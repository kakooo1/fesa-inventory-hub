import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import Tools from "./pages/Tools";
import Loans from "./pages/Loans";
import Vehicles from "./pages/Vehicles";
import UsersPage from "./pages/Users";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useApp();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={currentUser ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/materials" 
        element={
          <ProtectedRoute>
            <Materials />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tools" 
        element={
          <ProtectedRoute>
            <Tools />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/loans" 
        element={
          <ProtectedRoute>
            <Loans />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vehicles" 
        element={
          <ProtectedRoute>
            <Vehicles />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
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
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
