import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { z } from 'zod';
import logo from '@/assets/logo.png';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

// Mountain Range
const Mountains = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 60" className={className} fill="currentColor" preserveAspectRatio="none">
    <polygon points="0,60 20,25 40,45 60,15 85,40 110,10 140,35 165,20 185,40 200,30 200,60" opacity="0.4" />
    <polygon points="0,60 30,35 50,50 80,25 105,45 130,20 160,40 180,30 200,45 200,60" opacity="0.25" />
  </svg>
);

// Pine Tree (Cordillera)
const PineTree = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 30 50" className={className} fill="currentColor">
    <rect x="13" y="38" width="4" height="12" opacity="0.5" />
    <polygon points="15,0 8,15 22,15" opacity="0.4" />
    <polygon points="15,8 5,25 25,25" opacity="0.35" />
    <polygon points="15,18 2,38 28,38" opacity="0.3" />
  </svg>
);

// Rice Terrace Pattern
const RiceTerrace = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M0,15 Q25,10 50,15 Q75,20 100,15" opacity="0.3" />
    <path d="M0,25 Q25,18 50,25 Q75,32 100,25" opacity="0.25" />
    <path d="M0,35 Q25,27 50,35 Q75,43 100,35" opacity="0.3" />
    <path d="M0,45 Q25,36 50,45 Q75,54 100,45" opacity="0.25" />
    <path d="M0,55 Q25,46 50,55 Q75,64 100,55" opacity="0.2" />
  </svg>
);

// Igorot Geometric Pattern
const IgorotPattern = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="currentColor">
    <polygon points="20,5 25,15 35,15 27,22 30,32 20,26 10,32 13,22 5,15 15,15" opacity="0.25" />
    <rect x="8" y="8" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    <rect x="14" y="14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />
  </svg>
);

// Cloud over mountains
const MountainCloud = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 25" className={className} fill="currentColor">
    <ellipse cx="25" cy="15" rx="18" ry="8" opacity="0.2" />
    <ellipse cx="15" cy="16" rx="12" ry="7" opacity="0.25" />
    <ellipse cx="35" cy="16" rx="12" ry="7" opacity="0.25" />
    <ellipse cx="20" cy="12" rx="8" ry="5" opacity="0.15" />
    <ellipse cx="30" cy="12" rx="8" ry="5" opacity="0.15" />
  </svg>
);

// Sun/Sunrise
const Sun = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="currentColor">
    <circle cx="20" cy="20" r="8" opacity="0.3" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <line
        key={i}
        x1="20"
        y1="20"
        x2={20 + 15 * Math.cos((angle * Math.PI) / 180)}
        y2={20 + 15 * Math.sin((angle * Math.PI) / 180)}
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
      />
    ))}
  </svg>
);

// Native Hut (Cordilleran)
const NativeHut = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 35" className={className} fill="currentColor">
    <polygon points="20,0 2,18 38,18" opacity="0.35" />
    <rect x="8" y="18" width="24" height="17" opacity="0.3" />
    <rect x="16" y="23" width="8" height="12" opacity="0.4" />
  </svg>
);

// Woven Diamond Pattern
const WovenPattern = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 30 30" className={className} fill="none" stroke="currentColor" strokeWidth="1">
    <polygon points="15,2 28,15 15,28 2,15" opacity="0.2" />
    <polygon points="15,7 23,15 15,23 7,15" opacity="0.25" />
    <line x1="15" y1="2" x2="15" y2="28" opacity="0.15" />
    <line x1="2" y1="15" x2="28" y2="15" opacity="0.15" />
  </svg>
);

export default function Auth() {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive',
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);
    
    if (error) {
      toast({
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a3a2a]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a3a2a] via-[#2d5a3d] to-[#1a3a2a] p-4 relative overflow-hidden">
      
      {/* Sun/Sunrise at top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <Sun className="w-20 h-20 text-amber-400" />
      </div>

      {/* Clouds */}
      <div className="absolute top-16 left-16">
        <MountainCloud className="w-24 h-12 text-white" />
      </div>
      <div className="absolute top-20 right-20">
        <MountainCloud className="w-20 h-10 text-white" />
      </div>
      <div className="absolute top-32 left-1/3">
        <MountainCloud className="w-16 h-8 text-white/80" />
      </div>

      {/* Igorot patterns - corners */}
      <div className="absolute top-6 left-6">
        <IgorotPattern className="w-12 h-12 text-amber-500" />
      </div>
      <div className="absolute top-6 right-6">
        <IgorotPattern className="w-12 h-12 text-amber-500" />
      </div>
      <div className="absolute top-24 left-20">
        <WovenPattern className="w-8 h-8 text-amber-400" />
      </div>
      <div className="absolute top-28 right-24">
        <WovenPattern className="w-8 h-8 text-amber-400" />
      </div>

      {/* Native Huts */}
      <div className="absolute left-8 top-1/3">
        <NativeHut className="w-12 h-10 text-amber-600" />
      </div>
      <div className="absolute right-10 top-1/3">
        <NativeHut className="w-10 h-9 text-amber-600" />
      </div>

      {/* Rice Terraces - sides */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <RiceTerrace className="w-32 h-24 text-emerald-400" />
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <RiceTerrace className="w-32 h-24 text-emerald-400 scale-x-[-1]" />
      </div>

      {/* Mountain range - bottom background */}
      <div className="absolute bottom-20 left-0 right-0">
        <Mountains className="w-full h-20 text-emerald-800" />
      </div>
      <div className="absolute bottom-12 left-0 right-0">
        <Mountains className="w-full h-16 text-emerald-700" />
      </div>

      {/* Pine Trees - bottom left */}
      <div className="absolute left-0 bottom-0 flex items-end gap-1 p-4">
        <PineTree className="w-6 h-10 text-emerald-600" />
        <PineTree className="w-8 h-14 text-emerald-500" />
        <PineTree className="w-10 h-18 text-emerald-600" />
        <PineTree className="w-7 h-12 text-emerald-500" />
        <PineTree className="w-9 h-16 text-emerald-600" />
      </div>

      {/* Pine Trees - bottom right */}
      <div className="absolute right-0 bottom-0 flex items-end gap-1 p-4">
        <PineTree className="w-9 h-16 text-emerald-600" />
        <PineTree className="w-7 h-12 text-emerald-500" />
        <PineTree className="w-10 h-18 text-emerald-600" />
        <PineTree className="w-8 h-14 text-emerald-500" />
        <PineTree className="w-6 h-10 text-emerald-600" />
      </div>

      {/* Woven border patterns - bottom */}
      <div className="absolute bottom-4 left-1/4 flex gap-4">
        <WovenPattern className="w-6 h-6 text-amber-500/50" />
        <WovenPattern className="w-6 h-6 text-amber-500/50" />
      </div>
      <div className="absolute bottom-4 right-1/4 flex gap-4">
        <WovenPattern className="w-6 h-6 text-amber-500/50" />
        <WovenPattern className="w-6 h-6 text-amber-500/50" />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-0 shadow-2xl shadow-black/30">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto">
            <img src={logo} alt="DOST Logo" className="mx-auto h-20 w-20" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-[#1a3a2a]">DOST-CAR</CardTitle>
            <CardDescription className="text-base text-emerald-600 font-medium">
              Management System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-[#1a3a2a] font-medium">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@dost.gov.ph"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-[#1a3a2a] font-medium">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-5 shadow-lg shadow-emerald-600/30" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Bottom accent with woven pattern colors */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600/50 via-emerald-500/50 to-amber-600/50" />
    </div>
  );
}
