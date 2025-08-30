import React, { useState, useEffect } from 'react';
import { NeonBackdrop } from '@/components/ui/NeonBackdrop';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { FillBlankQuestion } from './FillBlankQuestion';
import { ConfettiEffect } from './ConfettiEffect';
import { useQuestions, Question } from '@/hooks/useQuestions';
import { useAuth } from '@/hooks/useAuth';
import { useAnswerValidation } from '@/hooks/useAnswerValidation';
import { supabase } from '@/integrations/supabase/client';
import { PlayerData } from './GameContainer';

interface SingleLevelGameScreenProps {
  playerData: PlayerData;
  levelNumber: number;
  onLevelComplete: (score: number, medal: 'bronze' | 'silver' | 'gold' | null) => void;
  onBack: () => void;
}

export const SingleLevelGameScreen: React.FC<SingleLevelGameScreenProps> = ({
  playerData,
  levelNumber,
  onLevelComplete,
  onBack
}) => {
  const { questions, loading, error, refetch } = useQuestions();
  const { user } = useAuth();
  const { validateAnswer, validating, lastResult } = useAnswerValidation();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [levelQuestions, setLevelQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);

  useEffect(() => {
    if (questions.length > 0) {
      // Select 10 random questions for this level
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setLevelQuestions(shuffled.slice(0, 10));
    }
  }, [questions]);

  const currentQuestion = levelQuestions[currentQuestionIndex];

  const calculateMedal = (score: number): 'bronze' | 'silver' | 'gold' | null => {
    if (score >= 90) return 'gold';
    if (score >= 70) return 'silver';
    if (score >= 50) return 'bronze';
    return null;
  };

  const handleAnswer = async (answer: string | boolean, userAnswers?: string[]) => {
    if (!currentQuestion || isAnswering || validating) return;
    
    setIsAnswering(true);
    
    try {
      const result = await validateAnswer(
        currentQuestion.id,
        currentQuestion.question_type,
        answer,
        userAnswers
      );
      
      if (currentQuestion.question_type !== 'fill-in-the-blank') {
        setSelectedAnswer(answer as string);
      }
      
      setFeedback(result.feedback);
      setShowFeedback(true);
      setHasAnswered(true);
      setTotalAnswered(prev => prev + 1);

      if (result.isCorrect || (result.correctCount && result.correctCount > 0)) {
        setCorrectAnswers(prev => prev + 1);
        setShowConfetti(true);
      }

    } catch (error) {
      console.error('Error validating answer:', error);
      setFeedback('Σφάλμα επικύρωσης απάντησης');
      setShowFeedback(true);
    }

    setIsAnswering(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < levelQuestions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setFeedback('');
      setShowFeedback(false);
      setHasAnswered(false);
    } else {
      // Level complete
      const finalScore = Math.round((correctAnswers / Math.max(totalAnswered, 1)) * 100);
      const medal = calculateMedal(finalScore);
      setLevelComplete(true);
      
      // Save level completion
      saveLevelCompletion(finalScore, medal);
      
      setTimeout(() => {
        onLevelComplete(finalScore, medal);
      }, 2000);
    }
  };

  const saveLevelCompletion = async (score: number, medal: 'bronze' | 'silver' | 'gold' | null) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('player_progress')
        .upsert({
          user_id: user.id,
          current_position: Math.max(levelNumber, 1),
          correct_answers: correctAnswers,
          total_questions_answered: totalAnswered,
          completion_percentage: score,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,category_id'
        });

      if (error) {
        console.error('Error saving level completion:', error);
      }
    } catch (error) {
      console.error('Error saving level completion:', error);
    }
  };

  if (loading || levelQuestions.length === 0) {
    return (
      <NeonBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard glowColor="cyan" className="text-center">
            <div className="w-16 h-16 mx-auto border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-exo text-lg">Loading Level {levelNumber}... 🎮</p>
          </GlassCard>
        </div>
      </NeonBackdrop>
    );
  }

  if (error) {
    return (
      <NeonBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard glowColor="pink" className="text-center space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-xl font-orbitron font-bold text-white">Connection Failed</div>
            <p className="text-lg text-white/70 font-exo">Unable to load level questions.</p>
            <div className="flex gap-4 justify-center">
              <NeonButton variant="purple" onClick={onBack}>
                Back to Map 🗺️
              </NeonButton>
              <NeonButton variant="lime" onClick={refetch}>
                Retry 🔄
              </NeonButton>
            </div>
          </GlassCard>
        </div>
      </NeonBackdrop>
    );
  }

  if (levelComplete) {
    const finalScore = Math.round((correctAnswers / Math.max(totalAnswered, 1)) * 100);
    const medal = calculateMedal(finalScore);
    
    return (
      <NeonBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <ConfettiEffect 
            isActive={true} 
            onComplete={() => {}}
            intensity="high"
          />
          <GlassCard glowColor="lime" className="text-center space-y-6 max-w-md">
            <div className="text-6xl mb-4">
              {medal === 'gold' && '🥇'}
              {medal === 'silver' && '🥈'}
              {medal === 'bronze' && '🥉'}
              {!medal && '⭐'}
            </div>
            <div className="text-2xl font-orbitron font-bold text-white">
              Level {levelNumber} Complete!
            </div>
            <div className="text-4xl font-bold text-lime-400">{finalScore}%</div>
            <div className="text-white/80 font-exo">
              {correctAnswers} out of {totalAnswered} correct
            </div>
            {medal && (
              <div className="text-yellow-400 font-bold">
                {medal.charAt(0).toUpperCase() + medal.slice(1)} Medal Earned!
              </div>
            )}
            <div className="text-white/60 text-sm">
              Returning to level map...
            </div>
          </GlassCard>
        </div>
      </NeonBackdrop>
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
            ← Back to Map
          </NeonButton>
          
          <div className="text-center">
            <h1 className="text-2xl font-orbitron font-bold text-white">
              Level {levelNumber}
            </h1>
            <p className="text-white/70 font-exo">
              Question {currentQuestionIndex + 1} of {levelQuestions.length}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-lime-400 font-bold text-lg">{correctAnswers}/{totalAnswered}</div>
            <div className="text-white/60 text-sm font-exo">Correct</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-lime-400 to-cyan-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + (hasAnswered ? 1 : 0)) / levelQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto">
          {currentQuestion && (
            <div className="mb-6">
              {currentQuestion.question_type === 'fill-in-the-blank' ? (
                <FillBlankQuestion
                  questionText={currentQuestion.question_text}
                  explanation={currentQuestion.explanation}
                  onAnswer={(userAnswers: string[]) => handleAnswer('', userAnswers)}
                  feedback={feedback}
                  hasAnswered={hasAnswered}
                  onNextQuestion={hasAnswered ? handleNextQuestion : undefined}
                  isValidating={isAnswering}
                  perBlankResults={lastResult?.perBlankResults}
                  correctCount={lastResult?.correctCount}
                  totalBlanks={lastResult?.totalBlanks}
                  correctAnswers={lastResult?.correctAnswers}
                />
              ) : (
                <GlassCard glowColor="pink">
                  <div className="text-center space-y-6">
                    <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-white">
                      {currentQuestion.question_text}
                    </h2>

                    {currentQuestion.question_type === 'multiple-choice' && currentQuestion.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => (
                          <NeonButton
                            key={index}
                            variant={selectedAnswer === option ? 'cyan' : 'purple'}
                            onClick={() => !isAnswering && setSelectedAnswer(option)}
                            disabled={isAnswering}
                            className="p-4 text-left"
                          >
                            {option}
                          </NeonButton>
                        ))}
                      </div>
                    )}

                    {currentQuestion.question_type === 'true-false' && (
                      <div className="flex gap-4 justify-center">
                        <NeonButton
                          variant={selectedAnswer === 'true' ? 'lime' : 'purple'}
                          onClick={() => !isAnswering && setSelectedAnswer('true')}
                          disabled={isAnswering}
                          size="lg"
                        >
                          True ✅
                        </NeonButton>
                        <NeonButton
                          variant={selectedAnswer === 'false' ? 'pink' : 'purple'}
                          onClick={() => !isAnswering && setSelectedAnswer('false')}
                          disabled={isAnswering}
                          size="lg"
                        >
                          False ❌
                        </NeonButton>
                      </div>
                    )}

                    {!hasAnswered && selectedAnswer && (
                      <div className="text-center">
                        <NeonButton
                          variant="lime"
                          onClick={() => handleAnswer(selectedAnswer)}
                          disabled={isAnswering}
                          size="lg"
                        >
                          {isAnswering ? 'Processing... ⚡' : 'Submit Answer ⚡'}
                        </NeonButton>
                      </div>
                    )}

                    {hasAnswered && feedback && (
                      <GlassCard glowColor="cyan" className="text-center">
                        <p className="text-white font-exo text-lg">{feedback}</p>
                        <div className="mt-4">
                          <NeonButton
                            variant="cyan"
                            onClick={handleNextQuestion}
                            size="lg"
                          >
                            {currentQuestionIndex < levelQuestions.length - 1 ? 'Next Question 🚀' : 'Complete Level 🏆'}
                          </NeonButton>
                        </div>
                      </GlassCard>
                    )}
                  </div>
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </div>
    </NeonBackdrop>
  );
};