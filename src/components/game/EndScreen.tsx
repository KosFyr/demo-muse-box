import { Button } from '@/components/ui/button';
import { PlayerData, GameState } from './GameContainer';
import { Trophy, Medal, Target, RotateCcw, Home } from 'lucide-react';

interface EndScreenProps {
  gameState: GameState;
  playerData: PlayerData;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const EndScreen = ({ gameState, playerData, onPlayAgain, onHome }: EndScreenProps) => {
  const isWinner = gameState.currentPosition >= 15;
  const accuracy = gameState.totalQuestions > 0 ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) : 0;

  const getPerformanceMessage = () => {
    if (isWinner) {
      if (accuracy >= 90) return "Εξαιρετική επίδοση! Είσαι πραγματικός ειδικός! 🌟";
      if (accuracy >= 80) return "Υπέροχη δουλειά! Φτάσες στην κορυφή! 🎊";
      return "Συγχαρητήρια! Ολοκλήρωσες την αναρρίχηση! 🎉";
    } else {
      if (accuracy >= 70) return "Καλή προσπάθεια! Λίγο ακόμα και θα τα καταφέρεις! 💪";
      if (accuracy >= 50) return "Μπορείς και καλύτερα! Δοκίμασε ξανά! 🚀";
      return "Μην τα παρατάς! Η εξάσκηση κάνει τον δάσκαλο! 📚";
    }
  };

  const getScoreColor = () => {
    if (accuracy >= 80) return "text-green-300";
    if (accuracy >= 60) return "text-yellow-300";
    return "text-red-300";
  };

  return (
    <div className="text-center space-y-8 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="text-6xl mb-4">
          {isWinner ? '🏆' : '🎯'}
        </div>
        
        <h2 className="text-4xl font-bold text-white drop-shadow-lg">
          {isWinner ? 'Συγχαρητήρια!' : 'Παιχνίδι Τελειωμένο!'}
        </h2>
        
        <p className="text-xl text-white/90">
          {getPerformanceMessage()}
        </p>
      </div>

      {/* Player Avatar */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Stick figure with face */}
          <svg viewBox="0 0 100 130" className="w-28 h-36">
            <defs>
              <clipPath id="endScreenHeadClip">
                <circle cx="50" cy="20" r="18" />
              </clipPath>
              <filter id="endScreenHeadShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
              </filter>
            </defs>
            
            {/* Head with shadow and outline */}
            <g filter="url(#endScreenHeadShadow)">
              {/* Player face image */}
              {playerData.avatarImageUrl && (
                <image 
                  href={playerData.avatarImageUrl} 
                  x="32" y="2" 
                  width="36" height="36" 
                  clipPath="url(#endScreenHeadClip)"
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              {/* Circle outline */}
              <circle 
                cx="50" cy="20" r="18" 
                fill={playerData.avatarImageUrl ? "transparent" : "white"} 
                stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} 
                strokeWidth="2.5" 
              />
            </g>
            
            {/* Neck */}
            <line x1="50" y1="38" x2="50" y2="45" stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="2"/>
            
            {/* Body */}
            <line x1="50" y1="45" x2="50" y2="80" stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="3"/>
            
            {/* Arms - victory pose if winner */}
            {isWinner ? (
              <>
                <line x1="50" y1="55" x2="25" y2="40" stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="3"/>
                <line x1="50" y1="55" x2="75" y2="40" stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="3"/>
              </>
            ) : (
              <>
                <line x1="50" y1="55" x2="30" y2="70" stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="3"/>
                <line x1="50" y1="55" x2="70" y2="70" stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="3"/>
              </>
            )}
            
            {/* Legs */}
            <line x1="50" y1="80" x2="35" y2="110" stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="3"/>
            <line x1="50" y1="80" x2="65" y2="110" stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="3"/>
          </svg>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/20 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white">
            {gameState.currentPosition}
          </div>
          <div className="text-white/80 text-sm">
            Τελικό Επίπεδο
          </div>
        </div>

        <div className="bg-white/20 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-300">
            {gameState.correctAnswers}
          </div>
          <div className="text-white/80 text-sm">
            Σωστές Απαντήσεις
          </div>
        </div>

        <div className="bg-white/20 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Medal className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {gameState.totalQuestions}
          </div>
          <div className="text-white/80 text-sm">
            Συνολικές Ερωτήσεις
          </div>
        </div>

        <div className="bg-white/20 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-6 h-6 text-yellow-400">🎯</div>
          </div>
          <div className={`text-2xl font-bold ${getScoreColor()}`}>
            {accuracy}%
          </div>
          <div className="text-white/80 text-sm">
            Ακρίβεια
          </div>
        </div>
      </div>

      {/* Player Name */}
      <div className="text-xl text-white/90">
        Παίκτης: <span className="font-bold text-white">{playerData.name}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
        <Button 
          onClick={onPlayAgain}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-xl px-8"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Παίξε Ξανά
        </Button>
        
        <Button 
          onClick={onHome}
          size="lg"
          variant="outline"
          className="bg-white/20 border-white/40 text-white hover:bg-white/30 px-8"
        >
          <Home className="w-5 h-5 mr-2" />
          Αρχική Σελίδα
        </Button>
      </div>

      {/* Motivational message */}
      <div className="text-white/70 text-sm italic max-w-md mx-auto">
        "Κάθε λάθος είναι μια ευκαιρία να μάθεις κάτι νέο. Συνέχισε να προσπαθείς!"
      </div>
    </div>
  );
};