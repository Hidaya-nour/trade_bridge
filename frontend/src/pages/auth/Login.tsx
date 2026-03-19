import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Login from "@/components/landing/Login";

export const LoginPage: React.FC = () => {
  const { isLoading } = useAuthStore();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading your data..." />;
  }

  const handleSuccessRedirect = () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    switch (user.role) {
      case "retailer":
        navigate("/retailer/dashboard");
        break;
      case "distributor":
        navigate("/distributor/dashboard");
        break;
      case "factory":
        navigate("/factory/dashboard");
        break;
      case "driver":
        navigate("/driver/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Login />
    </div>
  );
};
