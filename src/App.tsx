console.log("🚨 MI URL DE SUPABASE ES:", import.meta.env.VITE_SUPABASE_URL);
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";

import Materials from "./pages/Materials";
import Tools from "./pages/Tools";
import Equipments from "./pages/Equipments";
import Loans from "./pages/Loans";
import MaterialRequests from "./pages/MaterialRequests";
import Vehicles from "./pages/Vehicles";
import Notifications from "./pages/Notifications";
import UsersPage from "./pages/Users";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if allowedRoles is specified
  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'supervisor', 'technician', 'bodeguero']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/materials" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'supervisor', 'technician', 'bodeguero']}>
            <Materials />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tools" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'supervisor', 'technician', 'bodeguero']}>
            <Tools />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/equipments" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'supervisor', 'technician', 'bodeguero']}>
            <Equipments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/loans" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'supervisor', 'technician', 'bodeguero']}>
            <Loans />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/material-requests" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'supervisor', 'bodeguero']}>
            <MaterialRequests />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vehicles" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'technician', 'bodeguero', 'supervisor']}>
            <Vehicles />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
