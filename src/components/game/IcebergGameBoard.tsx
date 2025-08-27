import { useState, useEffect } from 'react';
import { PlayerData } from './GameContainer';

interface IcebergGameBoardProps {
  effectivePosition: number;
  playerData: PlayerData;
  isClimbing: boolean;
  isSlipping: boolean;
}

export const IcebergGameBoard = ({ effectivePosition, playerData, isClimbing, isSlipping }: IcebergGameBoardProps) => {
  const [animatingPosition, setAnimatingPosition] = useState(effectivePosition);
  const [showRope, setShowRope] = useState(false);

  useEffect(() => {
    if (Math.abs(effectivePosition - animatingPosition) > 0.01) {
      setAnimatingPosition(effectivePosition);
      if (isClimbing) {
        setShowRope(true);
        setTimeout(() => setShowRope(false), 1000);
      }
    }
  }, [effectivePosition, isClimbing]);

  // Generate iceberg bases (15 levels)
  const generateBases = () => {
    const bases = [];
    const totalLevels = 15;
    const boardHeight = 700;
    const baseHeight = boardHeight / (totalLevels + 2);

    for (let i = 1; i <= totalLevels; i++) {
      const y = boardHeight - (i * baseHeight) + 80;
      // Alternate sides for climbing effect
      const x = i % 2 === 1 ? 120 : 280;
      
      bases.push({
        level: i,
        x,
        y,
        isCheckpoint: i % 5 === 0,
        isGoal: i === 15
      });
    }
    
    return bases;
  };

  const bases = generateBases();
  
  // Calculate current visual position
  const currentLevelIndex = Math.floor(animatingPosition) - 1;
  const nextLevelIndex = Math.min(currentLevelIndex + 1, bases.length - 1);
  const progress = animatingPosition - Math.floor(animatingPosition);
  
  const currentBase = bases[Math.max(0, currentLevelIndex)];
  const nextBase = bases[nextLevelIndex];
  
  // Interpolate player position
  let playerX = currentBase?.x || 120;
  let playerY = currentBase?.y || (700 - 80);
  
  if (progress > 0 && nextBase && currentBase) {
    playerX = currentBase.x + (nextBase.x - currentBase.x) * progress;
    playerY = currentBase.y + (nextBase.y - currentBase.y) * progress;
  }

  // Camera follow - adjust viewport to keep player centered
  const cameraY = Math.max(0, playerY - 200);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Iceberg Mission Background */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20" style={{ height: '500px' }}>
        <svg 
          viewBox={`0 ${cameraY} 400 400`}
          className="w-full h-full bg-gradient-to-b from-blue-100/30 via-blue-200/40 to-blue-300/50"
          style={{ background: 'linear-gradient(to bottom, #87CEEB, #4682B4, #191970)' }}
        >
          {/* Sea level */}
          <rect x="0" y="650" width="400" height="150" fill="url(#seaGradient)" />
          
          {/* Iceberg underwater part */}
          <polygon
            points="50,650 350,650 300,750 100,750"
            fill="url(#icebergGradient)"
            opacity="0.6"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="seaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#4682B4', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#191970', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="icebergGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#E0F6FF', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#B0E0E6', stopOpacity: 0.7 }} />
            </linearGradient>
            <linearGradient id="iceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#F0F8FF', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#E6F3FF', stopOpacity: 0.9 }} />
            </linearGradient>
          </defs>

          {/* Floating ice particles */}
          <circle cx="50" cy={cameraY + 50} r="3" fill="white" opacity="0.7">
            <animate attributeName="cy" values={`${cameraY + 50};${cameraY + 70};${cameraY + 50}`} dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="350" cy={cameraY + 80} r="2" fill="white" opacity="0.6">
            <animate attributeName="cy" values={`${cameraY + 80};${cameraY + 60};${cameraY + 80}`} dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Ice bases (platforms) */}
          {bases.map((base) => {
            const isVisible = base.y >= cameraY - 50 && base.y <= cameraY + 450;
            if (!isVisible) return null;
            
            return (
              <g key={base.level}>
                {/* Ice platform */}
                <ellipse
                  cx={base.x}
                  cy={base.y + 5}
                  rx="45"
                  ry="12"
                  fill="url(#iceGradient)"
                  stroke={base.level === Math.floor(animatingPosition) ? '#00BFFF' : '#B0E0E6'}
                  strokeWidth="2"
                  opacity="0.9"
                />
                
                {/* Platform details */}
                <rect
                  x={base.x - 40}
                  y={base.y}
                  width="80"
                  height="8"
                  rx="4"
                  fill={base.isGoal ? '#FFD700' : base.isCheckpoint ? '#FF69B4' : '#E6F3FF'}
                  stroke={base.level === Math.floor(animatingPosition) ? '#00BFFF' : 'none'}
                  strokeWidth="2"
                />
                
                {/* Level number */}
                <text
                  x={base.x}
                  y={base.y - 15}
                  textAnchor="middle"
                  fill="#003366"
                  fontSize="14"
                  fontWeight="bold"
                >
                  {base.level}
                </text>

                {/* Special indicators */}
                {base.isGoal && (
                  <text x={base.x} y={base.y - 35} textAnchor="middle" fontSize="20">
                    🏆
                  </text>
                )}
                {base.isCheckpoint && !base.isGoal && (
                  <text x={base.x} y={base.y - 35} textAnchor="middle" fontSize="16">
                    🚩
                  </text>
                )}
                
                {/* Mini ice picks for partial progress */}
                {base.level === Math.floor(animatingPosition) && progress > 0 && (
                  <g>
                    <line
                      x1={base.x - 20}
                      y1={base.y - 10}
                      x2={base.x - 20}
                      y2={base.y - 5}
                      stroke="#FF4500"
                      strokeWidth="2"
                    />
                    <circle cx={base.x - 20} cy={base.y - 12} r="2" fill="#FF4500" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Connecting rope/path */}
          {bases.slice(0, -1).map((base, index) => {
            const nextBase = bases[index + 1];
            const isVisible = (base.y >= cameraY - 50 && base.y <= cameraY + 450) ||
                            (nextBase.y >= cameraY - 50 && nextBase.y <= cameraY + 450);
            if (!isVisible) return null;
            
            return (
              <line
                key={`rope-${base.level}`}
                x1={base.x}
                y1={base.y}
                x2={nextBase.x}
                y2={nextBase.y}
                stroke="rgba(139,69,19,0.6)"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            );
          })}

          {/* Player avatar */}
          <g
            transform={`translate(${playerX}, ${playerY - 50})`}
            className={isClimbing ? 'transition-transform duration-500' : isSlipping ? 'animate-bounce' : ''}
          >
            {/* Climbing rope when moving up */}
            {showRope && (
              <g>
                <line x1="0" y1="-20" x2="0" y2="40" stroke="#8B4513" strokeWidth="3" />
                <circle cx="0" cy="-22" r="3" fill="#FF4500" />
              </g>
            )}
            
            {/* Slip effect */}
            {isSlipping && (
              <g>
                <text x="15" y="0" fontSize="16" opacity="0.8">💨</text>
                <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="3" />
              </g>
            )}
            
            {/* Player stick figure */}
            <g>
              <defs>
                <clipPath id="playerHeadClip">
                  <circle cx="0" cy="0" r="20" />
                </clipPath>
                <filter id="iceShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="#003366" floodOpacity="0.5" />
                </filter>
              </defs>
              
              {/* Head with winter gear effect */}
              <g filter="url(#iceShadow)">
                {playerData.avatarImageUrl && (
                  <image 
                    href={playerData.avatarImageUrl} 
                    x="-20" y="-20" 
                    width="40" height="40" 
                    clipPath="url(#playerHeadClip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                )}
                <circle 
                  cx="0" cy="0" r="20" 
                  fill={playerData.avatarImageUrl ? "transparent" : "white"} 
                  stroke={playerData.stickFigureColor === 'pink' ? '#FF69B4' : '#003366'} 
                  strokeWidth="2" 
                />
              </g>
              
              {/* Climbing gear body */}
              <line x1="0" y1="20" x2="0" y2="45" stroke={playerData.stickFigureColor === 'pink' ? '#FF69B4' : '#003366'} strokeWidth="2" />
              
              {/* Arms with ice picks */}
              <line 
                x1="0" y1="35" x2="-15" y2="42" 
                stroke={playerData.stickFigureColor === 'pink' ? '#FF69B4' : '#003366'} strokeWidth="2"
              />
              <circle cx="-17" cy="43" r="2" fill="#FF4500" />
              
              <line 
                x1="0" y1="35" x2="15" y2="42" 
                stroke={playerData.stickFigureColor === 'pink' ? '#FF69B4' : '#003366'} strokeWidth="2"
              />
              <circle cx="17" cy="43" r="2" fill="#FF4500" />
              
              {/* Legs with crampons */}
              <line 
                x1="0" y1="45" x2="-12" y2="60" 
                stroke={playerData.stickFigureColor === 'pink' ? '#FF69B4' : '#003366'} strokeWidth="2"
              />
              <line 
                x1="0" y1="45" x2="12" y2="60" 
                stroke={playerData.stickFigureColor === 'pink' ? '#FF69B4' : '#003366'} strokeWidth="2"
              />
              
              {/* Climbing animation */}
              {isClimbing && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -2,-3; 2,-3; 0,0"
                  dur="0.8s"
                  repeatCount="3"
                />
              )}
            </g>
          </g>
        </svg>
      </div>

      {/* Player info and progress */}
      <div className="text-center mt-6 space-y-3 animate-fade-in">
        <div className="text-foreground font-bold text-xl font-gaming text-neon-blue">
          {playerData.name} - Αποστολή Παγόβουνο
        </div>
        <div className="progress-gaming rounded-full h-4">
          <div 
            className="progress-fill h-4 rounded-full transition-all duration-1000"
            style={{ width: `${(animatingPosition / 15) * 100}%` }}
          />
        </div>
        <div className="text-muted-foreground text-sm font-gaming">
          Βάση: <span className="text-primary font-bold">{animatingPosition.toFixed(1)}/15</span> ({Math.round((animatingPosition / 15) * 100)}%)
        </div>
      </div>
    </div>
  );
};
