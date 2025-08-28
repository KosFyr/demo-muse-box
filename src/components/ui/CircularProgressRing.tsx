import React from 'react';

interface CircularProgressRingProps {
  progress: number; // 0-100
  level: number;
  maxLevel: number;
  size?: number;
  strokeWidth?: number;
  glowColor?: string;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  progress,
  level,
  maxLevel,
  size = 120,
  strokeWidth = 8,
  glowColor = '#00c9ff'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={glowColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${glowColor}40)`,
          }}
        />
      </svg>

      {/* Level indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white font-orbitron">
          {level}
        </span>
        <span className="text-xs text-white/70">
          / {maxLevel}
        </span>
      </div>

      {/* Milestone badges */}
      {level >= 5 && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs animate-pulse">
            ⭐
          </div>
        </div>
      )}
      
      {level >= 10 && (
        <div className="absolute -bottom-2 -right-2">
          <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-xs animate-pulse">
            💎
          </div>
        </div>
      )}
    </div>
  );
};