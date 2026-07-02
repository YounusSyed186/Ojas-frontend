import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/roles";
import { DashboardLoadingState } from "@/components/dashboard/DashboardErrorState";

const DashboardRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  return <Navigate to={getDashboardPath(user?.role)} replace />;
};

export default DashboardRedirect;
