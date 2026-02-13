import { BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatCompactPrice } from "@/lib/formatters";

interface PerformanceMetric {
  label: string;
  value: number;
  target?: number;
  suffix?: string;
}

interface PerformanceCardProps {
  title?: string;
  metrics: PerformanceMetric[];
  footerLabel?: string;
  footerValue?: string | number;
  className?: string;
}

export const PerformanceCard = ({
  title = "Performance",
  metrics,
  footerLabel,
  footerValue,
  className,
}: PerformanceCardProps) => {
  return (
    <div
      className={cn(
        "mt-6 rounded-xl bg-gradient-to-br from-primary/5 via-primary/5 to-primary/10 p-4 border border-primary/10 shadow-sm",
        className,
      )}
    >
      <h4 className="text-xs font-semibold mb-3 flex items-center text-foreground/80">
        <BarChart3 className="h-3.5 w-3.5 mr-1.5 text-primary" />
        {title}
      </h4>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{metric.label}</span>
              <span className="font-medium text-foreground">
                {metric.value}
                {metric.suffix || "%"}
              </span>
            </div>
            <Progress
              value={metric.target || metric.value}
              className="h-1.5 bg-primary/10 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/80"
            />
          </div>
        ))}

        {footerLabel && footerValue && (
          <div className="flex items-center justify-between pt-1.5 border-t border-primary/10">
            <span className="text-xs text-muted-foreground">{footerLabel}</span>
            <span className="text-sm font-semibold text-foreground">
              {footerValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
