import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Package, 
  Calendar, 
  ShoppingCart, 
  Settings,
  Flower2,
  LogOut
} from "lucide-react";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FloristNotificationBell } from "./FloristNotificationBell";

const navItems = [
  { title: "Dashboard", url: "/florist", icon: Home },
  { title: "Products", url: "/florist/products", icon: Package },
  { title: "Campaigns", url: "/florist/campaigns", icon: Calendar },
  { title: "Orders", url: "/florist/orders", icon: ShoppingCart },
  { title: "Settings", url: "/florist/settings", icon: Settings },
];

export function FloristSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, profile } = useBloomFundrAuth();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/florist") {
      return location.pathname === "/florist";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar
      className={cn(
        "border-r border-bloomfundr-muted bg-bloomfundr-card",
        collapsed ? "w-14" : "w-60"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-bloomfundr-muted p-4">
        <div className="flex items-center justify-between">
          <Link to="/florist" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bloomfundr-primary to-bloomfundr-primary-light flex items-center justify-center shadow-lg shrink-0">
              <Flower2 className="w-6 h-6 text-bloomfundr-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-foreground">BloomFundr</span>
                <span className="text-xs text-muted-foreground">Florist Portal</span>
              </div>
            )}
          </Link>
          {!collapsed && <FloristNotificationBell />}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive(item.url)
                          ? "bg-bloomfundr-primary/10 text-bloomfundr-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-bloomfundr-muted p-4">
        {!collapsed && profile && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-foreground truncate">
              {profile.full_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile.email}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
