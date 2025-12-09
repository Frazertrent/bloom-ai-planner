import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OrgSidebar } from "./OrgSidebar";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";

interface OrgLayoutProps {
  children: ReactNode;
}

export function OrgLayout({ children }: OrgLayoutProps) {
  const { profile } = useBloomFundrAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <OrgSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border flex items-center px-4 gap-4 bg-background">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="text-sm text-muted-foreground">
              {profile?.email}
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
