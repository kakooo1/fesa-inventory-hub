console.log("🚨 MI URL DE SUPABASE ES:", import.meta.env.VITE_SUPABASE_URL);
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useRealtimeProfiles } from "@/hooks/useRealtimeProfiles";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";

import Materials from "./pages/Materials";
import Clothing from "./pages/Clothing";
import EPP from "./pages/EPP";
import Tools from "./pages/Tools";
import Equipments from "./pages/Equipments";
import Repairs from "./pages/Repairs";
import ImportData from "./pages/ImportData";
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

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/" 
        element={
          user && userProfile?.role === 'supervisor' ? (
            <SupervisorDashboard />
          ) : user && userProfile?.role === 'technician' ? (
            <TechnicianDashboard />
          ) : (
            <ProtectedRoute allowedRoles={['admin', 'bodeguero']}>
              <Dashboard />
            </ProtectedRoute>
          )
        } 
      />
      <Route 
        path="/materials" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'bodeguero', 'supervisor']}>
            <Materials />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clothing" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'bodeguero', 'supervisor']}>
            <Clothing />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/epp" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'bodeguero', 'supervisor']}>
            <EPP />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tools" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'bodeguero', 'supervisor']}>
            <Tools />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/equipments" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'bodeguero', 'supervisor']}>
            <Equipments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/repairs" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'supervisor', 'technician']}>
            <Repairs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/import-data" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ImportData />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/loans" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'supervisor', 'bodeguero']}>
            <Loans />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/material-requests" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'supervisor', 'bodeguero', 'technician']}>
            <MaterialRequests />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vehicles" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'bodeguero', 'supervisor']}>
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

function AppWithRealtime() {
  // Initialize realtime listeners globally
  useRealtimeProfiles();
  
  return <AppRoutes />;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppWithRealtime />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
