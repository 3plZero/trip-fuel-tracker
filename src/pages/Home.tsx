import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plane, Wrench, Package, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import logo from '@/assets/logo.png';

const systems = [
  {
    id: 'fuel-report',
    name: 'Fuel Report System',
    description: 'Manage trip tickets, fuel consumption, and vehicle tracking',
    icon: FileText,
    href: '/fuel-dashboard',
    color: 'bg-blue-500',
  },
  {
    id: 'travel-order',
    name: 'Travel Order System',
    description: 'Create and manage travel orders and itineraries',
    icon: Plane,
    href: '/travel-order-dashboard',
    color: 'bg-emerald-500',
  },
  {
    id: 'preventive-maintenance',
    name: 'Preventive Maintenance',
    description: 'Track maintenance schedules for vehicles, buildings, and generators',
    icon: Wrench,
    href: '/maintenance-dashboard',
    color: 'bg-amber-500',
  },
  {
    id: 'inventory-system',
    name: 'Inventory System',
    description: 'Manage inventory items, categories, and stock levels',
    icon: Package,
    href: '/inventory-dashboard',
    color: 'bg-purple-500',
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="DOST Logo" className="h-12 w-12 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-foreground">DOST-CAR</h1>
                <p className="text-sm text-muted-foreground">Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Welcome, {displayName}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Select a system to get started
          </p>
        </div>

        {/* System Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {systems.map((system) => (
            <Card
              key={system.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
              onClick={() => navigate(system.href)}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${system.color} flex items-center justify-center mb-3`}>
                  <system.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{system.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{system.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
