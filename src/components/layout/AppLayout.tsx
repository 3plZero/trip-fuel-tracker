import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutDashboard,
  FileText,
  Car,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Plane,
  Wrench,
  Building2,
  Zap,
  Package,
  FolderOpen,
  GraduationCap,
  Home,
  User,
  Settings,
  ChevronRight,
} from 'lucide-react';
import logo from '@/assets/dost-car-logo-new.png';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

type SystemType = 'fuel-report' | 'travel-order' | 'preventive-maintenance' | 'inventory-system' | 'technology-trainings';

const fuelReportNavigation = [
  { name: 'Dashboard', href: '/fuel-dashboard', icon: LayoutDashboard },
  { name: 'Trip Tickets', href: '/trip-tickets', icon: FileText },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Drivers', href: '/drivers', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const travelOrderNavigation = [
  { name: 'Dashboard', href: '/travel-order-dashboard', icon: LayoutDashboard },
  { name: 'Travel Orders', href: '/travel-orders', icon: Plane },
];

const preventiveMaintenanceNavigation = [
  { name: 'Dashboard', href: '/maintenance-dashboard', icon: LayoutDashboard },
  { name: 'Vehicle Maintenance', href: '/vehicle-maintenance', icon: Car },
  { name: 'Building Maintenance', href: '/building-maintenance', icon: Building2 },
  { name: 'Generator Maintenance', href: '/generator-maintenance', icon: Zap },
];

const inventoryNavigation = [
  { name: 'Dashboard', href: '/inventory-dashboard', icon: LayoutDashboard },
  { name: 'Categories', href: '/inventory-categories', icon: FolderOpen },
  { name: 'All Items', href: '/inventory-items', icon: Package },
];

const trainingsNavigation = [
  { name: 'Dashboard', href: '/trainings-dashboard', icon: LayoutDashboard },
  { name: 'All Trainings', href: '/trainings', icon: GraduationCap },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSystem, setCurrentSystem] = useState<SystemType>(() => {
    const path = location.pathname;
    if (path.includes('travel-order')) return 'travel-order';
    if (path.includes('maintenance') || path.includes('generator') || path.includes('building')) return 'preventive-maintenance';
    if (path.includes('inventory')) return 'inventory-system';
    if (path.includes('training')) return 'technology-trainings';
    return 'fuel-report';
  });

  const navigation = currentSystem === 'fuel-report' 
    ? fuelReportNavigation 
    : currentSystem === 'travel-order' 
      ? travelOrderNavigation 
      : currentSystem === 'inventory-system'
        ? inventoryNavigation
        : currentSystem === 'technology-trainings'
          ? trainingsNavigation
          : preventiveMaintenanceNavigation;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform bg-sidebar transition-all duration-300 ease-out lg:translate-x-0 shadow-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-4 border-b border-sidebar-border px-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-400 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-500" />
              <img src={logo} alt="DOST Logo" className="relative h-12 w-12 rounded-xl shadow-lg" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-sidebar-foreground tracking-tight">DOST-CAR</h1>
              <p className="text-xs text-sidebar-foreground/60">Management System</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Back to Home */}
          <div className="p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-primary/20 hover:text-primary transition-all duration-300 rounded-xl h-11"
              onClick={() => navigate('/')}
            >
              <Home className="h-5 w-5" />
              Back to Home
              <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
            </Button>
          </div>

          {/* System Selector */}
          <div className="px-3 pb-3">
            <Select value={currentSystem} onValueChange={(value: SystemType) => setCurrentSystem(value)}>
              <SelectTrigger className="w-full bg-sidebar-accent/50 text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent transition-colors duration-300 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fuel-report">Fuel Report System</SelectItem>
                <SelectItem value="travel-order">Travel Order System</SelectItem>
                <SelectItem value="preventive-maintenance">Preventive Maintenance</SelectItem>
                <SelectItem value="inventory-system">Inventory System</SelectItem>
                <SelectItem value="technology-trainings">Technology Trainings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    !isActive && "group-hover:scale-110"
                  )} />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground animate-pulse-soft" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Profile & Settings */}
          <div className="border-t border-sidebar-border p-3 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300 rounded-xl h-11"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300 rounded-xl h-11"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </div>

          {/* Sign out */}
          <div className="border-t border-sidebar-border p-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-all duration-300 rounded-xl h-11"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72 transition-all duration-300">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-primary/10 transition-colors duration-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
