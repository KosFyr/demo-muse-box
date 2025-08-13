import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlayerData } from './GameContainer';
import { processAvatarImage } from '@/lib/avatar';
import { Upload, Camera } from 'lucide-react';

interface PhotoUploadScreenProps {
  onNext: () => void;
  onBack: () => void;
  onPlayerDataUpdate: (data: Partial<PlayerData>) => void;
  playerData: PlayerData;
}

export const PhotoUploadScreen = ({ onNext, onBack, onPlayerDataUpdate, playerData }: PhotoUploadScreenProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Παρακαλώ επιλέξτε μια εικόνα!');
      return;
    }

    setUploading(true);
    
    try {
      const processedBlob = await processAvatarImage(file);
      const previewUrl = URL.createObjectURL(processedBlob);
      
      setPreviewUrl(previewUrl);
      onPlayerDataUpdate({ avatarImageUrl: previewUrl });
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Σφάλμα κατά την επεξεργασία της εικόνας. Δοκιμάστε μια άλλη φωτογραφία.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const canProceed = playerData.name.trim() && previewUrl;

  return (
    <div className="text-center space-y-8 p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      <div className="space-y-4">
        <h2 className="text-4xl font-bold text-white drop-shadow-lg">
          Δημιούργησε το Avatar σου!
        </h2>
        <p className="text-lg text-white/80">
          Ανέβασε μια φωτογραφία σου για να δημιουργήσεις το stick figure avatar σου
        </p>
      </div>

      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="player-name" className="text-white text-lg">
            Όνομα Παίκτη
          </Label>
          <Input
            id="player-name"
            type="text"
            placeholder="Εισάγετε το όνομά σας"
            value={playerData.name}
            onChange={(e) => onPlayerDataUpdate({ name: e.target.value })}
            className="text-center text-lg py-3 bg-white/20 border-white/30 text-white placeholder:text-white/60"
          />
        </div>

        {/* Photo Upload Area */}
        <div className="space-y-4">
          <Label className="text-white text-lg">Φωτογραφία Προσώπου</Label>
          
          <div
            className="border-2 border-dashed border-white/40 rounded-2xl p-8 bg-white/10 transition-all hover:bg-white/20 cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <p className="text-white">Επεξεργασία φωτογραφίας...</p>
              </div>
            ) : previewUrl ? (
              <div className="space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/50">
                  <img 
                    src={previewUrl} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white">Τέλεια! Κάντε κλικ για να αλλάξετε φωτογραφία</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Upload className="w-12 h-12 text-white/60" />
                  <Camera className="w-12 h-12 text-white/60" />
                </div>
                <div className="text-white/80">
                  <p className="text-lg font-medium">Κάντε κλικ ή σύρετε μια φωτογραφία εδώ</p>
                  <p className="text-sm">JPG, PNG, GIF - Μέγεθος έως 10MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Big Head Avatar Preview */}
        {previewUrl && (
          <div className="mt-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white mb-4">Your Big Head Avatar!</h3>
            <div className="bg-white/20 backdrop-blur rounded-lg p-8">
              {/* Big Head Stick Figure */}
              <div className="flex flex-col items-center">
                {/* Big Head */}
                <div className="relative w-24 h-24 mb-2">
                  <img 
                    src={previewUrl} 
                    alt="Your big head" 
                    className="w-full h-full rounded-full object-cover border-3 border-white shadow-lg"
                  />
                </div>
                {/* Thin Body */}
                <div className="flex flex-col items-center text-white">
                  <div className="w-0.5 h-12 bg-white mb-1"></div> {/* Torso */}
                  <div className="flex">
                    <div className="w-8 h-0.5 bg-white rotate-12 -mr-4"></div> {/* Left arm */}
                    <div className="w-8 h-0.5 bg-white -rotate-12"></div> {/* Right arm */}
                  </div>
                  <div className="w-0.5 h-8 bg-white mt-1 mb-1"></div> {/* Lower torso */}
                  <div className="flex">
                    <div className="w-8 h-0.5 bg-white rotate-12 -mr-4"></div> {/* Left leg */}
                    <div className="w-8 h-0.5 bg-white -rotate-12"></div> {/* Right leg */}
                  </div>
                </div>
              </div>
              <p className="text-center text-white/80 text-sm mt-4">
                Look at that big head! Perfect for climbing! 🧗‍♂️
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6">
        <Button 
          onClick={onBack}
          variant="outline"
          size="lg"
          className="bg-white/20 border-white/40 text-white hover:bg-white/30"
        >
          ← Πίσω
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-xl disabled:opacity-50"
        >
          Ξεκίνα την Αναρρίχηση! 🏔️
        </Button>
      </div>
    </div>
  );
};