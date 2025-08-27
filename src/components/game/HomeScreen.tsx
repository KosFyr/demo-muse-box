import { Button } from '@/components/ui/button';

interface HomeScreenProps {
  onNext: () => void;
}

export const HomeScreen = ({ onNext }: HomeScreenProps) => {
  return (
    <div className="text-center space-y-8 p-8 card-gaming rounded-3xl animate-slide-in-gaming">
      {/* Gaming Title with Neon Effects */}
      <div className="space-y-6">
        <div className="relative">
          <h1 className="gaming-title text-6xl md:text-7xl font-black text-white animate-glow-pulse">
            🎮 <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text animate-neon-flicker">Code Quest</span> 🎮
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-xl -z-10 animate-pulse"></div>
        </div>
        
        <p className="text-3xl font-bold text-white/90 animate-float">
          Level Up στο <span className="text-accent glow-lime">Coding</span> ⬆️
        </p>
        
        <div className="card-gaming p-6 rounded-xl border border-accent/30 glow-lime">
          <p className="text-lg text-white/80 max-w-2xl mx-auto font-medium">
            Μπες στο game. <span className="text-gaming-success font-bold">Σωστό = level up ⬆️</span>, <span className="text-gaming-error font-bold">λάθος = rip 😵</span>
          </p>
        </div>
      </div>
      
      {/* Gaming Stats HUD */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-gaming p-4 rounded-xl text-center border border-gaming-success/30 glow-lime">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-gaming-success font-bold">Σωστό: +2 lvls ⬆️</div>
          </div>
          
          <div className="card-gaming p-4 rounded-xl text-center border border-gaming-error/30">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-gaming-error font-bold">Λάθος: -1 lvl ⬇️</div>
          </div>
          
          <div className="card-gaming p-4 rounded-xl text-center border border-gaming-warning/30 glow-pink">
            <div className="text-2xl mb-2">👑</div>
            <div className="text-gaming-warning font-bold">Goal: Boss Fight lvl 15</div>
          </div>
        </div>
        
        {/* Epic Play Button */}
        <div className="relative">
          <Button 
            onClick={onNext}
            size="lg"
            className="btn-gaming text-2xl px-16 py-8 font-black text-white border-0 bg-gradient-to-r from-secondary via-primary to-accent hover:scale-110 transform transition-all duration-300 glow-cyan shimmer"
          >
            🔥 PLAY NOW 🔥
          </Button>
          <div className="absolute -inset-2 bg-gradient-to-r from-secondary/30 via-primary/30 to-accent/30 rounded-2xl blur-xl -z-10 animate-glow-pulse"></div>
        </div>

        {/* Gaming Aesthetic Elements */}
        <div className="flex justify-center space-x-8 text-4xl animate-float">
          <span className="animate-pulse">⚡</span>
          <span className="animate-bounce">🚀</span>
          <span className="animate-pulse">⚡</span>
        </div>
      </div>
    </div>
  );
};