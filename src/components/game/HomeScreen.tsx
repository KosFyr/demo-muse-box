import { Button } from '@/components/ui/button';

interface HomeScreenProps {
  onNext: () => void;
}

export const HomeScreen = ({ onNext }: HomeScreenProps) => {
  return (
    <div className="text-center space-y-8 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg">
          🏔️ Παιχνίδι Προγραμματισμού
        </h1>
        <p className="text-2xl text-white/90 drop-shadow-md">
          Αναρρίχηση στο Βουνό της Γνώσης
        </p>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Ξεκίνα την περιπέτειά σου! Απάντησε σωστά στις ερωτήσεις για να ανέβεις στην κορυφή του βουνού. 
          Λάθος απάντηση σημαίνει πτώση με αλεξίπτωτο!
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="text-white/70 text-sm space-y-1">
          <p>✅ Σωστή απάντηση: Ανέβασμα 2 επίπεδα</p>
          <p>❌ Λάθος απάντηση: Κατέβασμα 1 επίπεδο</p>
          <p>🎯 Στόχος: Φτάσε στην κορυφή (επίπεδο 15)</p>
        </div>
        
        <Button 
          onClick={onNext}
          size="lg"
          className="text-xl px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-xl transform transition-all hover:scale-105"
        >
          🚀 Έναρξη Παιχνιδιού
        </Button>
      </div>
    </div>
  );
};