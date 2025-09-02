import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import NotFound from "./pages/NotFound";

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
          <Route path="/" element={<Navigate to="/login" replace />} />
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
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Clients</h1>
                <p className="text-muted-foreground">Client management coming soon...</p>
              </div>
            </AuthenticatedLayout>
          } />
          <Route path="/orders" element={
            <AuthenticatedLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Orders</h1>
                <p className="text-muted-foreground">Order management coming soon...</p>
              </div>
            </AuthenticatedLayout>
          } />
          <Route path="/layouts" element={
            <AuthenticatedLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Layouts</h1>
                <p className="text-muted-foreground">Layout designer coming soon...</p>
              </div>
            </AuthenticatedLayout>
          } />
          <Route path="/schedule" element={
            <AuthenticatedLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Schedule</h1>
                <p className="text-muted-foreground">Schedule management coming soon...</p>
              </div>
            </AuthenticatedLayout>
          } />
          <Route path="/budget" element={
            <AuthenticatedLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Budget</h1>
                <p className="text-muted-foreground">Budget calculator coming soon...</p>
              </div>
            </AuthenticatedLayout>
          } />
          <Route path="/marketing" element={
            <AuthenticatedLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Marketing</h1>
                <p className="text-muted-foreground">Marketing center coming soon...</p>
              </div>
            </AuthenticatedLayout>
          } />
          <Route path="/analytics" element={
            <AuthenticatedLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Analytics</h1>
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </div>
            </AuthenticatedLayout>
          } />
          <Route path="/team" element={
            <AuthenticatedLayout>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">Team</h1>
                <p className="text-muted-foreground">Team management coming soon...</p>
              </div>
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