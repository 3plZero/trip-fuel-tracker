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

// Minimalist Tree SVG
const Tree = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 60" className={className} fill="currentColor">
    <rect x="17" y="40" width="6" height="20" opacity="0.4" />
    <polygon points="20,0 5,25 35,25" opacity="0.3" />
    <polygon points="20,12 2,42 38,42" opacity="0.35" />
  </svg>
);

// Minimalist Computer/Monitor
const Computer = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="3" width="40" height="26" rx="2" opacity="0.35" />
    <rect x="8" y="6" width="34" height="20" fill="currentColor" opacity="0.15" />
    <rect x="20" y="29" width="10" height="4" fill="currentColor" opacity="0.3" />
    <rect x="15" y="33" width="20" height="3" rx="1" fill="currentColor" opacity="0.35" />
  </svg>
);

// Cloud icon
const Cloud = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 50 30" className={className} fill="currentColor">
    <ellipse cx="25" cy="18" rx="15" ry="10" opacity="0.25" />
    <ellipse cx="15" cy="20" rx="10" ry="8" opacity="0.3" />
    <ellipse cx="35" cy="20" rx="10" ry="8" opacity="0.3" />
    <ellipse cx="20" cy="14" rx="8" ry="6" opacity="0.2" />
    <ellipse cx="30" cy="14" rx="8" ry="6" opacity="0.2" />
  </svg>
);

// Server/Database icon
const Server = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 30 50" className={className} fill="currentColor">
    <rect x="2" y="2" width="26" height="14" rx="2" opacity="0.3" />
    <rect x="2" y="18" width="26" height="14" rx="2" opacity="0.25" />
    <rect x="2" y="34" width="26" height="14" rx="2" opacity="0.3" />
    <circle cx="7" cy="9" r="2" opacity="0.5" />
    <circle cx="7" cy="25" r="2" opacity="0.5" />
    <circle cx="7" cy="41" r="2" opacity="0.5" />
  </svg>
);

// Gear/Cog icon
const Gear = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="currentColor" opacity="0.25">
    <path d="M20 8 L22 2 L18 2 Z M20 32 L22 38 L18 38 Z M8 20 L2 22 L2 18 Z M32 20 L38 22 L38 18 Z M11 11 L6 6 L9 9 Z M29 29 L34 34 L31 31 Z M11 29 L6 34 L9 31 Z M29 11 L34 6 L31 9 Z" />
    <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
    <circle cx="20" cy="20" r="4" opacity="0.4" />
  </svg>
);

// Leaf/Plant icon
const Leaf = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 30 40" className={className} fill="currentColor">
    <path d="M15 38 Q15 25 15 15 Q5 18 3 8 Q15 2 25 10 Q28 20 15 25" opacity="0.3" />
    <path d="M15 38 L15 20" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
  </svg>
);

// Network node
const NetworkNode = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="currentColor">
    <circle cx="20" cy="20" r="4" opacity="0.4" />
    <circle cx="8" cy="8" r="3" opacity="0.25" />
    <circle cx="32" cy="8" r="3" opacity="0.25" />
    <circle cx="8" cy="32" r="3" opacity="0.25" />
    <circle cx="32" cy="32" r="3" opacity="0.25" />
    <line x1="20" y1="20" x2="8" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <line x1="20" y1="20" x2="32" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <line x1="20" y1="20" x2="8" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    <line x1="20" y1="20" x2="32" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.2" />
  </svg>
);

// Chip/Processor icon
const Chip = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="currentColor">
    <rect x="10" y="10" width="20" height="20" rx="2" opacity="0.3" />
    <rect x="14" y="14" width="12" height="12" opacity="0.2" />
    {/* Pins */}
    <rect x="14" y="5" width="3" height="5" opacity="0.25" />
    <rect x="23" y="5" width="3" height="5" opacity="0.25" />
    <rect x="14" y="30" width="3" height="5" opacity="0.25" />
    <rect x="23" y="30" width="3" height="5" opacity="0.25" />
    <rect x="5" y="14" width="5" height="3" opacity="0.25" />
    <rect x="5" y="23" width="5" height="3" opacity="0.25" />
    <rect x="30" y="14" width="5" height="3" opacity="0.25" />
    <rect x="30" y="23" width="5" height="3" opacity="0.25" />
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
      <div className="min-h-screen flex items-center justify-center bg-[#0d1b2a]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d1b2a] via-[#1b263b] to-[#0d1b2a] p-4 relative overflow-hidden">
      
      {/* Left side decorations */}
      <div className="absolute left-6 top-8">
        <Cloud className="w-16 h-10 text-cyan-400" />
      </div>
      <div className="absolute left-20 top-20">
        <NetworkNode className="w-10 h-10 text-blue-400" />
      </div>
      <div className="absolute left-8 top-1/3">
        <Computer className="w-14 h-12 text-cyan-400" />
      </div>
      <div className="absolute left-24 top-1/2">
        <Gear className="w-12 h-12 text-teal-400" />
      </div>
      <div className="absolute left-4 bottom-32">
        <Server className="w-10 h-16 text-blue-400" />
      </div>
      <div className="absolute left-0 bottom-0 flex items-end gap-3 p-6">
        <Tree className="w-10 h-16 text-emerald-400" />
        <Tree className="w-14 h-20 text-teal-400" />
        <Leaf className="w-8 h-12 text-green-400" />
        <Tree className="w-12 h-18 text-cyan-500" />
      </div>

      {/* Right side decorations */}
      <div className="absolute right-6 top-8">
        <Chip className="w-12 h-12 text-cyan-400" />
      </div>
      <div className="absolute right-24 top-16">
        <Cloud className="w-14 h-9 text-blue-400" />
      </div>
      <div className="absolute right-8 top-1/3">
        <Server className="w-8 h-14 text-teal-400" />
      </div>
      <div className="absolute right-20 top-1/2">
        <Computer className="w-12 h-10 text-cyan-400" />
      </div>
      <div className="absolute right-6 bottom-36">
        <NetworkNode className="w-10 h-10 text-blue-400" />
      </div>
      <div className="absolute right-0 bottom-0 flex items-end gap-3 p-6">
        <Tree className="w-12 h-18 text-teal-400" />
        <Leaf className="w-8 h-12 text-emerald-400" />
        <Tree className="w-16 h-22 text-cyan-500" />
        <Tree className="w-10 h-14 text-green-400" />
      </div>

      {/* Top center decorations */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-8">
        <Gear className="w-8 h-8 text-cyan-400/50" />
        <Chip className="w-10 h-10 text-blue-400/50" />
        <Gear className="w-8 h-8 text-teal-400/50" />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-white border-0 shadow-2xl shadow-black/30">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto">
            <img src={logo} alt="DOST Logo" className="mx-auto h-20 w-20" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold text-[#1b263b]">DOST-CAR</CardTitle>
            <CardDescription className="text-base text-cyan-600 font-medium">
              Management System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-[#1b263b] font-medium">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@dost.gov.ph"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-[#1b263b] font-medium">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-cyan-500 focus:ring-cyan-500/20"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-5 shadow-lg shadow-cyan-500/30" 
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
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
    </div>
  );
}
