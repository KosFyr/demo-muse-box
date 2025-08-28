import React, { useState, useRef } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

interface IcebergGameBoardProps {
  effectivePosition: number;
  playerData: {
    name: string;
    mission?: string;
    avatarUrl?: string;
  };
  isClimbing?: boolean;
  isSlipping?: boolean;
}

export const IcebergGameBoard: React.FC<IcebergGameBoardProps> = ({
  effectivePosition,
  playerData,
  isClimbing = false,
  isSlipping = false
}) => {
  return (
    <GlassCard glowColor="cyan" intensity="high" className="p-0 overflow-hidden">
      <div className="relative w-full h-96 bg-gradient-to-b from-blue-900/20 via-purple-900/20 to-slate-900/20">
        {/* Player Progress Display */}
        <div className="absolute top-4 left-4">
          <GlassCard glowColor="lime" className="p-3">
            <div className="text-white font-orbitron font-bold">
              <div className="text-lg">{playerData.name}</div>
              <div className="text-sm text-lime-400">{playerData.mission || 'Code Quest'}</div>
              <div className="text-xs text-white/70 mt-1">Level {Math.floor(effectivePosition) + 1}/15</div>
            </div>
          </GlassCard>
        </div>

        {/* Animated Character Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`relative transition-all duration-1000 ${isClimbing ? 'animate-bounce' : isSlipping ? 'animate-cyber-shake' : ''}`}>
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm">
              {playerData.avatarUrl ? (
                <img src={playerData.avatarUrl} alt="Player avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🎮</div>
              )}
            </div>

            {/* Status Effects */}
            {isClimbing && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lime-400 text-2xl animate-bounce">
                ⬆️ +LVL
              </div>
            )}
            
            {isSlipping && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-red-400 text-2xl animate-pulse">
                💫 RIP
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-4 left-4 right-4">
          <GlassCard glowColor="cyan" className="p-3">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-orbitron text-sm font-bold">PROGRESS</span>
              <div className="flex-1 bg-black/30 rounded-full h-2">
                <div className="h-2 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-full transition-all duration-700"
                     style={{ width: `${(effectivePosition / 15) * 100}%` }} />
              </div>
              <span className="text-white/80 font-exo text-sm">{Math.round((effectivePosition / 15) * 100)}%</span>
            </div>
          </GlassCard>
        </div>

        {/* Gaming Particles */}
        <div className="absolute top-1/4 right-1/4 text-cyan-400/30 text-2xl animate-float">⚡</div>
        <div className="absolute bottom-1/3 left-1/4 text-pink-400/30 text-xl animate-pulse">💎</div>
        <div className="absolute top-1/2 left-1/3 text-lime-400/20 text-lg animate-bounce">🔥</div>
      </div>
    </GlassCard>
  );
};