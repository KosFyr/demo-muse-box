import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Question } from './useQuestions';

export type GameMode = 'progress' | 'units' | 'mistakes';

export interface GameModeState {
  mode: GameMode;
  selectedCategoryIds: string[];
  questionsPool: Question[];
  currentQuestionIndex: number;
  usedQuestions: Set<string>;
}

interface QuestionFromDB {
  id: string;
  category_id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  explanation?: string;
  created_at: string;
  points_value: number;
  difficulty_level: number;
}

export function useGameMode() {
  const { user } = useAuth();
  const [gameModeState, setGameModeState] = useState<GameModeState>({
    mode: 'progress',
    selectedCategoryIds: [],
    questionsPool: [],
    currentQuestionIndex: 0,
    usedQuestions: new Set()
  });

  const convertToQuestion = (dbQuestion: QuestionFromDB): Question => ({
    ...dbQuestion,
    question_type: dbQuestion.question_type as 'true-false' | 'matching' | 'multiple-choice' | 'fill-in-the-blank',
    correct_answer: '' // Will be fetched when needed for validation
  });

  const initializeGameMode = async (
    mode: GameMode,
    selectedCategoryIds: string[] = []
  ) => {
    try {
      let questionsPool: Question[] = [];

      if (mode === 'progress') {
        // Get all questions from completed categories
        const { data: questions } = await supabase.rpc('get_questions_public');
        questionsPool = (questions || []).map(convertToQuestion);
      } 
      else if (mode === 'units') {
        // Get questions from selected categories
        const { data: questions } = await supabase
          .rpc('get_questions_public')
          .in('category_id', selectedCategoryIds);
        questionsPool = (questions || []).map(convertToQuestion);
      }
      else if (mode === 'mistakes') {
        // Get questions that need review
        if (!user) return;
        
        const { data: reviewStatus } = await supabase
          .from('question_review_status')
          .select('question_id')
          .eq('user_id', user.id)
          .eq('needs_review', true);

        if (reviewStatus && reviewStatus.length > 0) {
          const questionIds = reviewStatus.map(r => r.question_id);
          const { data: questions } = await supabase
            .rpc('get_questions_public')
            .in('id', questionIds);
          questionsPool = (questions || []).map(convertToQuestion);
        }
      }

      // Shuffle questions
      const shuffledQuestions = questionsPool.sort(() => Math.random() - 0.5);

      setGameModeState({
        mode,
        selectedCategoryIds,
        questionsPool: shuffledQuestions,
        currentQuestionIndex: 0,
        usedQuestions: new Set()
      });

    } catch (error) {
      console.error('Error initializing game mode:', error);
    }
  };

  const getNextQuestion = (): Question | null => {
    const { questionsPool, currentQuestionIndex } = gameModeState;
    
    if (currentQuestionIndex >= questionsPool.length) {
      return null; // No more questions
    }

    return questionsPool[currentQuestionIndex];
  };

  const moveToNextQuestion = () => {
    setGameModeState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));
  };

  const markQuestionAsUsed = (questionId: string) => {
    setGameModeState(prev => ({
      ...prev,
      usedQuestions: new Set([...prev.usedQuestions, questionId])
    }));
  };

  const resetGameMode = () => {
    setGameModeState({
      mode: 'progress',
      selectedCategoryIds: [],
      questionsPool: [],
      currentQuestionIndex: 0,
      usedQuestions: new Set()
    });
  };

  return {
    gameModeState,
    initializeGameMode,
    getNextQuestion,
    moveToNextQuestion,
    markQuestionAsUsed,
    resetGameMode
  };
}