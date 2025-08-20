import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
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
          description: "Έλεγξε το email σου για επιβεβαίωση.",
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {isPasswordReset ? 'Νέος Κωδικός' : 
             (isForgotPassword ? 'Επαναφορά Κωδικού' : 
              (isLogin ? 'Είσοδος' : 'Εγγραφή'))}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && !isForgotPassword && !isPasswordReset && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-white">
                  Όνομα χρήστη
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin && !isForgotPassword}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  placeholder="Πώς θα σε φωνάζουμε;"
                />
              </div>
            )}
            
            {!isPasswordReset && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  placeholder="Το email σου"
                />
              </div>
            )}
            
            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Κωδικός
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isForgotPassword}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  placeholder="Ο κωδικός σου"
                />
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold"
            >
              {loading ? 'Φόρτωση...' : (
                isPasswordReset ? 'Αλλαγή Κωδικού' :
                (isForgotPassword ? 'Στείλε Email Επαναφοράς' : 
                 (isLogin ? 'Είσοδος' : 'Εγγραφή'))
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center space-y-2">
            {!isForgotPassword && !isPasswordReset && isLogin && (
              <button
                onClick={() => {
                  setIsForgotPassword(true);
                  setPassword('');
                }}
                className="text-white/80 hover:text-white underline block w-full"
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
                className="text-white/80 hover:text-white underline"
              >
                {isForgotPassword ? 'Πίσω στην είσοδο' : (
                  isLogin 
                    ? 'Δεν έχεις λογαριασμό; Κάνε εγγραφή' 
                    : 'Έχεις ήδη λογαριασμό; Κάνε είσοδος'
                )}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}