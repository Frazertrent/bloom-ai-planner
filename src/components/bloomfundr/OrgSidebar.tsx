import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  Building2
} from "lucide-react";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";

const navItems = [
  { title: "Dashboard", url: "/org", icon: Home },
  { title: "Campaigns", url: "/org/campaigns", icon: Calendar },
  { title: "Sellers", url: "/org/students", icon: Users },
  { title: "Reports", url: "/org/reports", icon: BarChart3 },
  { title: "Settings", url: "/org/settings", icon: Settings },
];

export function OrgSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { profile, signOut } = useBloomFundrAuth();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/org") {
      return location.pathname === "/org";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar 
      className="border-r border-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Link to="/org" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div>
                <span className="font-bold text-lg text-foreground">BloomFundr</span>
                <p className="text-xs text-muted-foreground">Organization Portal</p>
              </div>
            )}
          </Link>
          {!collapsed && <NotificationBell />}
        </div>
      </SidebarHeader>

      <SidebarContent>
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
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || "Organization"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </p>
          </div>
        )}
        <Button 
          variant="ghost" 
          size={collapsed ? "icon" : "sm"} 
          onClick={signOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
