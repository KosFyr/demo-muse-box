import React, { useEffect, useState } from 'react';

interface ConfettiEffectProps {
  isActive: boolean;
  onComplete?: () => void;
  intensity?: 'low' | 'medium' | 'high';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  emoji: string;
  size: number;
  life: number;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  isActive,
  onComplete,
  intensity = 'medium'
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const colors = [
    '#ff6ec7', // neon pink
    '#00c9ff', // neon cyan
    '#7fff00', // neon lime
    '#bf40ff', // neon purple
    '#ff9940', // neon orange
    '#ffff00', // yellow
    '#ff4081', // hot pink
    '#00e676'  // green
  ];

  const emojis = ['⭐', '✨', '🎉', '🎊', '💫', '🌟', '⚡', '🔥', '💎', '🎯'];

  const particleCount = {
    low: 20,
    medium: 40,
    high: 80
  };

  const createParticle = (id: number): Particle => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    return {
      id,
      x: centerX + (Math.random() - 0.5) * 200,
      y: centerY + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 10,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: Math.random() * 20 + 10,
      life: 1
    };
  };

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Create initial particles
    const initialParticles = Array.from({ length: particleCount[intensity] }, (_, i) => 
      createParticle(i)
    );
    setParticles(initialParticles);

    // Animation loop
    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      if (elapsed > 3000) { // Stop after 3 seconds
        setParticles([]);
        onComplete?.();
        return;
      }

      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.5, // gravity
            rotation: particle.rotation + particle.rotationSpeed,
            life: particle.life - 0.01
          }))
          .filter(particle => 
            particle.life > 0 && 
            particle.y < window.innerHeight + 100 &&
            particle.x > -100 && 
            particle.x < window.innerWidth + 100
          )
      );

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isActive, intensity, onComplete]);

  if (!isActive || particles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute transition-opacity duration-100"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.life,
            fontSize: particle.size
          }}
        >
          {Math.random() > 0.3 ? particle.emoji : (
            <div
              className="w-3 h-3 rotate-45"
              style={{
                backgroundColor: particle.color,
                boxShadow: `0 0 10px ${particle.color}`
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};