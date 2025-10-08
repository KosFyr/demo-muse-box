import React, { useState, useEffect } from 'react';
import { NeonBackdrop } from '@/components/ui/NeonBackdrop';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { FillBlankQuestion } from './FillBlankQuestion';
import { EndScreen } from './EndScreen';
import { ConfettiEffect } from './ConfettiEffect';
import { PlayerData } from './GameContainer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { fuzzyMatch } from '@/lib/fuzzyMatch';

interface FillBlankExercise {
  id: string;
  exercise_text: string;
  answers: string[];
  difficulty_level: number;
}

interface SingleLevelGameScreenProps {
  playerData: PlayerData;
  categoryId?: string;
  levelNumber: number;
  onLevelComplete: (score: number, medal: 'bronze' | 'silver' | 'gold' | null) => void;
  onBack: () => void;
}

export const SingleLevelGameScreen: React.FC<SingleLevelGameScreenProps> = ({
  playerData,
  categoryId,
  levelNumber,
  onLevelComplete,
  onBack
}) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<FillBlankExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadExercises();
  }, [categoryId, levelNumber]);

  const loadExercises = async () => {
    if (!categoryId) {
      // Fallback to mock data if no category
      const mockQuestions = [{
        id: 'q1',
        exercise_text: `Συμπληρώστε το κενό στην πρόταση: "Ο αλγόριθμος είναι μία ________ οδηγιών που οδηγούν στην επίλυση ενός προβλήματος."`,
        answers: ['ακολουθία'],
        difficulty_level: 1
      }];
      setExercises(mockQuestions);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fill_blank_exercises')
        .select('*')
        .eq('category_id', categoryId)
        .range(levelNumber - 1, levelNumber - 1); // Get only 1 exercise for this level

      if (error) throw error;

      if (data && data.length > 0) {
        setExercises(data);
      } else {
        // Fallback if no exercises found
        const mockQuestions = [{
          id: 'q1',
          exercise_text: `Συμπληρώστε το κενό στην πρόταση: "Ο αλγόριθμος είναι μία ________ οδηγιών που οδηγούν στην επίλυση ενός προβλήματος."`,
          answers: ['ακολουθία'],
          difficulty_level: 1
        }];
        setExercises(mockQuestions);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      // Fallback to mock data on error
      const mockQuestions = [{
        id: 'q1',
        exercise_text: `Συμπληρώστε το κενό στην πρόταση: "Ο αλγόριθμος είναι μία ________ οδηγιών που οδηγούν στην επίλυση ενός προβλήματος."`,
        answers: ['ακολουθία'],
        difficulty_level: 1
      }];
      setExercises(mockQuestions);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (userAnswers: string[]) => {
    const currentExercise = exercises[currentQuestionIndex];
    
    // Use fuzzy matching to check answers
    const results = userAnswers.map((answer, index) => {
      const { isMatch } = fuzzyMatch(answer, currentExercise.answers[index] || '');
      return isMatch;
    });
    
    const isCorrect = results.every(Boolean);
    
    setAnswers([...answers, ...userAnswers]);
    setCorrectAnswers([...correctAnswers, isCorrect]);
    
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    if (currentQuestionIndex < exercises.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Game completed
      setGameCompleted(true);
    }
  };

  const calculateScore = () => {
    const correct = correctAnswers.filter(Boolean).length;
    return Math.round((correct / exercises.length) * 100);
  };

  const getMedal = (score: number): 'bronze' | 'silver' | 'gold' | null => {
    if (score >= 90) return 'gold';
    if (score >= 70) return 'silver';
    if (score >= 50) return 'bronze';
    return null;
  };

  const handleGameComplete = () => {
    const score = calculateScore();
    const medal = getMedal(score);
    saveLevelProgress(score);
    onLevelComplete(score, medal);
  };

  const saveLevelProgress = async (score: number) => {
    if (!user || !categoryId) return;

    try {
      const { error } = await supabase
        .from('player_progress')
        .upsert({
          user_id: user.id,
          category_id: categoryId,
          current_position: levelNumber + 1, // Unlock next level
          correct_answers: correctAnswers.filter(Boolean).length,
          total_questions_answered: exercises.length,
          completion_percentage: score,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,category_id'
        });

      if (error) {
        console.error('Error saving progress:', error);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  if (loading) {
    return (
      <NeonBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard glowColor="cyan" className="text-center">
            <div className="w-16 h-16 mx-auto border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-exo text-lg">Φόρτωση Ασκήσεων... 📝</p>
          </GlassCard>
        </div>
      </NeonBackdrop>
    );
  }

  if (gameCompleted) {
    const score = calculateScore();
    const medal = getMedal(score);
    
    // Create a compatible gameState object for EndScreen
    const gameStateForEndScreen = {
      currentPosition: levelNumber,
      correctAnswers: correctAnswers.filter(Boolean).length,
      totalQuestions: exercises.length,
      completionPercentage: score,
      currentLevelProgress: 0,
      usedQuestions: new Set<string>(),
      gameMode: 'progress' as const,
      selectedCategoryIds: categoryId ? [categoryId] : []
    };
    
    return (
      <EndScreen
        gameState={gameStateForEndScreen}
        playerData={playerData}
        onPlayAgain={() => window.location.reload()}
        onHome={handleGameComplete}
      />
    );
  }

  return (
    <NeonBackdrop>
      <div className="min-h-screen p-4 space-y-6">
        {/* Confetti Effect */}
        <ConfettiEffect 
          isActive={showConfetti} 
          onComplete={() => setShowConfetti(false)}
          intensity="medium"
        />

        {/* Header */}
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <NeonButton variant="purple" onClick={onBack}>
            ← Πίσω στον Χάρτη
          </NeonButton>
          
          <div className="text-center">
            <h1 className="text-2xl font-orbitron font-bold text-white">
              Πίστα {levelNumber}
            </h1>
            <p className="text-white/70 font-exo">
              Ερώτηση {currentQuestionIndex + 1} από {exercises.length}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-lime-400 font-bold text-lg">
              {correctAnswers.filter(Boolean).length}/{correctAnswers.length}
            </div>
            <div className="text-white/60 text-sm font-exo">Σωστές</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-lime-400 to-cyan-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(currentQuestionIndex / exercises.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto">
          <FillBlankQuestion
            exercise={exercises[currentQuestionIndex]}
            onAnswerSubmit={handleAnswerSubmit}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={exercises.length}
          />
        </div>
      </div>
    </NeonBackdrop>
  );
};