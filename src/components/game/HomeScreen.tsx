import { Button } from '@/components/ui/button';

interface HomeScreenProps {
  onNext: () => void;
}

export const HomeScreen = ({ onNext }: HomeScreenProps) => {
  return (
    <div className="text-center space-y-8 p-8 card-gaming rounded-3xl animate-fade-in">
      <div className="space-y-6 animate-scale-in">
        <h1 className="text-6xl font-bold text-gaming-gradient drop-shadow-lg font-gaming animate-glow-pulse">
          🏔️ Παιχνίδι Προγραμματισμού
        </h1>
        <div className="text-3xl text-neon-blue font-display animate-neon-flicker">
          Αναρρίχηση στο Βουνό της Γνώσης
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Ξεκίνα την περιπέτειά σου! Απάντησε σωστά στις ερωτήσεις για να ανέβεις στην κορυφή του βουνού. 
          Λάθος απάντηση σημαίνει πτώση με αλεξίπτωτο!
        </p>
      </div>
      
      <div className="space-y-6 animate-fade-in-up">
        <div className="glass-effect rounded-2xl p-6 space-y-3">
          <div className="text-accent text-sm font-medium space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-neon-green">✅</span>
              <span>Σωστή απάντηση: Ανέβασμα 2 επίπεδα</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-destructive">❌</span>
              <span>Λάθος απάντηση: Κατέβασμα 1 επίπεδο</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-gaming-orange">🎯</span>
              <span>Στόχος: Φτάσε στην κορυφή (επίπεδο 15)</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onNext}
          size="lg"
          className="btn-gaming text-xl px-12 py-6 font-gaming font-bold border-0 animate-breath"
        >
          🚀 Έναρξη Παιχνιδιού
        </Button>
      </div>
    </div>
  );
};