import { useState, useEffect } from 'react';
import { PlayerData } from './GameContainer';

interface VerticalGameBoardProps {
  currentPosition: number;
  playerData: PlayerData;
  isMoving: boolean;
}

export const VerticalGameBoard = ({ currentPosition, playerData, isMoving }: VerticalGameBoardProps) => {
  const [animatingPosition, setAnimatingPosition] = useState(currentPosition);
  const [showParachute, setShowParachute] = useState(false);

  useEffect(() => {
    if (currentPosition !== animatingPosition) {
      if (currentPosition < animatingPosition) {
        // Falling - show parachute
        setShowParachute(true);
        setTimeout(() => {
          setAnimatingPosition(currentPosition);
          setShowParachute(false);
        }, 1500);
      } else {
        // Climbing
        setAnimatingPosition(currentPosition);
      }
    }
  }, [currentPosition, animatingPosition]);

  // Generate platform positions (15 levels)
  const generatePlatforms = () => {
    const platforms = [];
    const totalLevels = 15;
    const boardHeight = 600;
    const platformHeight = boardHeight / (totalLevels + 1);

    for (let i = 1; i <= totalLevels; i++) {
      const y = boardHeight - (i * platformHeight) + 50;
      // Alternate sides for zigzag effect
      const x = i % 2 === 1 ? 100 : 300;
      
      platforms.push({
        level: i,
        x,
        y,
        isCheckpoint: i % 5 === 0, // Every 5th level is a checkpoint
        isGoal: i === 15
      });
    }
    
    return platforms;
  };

  const platforms = generatePlatforms();
  const currentPlatform = platforms.find(p => p.level === animatingPosition);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Mountain Background */}
      <svg 
        viewBox="0 0 500 700" 
        className="w-full h-96 bg-gradient-to-b from-blue-200/20 to-green-200/20 rounded-2xl border border-white/20"
      >
        {/* Mountain silhouette */}
        <polygon
          points="0,700 150,300 250,150 350,300 500,700"
          fill="url(#mountainGradient)"
          opacity="0.3"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 0.4 }} />
          </linearGradient>
        </defs>

        {/* Clouds */}
        <circle cx="400" cy="200" r="30" fill="white" opacity="0.6" />
        <circle cx="420" cy="190" r="35" fill="white" opacity="0.6" />
        <circle cx="440" cy="200" r="30" fill="white" opacity="0.6" />

        <circle cx="80" cy="150" r="25" fill="white" opacity="0.5" />
        <circle cx="95" cy="140" r="30" fill="white" opacity="0.5" />
        <circle cx="110" cy="150" r="25" fill="white" opacity="0.5" />

        {/* Platforms */}
        {platforms.map((platform) => (
          <g key={platform.level}>
            {/* Platform */}
            <rect
              x={platform.x - 40}
              y={platform.y}
              width="80"
              height="8"
              rx="4"
              fill={platform.isGoal ? '#FFD700' : platform.isCheckpoint ? '#FF6B6B' : '#4ECDC4'}
              stroke={platform.level === animatingPosition ? '#FFFFFF' : 'none'}
              strokeWidth="2"
            />
            
            {/* Level number */}
            <text
              x={platform.x}
              y={platform.y - 8}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              {platform.level}
            </text>

            {/* Special indicators */}
            {platform.isGoal && (
              <text x={platform.x} y={platform.y - 25} textAnchor="middle" fontSize="20">
                🏆
              </text>
            )}
            {platform.isCheckpoint && !platform.isGoal && (
              <text x={platform.x} y={platform.y - 25} textAnchor="middle" fontSize="16">
                🚩
              </text>
            )}
          </g>
        ))}

        {/* Connecting path */}
        {platforms.slice(0, -1).map((platform, index) => {
          const nextPlatform = platforms[index + 1];
          return (
            <line
              key={`path-${platform.level}`}
              x1={platform.x}
              y1={platform.y}
              x2={nextPlatform.x}
              y2={nextPlatform.y}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        })}

        {/* Player avatar */}
        {currentPlatform && (
          <g
            transform={`translate(${currentPlatform.x}, ${currentPlatform.y - 40})`}
            className={isMoving ? 'transition-transform duration-1000' : ''}
          >
            {/* Parachute when falling */}
            {showParachute && (
              <g transform="translate(0, -30)">
                <path
                  d="M -20,-10 Q 0,-30 20,-10"
                  fill="#FF6B6B"
                  stroke="#FF4757"
                  strokeWidth="1"
                />
                <line x1="0" y1="-10" x2="0" y2="20" stroke="#333" strokeWidth="1" />
              </g>
            )}
            
            {/* Big Head Stick Figure */}
            <g>
              {/* Big Head with player face */}
              <circle cx="0" cy="0" r="18" fill="white" stroke="#333" strokeWidth="2" />
              
              {/* Player face overlay - bigger */}
              {playerData.avatarImageUrl && (
                <foreignObject x="-15" y="-15" width="30" height="30">
                  <div 
                    className="w-full h-full rounded-full overflow-hidden"
                    style={{
                      backgroundImage: `url(${playerData.avatarImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                </foreignObject>
              )}
              
              {/* Thin Body - with walking animation */}
              <line x1="0" y1="18" x2="0" y2="40" stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="2" />
              
              {/* Arms - with walking swing */}
              <line 
                x1="0" y1="28" x2="-10" y2="35" 
                stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="1.5"
                className={isMoving ? 'animate-armSwing' : ''}
              />
              <line 
                x1="0" y1="28" x2="10" y2="35" 
                stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="1.5"
                className={isMoving ? 'animate-armSwing' : ''}
                style={isMoving ? { animationDirection: 'reverse' } : {}}
              />
              
              {/* Legs - with walking motion */}
              <line 
                x1="0" y1="40" x2="-8" y2="50" 
                stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="1.5"
                className={isMoving ? 'animate-walkStep' : ''}
              />
              <line 
                x1="0" y1="40" x2="8" y2="50" 
                stroke={playerData.stickFigureColor === 'pink' ? '#F472B6' : '#333'} strokeWidth="1.5"
                className={isMoving ? 'animate-walkStep' : ''}
                style={isMoving ? { animationDirection: 'reverse' } : {}}
              />
            </g>

            {/* Climbing animation particles */}
            {isMoving && currentPosition > animatingPosition && (
              <g>
                <circle cx="-20" cy="10" r="2" fill="#FFD700" opacity="0.8">
                  <animate attributeName="cy" values="10;0;10" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="20" cy="15" r="1.5" fill="#FF6B6B" opacity="0.8">
                  <animate attributeName="cy" values="15;5;15" dur="0.8s" repeatCount="indefinite" />
                </circle>
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Player name and progress */}
      <div className="text-center mt-4 space-y-2">
        <div className="text-white font-bold text-lg">
          {playerData.name}
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${(animatingPosition / 15) * 100}%` }}
          />
        </div>
        <div className="text-white/80 text-sm">
          Πρόοδος: {animatingPosition}/15 ({Math.round((animatingPosition / 15) * 100)}%)
        </div>
      </div>
    </div>
  );
};