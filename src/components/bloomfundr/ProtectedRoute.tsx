import { Navigate } from "react-router-dom";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { Loader2 } from "lucide-react";

type AllowedRole = "florist" | "org_admin" | "org_member" | "customer";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useBloomFundrAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bloomfundr-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-bloomfundr-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/fundraiser/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === "florist") {
      return <Navigate to="/fundraiser/florist" replace />;
    } else if (role === "org_admin" || role === "org_member") {
      return <Navigate to="/fundraiser/org" replace />;
    }
    return <Navigate to="/fundraiser" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
