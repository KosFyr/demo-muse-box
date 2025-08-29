import React from 'react';
import { LevelNode } from './LevelNode';
import { GameCharacter } from './GameCharacter';
import { PlayerData } from './GameContainer';

interface LevelMapProps {
  currentPosition: number;
  levelProgress: number;
  playerData: PlayerData;
  isMoving: boolean;
  totalLevels?: number;
}

export const LevelMap: React.FC<LevelMapProps> = ({
  currentPosition,
  levelProgress,
  playerData,
  isMoving,
  totalLevels = 15
}) => {
  // Create a winding path of nodes
  const generateNodePosition = (index: number) => {
    const pathWidth = 800;
    const pathHeight = 600;
    const nodesPerRow = 5;
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;
    
    // Zigzag pattern
    const isEvenRow = row % 2 === 0;
    const actualCol = isEvenRow ? col : (nodesPerRow - 1 - col);
    
    const x = (actualCol / (nodesPerRow - 1)) * pathWidth;
    const y = pathHeight - (row * (pathHeight / Math.ceil(totalLevels / nodesPerRow)));
    
    return { x, y };
  };

  // Calculate character position with smooth interpolation
  const getCharacterPosition = () => {
    if (currentPosition === 0) {
      return generateNodePosition(0);
    }
    
    const currentNode = generateNodePosition(Math.min(currentPosition - 1, totalLevels - 1));
    const nextNode = generateNodePosition(Math.min(currentPosition, totalLevels - 1));
    
    // Interpolate between current and next position based on progress
    const x = currentNode.x + (nextNode.x - currentNode.x) * levelProgress;
    const y = currentNode.y + (nextNode.y - currentNode.y) * levelProgress;
    
    return { x, y };
  };

  const characterPos = getCharacterPosition();

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Colorful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-purple-500/20 to-cyan-400/20 rounded-3xl blur-lg"></div>
      
      {/* Main Map Container */}
      <div className="relative bg-gradient-to-br from-indigo-900/50 via-purple-800/50 to-pink-700/50 rounded-3xl p-8 overflow-hidden backdrop-blur-sm border border-white/20">
        {/* Magical sparkles background */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>

        {/* Path Trail */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6ec7" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#00c9ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7fff00" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          
          {/* Draw connecting path */}
          {Array.from({ length: totalLevels - 1 }).map((_, i) => {
            const start = generateNodePosition(i);
            const end = generateNodePosition(i + 1);
            const isCompleted = i < currentPosition - 1;
            
            return (
              <line
                key={i}
                x1={start.x + 40}
                y1={start.y + 40}
                x2={end.x + 40}
                y2={end.y + 40}
                stroke={isCompleted ? "url(#pathGradient)" : "#ffffff20"}
                strokeWidth="6"
                strokeDasharray={isCompleted ? "none" : "10,5"}
                className="transition-all duration-1000"
              />
            );
          })}
        </svg>

        {/* Level Nodes */}
        <div className="relative" style={{ height: '600px' }}>
          {Array.from({ length: totalLevels }).map((_, i) => {
            const position = generateNodePosition(i);
            const nodeNumber = i + 1;
            const isCompleted = i < currentPosition;
            const isCurrent = i === currentPosition;
            const isNext = i === currentPosition + 1;
            
            return (
              <LevelNode
                key={i}
                nodeNumber={nodeNumber}
                position={position}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isNext={isNext}
                progress={isCurrent ? levelProgress : 0}
              />
            );
          })}

          {/* Game Character */}
          <GameCharacter
            position={characterPos}
            playerData={playerData}
            isMoving={isMoving}
          />
        </div>

        {/* Progress Header */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
            <div className="flex items-center gap-4 text-white">
              <div className="text-xl font-bold">🎯</div>
              <div className="font-exo">
                <span className="text-2xl font-bold text-cyan-400">{currentPosition}</span>
                <span className="text-white/70 mx-2">/</span>
                <span className="text-white/70">{totalLevels}</span>
              </div>
              <div className="text-xl font-bold">🎮</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};