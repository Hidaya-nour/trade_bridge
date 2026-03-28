import React from "react";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: any;
  variant?: "inline" | "card" | "fullscreen" | "alert";
  action?: {
    label: string;
    onClick: () => void;
  };
  showRetry?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Something went wrong",
  message = "An error occurred while loading data.",
  error,
  variant = "card",
  action,
  showRetry = true,
  showHome = false,
  showBack = false,
  className,
}) => {
  const navigate = useNavigate();

  const errorMessage =
    error?.response?.data?.message || error?.message || message;

  const errorDetails = import.meta.env.DEV ? error : null;

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>

      <p className="text-sm text-muted-foreground">{errorMessage}</p>

      {errorDetails && (
        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-[200px]">
          {JSON.stringify(errorDetails, null, 2)}
        </pre>
      )}

      <div className="flex flex-wrap gap-2">
        {showRetry && (
          <Button size="sm" onClick={handleRetry} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}

        {action && (
          <Button size="sm" onClick={action.onClick} variant="default">
            {action.label}
          </Button>
        )}

        {showBack && (
          <Button size="sm" onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        )}

        {showHome && (
          <Button size="sm" onClick={handleGoHome} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );

  if (variant === "inline") {
    return <div className={cn("p-4", className)}>{content}</div>;
  }

  // if (variant === "alert") {
  //   return (
  //     <Alert variant="destructive" className={className}>
  //       <AlertCircle className="h-4 w-4" />
  //       <AlertTitle>{title}</AlertTitle>
  //       <AlertDescription>{errorMessage}</AlertDescription>
  //       {(showRetry || action) && (
  //         <div className="mt-4">{content.props.children[3]}</div>
  //       )}
  //     </Alert>
  //   );
  // }

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <Card className={cn("w-[400px]", className)}>
          <CardContent className="p-6">{content}</CardContent>
        </Card>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">{content}</CardContent>
    </Card>
  );
};
