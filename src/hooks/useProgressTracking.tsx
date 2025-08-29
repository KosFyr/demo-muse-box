import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CategoryProgress {
  categoryId: string;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
}

export interface MistakeStats {
  totalMistakes: number;
  questionsNeedingReview: number;
}

export function useProgressTracking() {
  const { user } = useAuth();
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
  const [mistakeStats, setMistakeStats] = useState<MistakeStats>({ totalMistakes: 0, questionsNeedingReview: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .order('order_index');

      if (categoriesError) throw categoriesError;

      // Fetch all questions grouped by category
      const { data: questions, error: questionsError } = await supabase
        .rpc('get_questions_public');

      if (questionsError) throw questionsError;

      // Fetch user's review status
      const { data: reviewStatus, error: reviewError } = await supabase
        .from('question_review_status')
        .select('question_id, category_id, needs_review, total_attempts')
        .eq('user_id', user.id);

      if (reviewError) throw reviewError;

      // Calculate progress for each category
      const progressData: CategoryProgress[] = [];
      let totalMistakes = 0;
      let questionsNeedingReview = 0;

      for (const category of categories || []) {
        const categoryQuestions = questions?.filter(q => q.category_id === category.id) || [];
        const categoryReviews = reviewStatus?.filter(r => r.category_id === category.id) || [];
        
        const totalQuestions = categoryQuestions.length;
        const answeredQuestions = categoryReviews.length;
        const completionPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

        progressData.push({
          categoryId: category.id,
          totalQuestions,
          answeredQuestions,
          completionPercentage
        });
      }

      // Calculate mistake stats
      if (reviewStatus) {
        totalMistakes = reviewStatus.filter(r => r.total_attempts > 0).length;
        questionsNeedingReview = reviewStatus.filter(r => r.needs_review).length;
      }

      setCategoryProgress(progressData);
      setMistakeStats({ totalMistakes, questionsNeedingReview });
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuestionStatus = async (
    questionId: string,
    categoryId: string,
    isCorrect: boolean
  ) => {
    if (!user) return;

    try {
      const { data: existing, error: fetchError } = await supabase
        .from('question_review_status')
        .select('*')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        // Update existing record
        const newCorrectStreak = isCorrect ? existing.correct_streak + 1 : 0;
        const needsReview = newCorrectStreak < 3; // Remove from review after 3 correct answers

        await supabase
          .from('question_review_status')
          .update({
            correct_streak: newCorrectStreak,
            total_attempts: existing.total_attempts + 1,
            correct_attempts: existing.correct_attempts + (isCorrect ? 1 : 0),
            needs_review: needsReview,
            last_attempted_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabase
          .from('question_review_status')
          .insert({
            user_id: user.id,
            question_id: questionId,
            category_id: categoryId,
            correct_streak: isCorrect ? 1 : 0,
            total_attempts: 1,
            correct_attempts: isCorrect ? 1 : 0,
            needs_review: !isCorrect || true // Always needs review initially, removed after 3 correct
          });
      }

      // Refresh progress data
      fetchProgressData();
    } catch (error) {
      console.error('Error updating question status:', error);
    }
  };

  return {
    categoryProgress,
    mistakeStats,
    loading,
    updateQuestionStatus,
    refetch: fetchProgressData
  };
}