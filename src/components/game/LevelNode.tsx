import React from 'react';
import { cn } from '@/lib/utils';

type MedalType = 'bronze' | 'silver' | 'gold' | null;

interface LevelNodeProps {
  nodeNumber: number;
  position: { x: number; y: number };
  chapterNumber: number;
  isCompleted: boolean;
  isLocked: boolean;
  isAvailable: boolean;
  medal: MedalType;
  score?: number;
  onClick?: () => void;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
  nodeNumber,
  position,
  chapterNumber,
  isCompleted,
  isLocked,
  isAvailable,
  medal,
  score,
  onClick
}) => {
  const getChapterColors = () => {
    const colors = [
      { bg: 'linear-gradient(135deg, #ff6ec7, #ff8fab)', border: '#ff6ec7', glow: 'rgba(255, 110, 199, 0.4)' }, // Pink
      { bg: 'linear-gradient(135deg, #00c9ff, #92ffd3)', border: '#00c9ff', glow: 'rgba(0, 201, 255, 0.4)' }, // Cyan
      { bg: 'linear-gradient(135deg, #7fff00, #59ff00)', border: '#7fff00', glow: 'rgba(127, 255, 0, 0.4)' }, // Lime
      { bg: 'linear-gradient(135deg, #9c27b0, #e91e63)', border: '#9c27b0', glow: 'rgba(156, 39, 176, 0.4)' }, // Purple
      { bg: 'linear-gradient(135deg, #ff9800, #ff5722)', border: '#ff9800', glow: 'rgba(255, 152, 0, 0.4)' } // Orange
    ];
    return colors[chapterNumber % colors.length];
  };

  const getNodeStyle = () => {
    const chapterColors = getChapterColors();
    
    if (isLocked) {
      return {
        background: 'linear-gradient(135deg, #374151, #1f2937)',
        border: '3px solid #4b5563',
        boxShadow: '0 0 5px rgba(75, 85, 99, 0.3)',
        color: '#6b7280',
        cursor: 'not-allowed'
      };
    }
    
    if (isCompleted) {
      return {
        background: chapterColors.bg,
        border: `3px solid ${chapterColors.border}`,
        boxShadow: `0 0 20px ${chapterColors.glow}, 0 0 40px ${chapterColors.glow}`,
        color: 'white',
        cursor: 'pointer'
      };
    }
    
    if (isAvailable) {
      return {
        background: `linear-gradient(135deg, ${chapterColors.border}88, ${chapterColors.border}44)`,
        border: `3px solid ${chapterColors.border}`,
        boxShadow: `0 0 15px ${chapterColors.glow}`,
        color: 'white',
        cursor: 'pointer'
      };
    }
    
    return {
      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
      border: '3px solid #9ca3af',
      boxShadow: '0 0 10px rgba(107, 114, 128, 0.3)',
      color: '#d1d5db',
      cursor: 'not-allowed'
    };
  };

  const getMedalIcon = () => {
    if (medal === 'gold') return '🥇';
    if (medal === 'silver') return '🥈';
    if (medal === 'bronze') return '🥉';
    return null;
  };

  const getNodeIcon = () => {
    if (isCompleted && medal) return getMedalIcon();
    if (isCompleted) return '⭐';
    if (isLocked) return '🔒';
    return nodeNumber;
  };

  const getDecorations = () => {
    if (isCompleted && medal) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Sparkle effects for completed levels */}
          <div className="absolute -top-1 -right-1 text-yellow-300 animate-bounce text-sm">✨</div>
          <div className="absolute -bottom-1 -left-1 text-yellow-300 animate-bounce text-sm" style={{ animationDelay: '0.5s' }}>⭐</div>
        </div>
      );
    }
    
    if (isAvailable && !isCompleted) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Gentle pulse for available levels */}
          <div 
            className="absolute inset-0 rounded-full bg-white/10 animate-pulse"
            style={{ animationDuration: '2s' }}
          ></div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
      style={{
        left: position.x,
        top: position.y,
        zIndex: isCompleted ? 15 : isAvailable ? 10 : 5
      }}
    >
      {/* Node Background Glow */}
      <div
        className="absolute inset-0 rounded-full blur-lg opacity-30"
        style={{
          ...getNodeStyle(),
          width: '90px',
          height: '90px',
          transform: 'translate(-10px, -10px)'
        }}
      ></div>

      {/* Main Node */}
      <div
        className={cn(
          "relative w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold text-lg transition-all duration-500",
          (isAvailable || isCompleted) && "hover:scale-110",
          isLocked && "opacity-60"
        )}
        style={getNodeStyle()}
        onClick={!isLocked ? onClick : undefined}
      >
        <div className="text-xl">{getNodeIcon()}</div>
        {isCompleted && score !== undefined && (
          <div className="text-xs text-white/80 font-medium">{score}%</div>
        )}
        
        {getDecorations()}
      </div>

      {/* Chapter Badge */}
      {nodeNumber % 10 === 1 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            Chapter {chapterNumber + 1}
          </div>
        </div>
      )}

      {/* Node Label */}
      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-exo whitespace-nowrap text-center">
          <div>Level {nodeNumber}</div>
          {isCompleted && medal && (
            <div className="text-yellow-300 font-medium">
              {medal.charAt(0).toUpperCase() + medal.slice(1)}
            </div>
          )}
          {isLocked && (
            <div className="text-red-300">Locked</div>
          )}
        </div>
      </div>
    </div>
  );
};