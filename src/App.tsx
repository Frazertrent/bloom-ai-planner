// src/App.tsx - Updated with Authentication Provider and Route Protection
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/hooks/useProfile";
import { OrderProvider } from "@/contexts/OrderContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { NetworkStatus } from "@/components/ui/network-status";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
import NewEvent from "./pages/NewEvent";
import NewClient from "./pages/NewClient";
import EventDetail from "./pages/EventDetail";

// BloomFundr Pages
import BloomFundrLanding from "./pages/bloomfundr/Landing";
import BloomFundrLogin from "./pages/bloomfundr/Login";
import BloomFundrRegister from "./pages/bloomfundr/Register";
import { BloomFundrAuthProvider } from "./contexts/BloomFundrAuthContext";
import BFProtectedRoute from "./components/bloomfundr/ProtectedRoute";

// Organization Pages
import OrgDashboard from "./pages/org/OrgDashboard";
import OrgCampaigns from "./pages/org/OrgCampaigns";
import OrgCampaignDetail from "./pages/org/OrgCampaignDetail";
import OrgStudents from "./pages/org/OrgStudents";
import OrgReports from "./pages/org/OrgReports";
import OrgSettings from "./pages/org/OrgSettings";
import CampaignWizard from "./pages/org/CampaignWizard";
import ManualOrderEntry from "./pages/org/ManualOrderEntry";

// Florist Pages
import FloristDashboard from "./pages/florist/FloristDashboard";
import FloristProducts from "./pages/florist/FloristProducts";
import FloristCampaigns from "./pages/florist/FloristCampaigns";
import FloristCampaignDetail from "./pages/florist/FloristCampaignDetail";
import FloristOrders from "./pages/florist/FloristOrders";
import FloristOrderDetail from "./pages/florist/FloristOrderDetail";
import FloristSettings from "./pages/florist/FloristSettings";
import FloristReports from "./pages/florist/FloristReports";

// Print styles
import "./styles/print.css";

// Public Order Pages
import OrderPage from "./pages/order/OrderPage";
import CheckoutPage from "./pages/order/CheckoutPage";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
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
        <LoadingSpinner size="lg" message="Loading..." />
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
    <Route path="/events/new" element={
  <ProtectedRoute>
    <AuthenticatedLayout>
      <NewEvent />
    </AuthenticatedLayout>
  </ProtectedRoute>
} />
<Route path="/events/:id" element={
  <ProtectedRoute>
    <AuthenticatedLayout>
      <EventDetail />
    </AuthenticatedLayout>
  </ProtectedRoute>
} />
<Route path="/events/:id/edit" element={
  <ProtectedRoute>
    <AuthenticatedLayout>
      <NewEvent />
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
<Route path="/clients/new" element={
  <ProtectedRoute>
    <AuthenticatedLayout>
      <NewClient />
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
<Route path="/clients/:id/edit" element={
  <ProtectedRoute>
    <AuthenticatedLayout>
      <NewClient />
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
    
    {/* BloomFundr Routes */}
    <Route path="/fundraiser" element={<BloomFundrLanding />} />
    <Route path="/fundraiser/login" element={<BloomFundrLogin />} />
    <Route path="/fundraiser/register" element={<BloomFundrRegister />} />
    
    {/* Florist Portal Routes */}
    <Route path="/florist" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <FloristDashboard />
      </BFProtectedRoute>
    } />
    <Route path="/florist/products" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <FloristProducts />
      </BFProtectedRoute>
    } />
    <Route path="/florist/campaigns" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <FloristCampaigns />
      </BFProtectedRoute>
    } />
    <Route path="/florist/campaigns/:id" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <FloristCampaignDetail />
      </BFProtectedRoute>
    } />
    <Route path="/florist/orders" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <FloristOrders />
      </BFProtectedRoute>
    } />
    <Route path="/florist/orders/:id" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <FloristOrderDetail />
      </BFProtectedRoute>
    } />
    <Route path="/florist/settings" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <FloristSettings />
      </BFProtectedRoute>
    } />
    <Route path="/florist/reports" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <FloristReports />
      </BFProtectedRoute>
    } />
    
    {/* Organization Portal Routes */}
    <Route path="/org" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <OrgDashboard />
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <OrgCampaigns />
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns/new" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <CampaignWizard />
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns/:id" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <OrgCampaignDetail />
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns/:id/edit" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <CampaignWizard />
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns/:id/add-order" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <ManualOrderEntry />
      </BFProtectedRoute>
    } />
    <Route path="/org/students" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <OrgStudents />
      </BFProtectedRoute>
    } />
    <Route path="/org/reports" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <OrgReports />
      </BFProtectedRoute>
    } />
    <Route path="/org/settings" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <OrgSettings />
      </BFProtectedRoute>
    } />
    
    {/* Legacy redirects */}
    <Route path="/fundraiser/org" element={<Navigate to="/org" replace />} />
    <Route path="/fundraiser/dashboard" element={
      <BFProtectedRoute>
        <FloristDashboard />
      </BFProtectedRoute>
    } />
    <Route path="/fundraiser/florist" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <FloristDashboard />
      </BFProtectedRoute>
    } />
    
    {/* Public Order Routes */}
    <Route path="/order/:magicLinkCode" element={<OrderPage />} />
    <Route path="/order/:magicLinkCode/checkout" element={<CheckoutPage />} />
    
    {/* Catch all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <NetworkStatus />
        <AuthProvider>
          <BloomFundrAuthProvider>
            <OrderProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </OrderProvider>
          </BloomFundrAuthProvider>
        </AuthProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;