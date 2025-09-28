// src/App.tsx - Updated with Authentication Provider and Route Protection
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/hooks/useProfile";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import Events from "./pages/Events";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Marketing from "./pages/Marketing";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Team from "./pages/Team";
import PhotoGallery from "./pages/PhotoGallery";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  </SidebarProvider>
);

// Public Route Component (redirects if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={
      <PublicRoute>
        <Index />
      </PublicRoute>
    } />
    <Route path="/login" element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    } />
    <Route path="/register" element={
      <PublicRoute>
        <Register />
      </PublicRoute>
    } />
    
    {/* Protected routes with sidebar */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } />
    <Route path="/events" element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <Events />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } />
    <Route path="/clients" element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <Clients />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } />
    <Route path="/clients/:id" element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ClientDetail />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } />
    <Route path="/marketing" element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <Marketing />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } />
    <Route path="/analytics" element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <Analytics />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } />
    <Route path="/team" element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <Team />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } />
    <Route path="/photos" element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <PhotoGallery />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <Settings />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } />
    
    {/* Catch all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;