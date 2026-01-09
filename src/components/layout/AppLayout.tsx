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
  Home,
  User,
  Settings,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

type SystemType = 'fuel-report' | 'travel-order' | 'preventive-maintenance' | 'inventory-system';

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

const systemLabels = {
  'fuel-report': 'Fuel Report System',
  'travel-order': 'Travel Order System',
  'preventive-maintenance': 'Preventive Maintenance',
  'inventory-system': 'Inventory System',
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSystem, setCurrentSystem] = useState<SystemType>(() => {
    // Determine initial system based on current path
    const path = location.pathname;
    if (path.includes('travel-order')) return 'travel-order';
    if (path.includes('maintenance') || path.includes('generator') || path.includes('building')) return 'preventive-maintenance';
    if (path.includes('inventory')) return 'inventory-system';
    return 'fuel-report';
  });

  const navigation = currentSystem === 'fuel-report' 
    ? fuelReportNavigation 
    : currentSystem === 'travel-order' 
      ? travelOrderNavigation 
      : currentSystem === 'inventory-system'
        ? inventoryNavigation
        : preventiveMaintenanceNavigation;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
            <img src={logo} alt="DOST Logo" className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <h1 className="font-bold text-sidebar-foreground">DOST-CAR</h1>
              <p className="text-xs text-sidebar-foreground/70">Management System</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Back to Home */}
          <div className="border-b border-sidebar-border p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          {/* System Selector */}
          <div className="border-b border-sidebar-border p-4">
            <Select value={currentSystem} onValueChange={(value: SystemType) => setCurrentSystem(value)}>
              <SelectTrigger className="w-full bg-sidebar-accent text-sidebar-foreground border-sidebar-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fuel-report">Fuel Report System</SelectItem>
                <SelectItem value="travel-order">Travel Order System</SelectItem>
                <SelectItem value="preventive-maintenance">Preventive Maintenance</SelectItem>
                <SelectItem value="inventory-system">Inventory System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Profile & Settings */}
          <div className="border-t border-sidebar-border p-2 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </div>

          {/* Sign out */}
          <div className="border-t border-sidebar-border p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
