import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayerData, GameState } from './GameContainer';
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
      <div className="text-center text-white">
        <div className="w-16 h-16 mx-auto border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p>{loading ? 'Φόρτωση ερωτήσεων...' : 'Φόρτωση ερώτησης...'}</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="text-center text-white space-y-4">
        <div className="text-xl">⚠️ Πρόβλημα φόρτωσης</div>
        <p className="text-lg">Δεν ήταν δυνατή η φόρτωση των ερωτήσεων.</p>
        <Button
          onClick={refetch}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Προσπάθεια ξανά
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Board */}
      <IcebergGameBoard
        effectivePosition={gameState.currentPosition + gameState.currentLevelProgress}
        playerData={playerData}
        isClimbing={isClimbing}
        isSlipping={isSlipping}
      />

      {/* Score Display */}
      <div className="text-center text-white space-y-2">
        <div className="text-2xl font-bold">
          Επίπεδο {gameState.currentPosition} από 15
        </div>
        <div className="text-lg">
          Βάση: {(gameState.currentPosition + gameState.currentLevelProgress).toFixed(1)}/15
        </div>
        <div className="text-sm">
          Σωστές: {gameState.correctAnswers} | Συνολικές: {gameState.totalQuestions}
        </div>
      </div>

      {/* Question Section */}
      {currentQuestion.question_type === 'fill-in-the-blank' ? (
        <FillBlankQuestion
          questionText={currentQuestion.question_text}
          onAnswer={(userAnswers) => handleAnswer('', userAnswers)}
          feedback={showFeedback ? feedback : undefined}
          hasAnswered={showFeedback}
          onNextQuestion={showFeedback ? handleNextQuestion : undefined}
          isValidating={validating}
          perBlankResults={hasAnswered ? lastResult?.perBlankResults : undefined}
          correctCount={hasAnswered ? lastResult?.correctCount : undefined}
          totalBlanks={hasAnswered ? lastResult?.totalBlanks : undefined}
          correctAnswers={hasAnswered ? lastResult?.correctAnswers : undefined}
        />
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="space-y-4">
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
                {currentQuestion.question_type === 'true-false' ? 'Σωστό/Λάθος' : 
                 currentQuestion.question_type === 'multiple-choice' ? 'Πολλαπλή Επιλογή' : 'Αντιστοίχιση'}
              </span>
            </div>
            
            <h3 className="text-xl text-white text-center font-medium">
              {currentQuestion.question_text}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.question_type === 'true-false' ? (
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => handleAnswer('true')}
                    disabled={isAnswering}
                    className="bg-green-500 hover:bg-green-600 text-white border-0 px-8"
                  >
                    Σωστό ✓
                  </Button>
                  <Button
                    onClick={() => handleAnswer('false')}
                    disabled={isAnswering}
                    className="bg-red-500 hover:bg-red-600 text-white border-0 px-8"
                  >
                    Λάθος ✗
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentQuestion.options?.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswering}
                      variant="outline"
                      className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className="text-center space-y-4">
                <div className={`text-lg font-bold ${
                  feedback.includes('Σωστά') ? 'text-green-300' : 'text-red-300'
                }`}>
                  {feedback}
                </div>
                <Button
                  onClick={handleNextQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Επόμενη Ερώτηση
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};