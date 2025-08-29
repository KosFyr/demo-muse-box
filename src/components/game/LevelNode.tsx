import React from 'react';
import { cn } from '@/lib/utils';

interface LevelNodeProps {
  nodeNumber: number;
  position: { x: number; y: number };
  isCompleted: boolean;
  isCurrent: boolean;
  isNext: boolean;
  progress: number;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
  nodeNumber,
  position,
  isCompleted,
  isCurrent,
  isNext,
  progress
}) => {
  const getNodeStyle = () => {
    if (isCompleted) {
      return {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: '3px solid #34d399',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3)',
        color: 'white'
      };
    }
    
    if (isCurrent) {
      return {
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        border: '3px solid #60a5fa',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)',
        color: 'white'
      };
    }
    
    if (isNext) {
      return {
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        border: '3px solid #fbbf24',
        boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
        color: 'white'
      };
    }
    
    return {
      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
      border: '3px solid #9ca3af',
      boxShadow: '0 0 10px rgba(107, 114, 128, 0.3)',
      color: '#d1d5db'
    };
  };

  const getNodeIcon = () => {
    if (isCompleted) return '⭐';
    if (isCurrent) return `${nodeNumber}`;
    if (isNext) return '🎯';
    return nodeNumber;
  };

  const getDecorations = () => {
    if (isCompleted) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Sparkle effects */}
          <div className="absolute -top-2 -right-2 text-yellow-300 animate-bounce">✨</div>
          <div className="absolute -bottom-2 -left-2 text-yellow-300 animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</div>
          <div className="absolute -top-2 -left-2 text-yellow-300 animate-bounce" style={{ animationDelay: '1s' }}>💫</div>
        </div>
      );
    }
    
    if (isCurrent) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {/* Progress ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
          {/* Pulse effect */}
          <div 
            className="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse"
            style={{ animationDuration: '1s' }}
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
        zIndex: isCurrent ? 20 : isCompleted ? 15 : 10
      }}
    >
      {/* Node Background Glow */}
      <div
        className="absolute inset-0 rounded-full blur-lg opacity-50 animate-pulse"
        style={{
          ...getNodeStyle(),
          width: '100px',
          height: '100px',
          transform: 'translate(-12px, -12px)'
        }}
      ></div>

      {/* Main Node */}
      <div
        className={cn(
          "relative w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl transition-all duration-500 cursor-pointer transform hover:scale-110",
          isCurrent && "animate-pulse"
        )}
        style={getNodeStyle()}
      >
        {getNodeIcon()}
        
        {/* Progress indicator for current node */}
        {isCurrent && progress > 0 && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-lime-400 to-green-400 transition-all duration-700"
              style={{ height: `${progress * 100}%` }}
            ></div>
          </div>
        )}
        
        {getDecorations()}
      </div>

      {/* Node Label */}
      {!isCompleted && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm font-exo whitespace-nowrap">
            {isCurrent ? 'Current Level' : isNext ? 'Next Up!' : `Level ${nodeNumber}`}
          </div>
        </div>
      )}
    </div>
  );
};