import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Marketing from "./pages/Marketing";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Team from "./pages/Team";
import PhotoGallery from "./pages/PhotoGallery";

const queryClient = new QueryClient();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with sidebar */}
          <Route path="/dashboard" element={
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          } />
          <Route path="/events" element={
            <AuthenticatedLayout>
              <Events />
            </AuthenticatedLayout>
          } />
          <Route path="/clients" element={
            <AuthenticatedLayout>
              <Clients />
            </AuthenticatedLayout>
          } />
          <Route path="/clients/:clientId" element={
            <AuthenticatedLayout>
              <ClientDetail />
            </AuthenticatedLayout>
          } />
          <Route path="/marketing" element={
            <AuthenticatedLayout>
              <Marketing />
            </AuthenticatedLayout>
          } />
          <Route path="/analytics" element={
            <AuthenticatedLayout>
              <Analytics />
            </AuthenticatedLayout>
          } />
          <Route path="/team" element={
            <AuthenticatedLayout>
              <Team />
            </AuthenticatedLayout>
          } />
          <Route path="/gallery" element={
            <AuthenticatedLayout>
              <PhotoGallery />
            </AuthenticatedLayout>
          } />
          <Route path="/settings" element={
            <AuthenticatedLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p className="text-muted-foreground">Settings page coming soon...</p>
              </div>
            </AuthenticatedLayout>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;