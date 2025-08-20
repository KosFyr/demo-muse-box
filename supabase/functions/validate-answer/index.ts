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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { questionId, questionType, userAnswer, userAnswers }: ValidateAnswerRequest = await req.json();

    console.log('Validating answer for question:', questionId, 'Type:', questionType);

    let correctAnswer: string;
    let isCorrect = false;
    let similarity = 0;

    // Optional partial credit details for fill-in-the-blank
    let perBlankResults: boolean[] | undefined;
    let correctCountDetail: number | undefined;
    let totalBlanksDetail: number | undefined;
    let correctAnswersArr: string[] | undefined;

    if (questionType === 'fill-in-the-blank') {
      // Get correct answers from fill_blank_exercises table
      const { data: exercise, error } = await supabase
        .from('fill_blank_exercises')
        .select('answers')
        .eq('id', questionId)
        .single();

      if (error) {
        console.error('Error fetching fill blank exercise:', error);
        throw new Error('Question not found');
      }

      const correctAnswers = exercise.answers as string[];
      correctAnswersArr = correctAnswers;
      correctAnswer = correctAnswers.join(', ');

      if (userAnswers && userAnswers.length === correctAnswers.length) {
        // Validate each blank with fuzzy matching and collect per-blank correctness
        let correctCount = 0;
        let totalSimilarity = 0;
        const blanks: boolean[] = [];

        for (let i = 0; i < userAnswers.length; i++) {
          const userAns = (userAnswers[i] || '').toLowerCase().trim();
          const correctAns = correctAnswers[i].toLowerCase().trim();
          
          // Simple fuzzy matching - exact match or very close
          let isBlankCorrect = false;
          if (userAns === correctAns) {
            isBlankCorrect = true;
            totalSimilarity += 1;
          } else if (userAns.includes(correctAns) || correctAns.includes(userAns)) {
            const lengthRatio = Math.min(userAns.length, correctAns.length) / Math.max(userAns.length, correctAns.length);
            if (lengthRatio > 0.7) {
              isBlankCorrect = true;
              totalSimilarity += lengthRatio;
            }
          }
          blanks.push(isBlankCorrect);
          if (isBlankCorrect) correctCount++;
        }

        perBlankResults = blanks;
        correctCountDetail = correctCount;
        totalBlanksDetail = correctAnswers.length;

        isCorrect = correctCount === correctAnswers.length;
        similarity = totalSimilarity / correctAnswers.length;
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

    console.log('Validation result:', { isCorrect, similarity, correctAnswer });

    // Create response with partial credit data for fill-in-the-blank
    const response: any = {
      isCorrect,
      similarity,
      correctAnswer,
      feedback: isCorrect ? 'Σωστό!' : `Λάθος. Η σωστή απάντηση είναι: ${correctAnswer}`
    };

    if (questionType === 'fill-in-the-blank') {
      response.perBlankResults = perBlankResults || [];
      response.correctCount = correctCountDetail ?? 0;
      response.totalBlanks = totalBlanksDetail ?? (correctAnswersArr?.length || 0);
      response.correctAnswers = correctAnswersArr || [];
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in validate-answer function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        isCorrect: false,
        similarity: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});