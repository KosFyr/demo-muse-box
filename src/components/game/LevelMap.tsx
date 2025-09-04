import React from 'react';
import { LevelNode } from './LevelNode';

type MedalType = 'bronze' | 'silver' | 'gold' | null;

interface LevelData {
  id: number;
  isCompleted: boolean;
  score?: number;
  medal: MedalType;
}

interface LevelMapProps {
  levels: LevelData[];
  onLevelSelect: (levelNumber: number) => void;
  totalLevels?: number;
}

export const LevelMap: React.FC<LevelMapProps> = ({
  levels,
  onLevelSelect,
  totalLevels = 50
}) => {
  // Generate beautiful flowing path like Candy Crush
  const generateNodePosition = (index: number) => {
    const mapWidth = 800;
    const mapHeight = 600;
    
    // Create a serpentine (S-curved) path
    const nodesPerRow = 5;
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;
    
    // Alternate direction for each row to create zigzag
    const isEvenRow = row % 2 === 0;
    const actualCol = isEvenRow ? col : (nodesPerRow - 1 - col);
    
    // Base positions
    const baseX = 100 + (actualCol * (mapWidth - 200) / (nodesPerRow - 1));
    const baseY = 80 + row * 100;
    
    // Add slight random offset for organic feel
    const offsetX = (Math.sin(index * 0.5) * 20);
    const offsetY = (Math.cos(index * 0.3) * 15);
    
    return {
      x: Math.max(60, Math.min(mapWidth - 60, baseX + offsetX)),
      y: baseY + offsetY
    };
  };

  const getHighestUnlockedLevel = () => {
    // Find the highest completed level + 1 (next available)
    let highestCompleted = 0;
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].isCompleted) {
        highestCompleted = i + 1;
      } else {
        break;
      }
    }
    return highestCompleted + 1; // Next level to be unlocked
  };

  const isLevelUnlocked = (levelNumber: number) => {
    if (levelNumber === 1) return true; // First level always unlocked
    return levelNumber <= getHighestUnlockedLevel();
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Colorful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-purple-500/20 to-cyan-400/20 rounded-3xl blur-lg"></div>
      
      {/* Main Map Container */}
      <div className="relative bg-gradient-to-br from-indigo-900/30 via-purple-800/30 to-pink-700/30 rounded-3xl p-8 overflow-hidden backdrop-blur-sm border border-white/20">
        {/* Magical sparkles background */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse text-xs"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
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
              <stop offset="0%" stopColor="#ff6ec7" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#00c9ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7fff00" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="completedPath" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          
          {/* Draw connecting paths between levels */}
          {Array.from({ length: Math.min(totalLevels, levels.length) - 1 }).map((_, i) => {
            const start = generateNodePosition(i);
            const end = generateNodePosition(i + 1);
            const isPathCompleted = levels[i]?.isCompleted && levels[i + 1]?.isCompleted;
            const isPathAvailable = isLevelUnlocked(i + 2);
            
            return (
              <line
                key={i}
                x1={start.x + 32}
                y1={start.y + 32}
                x2={end.x + 32}
                y2={end.y + 32}
                stroke={isPathCompleted ? "url(#completedPath)" : isPathAvailable ? "url(#pathGradient)" : "#ffffff15"}
                strokeWidth="4"
                strokeDasharray={isPathCompleted ? "none" : "8,4"}
                className="transition-all duration-1000"
              />
            );
          })}
        </svg>

        {/* Level Nodes */}
        <div className="relative" style={{ height: '600px', minHeight: '600px' }}>
          {Array.from({ length: Math.min(totalLevels, levels.length || 10) }).map((_, i) => {
            const position = generateNodePosition(i);
            const levelNumber = i + 1;
            const levelData = levels[i];
            const chapterNumber = Math.floor(i / 10);
            const isLocked = !isLevelUnlocked(levelNumber);
            const isAvailable = isLevelUnlocked(levelNumber) && !levelData?.isCompleted;
            
            return (
              <LevelNode
                key={i}
                nodeNumber={levelNumber}
                position={position}
                chapterNumber={chapterNumber}
                isCompleted={levelData?.isCompleted || false}
                isLocked={isLocked}
                isAvailable={isAvailable}
                medal={levelData?.medal || null}
                score={levelData?.score}
                onClick={() => !isLocked && onLevelSelect(levelNumber)}
              />
            );
          })}
        </div>

        {/* Progress Header */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
            <div className="flex items-center gap-4 text-white">
              <div className="text-xl font-bold">🗺️</div>
              <div className="font-exo">
                <span className="text-lg font-bold text-cyan-400">Level Selection</span>
              </div>
              <div className="text-xl font-bold">⚡</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 text-white text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-pink-400"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-gray-600 to-gray-500"></div>
              <span>Locked</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🥉🥈🥇</span>
              <span>Medals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};