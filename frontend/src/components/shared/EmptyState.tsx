import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
}: EmptyStateProps) => {
  return (
    <Card className="py-12">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
        <div className="flex items-center justify-center gap-3">
          {actionLabel && (onAction || actionHref) && (
            <Button size="lg" asChild={!!actionHref} onClick={onAction}>
              {actionHref ? (
                <Link to={actionHref}>{actionLabel}</Link>
              ) : (
                actionLabel
              )}
            </Button>
          )}
          {secondaryActionLabel && secondaryActionHref && (
            <Button variant="outline" size="lg" asChild>
              <Link to={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
