import React from "react";
import {
  BadgePercent,
  Tag,
  Truck,
  Gift,
  Sparkles,
  CalendarClock,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import type { BroadcastRecord } from "@/types/broadcast.types";
import { formatDate, formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface ActivePromotionsPanelProps {
  title: string;
  description: string;
  items: BroadcastRecord[];
  emptyTitle?: string;
  emptyDescription?: string;
  compact?: boolean;
}

const typeIconMap = {
  discount: BadgePercent,
  bogo: Gift,
  "free-shipping": Truck,
  bundle: Sparkles,
  clearance: Tag,
} as const;

const getOfferLabel = (item: BroadcastRecord) => {
  if (item.discount_type === "percentage" && item.discount_value) {
    return `${Number(item.discount_value)}% off`;
  }

  if (item.discount_type === "fixed" && item.discount_value) {
    return `${formatPrice(Number(item.discount_value))} off`;
  }

  if (item.type === "free-shipping") {
    return "Free shipping";
  }

  if (item.type === "bogo") {
    return "Buy one, get one";
  }

  if (item.type === "bundle") {
    return "Bundle offer";
  }

  return "Limited offer";
};

export const ActivePromotionsPanel: React.FC<ActivePromotionsPanelProps> = ({
  title,
  description,
  items,
  emptyTitle = "No active promotions",
  emptyDescription = "New offers will appear here when suppliers publish them.",
  compact = false,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={BadgePercent}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <div
            className={cn(
              "grid gap-4",
              compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
            )}
          >
            {items.map((item) => {
              const Icon = typeIconMap[item.type];
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.created_by}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {getOfferLabel(item)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {item.summary || item.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {item.code && (
                      <Badge variant="outline" className="font-mono">
                        {item.code}
                      </Badge>
                    )}
                    {item.min_order ? (
                      <Badge variant="outline">
                        Min order {Number(item.min_order).toLocaleString()}
                      </Badge>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      Ends {formatDate(item.end_date)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivePromotionsPanel;
