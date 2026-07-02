import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath, type UserRole } from "@/lib/roles";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/?auth=signin" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // For customer routes, require phone verification
  if (user?.role === "customer" && !user?.phone_verified_at) {
    return <Navigate to="/?auth=verify-phone" replace />;
  }

  return <>{children}</>;
};