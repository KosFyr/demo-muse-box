import React from 'react';
import { cn } from '@/lib/utils';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'cyan' | 'pink' | 'lime' | 'purple' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glowing?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  className,
  variant = 'cyan',
  size = 'md',
  glowing = true,
  disabled,
  ...props
}) => {
  const variantClasses = {
    cyan: 'bg-cyan-500/20 border-cyan-500/60 text-cyan-100 hover:bg-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/40 active:bg-cyan-500/40',
    pink: 'bg-pink-500/20 border-pink-500/60 text-pink-100 hover:bg-pink-500/30 hover:border-pink-400 hover:shadow-pink-500/40 active:bg-pink-500/40',
    lime: 'bg-lime-400/20 border-lime-400/60 text-lime-100 hover:bg-lime-400/30 hover:border-lime-300 hover:shadow-lime-400/40 active:bg-lime-400/40',
    purple: 'bg-purple-500/20 border-purple-500/60 text-purple-100 hover:bg-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/40 active:bg-purple-500/40',
    success: 'bg-emerald-500/20 border-emerald-500/60 text-emerald-100 hover:bg-emerald-500/30 hover:border-emerald-400 hover:shadow-emerald-500/40 active:bg-emerald-500/40',
    danger: 'bg-red-500/20 border-red-500/60 text-red-100 hover:bg-red-500/30 hover:border-red-400 hover:shadow-red-500/40 active:bg-red-500/40'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  return (
    <button
      className={cn(
        'relative overflow-hidden rounded-xl border-2 font-bold',
        'backdrop-blur-sm transition-all duration-300 transform',
        'hover:scale-105 active:scale-95',
        glowing && 'hover:shadow-2xl',
        disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -top-px overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
      </div>
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};