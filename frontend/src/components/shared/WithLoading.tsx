import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface WithLoadingProps {
  isLoading: boolean;
  error?: string | null;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  children: React.ReactNode;
}

export const WithLoading: React.FC<WithLoadingProps> = ({
  isLoading,
  error,
  loadingComponent,
  errorComponent,
  children,
}) => {
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  if (error) {
    return errorComponent ? (
      <>{errorComponent}</>
    ) : (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
