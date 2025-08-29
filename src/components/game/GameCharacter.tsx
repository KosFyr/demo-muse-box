import React from 'react';
import { PlayerData } from './GameContainer';
import { cn } from '@/lib/utils';

interface GameCharacterProps {
  position: { x: number; y: number };
  playerData: PlayerData;
  isMoving: boolean;
}

export const GameCharacter: React.FC<GameCharacterProps> = ({
  position,
  playerData,
  isMoving
}) => {
  const getCharacterEmoji = () => {
    if (playerData.avatarImageUrl) {
      return null; // Will show image instead
    }
    
    // Colorful character options based on stick figure color
    const characters = {
      classic: '🚀',
      pink: '🦄'
    };
    
    return characters[playerData.stickFigureColor || 'classic'] || '🎮';
  };

  const getCharacterTrail = () => {
    if (!isMoving) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Movement sparkles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-70 animate-ping"
            style={{
              left: `${-20 - i * 10}px`,
              top: `${10 + i * 5}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.8s'
            }}
          >
            ✨
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-30"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      {/* Character Shadow */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-black/20 rounded-full blur-sm"></div>

      {/* Character Container */}
      <div className={cn(
        "relative transform transition-all duration-300",
        isMoving && "animate-bounce"
      )}>
        {/* Character Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 blur-lg opacity-50 animate-pulse scale-150"></div>

        {/* Main Character */}
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-cyan-400 border-4 border-white/30 shadow-2xl flex items-center justify-center">
          {playerData.avatarImageUrl ? (
            <img
              src={playerData.avatarImageUrl}
              alt="Player Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="text-3xl drop-shadow-lg">
              {getCharacterEmoji()}
            </div>
          )}
        </div>

        {/* Player Name Badge */}
        {playerData.name && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20 backdrop-blur-sm">
              {playerData.name}
            </div>
          </div>
        )}

        {/* Movement Effects */}
        {getCharacterTrail()}

        {/* Celebration Aura (when moving) */}
        {isMoving && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400/50 animate-ping scale-150"></div>
            <div className="absolute -top-4 -right-4 text-2xl animate-bounce">🎉</div>
            <div className="absolute -bottom-4 -left-4 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
          </div>
        )}
      </div>
    </div>
  );
};