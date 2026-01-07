import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

type SystemType = 'fuel-report' | 'travel-order';

const fuelReportNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Trip Tickets', href: '/trip-tickets', icon: FileText },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Drivers', href: '/drivers', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const travelOrderNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Travel Orders', href: '/travel-orders', icon: Plane },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const systemLabels = {
  'fuel-report': 'Fuel Report System',
  'travel-order': 'Travel Order System',
};

export default function AppLayout({ children }: AppLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSystem, setCurrentSystem] = useState<SystemType>('fuel-report');

  const navigation = currentSystem === 'fuel-report' ? fuelReportNavigation : travelOrderNavigation;

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

          {/* System Selector */}
          <div className="border-b border-sidebar-border p-4">
            <Select value={currentSystem} onValueChange={(value: SystemType) => setCurrentSystem(value)}>
              <SelectTrigger className="w-full bg-sidebar-accent text-sidebar-foreground border-sidebar-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fuel-report">Fuel Report System</SelectItem>
                <SelectItem value="travel-order">Travel Order System</SelectItem>
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
