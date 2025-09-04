import { useState } from 'react';
import { NeonBackdrop } from '@/components/ui/NeonBackdrop';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { useAuth } from '@/hooks/useAuth';

interface HomeScreenProps {
  onStartGame: () => void;
}

export const HomeScreen = ({ onStartGame }: HomeScreenProps) => {
  const { user } = useAuth();
  const { categoryProgress, loading } = useProgressTracking();
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  if (showAvatarUpload) {
    return (
      <NeonBackdrop enableMatrix={true}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <AvatarUpload onClose={() => setShowAvatarUpload(false)} />
        </div>
      </NeonBackdrop>
    );
  }

  return (
    <NeonBackdrop enableMatrix={true}>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        {/* Avatar Button */}
        <div className="absolute top-4 right-4 z-10">
          <NeonButton
            onClick={() => setShowAvatarUpload(true)}
            variant="purple"
            size="sm"
          >
            Avatar 🎨
          </NeonButton>
        </div>

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

        {/* Start Game Button */}
        <div className="mb-12">
          <GlassCard glowColor="purple" className="text-center cursor-pointer hover:bg-white/10 transition-all max-w-md mx-auto" 
                     onClick={onStartGame}>
            <div className="text-6xl mb-6 animate-bounce">🎮</div>
            <div className="text-3xl font-bold text-purple-400 font-orbitron mb-4">Ξεκίνα Παιχνίδι</div>
            <div className="text-white/70 text-lg font-exo mb-6">
              Επιλέξτε κεφάλαιο και παίξτε τις πίστες!
            </div>
            {!loading && (
              <div className="text-sm text-white/60 mb-2">
                {categoryProgress.length} κεφάλαια διαθέσιμα
              </div>
            )}
            <div className="text-purple-300 font-bold font-exo text-lg">
              PLAY NOW! 🚀
            </div>
          </GlassCard>
        </div>

        {/* Progress Overview */}
        {user && !loading && categoryProgress.length > 0 && (
          <div className="w-full max-w-4xl mb-8">
            <h3 className="text-white font-orbitron text-lg mb-4 text-center">Πρόοδος Κεφαλαίων</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {categoryProgress.map((progress, index) => (
                <div key={progress.categoryId} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="text-xs text-white/60">
                    {Math.round(progress.completionPercentage)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-cyan-400/30 text-6xl animate-float">⚡</div>
        <div className="absolute bottom-20 right-10 text-pink-400/30 text-4xl animate-float" style={{ animationDelay: '1s' }}>🔥</div>
        <div className="absolute top-1/3 right-20 text-lime-400/30 text-5xl animate-float" style={{ animationDelay: '2s' }}>💎</div>
      </div>
    </NeonBackdrop>
  );
};