import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { user, accessToken } = useAuthStore();

  // Not logged in
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  // Suspended account
  if (user.status === "suspended") {
    return <Navigate to="/account-suspended" replace />;
  }

  // Role restriction
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
