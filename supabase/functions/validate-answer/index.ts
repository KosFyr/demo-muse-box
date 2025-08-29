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

// Fuzzy matching utilities for Greek text
function normalizeGreekText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[άα]/g, 'α')
    .replace(/[έε]/g, 'ε')
    .replace(/[ήη]/g, 'η')
    .replace(/[ίι]/g, 'ι')
    .replace(/[όο]/g, 'ο')
    .replace(/[ύυ]/g, 'υ')
    .replace(/[ώω]/g, 'ω')
    .replace(/ς$/g, 'σ') // Final sigma to sigma
    .replace(/[.,;:!?]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize spaces
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;
  
  const distance = levenshteinDistance(str1, str2);
  return (maxLength - distance) / maxLength;
}

function smartFuzzyMatch(userAnswer: string, correctAnswer: string): { isMatch: boolean; similarity: number; feedback: string } {
  const normalizedUser = normalizeGreekText(userAnswer);
  const normalizedCorrect = normalizeGreekText(correctAnswer);
  
  // For very short words (≤3 chars), require exact match after normalization
  if (normalizedCorrect.length <= 3) {
    const isExact = normalizedUser === normalizedCorrect;
    return {
      isMatch: isExact,
      similarity: isExact ? 1.0 : 0,
      feedback: isExact ? 'Σωστό' : 'Λάθος'
    };
  }
  
  // Exact match after normalization
  if (normalizedUser === normalizedCorrect) {
    return { 
      isMatch: true, 
      similarity: 1.0,
      feedback: 'Σωστό'
    };
  }
  
  // Calculate similarity for longer words
  const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);
  
  // Use higher threshold for acceptance (0.8 for more accurate matching)
  const threshold = 0.8;
  const isMatch = similarity >= threshold;
  
  let feedback = 'Λάθος';
  if (isMatch) {
    feedback = similarity >= 0.95 ? 'Σωστό' : 'Σχεδόν σωστό';
  }
  
  return { isMatch, similarity, feedback };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for reading answers
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
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
        return new Response(
          JSON.stringify({ 
            error: 'Correct answers not found',
            isCorrect: false,
            similarity: 0,
            correctAnswer: '',
            perBlankResults: [],
            correctCount: 0,
            totalBlanks: 0,
            correctAnswers: [],
            feedback: 'Σφάλμα επικύρωσης απάντησης'
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
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
          const userAns = userAnswers[i] || '';
          const correctAns = correctAnswersArr[i];
          
          console.log(`Comparing blank ${i}: "${userAns}" vs "${correctAns}"`);
          
          // Use smart fuzzy matching with Greek text normalization
          const matchResult = smartFuzzyMatch(userAns, correctAns);
          const isBlankCorrect = matchResult.isMatch;
          
          console.log(`Blank ${i}: ${matchResult.feedback} (similarity: ${matchResult.similarity})`);
          
          blanks.push(isBlankCorrect);
          totalSimilarity += matchResult.similarity;
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
        return new Response(
          JSON.stringify({ 
            error: 'Question not found',
            isCorrect: false,
            similarity: 0,
            correctAnswer: '',
            perBlankResults: [],
            correctCount: 0,
            totalBlanks: 0,
            correctAnswers: [],
            feedback: 'Σφάλμα επικύρωσης απάντησης'
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
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
        ? (isCorrect ? 'Σωστό!' : 
           correctCountDetail === 0 ? 'Λάθος απάντηση' : 'Μερική απάντηση')
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