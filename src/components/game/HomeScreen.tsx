import { Button } from '@/components/ui/button';

interface HomeScreenProps {
  onNext: () => void;
}

export const HomeScreen = ({ onNext }: HomeScreenProps) => {
  return (
    <div className="text-center space-y-8 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg">
          🎮 Code Quest 🎮
        </h1>
        <p className="text-2xl text-white/90 drop-shadow-md">
          Level Up στο Coding ⬆️
        </p>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Μπες στο game. Σωστό = level up ⬆️, λάθος = rip 😵
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="text-white/70 text-sm space-y-1">
          <p>✅ Σωστό: +2 lvls ⬆️</p>
          <p>❌ Λάθος: -1 lvl ⬇️</p>
          <p>👑 Goal: Boss Fight lvl 15 👑</p>
        </div>
        
        <Button 
          onClick={onNext}
          size="lg"
          className="text-xl px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-xl transform transition-all hover:scale-105"
        >
          🔥 Play Now 🔥
        </Button>
      </div>
    </div>
  );
};