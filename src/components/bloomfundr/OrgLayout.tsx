import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OrgSidebar } from "./OrgSidebar";
import { NotificationBell } from "./NotificationBell";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrgLayoutProps {
  children: ReactNode;
}

export function OrgLayout({ children }: OrgLayoutProps) {
  const { profile } = useBloomFundrAuth();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <OrgSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 md:h-16 border-b border-border flex items-center px-3 md:px-4 gap-3 bg-background">
            <SidebarTrigger className="min-h-[44px] min-w-[44px] flex items-center justify-center" />
            <div className="flex-1" />
            {/* Mobile: Show notification bell in header */}
            <div className="md:hidden">
              <NotificationBell />
            </div>
            <div className="text-xs md:text-sm text-muted-foreground hidden sm:block truncate max-w-[200px]">
              {profile?.email}
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-20 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
