import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { processAvatarImage } from '@/lib/avatar';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';

interface AvatarUploadProps {
  onClose?: () => void;
  compact?: boolean;
}

export const AvatarUpload = ({ onClose, compact = false }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stickFigureColor, setStickFigureColor] = useState<'classic' | 'pink'>('classic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, stick_figure_color')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        if (profile.avatar_url) {
          setPreviewUrl(profile.avatar_url);
        }
        if (profile.stick_figure_color) {
          setStickFigureColor(profile.stick_figure_color as 'classic' | 'pink');
        }
      }
    };
    
    loadUserProfile();
  }, [user]);

  const handleFileSelect = async (file: File) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const processedBlob = await processAvatarImage(file);
      const fileName = `${user.id}-${Date.now()}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, processedBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl
        });

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      toast({
        title: "Avatar ενημερώθηκε! ✨",
        description: "Το νέο σου avatar είναι έτοιμο!",
      });
    } catch (error: any) {
      toast({
        title: "Σφάλμα",
        description: error.message || "Κάτι πήγε στραβά με το avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStickFigureColorChange = async (color: 'classic' | 'pink') => {
    if (!user) return;
    
    setStickFigureColor(color);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        stick_figure_color: color
      });

    if (error) {
      toast({
        title: "Σφάλμα",
        description: "Δεν μπόρεσε να αποθηκευτεί το χρώμα",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div 
            className="w-24 h-24 mx-auto rounded-full border-2 border-dashed border-cyan-400/50 flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors bg-white/5"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-cyan-400 text-2xl">📸</span>
            )}
          </div>
          <p className="text-white/60 text-sm mt-2">Κλικ για αλλαγή</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleStickFigureColorChange('classic')}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              stickFigureColor === 'classic' 
                ? 'border-cyan-400 bg-white' 
                : 'border-white/30 bg-white/50'
            }`}
          />
          <button
            onClick={() => handleStickFigureColorChange('pink')}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              stickFigureColor === 'pink' 
                ? 'border-pink-400 bg-pink-300' 
                : 'border-white/30 bg-pink-300/50'
            }`}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <GlassCard>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white font-orbitron mb-2">
          Φτιάξε το Avatar σου! 📸
        </h2>
        <p className="text-white/70 font-exo">
          Ανέβασε μια φωτό και διάλεξε χρώμα
        </p>
      </div>

      <div className="space-y-6">
        <div
          className="border-2 border-dashed border-cyan-400/30 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400/60 transition-colors bg-white/5"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {uploading ? (
            <div>
              <div className="w-16 h-16 mx-auto border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
              <p className="text-white font-exo">Επεξεργασία φωτογραφίας...</p>
            </div>
          ) : previewUrl ? (
            <div>
              <img src={previewUrl} alt="Preview" className="w-32 h-32 mx-auto rounded-full object-cover mb-4" />
              <p className="text-cyan-400 font-exo">Κλικ για αλλαγή φωτογραφίας</p>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">📸</div>
              <p className="text-white font-exo text-lg mb-2">Σύρε & άσε ή κλικ για upload</p>
              <p className="text-white/60 text-sm">JPG, PNG, GIF μέχρι 10MB</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-orbitron text-center">Χρώμα Stick Figure</h3>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleStickFigureColorChange('classic')}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                stickFigureColor === 'classic' 
                  ? 'border-cyan-400 bg-cyan-400/20' 
                  : 'border-white/30 hover:border-white/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-white mb-2"></div>
              <span className="text-white font-exo">Classic</span>
            </button>
            
            <button
              onClick={() => handleStickFigureColorChange('pink')}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                stickFigureColor === 'pink' 
                  ? 'border-pink-400 bg-pink-400/20' 
                  : 'border-white/30 hover:border-white/50'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-pink-300 mb-2"></div>
              <span className="text-white font-exo">Pink</span>
            </button>
          </div>
        </div>

        {onClose && (
          <div className="flex justify-center pt-4">
            <NeonButton onClick={onClose} variant="cyan">
              Τέλος ✨
            </NeonButton>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </GlassCard>
  );
};