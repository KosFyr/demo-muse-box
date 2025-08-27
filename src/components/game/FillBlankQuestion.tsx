import React, { useState, useEffect } from 'react';
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
    <div className="w-full card-gaming rounded-2xl p-6 border border-primary/30 glow-cyan animate-slide-in-gaming">
      <div className="space-y-6">
        {/* Gaming Question Header */}
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-2 card-gaming rounded-full border border-accent/30 glow-lime">
            <span className="text-accent font-bold">Fill the Blanks 🎯</span>
          </div>
        </div>

        {/* Question with Neon Input Fields */}
        <div className="text-lg leading-relaxed font-medium text-white">
          {questionParts.map((part, index) => (
            <div key={index} className="inline">
              <span className="text-white/90">{part}</span>
              {index < blanksCount && (
                <span className="inline-block mx-2 relative">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id={`blank-${index}`}
                        value={userAnswers[index] || ''}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        disabled={localHasAnswered || isValidating}
                        className={cn(
                          "inline-block w-28 h-10 text-center text-sm font-bold border-2 rounded-xl transition-all duration-300",
                          "bg-white/5 backdrop-blur-md text-white placeholder-white/50",
                          !localHasAnswered && "border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30 glow-cyan",
                          localHasAnswered && perBlankResults ? 
                            (perBlankResults[index] 
                              ? "border-gaming-success bg-gaming-success/10 glow-lime animate-glow-pulse" 
                              : "border-gaming-error bg-gaming-error/10 animate-cyber-shake") :
                            ""
                        )}
                        placeholder="..."
                        autoComplete="off"
                      />
                      {/* Gaming Success Indicator */}
                      {localHasAnswered && perBlankResults && perBlankResults[index] && (
                        <span className="ml-1 text-gaming-success text-xl animate-bounce">⚡</span>
                      )}
                     </div>
                     {/* Gaming Error Correction */}
                     {localHasAnswered && perBlankResults && correctAnswers && !perBlankResults[index] && (
                       <div className="text-xs mt-1 px-2 py-1 card-gaming rounded border border-gaming-error/30 text-gaming-error font-bold">
                         Correct: <span className="text-gaming-success">{correctAnswers[index]}</span>
                       </div>
                     )}
                   </div>
                </span>
              )}
            </div>
          ))}
        </div>
          
        {/* Gaming Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {!localHasAnswered && (
            <>
              <Button
                onClick={handleSubmit}
                disabled={!allFieldsFilled || isValidating}
                className="btn-gaming bg-gradient-to-r from-primary to-secondary hover:scale-105 transform transition-all duration-300 glow-cyan font-bold px-8 py-3"
              >
                {isValidating ? '⚡ Processing...' : '🚀 Submit ⚡'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowHint(!showHint)}
                className="btn-gaming border-gaming-warning text-gaming-warning hover:bg-gaming-warning/10 hover:scale-105 transform transition-all duration-300 font-bold px-6 py-3"
                disabled={isValidating}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                {showHint ? '🔒 Hide' : '💡 Hint'}
              </Button>
            </>
          )}
        </div>
          
        {/* Gaming Hint Panel */}
        {showHint && !localHasAnswered && (
          <div className="card-gaming border border-gaming-warning/30 rounded-xl p-4 glow-pink animate-slide-in-gaming">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💡</span>
              <span className="font-bold text-gaming-warning">Gaming Hint</span>
            </div>
            <p className="text-sm text-white/80 font-medium">
              <strong className="text-gaming-warning">Blanks to fill:</strong> {blanksCount} 🎯
              <br />
              Think about basic ΑΕΠΠ concepts and programming fundamentals! 🚀
            </p>
          </div>
        )}
          
        {/* Gaming Feedback Panel */}
        {localHasAnswered && feedback && (
          <div className={cn(
            "card-gaming border rounded-xl p-6 animate-slide-in-gaming",
            feedback.includes('Σωστά') || feedback.includes('Σωστό')
              ? "border-gaming-success/30 glow-lime" 
              : feedback.includes('Σχεδόν σωστό')
              ? "border-gaming-warning/30 glow-pink"
              : "border-gaming-error/30"
          )}>
            <div className="flex items-center gap-3 mb-4">
              {feedback.includes('Σωστά') || feedback.includes('Σωστό') ? (
                <>
                  <CheckCircle className="h-6 w-6 text-gaming-success animate-bounce" />
                  <Badge className="bg-gaming-success text-white font-bold px-4 py-2">
                    🎯 Perfect Shot!
                  </Badge>
                </>
              ) : feedback.includes('Σχεδόν σωστό') ? (
                <>
                  <CheckCircle className="h-6 w-6 text-gaming-warning animate-pulse" />
                  <Badge className="bg-gaming-warning text-white font-bold px-4 py-2">
                    🔥 Almost There!
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-gaming-error animate-cyber-shake" />
                  <Badge className="bg-gaming-error text-white font-bold px-4 py-2">
                    💀 Partial Hit
                  </Badge>
                </>
              )}
            </div>
           
           {/* Gaming Progress Bar */}
           {typeof correctCount === 'number' && typeof totalBlanks === 'number' && (
             <div className="mb-4 p-4 card-gaming border border-primary/20 rounded-xl">
               <div className="flex items-center gap-2 mb-2">
                 <span className="text-xl">⚡</span>
                 <p className="text-sm text-primary font-bold">
                   Hits: {correctCount}/{totalBlanks} targets locked! 🎯
                 </p>
               </div>
               <div className="progress-gaming rounded-full h-3">
                 <div 
                   className="progress-bar h-3 rounded-full transition-all duration-1000 animate-glow-pulse"
                   style={{ width: `${(correctCount / totalBlanks) * 100}%` }}
                 />
               </div>
             </div>
           )}
           
           <p className="text-sm text-white/80 mb-4 font-medium">{feedback}</p>
           
           {onNextQuestion && (
             <div className="text-center">
               <Button
                 onClick={onNextQuestion}
                 className="btn-gaming bg-gradient-to-r from-accent to-primary hover:scale-105 transform transition-all duration-300 glow-cyan font-bold px-8 py-3"
               >
                 🚀 Next Quest ➡️
               </Button>
             </div>
           )}
         </div>
       )}
      </div>
    </div>
  );
}