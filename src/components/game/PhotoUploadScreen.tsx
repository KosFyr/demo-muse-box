import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlayerData } from './GameContainer';
import { processAvatarImage } from '@/lib/avatar';
import { Upload, Camera, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PhotoUploadScreenProps {
  onNext: () => void;
  onBack: () => void;
  onPlayerDataUpdate: (data: Partial<PlayerData>) => void;
  playerData: PlayerData;
}

export const PhotoUploadScreen = ({ onNext, onBack, onPlayerDataUpdate, playerData }: PhotoUploadScreenProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stickFigureColor, setStickFigureColor] = useState<'classic' | 'pink'>('classic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Load existing avatar and stick figure color
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, stick_figure_color')
        .eq('id', user.id)
        .single();

      if (profile?.avatar_url) {
        setPreviewUrl(profile.avatar_url);
        onPlayerDataUpdate({ avatarImageUrl: profile.avatar_url });
      }
      
      if (profile?.stick_figure_color) {
        const color = profile.stick_figure_color as 'classic' | 'pink';
        setStickFigureColor(color);
        onPlayerDataUpdate({ stickFigureColor: color });
      }
    };

    loadUserProfile();
  }, [user, onPlayerDataUpdate]);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Παρακαλώ επιλέξτε μια εικόνα!');
      return;
    }

    if (!user) {
      toast.error('Πρέπει να συνδεθείτε για να ανεβάσετε φωτογραφία');
      return;
    }

    setUploading(true);
    
    try {
      // Process the image
      const processedBlob = await processAvatarImage(file);
      
      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, processedBlob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      setPreviewUrl(publicUrl);
      onPlayerDataUpdate({ avatarImageUrl: publicUrl });

      // Update profile with new avatar URL
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          stick_figure_color: stickFigureColor
        });

      if (profileError) throw profileError;
      
      toast.success('Η φωτογραφία αποθηκεύτηκε με επιτυχία!');
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Σφάλμα κατά την επεξεργασία της εικόνας. Δοκιμάστε μια άλλη φωτογραφία.');
    } finally {
      setUploading(false);
    }
  };

  const handleStickFigureColorChange = async (color: 'classic' | 'pink') => {
    setStickFigureColor(color);
    onPlayerDataUpdate({ stickFigureColor: color });

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          stick_figure_color: color,
          ...(previewUrl && { avatar_url: previewUrl })
        });

      if (error) {
        console.error('Error updating stick figure color:', error);
      }
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

  const canProceed = playerData.name.trim() && (previewUrl || !user);

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
                <div className="flex items-center gap-2 justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Αλλαγή Avatar
                  </Button>
                </div>
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

        {/* Stick Figure Color Selection */}
        <div className="space-y-4">
          <Label className="text-white text-lg">Χρώμα Stick Figure</Label>
          <div className="flex gap-6 justify-center">
            {/* Classic Stick Figure */}
            <button
              onClick={() => handleStickFigureColorChange('classic')}
              className={`p-4 rounded-lg border-2 transition-all ${
                stickFigureColor === 'classic' 
                  ? 'border-white bg-white/20' 
                  : 'border-white/40 bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                {/* Mini Stick Figure Preview */}
                <div className="relative bg-white/10 rounded-lg p-3 w-16 h-20">
                  <svg width="40" height="56" viewBox="0 0 40 56" className="mx-auto">
                    {/* Head */}
                    <circle cx="20" cy="12" r="10" fill="white" stroke="#333" strokeWidth="1.5" />
                    
                    {/* Face or User Avatar */}
                    {previewUrl ? (
                      <foreignObject x="12" y="4" width="16" height="16">
                        <div 
                          className="w-full h-full rounded-full overflow-hidden"
                          style={{
                            backgroundImage: `url(${previewUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                      </foreignObject>
                    ) : (
                      <g>
                        <circle cx="17" cy="9" r="1.5" fill="#333" />
                        <circle cx="23" cy="9" r="1.5" fill="#333" />
                        <path d="M 16 14 Q 20 16 24 14" stroke="#333" strokeWidth="1" fill="none" />
                      </g>
                    )}
                    
                    {/* Body */}
                    <line x1="20" y1="22" x2="20" y2="35" stroke="#333" strokeWidth="1.5" />
                    
                    {/* Arms */}
                    <line x1="20" y1="27" x2="12" y2="32" stroke="#333" strokeWidth="1" />
                    <line x1="20" y1="27" x2="28" y2="32" stroke="#333" strokeWidth="1" />
                    
                    {/* Legs */}
                    <line x1="20" y1="35" x2="14" y2="45" stroke="#333" strokeWidth="1" />
                    <line x1="20" y1="35" x2="26" y2="45" stroke="#333" strokeWidth="1" />
                  </svg>
                </div>
                <div className="text-white text-sm font-medium">Κλασικό</div>
              </div>
            </button>
            
            {/* Pink Stick Figure */}
            <button
              onClick={() => handleStickFigureColorChange('pink')}
              className={`p-4 rounded-lg border-2 transition-all ${
                stickFigureColor === 'pink' 
                  ? 'border-white bg-white/20' 
                  : 'border-white/40 bg-white/10 hover:bg-white/20'
              }`}
            >
              <div className="flex flex-col items-center space-y-3">
                {/* Mini Stick Figure Preview */}
                <div className="relative bg-white/10 rounded-lg p-3 w-16 h-20">
                  <svg width="40" height="56" viewBox="0 0 40 56" className="mx-auto">
                    {/* Head */}
                    <circle cx="20" cy="12" r="10" fill="white" stroke="#F472B6" strokeWidth="1.5" />
                    
                    {/* Face or User Avatar */}
                    {previewUrl ? (
                      <foreignObject x="12" y="4" width="16" height="16">
                        <div 
                          className="w-full h-full rounded-full overflow-hidden"
                          style={{
                            backgroundImage: `url(${previewUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                      </foreignObject>
                    ) : (
                      <g>
                        <circle cx="17" cy="9" r="1.5" fill="#F472B6" />
                        <circle cx="23" cy="9" r="1.5" fill="#F472B6" />
                        <path d="M 16 14 Q 20 16 24 14" stroke="#F472B6" strokeWidth="1" fill="none" />
                      </g>
                    )}
                    
                    {/* Body */}
                    <line x1="20" y1="22" x2="20" y2="35" stroke="#F472B6" strokeWidth="1.5" />
                    
                    {/* Arms */}
                    <line x1="20" y1="27" x2="12" y2="32" stroke="#F472B6" strokeWidth="1" />
                    <line x1="20" y1="27" x2="28" y2="32" stroke="#F472B6" strokeWidth="1" />
                    
                    {/* Legs */}
                    <line x1="20" y1="35" x2="14" y2="45" stroke="#F472B6" strokeWidth="1" />
                    <line x1="20" y1="35" x2="26" y2="45" stroke="#F472B6" strokeWidth="1" />
                  </svg>
                </div>
                <div className="text-white text-sm font-medium">Ρόζ</div>
              </div>
            </button>
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
                <div className="flex flex-col items-center">
                  <div className={`w-0.5 h-12 mb-1 ${stickFigureColor === 'pink' ? 'bg-pink-400' : 'bg-white'}`}></div> {/* Torso */}
                  <div className="flex">
                    <div className={`w-8 h-0.5 rotate-12 -mr-4 ${stickFigureColor === 'pink' ? 'bg-pink-400' : 'bg-white'}`}></div> {/* Left arm */}
                    <div className={`w-8 h-0.5 -rotate-12 ${stickFigureColor === 'pink' ? 'bg-pink-400' : 'bg-white'}`}></div> {/* Right arm */}
                  </div>
                  <div className={`w-0.5 h-8 mt-1 mb-1 ${stickFigureColor === 'pink' ? 'bg-pink-400' : 'bg-white'}`}></div> {/* Lower torso */}
                  <div className="flex">
                    <div className={`w-8 h-0.5 rotate-12 -mr-4 ${stickFigureColor === 'pink' ? 'bg-pink-400' : 'bg-white'}`}></div> {/* Left leg */}
                    <div className={`w-8 h-0.5 -rotate-12 ${stickFigureColor === 'pink' ? 'bg-pink-400' : 'bg-white'}`}></div> {/* Right leg */}
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