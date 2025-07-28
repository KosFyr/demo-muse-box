import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlayerData, GameState } from './GameContainer';
import { VerticalGameBoard } from './VerticalGameBoard';
import { Question } from '@/lib/supabase';

// Mock questions - will be moved to Supabase later
const mockQuestions: Question[] = [
  {
    id: '1',
    category_id: 'basic',
    question_text: 'Το αντικείμενο πρόγραμμα παράγεται από τον μεταγλωττιστή.',
    question_type: 'true-false',
    difficulty_level: 1,
    points_value: 1,
    correct_answer: 'true',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    category_id: 'basic',
    question_text: 'Σε ένα δυαδικό δένδρο κάθε κόμβος έχει 0, 1 ή 2 υποδένδρα.',
    question_type: 'true-false',
    difficulty_level: 1,
    points_value: 1,
    correct_answer: 'true',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    category_id: 'basic',
    question_text: 'Η ενθυλάκωση υποδηλώνει ότι οι εσωτερικές λειτουργίες ενός αντικειμένου είναι ορατές στον έξω κόσμο.',
    question_type: 'true-false',
    difficulty_level: 2,
    points_value: 1,
    correct_answer: 'false',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    category_id: 'basic',
    question_text: 'Παράλειψη δήλωσης μεταβλητής',
    question_type: 'matching',
    difficulty_level: 2,
    points_value: 1,
    correct_answer: 'Συντακτικό Λάθος',
    options: ['Συντακτικό Λάθος', 'Λάθος κατά την εκτέλεση', 'Λογικό Λάθος'],
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    category_id: 'basic',
    question_text: 'Διαίρεση με το μηδέν (0)',
    question_type: 'matching',
    difficulty_level: 2,
    points_value: 1,
    correct_answer: 'Λάθος κατά την εκτέλεση',
    options: ['Συντακτικό Λάθος', 'Λάθος κατά την εκτέλεση', 'Λογικό Λάθος'],
    created_at: new Date().toISOString()
  }
];

interface GameScreenProps {
  playerData: PlayerData;
  gameState: GameState;
  onGameStateUpdate: (state: Partial<GameState>) => void;
  onGameEnd: () => void;
}

export const GameScreen = ({ playerData, gameState, onGameStateUpdate, onGameEnd }: GameScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    loadNextQuestion();
  }, [gameState.usedQuestions]);

  const loadNextQuestion = () => {
    const availableQuestions = mockQuestions.filter(q => !gameState.usedQuestions.has(q.id));
    
    if (availableQuestions.length === 0 || gameState.currentPosition >= 15) {
      onGameEnd();
      return;
    }

    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setSelectedAnswer('');
    setFeedback('');
    setShowFeedback(false);
  };

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || isAnswering) return;
    
    setIsAnswering(true);
    setSelectedAnswer(answer);
    
    const isCorrect = answer === currentQuestion.correct_answer;
    setFeedback(isCorrect ? 'Σωστά! 🎉' : 'Λάθος! 😅');
    setShowFeedback(true);

    // Update used questions
    const newUsedQuestions = new Set(gameState.usedQuestions);
    newUsedQuestions.add(currentQuestion.id);

    // Update game state
    const newState = {
      usedQuestions: newUsedQuestions,
      totalQuestions: gameState.totalQuestions + 1,
      correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
      currentPosition: isCorrect 
        ? Math.min(15, gameState.currentPosition + 2)
        : Math.max(1, gameState.currentPosition - 1)
    };

    onGameStateUpdate(newState);

    // Wait for animation, then continue
    setTimeout(() => {
      setIsAnswering(false);
      if (newState.currentPosition >= 15) {
        onGameEnd();
      } else {
        loadNextQuestion();
      }
    }, 2000);
  };

  if (!currentQuestion) {
    return (
      <div className="text-center text-white">
        <div className="w-16 h-16 mx-auto border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        <p>Φόρτωση ερώτησης...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Board */}
      <VerticalGameBoard
        currentPosition={gameState.currentPosition}
        playerData={playerData}
        isMoving={isAnswering}
      />

      {/* Score Display */}
      <div className="text-center text-white space-y-2">
        <div className="text-2xl font-bold">
          Επίπεδο {gameState.currentPosition} από 15
        </div>
        <div className="text-lg">
          Σωστές: {gameState.correctAnswers} | Συνολικές: {gameState.totalQuestions}
        </div>
      </div>

      {/* Question Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="space-y-4">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              {currentQuestion.question_type === 'true-false' ? 'Σωστό/Λάθος' : 'Αντιστοίχιση'}
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
            <div className="text-center">
              <div className={`text-lg font-bold ${
                feedback.includes('Σωστά') ? 'text-green-300' : 'text-red-300'
              }`}>
                {feedback}
              </div>
              {currentQuestion.explanation && (
                <p className="text-white/80 text-sm mt-2">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};