// src/App.tsx - Main application with lazy loading and route protection
import { lazy, Suspense } from "react";
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
import { BloomFundrAuthProvider } from "./contexts/BloomFundrAuthContext";
import BFProtectedRoute from "./components/bloomfundr/ProtectedRoute";

// Print styles
import "./styles/print.css";

// Eagerly loaded pages (critical path)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Lazy loaded pages - AI Florist Platform
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Events = lazy(() => import("./pages/Events"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientDetail = lazy(() => import("./pages/ClientDetail"));
const Marketing = lazy(() => import("./pages/Marketing"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Team = lazy(() => import("./pages/Team"));
const PhotoGallery = lazy(() => import("./pages/PhotoGallery"));
const Settings = lazy(() => import("./pages/Settings"));
const NewEvent = lazy(() => import("./pages/NewEvent"));
const NewClient = lazy(() => import("./pages/NewClient"));
const EventDetail = lazy(() => import("./pages/EventDetail"));

// Lazy loaded BloomFundr pages
const BloomFundrLanding = lazy(() => import("./pages/bloomfundr/Landing"));
const BloomFundrLogin = lazy(() => import("./pages/bloomfundr/Login"));
const BloomFundrRegister = lazy(() => import("./pages/bloomfundr/Register"));

// Lazy loaded Organization pages
const OrgDashboard = lazy(() => import("./pages/org/OrgDashboard"));
const OrgCampaigns = lazy(() => import("./pages/org/OrgCampaigns"));
const OrgCampaignDetail = lazy(() => import("./pages/org/OrgCampaignDetail"));
const OrgStudents = lazy(() => import("./pages/org/OrgStudents"));
const OrgReports = lazy(() => import("./pages/org/OrgReports"));
const OrgSettings = lazy(() => import("./pages/org/OrgSettings"));
const CampaignWizard = lazy(() => import("./pages/org/CampaignWizard"));
const ManualOrderEntry = lazy(() => import("./pages/org/ManualOrderEntry"));

// Lazy loaded Florist pages
const FloristDashboard = lazy(() => import("./pages/florist/FloristDashboard"));
const FloristProducts = lazy(() => import("./pages/florist/FloristProducts"));
const FloristCampaigns = lazy(() => import("./pages/florist/FloristCampaigns"));
const FloristCampaignDetail = lazy(() => import("./pages/florist/FloristCampaignDetail"));
const FloristOrders = lazy(() => import("./pages/florist/FloristOrders"));
const FloristOrderDetail = lazy(() => import("./pages/florist/FloristOrderDetail"));
const FloristSettings = lazy(() => import("./pages/florist/FloristSettings"));
const FloristReports = lazy(() => import("./pages/florist/FloristReports"));

// Dashboard redirect component for role-based routing
const DashboardRedirect = lazy(() => import("./components/bloomfundr/DashboardRedirect"));

// Lazy loaded Public Order pages
const OrderPage = lazy(() => import("./pages/order/OrderPage"));
const CheckoutPage = lazy(() => import("./pages/order/CheckoutPage"));
const OrderSuccess = lazy(() => import("./pages/order/OrderSuccess"));
const OrderCancel = lazy(() => import("./pages/order/OrderCancel"));
const TestPayment = lazy(() => import("./pages/order/TestPayment"));
const SellerJoinPage = lazy(() => import("./pages/order/SellerJoinPage"));
const SellerPortal = lazy(() => import("./pages/order/SellerPortal"));

const queryClient = new QueryClient();

// Suspense fallback component
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading page">
    <LoadingSpinner size="lg" message="Loading page..." />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Authenticating">
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
      <main className="flex-1 overflow-hidden" role="main">
        <div className="h-full p-6 overflow-y-auto">
          <Suspense fallback={<PageFallback />}>
            {children}
          </Suspense>
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
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
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
    <Route path="/fundraiser" element={
      <Suspense fallback={<PageFallback />}>
        <BloomFundrLanding />
      </Suspense>
    } />
    <Route path="/fundraiser/login" element={
      <Suspense fallback={<PageFallback />}>
        <BloomFundrLogin />
      </Suspense>
    } />
    <Route path="/fundraiser/register" element={
      <Suspense fallback={<PageFallback />}>
        <BloomFundrRegister />
      </Suspense>
    } />
    
    {/* Florist Portal Routes */}
    <Route path="/florist" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <Suspense fallback={<PageFallback />}>
          <FloristDashboard />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/florist/products" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <Suspense fallback={<PageFallback />}>
          <FloristProducts />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/florist/products/new" element={
      <Navigate to="/florist/products?addProduct=true" replace />
    } />
    <Route path="/florist/campaigns" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <Suspense fallback={<PageFallback />}>
          <FloristCampaigns />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/florist/campaigns/:id" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <Suspense fallback={<PageFallback />}>
          <FloristCampaignDetail />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/florist/orders" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <Suspense fallback={<PageFallback />}>
          <FloristOrders />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/florist/orders/:id" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <Suspense fallback={<PageFallback />}>
          <FloristOrderDetail />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/florist/settings" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <Suspense fallback={<PageFallback />}>
          <FloristSettings />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/florist/reports" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <Suspense fallback={<PageFallback />}>
          <FloristReports />
        </Suspense>
      </BFProtectedRoute>
    } />
    
    {/* Organization Portal Routes */}
    <Route path="/org" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <Suspense fallback={<PageFallback />}>
          <OrgDashboard />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <Suspense fallback={<PageFallback />}>
          <OrgCampaigns />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns/new" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <Suspense fallback={<PageFallback />}>
          <CampaignWizard />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns/:id" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <Suspense fallback={<PageFallback />}>
          <OrgCampaignDetail />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns/:id/edit" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <Suspense fallback={<PageFallback />}>
          <CampaignWizard />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/org/campaigns/:id/add-order" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <Suspense fallback={<PageFallback />}>
          <ManualOrderEntry />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/org/students" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <Suspense fallback={<PageFallback />}>
          <OrgStudents />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/org/reports" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <Suspense fallback={<PageFallback />}>
          <OrgReports />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/org/settings" element={
      <BFProtectedRoute allowedRoles={["org_admin", "org_member"]}>
        <Suspense fallback={<PageFallback />}>
          <OrgSettings />
        </Suspense>
      </BFProtectedRoute>
    } />
    
    {/* Legacy redirects */}
    <Route path="/fundraiser/org" element={<Navigate to="/org" replace />} />
    <Route path="/fundraiser/dashboard" element={
      <BFProtectedRoute>
        <Suspense fallback={<PageFallback />}>
          <DashboardRedirect />
        </Suspense>
      </BFProtectedRoute>
    } />
    <Route path="/fundraiser/florist" element={
      <BFProtectedRoute allowedRoles={["florist"]}>
        <Suspense fallback={<PageFallback />}>
          <FloristDashboard />
        </Suspense>
      </BFProtectedRoute>
    } />
    
    {/* Public Order Routes */}
    <Route path="/order/:magicLinkCode" element={
      <Suspense fallback={<PageFallback />}>
        <OrderPage />
      </Suspense>
    } />
    <Route path="/order/:magicLinkCode/checkout" element={
      <Suspense fallback={<PageFallback />}>
        <CheckoutPage />
      </Suspense>
    } />
    <Route path="/order/:magicLinkCode/success" element={
      <Suspense fallback={<PageFallback />}>
        <OrderSuccess />
      </Suspense>
    } />
    <Route path="/order/:magicLinkCode/cancel" element={
      <Suspense fallback={<PageFallback />}>
        <OrderCancel />
      </Suspense>
    } />
    <Route path="/order/:magicLinkCode/test-payment" element={
      <Suspense fallback={<PageFallback />}>
        <TestPayment />
      </Suspense>
    } />
    
    {/* Seller Self-Registration Route */}
    <Route path="/join/:code" element={
      <Suspense fallback={<PageFallback />}>
        <SellerJoinPage />
      </Suspense>
    } />
    
    {/* Seller Portal Route */}
    <Route path="/seller/:magicLinkCode" element={
      <Suspense fallback={<PageFallback />}>
        <SellerPortal />
      </Suspense>
    } />
    
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