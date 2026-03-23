import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plane, Wrench, Package, DollarSign, Settings, User, LogOut, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import logo from '@/assets/dost-car-logo-new.png';

const systems = [
  {
    id: 'fuel-report',
    name: 'Fuel Report System',
    description: 'Manage trip tickets, fuel consumption, and vehicle tracking',
    icon: FileText,
    href: '/fuel-dashboard',
    gradient: 'from-cyan-500 to-blue-600',
    delay: '0ms',
  },
  {
    id: 'travel-order',
    name: 'Travel Order System',
    description: 'Create and manage travel orders and itineraries',
    icon: Plane,
    href: '/travel-order-dashboard',
    gradient: 'from-emerald-500 to-teal-600',
    delay: '100ms',
  },
  {
    id: 'preventive-maintenance',
    name: 'Preventive Maintenance',
    description: 'Track maintenance schedules for vehicles, buildings, and generators',
    icon: Wrench,
    href: '/maintenance-dashboard',
    gradient: 'from-amber-500 to-orange-600',
    delay: '200ms',
  },
  {
    id: 'inventory-system',
    name: 'Inventory System',
    description: 'Manage inventory items, categories, and stock levels',
    icon: Package,
    href: '/inventory-dashboard',
    gradient: 'from-violet-500 to-purple-600',
    delay: '300ms',
  },
  {
    id: 'technology-trainings',
    name: 'Technology Trainings',
    description: 'Track technology trainings, participants, and expenditures across CAR provinces',
    icon: GraduationCap,
    href: '/trainings-dashboard',
    gradient: 'from-rose-500 to-pink-600',
    delay: '400ms',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                <img 
                  src={logo} 
                  alt="DOST-CAR Logo" 
                  className="relative h-12 w-12 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">DOST-CAR</h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/profile')}
                className="gap-2 hover:bg-primary/10 transition-all duration-300"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/settings')}
                className="gap-2 hover:bg-primary/10 transition-all duration-300"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Dark Hero Section */}
      <section className="relative bg-sidebar text-sidebar-foreground py-16 overflow-hidden">
        {/* Dark section decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center animate-fade-in-up">
            <div className="inline-block mb-6">
              <div className="relative">
                <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-cyan-400/30 to-primary/30 rounded-full blur-2xl animate-pulse-soft" />
                <img 
                  src={logo} 
                  alt="DOST-CAR Logo" 
                  className="relative w-28 h-28 mx-auto animate-float drop-shadow-2xl" 
                />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, <span className="text-primary">{displayName}</span>!
            </h2>
            <p className="text-lg text-sidebar-foreground/70 max-w-md mx-auto">
              Select a system below to get started with your work
            </p>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-background">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* System Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {systems.map((system, index) => (
            <Card
              key={system.id}
              className="group cursor-pointer relative overflow-hidden border-0 bg-card shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: system.delay }}
              onClick={() => navigate(system.href)}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${system.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Animated border */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${system.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm`} />
              <div className="absolute inset-[1px] rounded-xl bg-card z-0" />
              
              <CardHeader className="relative z-10 pb-2">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${system.gradient} flex items-center justify-center mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <system.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                  {system.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-sm leading-relaxed mb-4">
                  {system.description}
                </CardDescription>
                <div className="flex items-center text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                  Open System
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Dark Footer Section */}
      <footer className="relative bg-sidebar text-sidebar-foreground py-12 mt-8">
        {/* Wave divider at top */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden rotate-180">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 fill-background">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={logo} alt="DOST-CAR" className="h-10 w-10 opacity-80" />
            <div className="h-8 w-px bg-sidebar-foreground/20" />
            <span className="text-lg font-semibold text-primary">DOST-CAR</span>
          </div>
          <p className="text-sm text-sidebar-foreground/60">
            Department of Science and Technology - Cordillera Administrative Region
          </p>
          <p className="text-xs text-sidebar-foreground/40 mt-2">
            © 2026 All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
