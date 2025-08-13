import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '@/components/game/GameContainer';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
          <p>Φόρτωση...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={signOut}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Αποσύνδεση
        </Button>
      </div>
      <GameContainer />
    </div>
  );
};

export default Index;
