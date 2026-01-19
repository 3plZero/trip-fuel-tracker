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

// Minimalist Tree SVG Component
const TreeDecoration = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 60 100"
    className={className}
    style={style}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Tree trunk */}
    <rect x="26" y="70" width="8" height="30" fill="currentColor" opacity="0.3" />
    {/* Tree foliage layers */}
    <polygon points="30,5 10,40 50,40" fill="currentColor" opacity="0.2" />
    <polygon points="30,20 5,55 55,55" fill="currentColor" opacity="0.25" />
    <polygon points="30,35 0,75 60,75" fill="currentColor" opacity="0.3" />
  </svg>
);

// Minimalist Computer SVG Component
const ComputerDecoration = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 80 60"
    className={className}
    style={style}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Monitor */}
    <rect x="5" y="5" width="70" height="40" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.3" fill="none" />
    <rect x="10" y="10" width="60" height="30" fill="currentColor" opacity="0.15" />
    {/* Stand */}
    <rect x="32" y="45" width="16" height="5" fill="currentColor" opacity="0.25" />
    <rect x="25" y="50" width="30" height="4" rx="1" fill="currentColor" opacity="0.3" />
    {/* Screen details */}
    <rect x="15" y="15" width="25" height="3" fill="currentColor" opacity="0.2" />
    <rect x="15" y="21" width="35" height="2" fill="currentColor" opacity="0.15" />
    <rect x="15" y="26" width="20" height="2" fill="currentColor" opacity="0.15" />
  </svg>
);

// Floating dots decoration
const FloatingDots = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white/10 animate-pulse"
        style={{
          width: Math.random() * 6 + 2 + 'px',
          height: Math.random() * 6 + 2 + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDelay: Math.random() * 3 + 's',
          animationDuration: Math.random() * 3 + 2 + 's',
        }}
      />
    ))}
  </div>
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
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-blue-500/5 animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Floating dots */}
      <FloatingDots />
      
      {/* Left side decorations - Trees */}
      <div className="absolute left-0 bottom-0 flex items-end gap-4 p-8">
        <TreeDecoration 
          className="w-16 h-24 text-cyan-400 animate-float" 
          style={{ animationDelay: '0s' }}
        />
        <TreeDecoration 
          className="w-12 h-20 text-emerald-400 animate-float" 
          style={{ animationDelay: '0.5s' }}
        />
        <TreeDecoration 
          className="w-20 h-28 text-teal-400 animate-float" 
          style={{ animationDelay: '1s' }}
        />
      </div>
      
      {/* Right side decorations - Trees */}
      <div className="absolute right-0 bottom-0 flex items-end gap-4 p-8">
        <TreeDecoration 
          className="w-20 h-28 text-teal-400 animate-float" 
          style={{ animationDelay: '0.3s' }}
        />
        <TreeDecoration 
          className="w-14 h-22 text-cyan-400 animate-float" 
          style={{ animationDelay: '0.8s' }}
        />
        <TreeDecoration 
          className="w-16 h-24 text-emerald-400 animate-float" 
          style={{ animationDelay: '1.3s' }}
        />
      </div>
      
      {/* Top left - Computer decorations */}
      <div className="absolute left-8 top-8">
        <ComputerDecoration 
          className="w-20 h-16 text-cyan-400 animate-float opacity-60" 
          style={{ animationDelay: '0.2s' }}
        />
      </div>
      
      <div className="absolute left-32 top-24">
        <ComputerDecoration 
          className="w-14 h-12 text-blue-400 animate-float opacity-40" 
          style={{ animationDelay: '1.5s' }}
        />
      </div>
      
      {/* Top right - Computer decorations */}
      <div className="absolute right-8 top-8">
        <ComputerDecoration 
          className="w-20 h-16 text-cyan-400 animate-float opacity-60" 
          style={{ animationDelay: '0.7s' }}
        />
      </div>
      
      <div className="absolute right-32 top-24">
        <ComputerDecoration 
          className="w-14 h-12 text-teal-400 animate-float opacity-40" 
          style={{ animationDelay: '1.2s' }}
        />
      </div>
      
      {/* Middle side decorations */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <ComputerDecoration 
          className="w-16 h-14 text-emerald-400 animate-float opacity-30" 
          style={{ animationDelay: '0.9s' }}
        />
      </div>
      
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <ComputerDecoration 
          className="w-16 h-14 text-blue-400 animate-float opacity-30" 
          style={{ animationDelay: '1.8s' }}
        />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm border-0 shadow-2xl shadow-black/20 animate-scale-in">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="relative mx-auto">
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
            <img src={logo} alt="DOST Logo" className="relative mx-auto h-20 w-20 animate-float" style={{ animationDuration: '4s' }} />
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
                className="border-gray-200 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-200"
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
                className="border-gray-200 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-200"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-medium py-5 transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40" 
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
      
      {/* Bottom decoration line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </div>
  );
}
