import React, { useState, useEffect } from 'react';
import { NeonButton } from '@/components/ui/NeonButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FillBlankQuestionProps {
  questionText: string;
  explanation?: string; // will not be rendered
  onAnswer: (userAnswers: string[]) => void;
  feedback?: string;
  hasAnswered?: boolean;
  onNextQuestion?: () => void;
  isValidating?: boolean;
  perBlankResults?: boolean[];
  correctCount?: number;
  totalBlanks?: number;
  correctAnswers?: string[];
}

export function FillBlankQuestion({
  questionText,
  explanation,
  onAnswer,
  feedback,
  hasAnswered = false,
  onNextQuestion,
  isValidating = false,
  perBlankResults,
  correctCount,
  totalBlanks,
  correctAnswers
}: FillBlankQuestionProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [localHasAnswered, setLocalHasAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Parse question text to identify blanks and create segments
  const questionParts = questionText.split(/________/g);
  const blanksCount = questionParts.length - 1;
  
  useEffect(() => {
    // Initialize user answers array
    setUserAnswers(new Array(blanksCount).fill(''));
    setLocalHasAnswered(false);
    setShowHint(false);
  }, [questionText, blanksCount]);
  
  const handleInputChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };
  
  const handleSubmit = () => {
    if (localHasAnswered || isValidating) return;
    
    setLocalHasAnswered(true);
    onAnswer(userAnswers);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      if (index < blanksCount - 1) {
        // Focus next input
        const nextInput = document.getElementById(`blank-${index + 1}`);
        nextInput?.focus();
      } else {
        // Submit if all fields are filled
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
          <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-4">
            Fill in the <span className="text-cyan-400 text-shadow-neon">blanks</span> 🧩
          </h2>
        </div>

        {/* Question Text with Input Fields */}
        <div className="bg-black/20 rounded-xl p-6 border border-cyan-500/30">
          <div className="text-lg md:text-xl text-white leading-relaxed font-exo">
            {questionParts.map((part, index) => (
              <div key={index} className="inline">
                <span className="text-white/90">{part}</span>
                {index < blanksCount && (
                  <div className="inline-block mx-2 align-top">
                    {localHasAnswered && perBlankResults ? (
                      // Show feedback box after answer submission
                      <div className="inline-block">
                      {perBlankResults[index] ? (
                        // Correct answer - single green box
                        <div className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white text-sm font-exo rounded-lg border border-emerald-500">
                          <span className="text-emerald-200 mr-2">✔</span>
                          <span>{userAnswers[index]}</span>
                        </div>
                      ) : (
                        // Wrong answer - dual section box
                        <div className="inline-block border border-gray-400 rounded-lg overflow-hidden" style={{ minWidth: `${Math.max(correctAnswers?.[index]?.length || 0, userAnswers[index]?.length || 0) * 8 + 60}px` }}>
                          {/* Top section - Correct answer (40% height) */}
                          <div className="bg-emerald-600 text-white px-2 py-1 text-xs font-exo flex items-center">
                            <span className="text-emerald-200 mr-1">✔</span>
                            <span className="truncate">{correctAnswers?.[index]}</span>
                          </div>
                          {/* Bottom section - Wrong answer (60% height) */}
                          <div className="bg-red-600 text-white px-2 py-1.5 text-xs font-exo flex items-center">
                            <span className="text-red-200 mr-1">✘</span>
                            <span className="truncate">{userAnswers[index]}</span>
                          </div>
                        </div>
                      )}
                      </div>
                    ) : (
                      // Show input field before answer submission
                      <input
                        id={`blank-${index}`}
                        value={userAnswers[index] || ''}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        disabled={localHasAnswered || isValidating}
                        className={`px-4 py-3 min-w-[120px] bg-black/40 border-2 rounded-xl text-cyan-100 font-exo text-center focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 backdrop-blur-sm transition-all duration-300 border-cyan-500/50 hover:border-cyan-400/70`}
                        style={{ 
                          width: `${Math.max(120, (userAnswers[index]?.length || 3) * 12 + 40)}px` 
                        }}
                        placeholder="..."
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          {!localHasAnswered && (
            <>
              <NeonButton
                variant="lime"
                onClick={handleSubmit}
                disabled={!allFieldsFilled || isValidating}
              >
                {isValidating ? 'Processing... ⚡' : 'Submit Answer ⚡'}
              </NeonButton>
              
              <NeonButton
                variant="purple"
                onClick={() => setShowHint(!showHint)}
                disabled={isValidating}
              >
                {showHint ? 'Hide Hint 👁️' : 'Show Hint 💡'}
              </NeonButton>
            </>
          )}
        </div>

        {/* Hint Display */}
        {showHint && !localHasAnswered && (
          <GlassCard glowColor="purple" className="bg-purple-500/10">
            <div className="flex items-center gap-3 text-purple-300">
              <span className="text-2xl">💡</span>
              <span className="font-exo">
                Think about basic programming concepts and syntax! ({blanksCount} blanks to fill)
              </span>
            </div>
          </GlassCard>
        )}

        {/* Feedback Section */}
        {localHasAnswered && feedback && (
          <div className="space-y-4 mt-8">
            {/* Progress Indicator */}
            {typeof correctCount === 'number' && typeof totalBlanks === 'number' && (
              <GlassCard glowColor="cyan" className="text-center">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-cyan-400 font-orbitron font-bold text-lg">
                    {correctCount} / {totalBlanks}
                  </span>
                  <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-lime-400 transition-all duration-700 rounded-full"
                      style={{ width: `${(correctCount / totalBlanks) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-exo">
                    {Math.round((correctCount / totalBlanks) * 100)}%
                  </span>
                </div>
              </GlassCard>
            )}

            {/* General Feedback */}
            <GlassCard glowColor="pink" className="text-center">
              <p className="text-white font-exo">{feedback}</p>
            </GlassCard>

            {/* Next Question Button */}
            {onNextQuestion && (
              <div className="text-center">
                <NeonButton
                  variant="cyan"
                  onClick={onNextQuestion}
                  size="lg"
                  className="animate-pulse"
                >
                  Next Challenge 🚀
                </NeonButton>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}