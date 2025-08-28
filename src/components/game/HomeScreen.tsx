import { Button } from '@/components/ui/button';

import { NeonBackdrop } from '@/components/ui/NeonBackdrop';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';

interface HomeScreenProps {
  onNext: () => void;
}

export const HomeScreen = ({ onNext }: HomeScreenProps) => {
  return (
    <NeonBackdrop enableMatrix={true}>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        {/* Main Game Title */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron font-black text-6xl md:text-8xl mb-6">
            <span className="text-white">CODE</span>{' '}
            <span className="text-cyan-400 text-shadow-neon animate-neon-flicker">QUEST</span>
          </h1>
          <div className="text-xl md:text-2xl text-white/80 font-exo mb-4">
            🎮 Gaming Quiz Adventure
          </div>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-exo">
            Μπες στο game. Σωστό = level up ⬆️, λάθος = rip 😵
          </p>
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
          <GlassCard glowColor="lime" className="text-center">
            <div className="text-3xl font-bold text-lime-400 font-orbitron">15</div>
            <div className="text-white/70 text-sm font-exo">LEVELS</div>
          </GlassCard>
          
          <GlassCard glowColor="cyan" className="text-center">
            <div className="text-3xl font-bold text-cyan-400 font-orbitron">∞</div>
            <div className="text-white/70 text-sm font-exo">QUESTIONS</div>
          </GlassCard>
          
          <GlassCard glowColor="pink" className="text-center">
            <div className="text-3xl font-bold text-pink-400 font-orbitron">★</div>
            <div className="text-white/70 text-sm font-exo">ACHIEVEMENTS</div>
          </GlassCard>
        </div>

        {/* Call to Action */}
        <NeonButton
          variant="cyan"
          size="xl"
          onClick={onNext}
          className="animate-pulse font-orbitron font-bold"
        >
          PLAY NOW 🚀
        </NeonButton>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-cyan-400/30 text-6xl animate-float">⚡</div>
        <div className="absolute bottom-20 right-10 text-pink-400/30 text-4xl animate-float" style={{ animationDelay: '1s' }}>🔥</div>
        <div className="absolute top-1/3 right-20 text-lime-400/30 text-5xl animate-float" style={{ animationDelay: '2s' }}>💎</div>
      </div>
    </NeonBackdrop>
  );
};