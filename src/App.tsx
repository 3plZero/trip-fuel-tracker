import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Dashboard from "@/pages/Dashboard";
import TravelOrderDashboard from "@/pages/TravelOrderDashboard";
import TripTickets from "@/pages/TripTickets";
import TripTicketForm from "@/pages/TripTicketForm";
import TripTicketView from "@/pages/TripTicketView";
import TravelOrders from "@/pages/TravelOrders";
import TravelOrderForm from "@/pages/TravelOrderForm";
import TravelOrderView from "@/pages/TravelOrderView";
import Vehicles from "@/pages/Vehicles";
import Drivers from "@/pages/Drivers";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/NotFound";
import MaintenanceDashboard from "@/pages/MaintenanceDashboard";
import VehicleMaintenance from "@/pages/VehicleMaintenance";
import VehicleMaintenanceForm from "@/pages/VehicleMaintenanceForm";
import VehicleMaintenanceView from "@/pages/VehicleMaintenanceView";
import BuildingMaintenance from "@/pages/BuildingMaintenance";
import BuildingMaintenanceForm from "@/pages/BuildingMaintenanceForm";
import BuildingMaintenanceView from "@/pages/BuildingMaintenanceView";
import GeneratorMaintenance from "@/pages/GeneratorMaintenance";
import GeneratorMaintenanceForm from "@/pages/GeneratorMaintenanceForm";
import GeneratorMaintenanceView from "@/pages/GeneratorMaintenanceView";
import Generators from "@/pages/Generators";
import Buildings from "@/pages/Buildings";
import InventoryDashboard from "@/pages/InventoryDashboard";
import InventoryCategories from "@/pages/InventoryCategories";
import InventoryItems from "@/pages/InventoryItems";
import InventoryItemForm from "@/pages/InventoryItemForm";
import InventoryItemView from "@/pages/InventoryItemView";
import ItemScan from "@/pages/ItemScan";
import TrainingsDashboard from "@/pages/TrainingsDashboard";
import Trainings from "@/pages/Trainings";
import TrainingForm from "@/pages/TrainingForm";
import TrainingView from "@/pages/TrainingView";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function ProtectedRouteWithLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      {/* Public route for QR scan - no auth required */}
      <Route path="/scan/:id" element={<ItemScan />} />
      {/* Main Landing Page */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      {/* Fuel Report System Routes */}
      <Route path="/fuel-dashboard" element={<ProtectedRouteWithLayout><Dashboard /></ProtectedRouteWithLayout>} />
      <Route path="/trip-tickets" element={<ProtectedRouteWithLayout><TripTickets /></ProtectedRouteWithLayout>} />
      <Route path="/trip-tickets/new" element={<ProtectedRouteWithLayout><TripTicketForm /></ProtectedRouteWithLayout>} />
      <Route path="/trip-tickets/:id" element={<ProtectedRouteWithLayout><TripTicketView /></ProtectedRouteWithLayout>} />
      <Route path="/trip-tickets/:id/edit" element={<ProtectedRouteWithLayout><TripTicketForm /></ProtectedRouteWithLayout>} />
      {/* Travel Order System Routes */}
      <Route path="/travel-order-dashboard" element={<ProtectedRouteWithLayout><TravelOrderDashboard /></ProtectedRouteWithLayout>} />
      <Route path="/travel-orders" element={<ProtectedRouteWithLayout><TravelOrders /></ProtectedRouteWithLayout>} />
      <Route path="/travel-orders/new" element={<ProtectedRouteWithLayout><TravelOrderForm /></ProtectedRouteWithLayout>} />
      <Route path="/travel-orders/:id" element={<ProtectedRouteWithLayout><TravelOrderView /></ProtectedRouteWithLayout>} />
      <Route path="/travel-orders/:id/edit" element={<ProtectedRouteWithLayout><TravelOrderForm /></ProtectedRouteWithLayout>} />
      {/* Preventive Maintenance System Routes */}
      <Route path="/maintenance-dashboard" element={<ProtectedRouteWithLayout><MaintenanceDashboard /></ProtectedRouteWithLayout>} />
      <Route path="/vehicle-maintenance" element={<ProtectedRouteWithLayout><VehicleMaintenance /></ProtectedRouteWithLayout>} />
      <Route path="/vehicle-maintenance/new" element={<ProtectedRouteWithLayout><VehicleMaintenanceForm /></ProtectedRouteWithLayout>} />
      <Route path="/vehicle-maintenance/:id" element={<ProtectedRouteWithLayout><VehicleMaintenanceView /></ProtectedRouteWithLayout>} />
      <Route path="/vehicle-maintenance/:id/edit" element={<ProtectedRouteWithLayout><VehicleMaintenanceForm /></ProtectedRouteWithLayout>} />
      <Route path="/building-maintenance" element={<ProtectedRouteWithLayout><BuildingMaintenance /></ProtectedRouteWithLayout>} />
      <Route path="/building-maintenance/new" element={<ProtectedRouteWithLayout><BuildingMaintenanceForm /></ProtectedRouteWithLayout>} />
      <Route path="/building-maintenance/:id" element={<ProtectedRouteWithLayout><BuildingMaintenanceView /></ProtectedRouteWithLayout>} />
      <Route path="/building-maintenance/:id/edit" element={<ProtectedRouteWithLayout><BuildingMaintenanceForm /></ProtectedRouteWithLayout>} />
      <Route path="/generator-maintenance" element={<ProtectedRouteWithLayout><GeneratorMaintenance /></ProtectedRouteWithLayout>} />
      <Route path="/generator-maintenance/new" element={<ProtectedRouteWithLayout><GeneratorMaintenanceForm /></ProtectedRouteWithLayout>} />
      <Route path="/generator-maintenance/:id" element={<ProtectedRouteWithLayout><GeneratorMaintenanceView /></ProtectedRouteWithLayout>} />
      <Route path="/generator-maintenance/:id/edit" element={<ProtectedRouteWithLayout><GeneratorMaintenanceForm /></ProtectedRouteWithLayout>} />
      <Route path="/generators" element={<ProtectedRouteWithLayout><Generators /></ProtectedRouteWithLayout>} />
      <Route path="/buildings" element={<ProtectedRouteWithLayout><Buildings /></ProtectedRouteWithLayout>} />
      {/* Inventory System Routes */}
      <Route path="/inventory-dashboard" element={<ProtectedRouteWithLayout><InventoryDashboard /></ProtectedRouteWithLayout>} />
      <Route path="/inventory-categories" element={<ProtectedRouteWithLayout><InventoryCategories /></ProtectedRouteWithLayout>} />
      <Route path="/inventory-items" element={<ProtectedRouteWithLayout><InventoryItems /></ProtectedRouteWithLayout>} />
      <Route path="/inventory-items/new" element={<ProtectedRouteWithLayout><InventoryItemForm /></ProtectedRouteWithLayout>} />
      <Route path="/inventory-items/:id" element={<ProtectedRouteWithLayout><InventoryItemView /></ProtectedRouteWithLayout>} />
      <Route path="/inventory-items/:id/edit" element={<ProtectedRouteWithLayout><InventoryItemForm /></ProtectedRouteWithLayout>} />
      {/* Technology Trainings System Routes */}
      <Route path="/trainings-dashboard" element={<ProtectedRouteWithLayout><TrainingsDashboard /></ProtectedRouteWithLayout>} />
      <Route path="/trainings" element={<ProtectedRouteWithLayout><Trainings /></ProtectedRouteWithLayout>} />
      <Route path="/trainings/new" element={<ProtectedRouteWithLayout><TrainingForm /></ProtectedRouteWithLayout>} />
      <Route path="/trainings/:id" element={<ProtectedRouteWithLayout><TrainingView /></ProtectedRouteWithLayout>} />
      <Route path="/trainings/:id/edit" element={<ProtectedRouteWithLayout><TrainingForm /></ProtectedRouteWithLayout>} />
      {/* Shared Routes */}
      <Route path="/vehicles" element={<ProtectedRouteWithLayout><Vehicles /></ProtectedRouteWithLayout>} />
      <Route path="/drivers" element={<ProtectedRouteWithLayout><Drivers /></ProtectedRouteWithLayout>} />
      <Route path="/reports" element={<ProtectedRouteWithLayout><Reports /></ProtectedRouteWithLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
