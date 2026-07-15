import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAdminOrDirector = user.role === "admin" || user.role === "director";
  if (!isAdminOrDirector) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
