import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FloristSidebar } from "./FloristSidebar";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";

interface FloristLayoutProps {
  children: ReactNode;
}

export function FloristLayout({ children }: FloristLayoutProps) {
  const { profile } = useBloomFundrAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-bloomfundr-background">
        <FloristSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-bloomfundr-muted bg-bloomfundr-card flex items-center px-4 gap-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1" />
            <div className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{profile?.full_name || "Florist"}</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
