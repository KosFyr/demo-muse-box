import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isCorrect: boolean;
  similarity: number;
  correctAnswer: string;
  feedback: string;
  perBlankResults?: boolean[];
  correctCount?: number;
  totalBlanks?: number;
  correctAnswers?: string[];
}

export function useAnswerValidation() {
  const [validating, setValidating] = useState(false);
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);

  const validateAnswer = async (
    questionId: string,
    questionType: 'true-false' | 'matching' | 'multiple-choice' | 'fill-in-the-blank',
    userAnswer: string | boolean,
    userAnswers?: string[]
  ): Promise<ValidationResult> => {
    setValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-answer', {
        body: {
          questionId,
          questionType,
          userAnswer,
          userAnswers
        }
      });

      if (error) throw error;

      const result = data as ValidationResult;
      setLastResult(result);
      return result;
    } catch (error: any) {
      console.error('Answer validation error:', error);
      return {
        isCorrect: false,
        similarity: 0,
        correctAnswer: '',
        feedback: 'Σφάλμα επικύρωσης απάντησης'
      };
    } finally {
      setValidating(false);
    }
  };

  return { validateAnswer, validating, lastResult };
}