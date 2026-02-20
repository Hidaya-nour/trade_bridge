import React from "react";
import { ErrorDisplay } from "./ErrorDisplay";

interface WithErrorProps {
  error: string | null | undefined;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  message?: string;
  variant?: "inline" | "card" | "fullscreen" | "alert";
  showRetry?: boolean;
  onRetry?: () => void;
}

export const WithError: React.FC<WithErrorProps> = ({
  error,
  children,
  fallback,
  title,
  message,
  variant = "card",
  showRetry = true,
  onRetry,
}) => {
  if (!error) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <ErrorDisplay
      title={title}
      message={message || error}
      error={error}
      variant={variant}
      showRetry={showRetry}
      action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
    />
  );
};
