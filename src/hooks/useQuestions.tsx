import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  category_id: string;
  question_text: string;
  question_type: 'true-false' | 'matching' | 'multiple-choice' | 'fill-in-the-blank';
  difficulty_level: number;
  points_value: number;
  correct_answer: string;
  options?: string[];
  explanation?: string;
  created_at: string;
}

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use secure function instead of direct table access
      const { data, error } = await supabase
        .rpc('get_questions_public')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuestions((data as Question[]) || []);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  return { questions, loading, error, refetch: fetchQuestions };
}