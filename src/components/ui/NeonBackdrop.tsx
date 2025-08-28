import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  enabled?: boolean;
}

const MatrixRain: React.FC<MatrixRainProps> = ({ enabled = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix rain characters
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      // Semi-transparent black for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'hsl(195, 100%, 50%)'; // Neon cyan
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-20"
      style={{ zIndex: -1 }}
    />
  );
};

interface NeonBackdropProps {
  children: React.ReactNode;
  enableMatrix?: boolean;
}

export const NeonBackdrop: React.FC<NeonBackdropProps> = ({ 
  children, 
  enableMatrix = false 
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cyberpunk gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Neon glow spots */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary cyan glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-gaming" />
        
        {/* Secondary pink glow */}
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse-gaming" 
             style={{ animationDelay: '1s' }} />
        
        {/* Accent lime glow */}
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl animate-pulse-gaming" 
             style={{ animationDelay: '2s' }} />
      </div>

      {/* Matrix rain effect */}
      <MatrixRain enabled={enableMatrix} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};