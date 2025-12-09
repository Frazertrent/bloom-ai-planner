import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flower2, LogOut, LayoutDashboard } from "lucide-react";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const { user, profile, role, signOut } = useBloomFundrAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/fundraiser");
  };

  const getDashboardLink = () => {
    if (role === "florist") return "/fundraiser/florist";
    if (role === "org_admin" || role === "org_member") return "/fundraiser/org";
    return "/fundraiser/dashboard";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bloomfundr-card/95 backdrop-blur-sm border-b border-bloomfundr-muted">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/fundraiser" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bloomfundr-primary to-bloomfundr-primary-light flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <Flower2 className="w-6 h-6 text-bloomfundr-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-bloomfundr-primary to-bloomfundr-secondary bg-clip-text text-transparent">
            BloomFundr
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-foreground hover:text-bloomfundr-primary hover:bg-bloomfundr-muted"
              >
                <Link to={getDashboardLink()} className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-bloomfundr-primary/20">
                      <AvatarFallback className="bg-bloomfundr-primary/10 text-bloomfundr-primary">
                        {profile?.full_name ? getInitials(profile.full_name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-bloomfundr-primary capitalize mt-1">{role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-foreground hover:text-bloomfundr-primary hover:bg-bloomfundr-muted"
              >
                <Link to="/fundraiser/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light text-bloomfundr-primary-foreground shadow-md hover:shadow-lg transition-all"
              >
                <Link to="/fundraiser/register">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
