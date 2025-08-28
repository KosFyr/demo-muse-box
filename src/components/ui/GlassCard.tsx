import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: 'cyan' | 'pink' | 'lime' | 'purple';
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glowColor = 'cyan',
  intensity = 'medium',
  ...props
}) => {
  const glowClasses = {
    cyan: 'shadow-cyan-500/20 border-cyan-500/30',
    pink: 'shadow-pink-500/20 border-pink-500/30',
    lime: 'shadow-lime-400/20 border-lime-400/30',
    purple: 'shadow-purple-500/20 border-purple-500/30'
  };

  const intensityClasses = {
    low: 'shadow-lg',
    medium: 'shadow-xl',
    high: 'shadow-2xl glow-soft'
  };

  return (
    <div
      className={cn(
        'relative backdrop-blur-md bg-white/5 border rounded-xl',
        'transition-all duration-300 hover:bg-white/10 hover:shadow-2xl',
        glowClasses[glowColor],
        intensityClasses[intensity],
        className
      )}
      {...props}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
};