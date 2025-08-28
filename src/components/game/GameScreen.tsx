import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayerData, GameState } from './GameContainer';
import { NeonBackdrop } from '@/components/ui/NeonBackdrop';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { CircularProgressRing } from '@/components/ui/CircularProgressRing';
import { IcebergGameBoard } from './IcebergGameBoard';
import { FillBlankQuestion } from './FillBlankQuestion';
import { useQuestions, Question } from '@/hooks/useQuestions';
import { useAuth } from '@/hooks/useAuth';
import { useAnswerValidation } from '@/hooks/useAnswerValidation';
import { supabase } from '@/integrations/supabase/client';


interface GameScreenProps {
  playerData: PlayerData;
  gameState: GameState;
  onGameStateUpdate: (state: Partial<GameState>) => void;
  onGameEnd: () => void;
}

export const GameScreen = ({ playerData, gameState, onGameStateUpdate, onGameEnd }: GameScreenProps) => {
  const { questions, loading, error, refetch } = useQuestions();
  const { user } = useAuth();
  const { validateAnswer, validating, lastResult } = useAnswerValidation();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isClimbing, setIsClimbing] = useState(false);
  const [isSlipping, setIsSlipping] = useState(false);

  useEffect(() => {
    // Load the first question only when questions are ready and none is loaded yet
    if (questions.length > 0 && !currentQuestion) {
      loadNextQuestion();
    }
  }, [questions]);

  const loadNextQuestion = () => {
    if (questions.length === 0) return;
    
    const availableQuestions = questions.filter(q => !gameState.usedQuestions.has(q.id));
    
    if (availableQuestions.length === 0 || gameState.currentPosition >= 15) {
      onGameEnd();
      return;
    }

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setSelectedAnswer('');
    setFeedback('');
    setShowFeedback(false);
    setHasAnswered(false);
  };

  const handleAnswer = async (answer: string | boolean, userAnswers?: string[]) => {
    if (!currentQuestion || isAnswering || validating) return;
    
    setIsAnswering(true);
    
    try {
      // Use secure server-side validation
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

      // Update used questions
      const newUsedQuestions = new Set(gameState.usedQuestions);
      newUsedQuestions.add(currentQuestion.id);

      let newState;

      if (currentQuestion.question_type === 'fill-in-the-blank') {
        // Partial credit system for fill-in-the-blank
        const correctCount = result.correctCount || 0;
        const totalBlanks = result.totalBlanks || 1;
        const progressIncrease = correctCount / totalBlanks;
        
        let newPosition = gameState.currentPosition;
        let newLevelProgress = gameState.currentLevelProgress + progressIncrease;
        
        // If we've filled the current level, advance to next level
        if (newLevelProgress >= 1) {
          newPosition = Math.min(15, newPosition + Math.floor(newLevelProgress));
          newLevelProgress = newLevelProgress % 1;
        }
        
        setIsClimbing(progressIncrease > 0);
        
        newState = {
          usedQuestions: newUsedQuestions,
          totalQuestions: gameState.totalQuestions + 1,
          correctAnswers: result.isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
          currentPosition: newPosition,
          currentLevelProgress: newLevelProgress
        };
      } else {
        // All-or-nothing for other question types
        if (result.isCorrect) {
          setIsClimbing(true);
          newState = {
            usedQuestions: newUsedQuestions,
            totalQuestions: gameState.totalQuestions + 1,
            correctAnswers: gameState.correctAnswers + 1,
            currentPosition: Math.min(15, gameState.currentPosition + 1),
            currentLevelProgress: 0
          };
        } else {
          // Just slip animation, no progress loss
          setIsSlipping(true);
          setTimeout(() => setIsSlipping(false), 1000);
          
          newState = {
            usedQuestions: newUsedQuestions,
            totalQuestions: gameState.totalQuestions + 1,
            correctAnswers: gameState.correctAnswers,
            currentPosition: gameState.currentPosition,
            currentLevelProgress: gameState.currentLevelProgress
          };
        }
      }

      onGameStateUpdate(newState);

      // Save progress to database
      if (user) {
        savePlayerProgress(newState);
      }
      
      // Reset climbing animation
      setTimeout(() => setIsClimbing(false), 1000);
      
    } catch (error) {
      console.error('Error validating answer:', error);
      setFeedback('Σφάλμα επικύρωσης απάντησης');
      setShowFeedback(true);
    }

    setIsAnswering(false);
  };

  const handleNextQuestion = () => {
    if (gameState.currentPosition >= 15) {
      onGameEnd();
    } else {
      loadNextQuestion();
    }
  };

  const savePlayerProgress = async (state: Partial<GameState>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('player_progress')
        .upsert({
          user_id: user.id,
          current_position: state.currentPosition || gameState.currentPosition,
          correct_answers: state.correctAnswers || gameState.correctAnswers,
          total_questions_answered: state.totalQuestions || gameState.totalQuestions,
          completion_percentage: ((state.correctAnswers || gameState.correctAnswers) / (state.totalQuestions || gameState.totalQuestions || 1)) * 100,
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

  if (loading || (!currentQuestion && !error)) {
    return (
      <NeonBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard glowColor="cyan" className="text-center">
            <div className="w-16 h-16 mx-auto border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-white font-exo text-lg">{loading ? 'Loading Questions... 🎮' : 'Loading Challenge... ⚡'}</p>
          </GlassCard>
        </div>
      </NeonBackdrop>
    );
  }

  if (error || questions.length === 0) {
    return (
      <NeonBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard glowColor="pink" className="text-center space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-xl font-orbitron font-bold text-white">Connection Failed</div>
            <p className="text-lg text-white/70 font-exo">Unable to load game challenges.</p>
            <NeonButton
              variant="lime"
              onClick={refetch}
            >
              Retry Connection 🔄
            </NeonButton>
          </GlassCard>
        </div>
      </NeonBackdrop>
    );
  }

  return (
    <NeonBackdrop>
      <div className="min-h-screen p-4 space-y-6">
        {/* Game Board */}
        <div className="flex justify-center">
          <GlassCard glowColor="cyan" intensity="high" className="relative">
            <IcebergGameBoard
              effectivePosition={gameState.currentPosition + gameState.currentLevelProgress}
              playerData={playerData}
              isClimbing={isClimbing}
              isSlipping={isSlipping}
            />
          </GlassCard>
        </div>

        {/* Gaming HUD */}
        <div className="max-w-4xl mx-auto">
          <GlassCard glowColor="lime" className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <CircularProgressRing
                  progress={(gameState.currentPosition / 15) * 100}
                  level={gameState.currentPosition + 1}
                  maxLevel={15}
                  size={100}
                />
                
                <div className="text-white">
                  <h3 className="font-orbitron font-bold text-xl mb-1">
                    Level {gameState.currentPosition + 1}
                  </h3>
                  <p className="text-white/70 font-exo">
                    Score: <span className="text-cyan-400 font-bold">{gameState.correctAnswers}</span>
                  </p>
                </div>
              </div>

              <div className="text-right text-white/80 font-exo">
                <div className="text-sm">Progress</div>
                <div className="text-lg font-bold text-cyan-400">
                  {Math.round(gameState.currentLevelProgress * 100)}%
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Question Display */}
          {currentQuestion && (
            <div className="mb-6">
              {currentQuestion.question_type === 'fill-in-the-blank' ? (
                <FillBlankQuestion
                  questionText={currentQuestion.question_text}
                  explanation={currentQuestion.explanation}
                  onAnswer={(userAnswers: string[]) => handleAnswer('', userAnswers)}
                  feedback={feedback}
                  hasAnswered={hasAnswered}
                  onNextQuestion={hasAnswered ? () => loadNextQuestion() : undefined}
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
                            onClick={() => loadNextQuestion()}
                            size="lg"
                          >
                            Next Challenge 🚀
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