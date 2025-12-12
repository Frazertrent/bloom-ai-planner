import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FloristSidebar } from "./FloristSidebar";
import { FloristNotificationBell } from "./FloristNotificationBell";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface FloristLayoutProps {
  children: ReactNode;
}

export function FloristLayout({ children }: FloristLayoutProps) {
  const { profile } = useBloomFundrAuth();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-bloomfundr-background">
        <FloristSidebar />
        <div className="flex-1 flex flex-col min-w-0 w-full max-w-full">
          {/* Header */}
          <header className="h-14 md:h-16 border-b border-bloomfundr-muted bg-bloomfundr-card flex items-center px-3 md:px-4 gap-3">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center" />
            <div className="flex-1" />
            {/* Mobile: Show notification bell in header */}
            <div className="md:hidden">
              <FloristNotificationBell />
            </div>
            <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Welcome, <span className="font-medium text-foreground">{profile?.full_name || "Florist"}</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-20 md:pb-6 w-full max-w-full box-border">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
