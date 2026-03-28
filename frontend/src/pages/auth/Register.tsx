import React, { useEffect } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Register from "@/components/landing/Register";

export const RegisterPage: React.FC = () => {
  const { isLoading, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Creating your account..." />;
  }

  return <Register />;
};
