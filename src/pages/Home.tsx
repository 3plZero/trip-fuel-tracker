import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plane, Wrench, Package, Settings, User, LogOut, ArrowRight } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-sidebar relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-sidebar-border bg-sidebar/90 backdrop-blur-md">
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
                <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">DOST-CAR</h1>
                <p className="text-xs text-sidebar-foreground/60">Management System</p>
              </div>
            </div>
            <nav className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/profile')}
                className="gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-300"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/settings')}
                className="gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-300"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="gap-2 border-sidebar-border text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-cyan-400/20 to-primary/20 rounded-full blur-2xl animate-pulse-soft" />
              <img 
                src={logo} 
                alt="DOST-CAR Logo" 
                className="relative w-24 h-24 mx-auto animate-float" 
              />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-sidebar-foreground mb-4">
            Welcome back, <span className="text-primary">{displayName}</span>!
          </h2>
          <p className="text-lg text-sidebar-foreground/60 max-w-md mx-auto">
            Select a system below to get started with your work
          </p>
        </div>

        {/* System Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {systems.map((system, index) => (
            <Card
              key={system.id}
              className="group cursor-pointer relative overflow-hidden border-0 bg-sidebar-accent shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: system.delay }}
              onClick={() => navigate(system.href)}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${system.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Animated border */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${system.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm`} />
              <div className="absolute inset-[1px] rounded-xl bg-sidebar-accent z-0" />
              
              <CardHeader className="relative z-10 pb-2">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${system.gradient} flex items-center justify-center mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <system.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-sidebar-foreground group-hover:text-primary transition-colors duration-300">
                  {system.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-sm leading-relaxed mb-4 text-sidebar-foreground/60">
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

        {/* Footer Stats */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
          <p className="text-sm text-sidebar-foreground/50">
            Department of Science and Technology - Cordillera Administrative Region
          </p>
        </div>
      </main>
    </div>
  );
}
