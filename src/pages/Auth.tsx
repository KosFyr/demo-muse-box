import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NeonBackdrop } from '@/components/ui/NeonBackdrop';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { AvatarUpload } from '@/components/ui/AvatarUpload';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAvatarSetup, setShowAvatarSetup] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    // Check if this is a password reset (recovery) URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (type === 'recovery' && accessToken) {
      // This is a password reset, show password reset form
      setIsPasswordReset(true);
      setIsForgotPassword(false);
      setIsLogin(false);
      toast({
        title: "Επαναφορά Κωδικού",
        description: "Εισάγετε τον νέο σας κωδικό",
      });
      return;
    }
    
    // Only check session if this is NOT a password reset
    if (!isPasswordReset) {
      const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/');
        }
      };
      checkUser();
    }
  }, [navigate, toast, isPasswordReset]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isPasswordReset) {
        // This is a password reset, update the password
        const { error } = await supabase.auth.updateUser({
          password: password
        });
        
        if (error) throw error;
        
        toast({
          title: "Κωδικός αλλάχθηκε!",
          description: "Ο κωδικός σας ενημερώθηκε με επιτυχία.",
        });
        
        // Clear the URL hash and redirect
        window.location.hash = '';
        setIsPasswordReset(false);
        navigate('/');
        return;
      }
      
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        
        if (error) throw error;
        
        toast({
          title: "Email στάλθηκε!",
          description: "Έλεγξε το email σου για επαναφορά κωδικού.",
        });
        setIsForgotPassword(false);
        setIsLogin(true);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Επιτυχής είσοδος!",
          description: "Καλώς ήρθες πίσω!",
        });
        navigate('/');
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: displayName,
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Επιτυχής εγγραφή!",
          description: "Ας φτιάξουμε το avatar σου!",
        });
        setShowAvatarSetup(true);
      }
    } catch (error: any) {
      toast({
        title: "Σφάλμα",
        description: error.message || "Κάτι πήγε στραβά",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showAvatarSetup) {
    return (
      <NeonBackdrop enableMatrix={true}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <AvatarUpload onClose={() => navigate('/')} />
        </div>
      </NeonBackdrop>
    );
  }

  return (
    <NeonBackdrop enableMatrix={true}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Game Title */}
          <div className="text-center mb-8">
            <h1 className="font-orbitron font-black text-4xl md:text-5xl mb-4">
              <span className="text-white">CODE</span>{' '}
              <span className="text-cyan-400 text-shadow-neon animate-neon-flicker">QUEST</span>
            </h1>
            <p className="text-white/60 font-exo">Gaming Quiz Adventure 🎮</p>
          </div>

          <GlassCard glowColor="cyan" intensity="high">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white font-orbitron">
                {isPasswordReset ? 'ΝΕΟΣ ΚΩΔΙΚΟΣ' : 
                 (isForgotPassword ? 'ΕΠΑΝΑΦΟΡΑ ΚΩΔΙΚΟΥ' : 
                  (isLogin ? 'ΕΙΣΟΔΟΣ' : 'ΕΓΓΡΑΦΗ'))}
              </h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && !isForgotPassword && !isPasswordReset && (
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white font-exo">
                    Όνομα χρήστη
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={!isLogin && !isForgotPassword}
                    className="bg-white/10 border-cyan-500/30 text-white placeholder:text-white/60 focus:border-cyan-400 font-exo"
                    placeholder="Πώς θα σε φωνάζουμε;"
                  />
                </div>
              )}
              
              {!isPasswordReset && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white font-exo">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-cyan-500/30 text-white placeholder:text-white/60 focus:border-cyan-400 font-exo"
                    placeholder="Το email σου"
                  />
                </div>
              )}
              
              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-exo">
                    Κωδικός
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isForgotPassword}
                    className="bg-white/10 border-cyan-500/30 text-white placeholder:text-white/60 focus:border-cyan-400 font-exo"
                    placeholder="Ο κωδικός σου"
                  />
                </div>
              )}
              
              <NeonButton
                type="submit"
                disabled={loading}
                variant="cyan"
                size="lg"
                className="w-full font-orbitron font-bold"
              >
                {loading ? 'ΦΟΡΤΩΣΗ...' : (
                  isPasswordReset ? 'ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ' :
                  (isForgotPassword ? 'ΣΤΕΙΛΕ EMAIL' : 
                   (isLogin ? 'ΕΙΣΟΔΟΣ' : 'ΕΓΓΡΑΦΗ'))
                )}
              </NeonButton>
            </form>
            
            <div className="mt-6 text-center space-y-3">
              {!isForgotPassword && !isPasswordReset && isLogin && (
                <button
                  onClick={() => {
                    setIsForgotPassword(true);
                    setPassword('');
                  }}
                  className="text-cyan-400/80 hover:text-cyan-400 underline block w-full font-exo transition-colors"
                >
                  Ξέχασες τον κωδικό σου;
                </button>
              )}
              
              {!isPasswordReset && (
                <button
                  onClick={() => {
                    if (isForgotPassword) {
                      setIsForgotPassword(false);
                      setIsLogin(true);
                    } else {
                      setIsLogin(!isLogin);
                    }
                    setEmail('');
                    setPassword('');
                    setDisplayName('');
                  }}
                  className="text-white/80 hover:text-white underline font-exo transition-colors"
                >
                  {isForgotPassword ? 'Πίσω στην είσοδο' : (
                    isLogin 
                      ? 'Δεν έχεις λογαριασμό; Κάνε εγγραφή' 
                      : 'Έχεις ήδη λογαριασμό; Κάνε είσοδος'
                  )}
                </button>
              )}
            </div>
          </GlassCard>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 text-cyan-400/20 text-4xl animate-float">⚡</div>
          <div className="absolute bottom-20 right-10 text-pink-400/20 text-3xl animate-float" style={{ animationDelay: '1s' }}>🔥</div>
        </div>
      </div>
    </NeonBackdrop>
  );
}