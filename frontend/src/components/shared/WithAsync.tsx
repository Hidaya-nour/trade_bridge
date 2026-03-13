import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";

interface WithAsyncProps {
  isLoading?: boolean;
  error?: string | null;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  children: React.ReactNode;
}

export const WithAsync: React.FC<WithAsyncProps> = ({
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
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <ErrorDisplay
          title="Something went wrong"
          message={error}
          error={error}
          variant="card"
          showRetry
        />
      </div>
    );
  }

  return <>{children}</>;
};
