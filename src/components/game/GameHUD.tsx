import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CircularProgressRing } from '@/components/ui/CircularProgressRing';
import { GameState } from './GameContainer';

interface GameHUDProps {
  gameState: GameState;
  totalLevels: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({ gameState, totalLevels }) => {
  const progressPercentage = (gameState.currentPosition / totalLevels) * 100;
  const accuracy = gameState.totalQuestions > 0 
    ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100)
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <GlassCard glowColor="lime" className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Level Progress */}
          <div className="flex items-center gap-4">
            <CircularProgressRing
              progress={progressPercentage}
              level={gameState.currentPosition}
              maxLevel={totalLevels}
              size={80}
            />
            
            <div className="text-white">
              <h3 className="font-orbitron font-bold text-xl mb-1 flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                Level {gameState.currentPosition}
              </h3>
              <div className="flex items-center gap-4 text-sm font-exo">
                <div className="flex items-center gap-1">
                  <span className="text-green-400">✅</span>
                  <span className="text-white/70">Score:</span>
                  <span className="text-cyan-400 font-bold">{gameState.correctAnswers}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-400">🎯</span>
                  <span className="text-white/70">Accuracy:</span>
                  <span className="text-lime-400 font-bold">{accuracy}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="flex-1 min-w-[200px] max-w-md">
            <div className="text-right text-white/80 font-exo mb-2">
              <div className="text-sm">Level Progress</div>
              <div className="text-lg font-bold text-cyan-400">
                {Math.round(gameState.currentLevelProgress * 100)}%
              </div>
            </div>
            
            <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden border border-white/20">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 transition-all duration-700 rounded-full relative overflow-hidden"
                style={{ width: `${gameState.currentLevelProgress * 100}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Fun Stats */}
          <div className="text-right">
            <div className="flex items-center gap-3 text-2xl mb-2">
              <div className="animate-bounce">🎮</div>
              <div className="animate-pulse">⚡</div>
              <div className="animate-bounce" style={{ animationDelay: '0.5s' }}>🌟</div>
            </div>
            <div className="text-xs text-white/60 font-exo">
              Questions: {gameState.totalQuestions}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};