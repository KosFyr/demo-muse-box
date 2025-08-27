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
    <Card className="w-full card-gaming animate-fade-in">
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Question with input fields */}
          <div className="text-lg leading-relaxed font-gaming">
            {questionParts.map((part, index) => (
              <div key={index} className="inline">
                <span className="text-foreground">{part}</span>
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
                            "inline-block w-28 h-10 text-center text-sm border-2 bg-input/50 font-gaming",
                            localHasAnswered && perBlankResults ? 
                              (perBlankResults[index] ? 
                                "border-accent glow-green bg-accent/10" : 
                                "border-destructive glow-blue bg-destructive/10"
                              ) :
                              "border-border hover:border-primary/50 focus:border-primary glow-blue"
                          )}
                          placeholder="..."
                          autoComplete="off"
                        />
                        {/* Ice pick indicator for correct answers */}
                        {localHasAnswered && perBlankResults && perBlankResults[index] && (
                          <span className="ml-1 text-gaming-orange animate-pulse">⛏️</span>
                        )}
                       </div>
                       {/* Correction below when wrong */}
                       {localHasAnswered && perBlankResults && correctAnswers && !perBlankResults[index] && (
                         <div className="text-xs mt-1 text-destructive font-medium glass-effect px-2 py-1 rounded">
                           Σωστό: <span className="font-bold text-accent">{correctAnswers[index]}</span>
                         </div>
                       )}
                     </div>
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-4">
            {!localHasAnswered && (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={!allFieldsFilled || isValidating}
                  className="btn-gaming font-gaming font-bold"
                >
                  {isValidating ? '🔄 Επεξεργασία...' : '📤 Υποβολή Απάντησης'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowHint(!showHint)}
                  className="border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary-foreground glow-purple font-gaming"
                  disabled={isValidating}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {showHint ? '🙈 Απόκρυψη' : '💡 Υπόδειξη'}
                </Button>
              </>
            )}
          </div>
          
          {/* Hint */}
          {showHint && !localHasAnswered && (
            <div className="glass-effect rounded-xl p-6 animate-scale-in">
              <p className="text-sm text-gaming-orange font-gaming">
                <strong className="text-gaming-orange-glow">💡 Υπόδειξη:</strong> Αριθμός κενών: {blanksCount}. 
                Προσπαθήστε να θυμηθείτε τους βασικούς ορισμούς από το μάθημα ΑΕΠΠ.
              </p>
            </div>
          )}
          
          {/* Feedback */}
          {localHasAnswered && feedback && (
            <div className={cn(
              "border rounded-xl p-6 card-gaming animate-fade-in-up",
              feedback.includes('Σωστά') || feedback.includes('Σωστό')
                ? "border-accent/50 glow-green" 
                : feedback.includes('Σχεδόν σωστό')
                ? "border-gaming-orange/50 glow-blue"
                : "border-destructive/50 glow-blue"
            )}>
              <div className="flex items-center gap-3 mb-4">
                {feedback.includes('Σωστά') || feedback.includes('Σωστό') ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-accent animate-pulse" />
                    <Badge variant="default" className="bg-gradient-accent text-accent-foreground font-gaming glow-green">
                      ✨ Σωστή απάντηση!
                    </Badge>
                  </>
                ) : feedback.includes('Σχεδόν σωστό') ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-gaming-orange animate-pulse" />
                    <Badge variant="default" className="bg-gaming-orange text-gaming-orange-foreground font-gaming">
                      🎯 Σχεδόν σωστό!
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-destructive animate-pulse" />
                    <Badge variant="destructive" className="font-gaming glow-blue">
                      ⚡ Μερική απάντηση
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Partial credit display */}
              {typeof correctCount === 'number' && typeof totalBlanks === 'number' && (
                <div className="mb-4 p-4 glass-effect rounded-xl">
                  <p className="text-sm text-primary font-bold font-gaming mb-2">
                    ⛏️ Καρφώθηκαν {correctCount}/{totalBlanks} αγκίστρια
                  </p>
                  <div className="progress-gaming rounded-full h-3">
                    <div 
                      className="progress-fill h-3 rounded-full transition-all duration-1000 animate-shimmer"
                      style={{ width: `${(correctCount / totalBlanks) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground mb-4 font-gaming">{feedback}</p>
              
              
              {onNextQuestion && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={onNextQuestion}
                    className="btn-gaming font-gaming font-bold animate-breath"
                  >
                    ➡️ Επόμενη Ερώτηση
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}