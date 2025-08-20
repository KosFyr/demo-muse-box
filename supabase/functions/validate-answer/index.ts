import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateAnswerRequest {
  questionId: string;
  questionType: 'true-false' | 'matching' | 'multiple-choice' | 'fill-in-the-blank';
  userAnswer: string | boolean;
  userAnswers?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for reading answers
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Also create client with user auth for verification
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Verify the user is actually authenticated
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic rate limiting - store request times per user
    const userId = user.id;
    const now = Date.now();
    const rateLimitKey = `rate_limit_${userId}`;
    
    // Simple in-memory rate limiting (10 requests per minute per user)
    if (!globalThis[rateLimitKey]) {
      globalThis[rateLimitKey] = [];
    }
    
    const userRequests = globalThis[rateLimitKey];
    // Remove requests older than 1 minute
    while (userRequests.length > 0 && userRequests[0] < now - 60000) {
      userRequests.shift();
    }
    
    if (userRequests.length >= 10) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded - too many requests' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    userRequests.push(now);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { questionId, questionType, userAnswer, userAnswers }: ValidateAnswerRequest = await req.json();

    console.log('Validating answer for question:', questionId, 'Type:', questionType);

    console.log('Received request:', { questionId, questionType, userAnswer, userAnswers });

    let correctAnswer: string;
    let isCorrect = false;
    let similarity = 0;

    // Optional partial credit details for fill-in-the-blank
    let perBlankResults: boolean[] | undefined;
    let correctCountDetail: number | undefined;
    let totalBlanksDetail: number | undefined;
    let correctAnswersArr: string[] | undefined;

    if (questionType === 'fill-in-the-blank') {
      console.log('Processing fill-in-the-blank question');
      
      let correctAnswers: string[] | null = null;

      // Try fill_blank_exercises first
      const { data: exercise, error: exErr } = await supabase
        .from('fill_blank_exercises')
        .select('answers')
        .eq('id', questionId)
        .maybeSingle();

      if (exErr) console.warn('fill_blank_exercises lookup failed:', exErr);
      if (exercise && Array.isArray(exercise.answers)) {
        correctAnswers = exercise.answers as string[];
      }

      // Fallback to questions.correct_answer if needed
      if (!correctAnswers) {
        const { data: qRow, error: qErr } = await supabase
          .from('questions')
          .select('correct_answer')
          .eq('id', questionId)
          .maybeSingle();
        if (qErr) console.warn('questions fallback lookup failed:', qErr);
        if (qRow && qRow.correct_answer) {
          try {
            const parsed = JSON.parse(qRow.correct_answer);
            if (Array.isArray(parsed)) correctAnswers = parsed as string[];
          } catch (_) {
            const raw = String(qRow.correct_answer);
            if (raw.includes('|')) correctAnswers = raw.split('|');
            else correctAnswers = raw.split(',');
          }
        }
      }

      if (!correctAnswers || correctAnswers.length === 0) {
        console.error('No correct answers found for FITB question', { questionId });
        throw new Error('Correct answers not found');
      }

      correctAnswersArr = correctAnswers.map((s) => String(s));
      correctAnswer = correctAnswersArr.join(', ');

      console.log('User answers:', userAnswers);
      console.log('Correct answers:', correctAnswersArr);

      if (userAnswers && userAnswers.length > 0) {
        // Validate each blank with fuzzy matching and collect per-blank correctness
        let correctCount = 0;
        let totalSimilarity = 0;
        const blanks: boolean[] = [];
        const len = Math.min(userAnswers.length, correctAnswersArr.length);

        for (let i = 0; i < len; i++) {
          const userAns = (userAnswers[i] || '').toLowerCase().trim();
          const correctAns = correctAnswersArr[i].toLowerCase().trim();
          
          console.log(`Comparing blank ${i}: "${userAns}" vs "${correctAns}"`);
          
          // Simple fuzzy matching - exact match or very close
          let isBlankCorrect = false;
          if (userAns === correctAns) {
            isBlankCorrect = true;
            totalSimilarity += 1;
            console.log(`Blank ${i}: Exact match`);
          } else if (userAns && (userAns.includes(correctAns) || correctAns.includes(userAns))) {
            const lengthRatio = Math.min(userAns.length, correctAns.length) / Math.max(userAns.length, correctAns.length);
            if (lengthRatio > 0.7) {
              isBlankCorrect = true;
              totalSimilarity += lengthRatio;
              console.log(`Blank ${i}: Fuzzy match (${lengthRatio})`);
            }
          }
          
          if (!isBlankCorrect) {
            console.log(`Blank ${i}: No match`);
          }
          
          blanks.push(isBlankCorrect);
          if (isBlankCorrect) correctCount++;
        }

        // If user provided fewer answers than blanks, pad remaining as false
        while (blanks.length < correctAnswersArr.length) blanks.push(false);

        perBlankResults = blanks;
        correctCountDetail = correctCount;
        totalBlanksDetail = correctAnswersArr.length;

        isCorrect = correctCount === correctAnswersArr.length;
        similarity = totalBlanksDetail ? totalSimilarity / totalBlanksDetail : 0;
        
        console.log('Final FITB results:', { 
          isCorrect, 
          similarity, 
          correctCount, 
          totalBlanks: correctAnswersArr.length, 
          perBlankResults: blanks 
        });
      } else {
        console.log('No user answers provided for FITB');
        // No answers: mark all false for clarity
        perBlankResults = new Array(correctAnswersArr.length).fill(false);
        correctCountDetail = 0;
        totalBlanksDetail = correctAnswersArr.length;
      }
    } else {
      // Get correct answer from questions table
      const { data: question, error } = await supabase
        .from('questions')
        .select('correct_answer')
        .eq('id', questionId)
        .single();

      if (error) {
        console.error('Error fetching question:', error);
        throw new Error('Question not found');
      }

      correctAnswer = question.correct_answer;

      // Validate based on question type
      if (questionType === 'true-false') {
        isCorrect = String(userAnswer).toLowerCase() === correctAnswer.toLowerCase();
        similarity = isCorrect ? 1 : 0;
      } else if (questionType === 'multiple-choice') {
        isCorrect = String(userAnswer) === correctAnswer;
        similarity = isCorrect ? 1 : 0;
      }
    }

    console.log('Final validation result:', { isCorrect, similarity, correctAnswer });

    // Create response with partial credit data for fill-in-the-blank
    const response: any = {
      isCorrect,
      similarity,
      correctAnswer,
      feedback: questionType === 'fill-in-the-blank'
        ? (isCorrect ? 'Σωστό!' : 'Μερική απάντηση')
        : (isCorrect ? 'Σωστό!' : 'Λάθος.')
    };

    if (questionType === 'fill-in-the-blank') {
      response.perBlankResults = perBlankResults || [];
      response.correctCount = correctCountDetail ?? 0;
      response.totalBlanks = totalBlanksDetail ?? 0;
      response.correctAnswers = correctAnswersArr || [];
      
      console.log('Adding FITB data to response:', {
        perBlankResults: response.perBlankResults,
        correctCount: response.correctCount,
        totalBlanks: response.totalBlanks,
        correctAnswers: response.correctAnswers
      });
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in validate-answer function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        isCorrect: false,
        similarity: 0,
        perBlankResults: [],
        correctCount: 0,
        totalBlanks: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});