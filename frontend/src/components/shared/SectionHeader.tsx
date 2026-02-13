import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface SectionHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "outline";
}

export const SectionHeader = ({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  badge,
  badgeVariant = "default",
}: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {badge && (
            <Badge variant={badgeVariant} className="ml-2">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actionLabel && (actionHref || onAction) && (
        <Button
          variant="ghost"
          size="sm"
          asChild={!!actionHref}
          onClick={onAction}
        >
          {actionHref ? (
            <Link to={actionHref} className="gap-1">
              {actionLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="flex items-center gap-1">
              {actionLabel}
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      )}
    </div>
  );
};
