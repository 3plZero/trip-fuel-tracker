import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
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
      <Route path="/travel-orders" element={<ProtectedRoute><TravelOrders /></ProtectedRoute>} />
      <Route path="/travel-orders/new" element={<ProtectedRoute><TravelOrderForm /></ProtectedRoute>} />
      <Route path="/travel-orders/:id" element={<ProtectedRoute><TravelOrderView /></ProtectedRoute>} />
      <Route path="/travel-orders/:id/edit" element={<ProtectedRoute><TravelOrderForm /></ProtectedRoute>} />
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
