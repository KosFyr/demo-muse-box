import React, { useState, useEffect } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

interface Exercise {
  id: string;
  exercise_text: string;
  answers: string[];
  difficulty_level: number;
}

interface FillBlankQuestionProps {
  exercise: Exercise;
  onAnswerSubmit: (answers: string[]) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
  exercise,
  onAnswerSubmit,
  questionNumber,
  totalQuestions
}) => {
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse the exercise text to find blanks (represented by ________) 
  const parseQuestion = (text: string) => {
    const parts = text.split(/________/g);
    return parts;
  };

  const questionParts = parseQuestion(exercise.exercise_text);
  const blankCount = exercise.answers.length;

  useEffect(() => {
    // Initialize answers array
    setUserAnswers(new Array(blankCount).fill(''));
    setHasAnswered(false);
    setShowHint(false);
    setAnswers([]);
  }, [exercise, blankCount]);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (hasAnswered || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Check answers
    const isCorrect = userAnswers.every((answer, index) => 
      answer.toLowerCase().trim() === exercise.answers[index]?.toLowerCase().trim()
    );
    
    setAnswers(userAnswers);
    setHasAnswered(true);
    
    // Show feedback for 2 seconds, then proceed
    setTimeout(() => {
      onAnswerSubmit(userAnswers);
      setIsSubmitting(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      if (index < blankCount - 1) {
        const nextInput = document.getElementById(`blank-${index + 1}`);
        nextInput?.focus();
      } else {
        if (userAnswers.every(answer => answer.trim() !== '')) {
          handleSubmit();
        }
      }
    }
  };

  const allFieldsFilled = userAnswers.every(answer => answer.trim() !== '');

  return (
    <GlassCard glowColor="cyan" className="w-full max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Question Header */}
        <div className="text-center">
          <div className="flex justify-between items-center mb-4">
            <div className="text-cyan-400 font-orbitron font-bold">
              Ερώτηση {questionNumber}
            </div>
            <div className="text-white/70 font-exo">
              {questionNumber} / {totalQuestions}
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-4">
            Συμπληρώστε τα <span className="text-cyan-400 text-shadow-neon">κενά</span> 🧩
          </h2>
        </div>

        {/* Question Text with Input Fields */}
        <div className="bg-black/20 rounded-xl p-6 border border-cyan-500/30">
          <div className="text-lg md:text-xl text-white leading-relaxed font-exo">
            {questionParts.map((part, index) => (
              <span key={index}>
                <span className="text-white/90">{part}</span>
                {index < blankCount && (
                  <span className="inline-block mx-2">
                    {hasAnswered ? (
                      // Show result after answering
                      <span 
                        className={cn(
                          "px-3 py-2 rounded-lg border-2 font-medium",
                          answers[index]?.toLowerCase().trim() === exercise.answers[index]?.toLowerCase().trim()
                            ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                            : "bg-red-500/20 border-red-400/50 text-red-200"
                        )}
                      >
                        {answers[index]?.toLowerCase().trim() === exercise.answers[index]?.toLowerCase().trim() ? '✔' : '✘'} {answers[index]}
                      </span>
                    ) : (
                      // Show input field
                      <input
                        id={`blank-${index}`}
                        type="text"
                        value={userAnswers[index] || ''}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        disabled={hasAnswered || isSubmitting}
                        className="px-4 py-2 min-w-[120px] bg-black/40 border-2 border-cyan-500/50 rounded-xl text-cyan-100 font-exo text-center focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/70"
                        placeholder="..."
                      />
                    )}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Feedback Section */}
        {hasAnswered && (
          <div className="space-y-4">
            {/* Show correct answers for incorrect ones */}
            <div className="bg-black/20 rounded-xl p-4 border border-green-500/30">
              <h3 className="text-green-400 font-orbitron font-bold mb-3">Σωστές Απαντήσεις:</h3>
              <div className="space-y-2">
                {exercise.answers.map((correctAnswer, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-white/70 w-16">Κενό {index + 1}:</span>
                    <span className="text-green-300 font-medium">{correctAnswer}</span>
                    {answers[index]?.toLowerCase().trim() === correctAnswer.toLowerCase().trim() && (
                      <span className="text-green-400">✓ Σωστό!</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Processing indicator */}
            <div className="text-center">
              <div className="text-cyan-400 font-exo animate-pulse">
                Επόμενη ερώτηση σε λίγο... ⏳
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!hasAnswered && (
          <div className="flex flex-wrap gap-4 justify-center">
            <NeonButton
              variant="lime"
              onClick={handleSubmit}
              disabled={!allFieldsFilled || isSubmitting}
            >
              {isSubmitting ? 'Επεξεργασία... ⚡' : 'Υποβολή Απάντησης ⚡'}
            </NeonButton>
            
            <NeonButton
              variant="purple"
              onClick={() => setShowHint(!showHint)}
              disabled={isSubmitting}
            >
              {showHint ? 'Απόκρυψη Υπόδειξης 👁️' : 'Δείτε Υπόδειξη 💡'}
            </NeonButton>
          </div>
        )}

        {/* Hint Display */}
        {showHint && !hasAnswered && (
          <GlassCard glowColor="purple" className="bg-purple-500/10">
            <div className="flex items-center gap-3 text-purple-300">
              <span className="text-2xl">💡</span>
              <span className="font-exo">
                Σκεφτείτε τις βασικές έννοιες προγραμματισμού! ({blankCount} κενά για συμπλήρωση)
              </span>
            </div>
          </GlassCard>
        )}
      </div>
    </GlassCard>
  );
};