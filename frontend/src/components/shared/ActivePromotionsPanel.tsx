// src/components/shared/ActivePromotionsPanel.tsx
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  BadgePercent,
  Tag,
  Truck,
  Gift,
  Sparkles,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  getProductLink?: (promotion: BroadcastRecord) => string | null;
  onProductClick?: (promotion: BroadcastRecord) => void;
  scrollable?: boolean;
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
  getProductLink,
  onProductClick,
  scrollable = true,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BadgePercent}
            title={emptyTitle}
            description={emptyDescription}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {scrollable && items.length > 3 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300",
            scrollable ? "scroll-smooth" : "flex-wrap"
          )}
          style={{
            scrollbarWidth: "thin",
            msOverflowStyle: "auto",
          }}
        >
          {items.map((item) => {
            const Icon = typeIconMap[item.type];
            const productLink = getProductLink ? getProductLink(item) : null;
            
            const handleClick = () => {
              if (onProductClick) {
                onProductClick(item);
              }
            };

            const PromotionCard = (
              <div
                className={cn(
                  "flex-shrink-0 rounded-xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-4 transition-all hover:shadow-md",
                  scrollable ? "w-[320px]" : "w-full"
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        by {item.created_by}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 whitespace-nowrap">
                    {getOfferLabel(item)}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
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
                      Min {formatPrice(Number(item.min_order))}
                    </Badge>
                  ) : null}
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <CalendarClock className="h-3 w-3" />
                    Ends {formatDate(item.end_date)}
                  </span>
                </div>

                {productLink && (
                  <div className="mt-4">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={productLink}>Shop Now →</Link>
                    </Button>
                  </div>
                )}
              </div>
            );

            // If there's a product link, wrap with Link, otherwise just render the card
            if (productLink) {
              return (
                <Link
                  key={item.id}
                  to={productLink}
                  onClick={handleClick}
                  className="block flex-shrink-0 no-underline"
                >
                  {PromotionCard}
                </Link>
              );
            }

            return (
              <div
                key={item.id}
                onClick={handleClick}
                className={cn(
                  "flex-shrink-0 cursor-pointer",
                  onProductClick && "hover:opacity-90"
                )}
              >
                {PromotionCard}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivePromotionsPanel;