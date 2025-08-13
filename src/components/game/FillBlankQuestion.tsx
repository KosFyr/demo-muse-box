import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { fuzzyMatchMultiple } from '@/lib/fuzzyMatch';
import { cn } from '@/lib/utils';

interface FillBlankQuestionProps {
  questionText: string;
  correctAnswers: string[];
  explanation?: string;
  onAnswer: (isCorrect: boolean, userAnswers: string[]) => void;
  feedback?: {
    isCorrect: boolean;
    explanation?: string;
  };
  hasAnswered?: boolean;
  onNextQuestion?: () => void;
}

export function FillBlankQuestion({
  questionText,
  correctAnswers,
  explanation,
  onAnswer,
  feedback,
  hasAnswered = false,
  onNextQuestion
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
    if (localHasAnswered) return;
    
    const { overallMatch } = fuzzyMatchMultiple(userAnswers, correctAnswers, 0.75);
    setLocalHasAnswered(true);
    onAnswer(overallMatch, userAnswers);
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
  
  const getInputFeedback = (index: number) => {
    if (!localHasAnswered || !feedback) return null;
    
    const { matches, details } = fuzzyMatchMultiple(userAnswers, correctAnswers, 0.75);
    const isCorrect = matches[index];
    const similarity = details[index]?.similarity || 0;
    
    return {
      isCorrect,
      similarity,
      correctAnswer: correctAnswers[index]
    };
  };
  
  const allFieldsFilled = userAnswers.every(answer => answer.trim() !== '');
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Question with input fields */}
          <div className="text-lg leading-relaxed">
            {questionParts.map((part, index) => (
              <React.Fragment key={index}>
                <span>{part}</span>
                {index < blanksCount && (
                  <span className="inline-block mx-1 relative">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <Input
                          id={`blank-${index}`}
                          value={userAnswers[index] || ''}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          disabled={localHasAnswered}
                          className={cn(
                            "inline-block w-24 h-8 text-center text-sm border-2",
                            localHasAnswered && getInputFeedback(index) && (
                              getInputFeedback(index)!.isCorrect 
                                ? "border-green-500 bg-green-50 text-green-700" 
                                : "border-red-500 bg-red-50 text-red-700"
                            )
                          )}
                          placeholder="..."
                          autoComplete="off"
                        />
                        {localHasAnswered && getInputFeedback(index) && (
                          <span className="inline-block">
                            {getInputFeedback(index)!.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </span>
                        )}
                      </div>
                      {localHasAnswered && getInputFeedback(index) && !getInputFeedback(index)!.isCorrect && (
                        <div className="text-xs text-green-700 font-medium bg-green-100 px-2 py-1 rounded border border-green-300">
                          ✓ {correctAnswers[index]}
                        </div>
                      )}
                    </div>
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {!localHasAnswered && (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={!allFieldsFilled}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Υποβολή Απάντησης
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowHint(!showHint)}
                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {showHint ? 'Απόκρυψη' : 'Υπόδειξη'}
                </Button>
              </>
            )}
          </div>
          
          {/* Hint */}
          {showHint && !localHasAnswered && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Υπόδειξη:</strong> Αριθμός κενών: {blanksCount}. 
                Προσπαθήστε να θυμηθείτε τους βασικούς ορισμούς από το μάθημα ΑΕΠΠ.
              </p>
            </div>
          )}
          
          {/* Feedback */}
          {localHasAnswered && feedback && (
            <div className={cn(
              "border rounded-md p-4",
              feedback.isCorrect 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {feedback.isCorrect ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Badge variant="default" className="bg-green-600">
                      Σωστή απάντηση!
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <Badge variant="destructive">
                      Λανθασμένη απάντηση
                    </Badge>
                  </>
                )}
              </div>
              
              {!feedback.isCorrect && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Σωστές απαντήσεις:</p>
                  <div className="flex flex-wrap gap-2">
                    {correctAnswers.map((answer, index) => (
                      <Badge key={index} variant="outline" className="text-green-700 border-green-300">
                        {index + 1}. {answer}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {explanation && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>Επεξήγηση:</strong> {explanation}
                  </p>
                </div>
              )}
              
              {onNextQuestion && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={onNextQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Επόμενη Ερώτηση
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