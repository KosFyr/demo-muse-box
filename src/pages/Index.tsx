import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '@/components/game/GameContainer';
import { useAuth } from '@/hooks/useAuth';
import { NeonBackdrop } from '@/components/ui/NeonBackdrop';
import { NeonButton } from '@/components/ui/NeonButton';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <NeonBackdrop>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="font-exo">Loading Game... 🎮</p>
          </div>
        </div>
      </NeonBackdrop>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <NeonButton
          onClick={signOut}
          variant="purple"
        >
          Logout 🚪
        </NeonButton>
      </div>
      <GameContainer />
    </div>
  );
};

export default Index;
