import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FillBlankQuestionProps {
  questionText: string;
  explanation?: string;
  onAnswer: (userAnswers: string[]) => void;
  feedback?: string;
  hasAnswered?: boolean;
  onNextQuestion?: () => void;
  isValidating?: boolean;
  perBlankResults?: boolean[];
  correctCount?: number;
  totalBlanks?: number;
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
  totalBlanks
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
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Question with input fields */}
          <div className="text-lg leading-relaxed">
            {questionParts.map((part, index) => (
              <div key={index} className="inline">
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
                          disabled={localHasAnswered || isValidating}
                          className={cn(
                            "inline-block w-24 h-8 text-center text-sm border-2",
                            localHasAnswered && perBlankResults ? 
                              (perBlankResults[index] ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50") :
                              ""
                          )}
                          placeholder="..."
                          autoComplete="off"
                        />
                        {/* Ice pick indicator for correct answers */}
                        {localHasAnswered && perBlankResults && perBlankResults[index] && (
                          <span className="ml-1 text-orange-500">⛏️</span>
                        )}
                      </div>
                    </div>
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {!localHasAnswered && (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={!allFieldsFilled || isValidating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isValidating ? 'Επεξεργασία...' : 'Υποβολή Απάντησης'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowHint(!showHint)}
                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  disabled={isValidating}
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
              feedback.includes('Σωστά') || feedback.includes('Σωστό')
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {feedback.includes('Σωστά') || feedback.includes('Σωστό') ? (
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
                      Μερική απάντηση
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Partial credit display */}
              {typeof correctCount === 'number' && typeof totalBlanks === 'number' && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800 font-medium">
                    ⛏️ Καρφώθηκαν {correctCount}/{totalBlanks} αγκίστρια
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(correctCount / totalBlanks) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-700 mb-3">{feedback}</p>
              
              {explanation && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Εξήγηση:</strong> {explanation}
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