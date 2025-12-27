import { Navigate } from "react-router-dom";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type AllowedRole = "florist" | "org_admin" | "org_member" | "customer" | "platform_admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AllowedRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useBloomFundrAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bloomfundr-background">
        <LoadingSpinner size="lg" message="Loading..." />
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
