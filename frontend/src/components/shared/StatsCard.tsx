import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  subtext?: string;
}

export const StatsCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  subtext,
}: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {(change || subtext) && (
              <div className="flex items-center gap-2">
                {trend && (
                  <div className="flex items-center">
                    {trend === "up" && (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    )}
                    {trend === "down" && (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    {trend === "neutral" && (
                      <Minus className="h-4 w-4 text-gray-600" />
                    )}
                    {change && (
                      <span
                        className={cn(
                          "text-xs font-medium",
                          trend === "up" && "text-green-600",
                          trend === "down" && "text-red-600",
                          trend === "neutral" && "text-gray-600",
                        )}
                      >
                        {change}
                      </span>
                    )}
                  </div>
                )}
                {subtext && (
                  <span className="text-xs text-muted-foreground">
                    {subtext}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-full", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
