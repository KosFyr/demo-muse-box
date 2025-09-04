import React, { useState, useEffect } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { fuzzyMatch } from '@/lib/fuzzyMatch';

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
  const [answers, setAnswers] = useState<string[]>([]);
  const [answerResults, setAnswerResults] = useState<boolean[]>([]);
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
    setAnswers([]);
    setAnswerResults([]);
  }, [exercise, blankCount]);

  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (hasAnswered || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Check answers using fuzzy matching
    const results = userAnswers.map((answer, index) => {
      const { isMatch } = fuzzyMatch(answer, exercise.answers[index] || '');
      return isMatch;
    });
    
    setAnswers(userAnswers);
    setAnswerResults(results);
    setHasAnswered(true);
    setIsSubmitting(false);
  };

  const handleNextQuestion = () => {
    onAnswerSubmit(userAnswers);
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
        {/* Progress Header */}
        <div className="text-center">
          <div className="text-white/70 font-exo text-lg mb-6">
            {questionNumber} / {totalQuestions}
          </div>
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
                      // Show result after answering with split display
                      <div className="inline-flex flex-col items-center gap-1">
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-medium text-sm",
                          answerResults[index] 
                            ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200"
                            : "bg-red-500/20 border-red-400/50 text-red-200"
                        )}>
                          <span className={answerResults[index] ? "text-emerald-300" : "text-red-300"}>
                            Απάντησή σας:
                          </span>
                          <span className="font-bold">{answers[index]}</span>
                        </div>
                        {!answerResults[index] && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 bg-emerald-500/20 border-emerald-400/50 text-emerald-200 font-medium text-sm">
                            <span className="text-emerald-300">Σωστή απάντηση:</span>
                            <span className="font-bold">{exercise.answers[index]}</span>
                          </div>
                        )}
                      </div>
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

        {/* Next Question Button */}
        {hasAnswered && (
          <div className="text-center">
            <NeonButton
              variant="cyan"
              onClick={handleNextQuestion}
            >
              Επόμενη Ερώτηση ➡️
            </NeonButton>
          </div>
        )}

        {/* Action Buttons */}
        {!hasAnswered && (
          <div className="flex justify-center">
            <NeonButton
              variant="lime"
              onClick={handleSubmit}
              disabled={!allFieldsFilled || isSubmitting}
            >
              {isSubmitting ? 'Επεξεργασία... ⚡' : 'Υποβολή Απάντησης ⚡'}
            </NeonButton>
          </div>
        )}
      </div>
    </GlassCard>
  );
};