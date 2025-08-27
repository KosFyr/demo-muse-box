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
      {/* Gaming Iceberg Mission Background */}
      <div className="relative overflow-hidden card-gaming rounded-3xl border border-primary/30 glow-cyan" style={{ height: '500px' }}>
        <svg 
          viewBox={`0 ${cameraY} 400 400`}
          className="w-full h-full"
          style={{ background: 'linear-gradient(135deg, #0f0f23, #1a1a40, #2d1b69)' }}
        >
          {/* Gaming Sea level with neon effects */}
          <rect x="0" y="650" width="400" height="150" fill="url(#gamingSeaGradient)" />
          
          {/* Gaming Iceberg underwater part */}
          <polygon
            points="50,650 350,650 300,750 100,750"
            fill="url(#gamingIcebergGradient)"
            opacity="0.7"
          />

          {/* Gaming Gradients */}
          <defs>
            <linearGradient id="gamingSeaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00c9ff', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#0f0f23', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="gamingIcebergGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#7fff00', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: '#ff6ec7', stopOpacity: 0.2 }} />
            </linearGradient>
            <linearGradient id="gamingIceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.9)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(0,201,255,0.3)', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>

          {/* Gaming Floating particles */}
          <circle cx="50" cy={cameraY + 50} r="3" fill="#7fff00" opacity="0.8" className="animate-float">
            <animate attributeName="cy" values={`${cameraY + 50};${cameraY + 70};${cameraY + 50}`} dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="350" cy={cameraY + 80} r="2" fill="#ff6ec7" opacity="0.7" className="animate-pulse">
            <animate attributeName="cy" values={`${cameraY + 80};${cameraY + 60};${cameraY + 80}`} dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Ice bases (platforms) */}
          {bases.map((base) => {
            const isVisible = base.y >= cameraY - 50 && base.y <= cameraY + 450;
            if (!isVisible) return null;
            
            return (
              <g key={base.level}>
                {/* Gaming Platform with neon glow */}
                <ellipse
                  cx={base.x}
                  cy={base.y + 5}
                  rx="45"
                  ry="12"
                  fill="url(#gamingIceGradient)"
                  stroke={base.level === Math.floor(animatingPosition) ? '#00BFFF' : '#7fff00'}
                  strokeWidth="2"
                  opacity="0.9"
                  className={base.level === Math.floor(animatingPosition) ? 'animate-glow-pulse' : ''}
                />
                
                {/* Gaming Platform details with neon colors */}
                <rect
                  x={base.x - 40}
                  y={base.y}
                  width="80"
                  height="8"
                  rx="4"
                  fill={base.isGoal ? '#FFD700' : base.isCheckpoint ? '#ff6ec7' : '#7fff00'}
                  stroke={base.level === Math.floor(animatingPosition) ? '#00BFFF' : 'none'}
                  strokeWidth="2"
                  className={base.level === Math.floor(animatingPosition) ? 'animate-glow-pulse' : ''}
                />
                
                {/* Gaming Level number */}
                <text
                  x={base.x}
                  y={base.y - 15}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="bold"
                  className="gaming-title"
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

      {/* Gaming Player info and progress */}
      <div className="text-center mt-4 space-y-3">
        <div className="text-white font-bold text-lg gaming-title">
          {playerData.name} - <span className="text-accent">Cyber Mission</span> 🚀
        </div>
        <div className="progress-gaming rounded-full h-4 p-0.5">
          <div 
            className="progress-bar h-full rounded-full transition-all duration-1000 animate-glow-pulse"
            style={{ width: `${(animatingPosition / 15) * 100}%` }}
          />
        </div>
        <div className="text-white/80 text-sm font-medium">
          Position: <span className="text-primary font-bold">{animatingPosition.toFixed(1)}</span>/15 ({Math.round((animatingPosition / 15) * 100)}%)
        </div>
      </div>
    </div>
  );
};
