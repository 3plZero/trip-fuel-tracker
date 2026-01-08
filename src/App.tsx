import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import Auth from "@/pages/Auth";
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
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      {/* Fuel Report System Routes */}
      <Route path="/trip-tickets" element={<ProtectedRoute><TripTickets /></ProtectedRoute>} />
      <Route path="/trip-tickets/new" element={<ProtectedRoute><TripTicketForm /></ProtectedRoute>} />
      <Route path="/trip-tickets/:id" element={<ProtectedRoute><TripTicketView /></ProtectedRoute>} />
      <Route path="/trip-tickets/:id/edit" element={<ProtectedRoute><TripTicketForm /></ProtectedRoute>} />
      {/* Travel Order System Routes */}
      <Route path="/travel-order-dashboard" element={<ProtectedRoute><TravelOrderDashboard /></ProtectedRoute>} />
      <Route path="/travel-orders" element={<ProtectedRoute><TravelOrders /></ProtectedRoute>} />
      <Route path="/travel-orders/new" element={<ProtectedRoute><TravelOrderForm /></ProtectedRoute>} />
      <Route path="/travel-orders/:id" element={<ProtectedRoute><TravelOrderView /></ProtectedRoute>} />
      <Route path="/travel-orders/:id/edit" element={<ProtectedRoute><TravelOrderForm /></ProtectedRoute>} />
      {/* Preventive Maintenance System Routes */}
      <Route path="/maintenance-dashboard" element={<ProtectedRoute><MaintenanceDashboard /></ProtectedRoute>} />
      <Route path="/vehicle-maintenance" element={<ProtectedRoute><VehicleMaintenance /></ProtectedRoute>} />
      <Route path="/vehicle-maintenance/new" element={<ProtectedRoute><VehicleMaintenanceForm /></ProtectedRoute>} />
      <Route path="/vehicle-maintenance/:id" element={<ProtectedRoute><VehicleMaintenanceView /></ProtectedRoute>} />
      <Route path="/vehicle-maintenance/:id/edit" element={<ProtectedRoute><VehicleMaintenanceForm /></ProtectedRoute>} />
      <Route path="/building-maintenance" element={<ProtectedRoute><BuildingMaintenance /></ProtectedRoute>} />
      <Route path="/building-maintenance/new" element={<ProtectedRoute><BuildingMaintenanceForm /></ProtectedRoute>} />
      <Route path="/building-maintenance/:id" element={<ProtectedRoute><BuildingMaintenanceView /></ProtectedRoute>} />
      <Route path="/building-maintenance/:id/edit" element={<ProtectedRoute><BuildingMaintenanceForm /></ProtectedRoute>} />
      <Route path="/generator-maintenance" element={<ProtectedRoute><GeneratorMaintenance /></ProtectedRoute>} />
      <Route path="/generator-maintenance/new" element={<ProtectedRoute><GeneratorMaintenanceForm /></ProtectedRoute>} />
      <Route path="/generator-maintenance/:id" element={<ProtectedRoute><GeneratorMaintenanceView /></ProtectedRoute>} />
      <Route path="/generator-maintenance/:id/edit" element={<ProtectedRoute><GeneratorMaintenanceForm /></ProtectedRoute>} />
      <Route path="/generators" element={<ProtectedRoute><Generators /></ProtectedRoute>} />
      <Route path="/buildings" element={<ProtectedRoute><Buildings /></ProtectedRoute>} />
      {/* Inventory System Routes */}
      <Route path="/inventory-dashboard" element={<ProtectedRoute><InventoryDashboard /></ProtectedRoute>} />
      <Route path="/inventory-categories" element={<ProtectedRoute><InventoryCategories /></ProtectedRoute>} />
      <Route path="/inventory-items" element={<ProtectedRoute><InventoryItems /></ProtectedRoute>} />
      <Route path="/inventory-items/new" element={<ProtectedRoute><InventoryItemForm /></ProtectedRoute>} />
      <Route path="/inventory-items/:id" element={<ProtectedRoute><InventoryItemView /></ProtectedRoute>} />
      <Route path="/inventory-items/:id/edit" element={<ProtectedRoute><InventoryItemForm /></ProtectedRoute>} />
      {/* Shared Routes */}
      <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
      <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
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
