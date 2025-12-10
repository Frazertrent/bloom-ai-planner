import { Navigate } from "react-router-dom";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const DashboardRedirect = () => {
  const { role, loading, user } = useBloomFundrAuth();

  // Wait for loading OR if user exists but role hasn't loaded yet
  if (loading || (user && !role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  // Redirect based on role
  if (role === "florist") {
    return <Navigate to="/fundraiser/florist" replace />;
  }
  
  if (role === "org_admin" || role === "org_member") {
    return <Navigate to="/org" replace />;
  }

  // Fallback to landing if no role
  return <Navigate to="/fundraiser" replace />;
};

export default DashboardRedirect;
