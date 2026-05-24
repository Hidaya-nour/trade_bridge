import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useProductStore } from "@/stores/product.store";
import forecastService from "@/services/forecast.service";
import type { InventoryForecastPoint } from "@/services/forecast.service";
import { formatDate } from "@/lib/formatters";

interface ProductForecastSummary {
  productId: string;
  productName: string;
  stockQuantity: number;
  dailyForecast: InventoryForecastPoint[];
  totalForecast: number;
  trend: "up" | "down" | "stable";
}

const FactoryForecast: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);
  const { products, fetchProducts } = useProductStore();
  const [forecastSummaries, setForecastSummaries] = useState<
    ProductForecastSummary[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const forecastFetchedRef = useRef(false);

  useEffect(() => {
    if (!authUser) return;
    fetchProducts({ supplier_id: authUser.id, limit: 8 } as any, {
      replace: true,
    });
  }, [authUser, fetchProducts]);

  useEffect(() => {
    if (!products.length) {
      setLoading(false);
      return;
    }
    if (forecastFetchedRef.current) return;

    const loadForecasts = async () => {
      forecastFetchedRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const firstProducts = products.slice(0, 6);
        const forecasts = await Promise.all(
          firstProducts.map(async (product) => {
            try {
              const result = await forecastService.getInventoryForecast(
                product.id,
                7,
              );
              const totalForecast = result.forecast.reduce(
                (sum, point) => sum + point.forecast_quantity,
                0,
              );
              const trend =
                totalForecast > (product.stock_quantity || 0)
                  ? "up"
                  : totalForecast < (product.stock_quantity || 0)
                    ? "down"
                    : "stable";
              return {
                productId: product.id,
                productName: product.name,
                stockQuantity: product.stock_quantity || 0,
                dailyForecast: result.forecast,
                totalForecast,
                trend,
              };
            } catch (error) {
              console.error(
                "Forecast load failed for product",
                product.id,
                error,
              );
              return {
                productId: product.id,
                productName: product.name,
                stockQuantity: product.stock_quantity || 0,
                dailyForecast: [],
                totalForecast: 0,
                trend: "stable" as const,
              };
            }
          }),
        );

        setForecastSummaries(forecasts);
      } catch (error: any) {
        setError(error.message || "Unable to load forecasts");
      } finally {
        setLoading(false);
      }
    };

    loadForecasts();
  }, [products]);

  const summaryItems = useMemo(() => forecastSummaries, [forecastSummaries]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Inventory Forecast</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Demand prediction for your factory products for this week (next 7 days).
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/factory/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Forecast status</CardTitle>
            <CardDescription>Model source and data freshness.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-muted p-4">
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {loading
                    ? "Loading forecast data…"
                    : error
                      ? "Partial results"
                      : "Forecast ready"}
                </p>
              </div>
              <div className="rounded-lg border border-muted p-4">
                <p className="text-sm font-medium">Items forecasted</p>
                <p className="text-2xl font-semibold mt-1">
                  {loading ? "-" : forecastSummaries.length}
                </p>
              </div>
              <div className="rounded-lg border border-muted p-4">
                <p className="text-sm font-medium">Forecast window</p>
                <p className="text-sm text-muted-foreground mt-1">7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Forecast summary</CardTitle>
            <CardDescription>
              Review predicted demand against available stock.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <ScrollArea className="h-[420px] pr-3">
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-muted p-4"
                      >
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-20 mb-3" />
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    ))
                  : summaryItems.map((item) => (
                      <Card
                        key={item.productId}
                        className="rounded-2xl border border-muted p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              {item.productName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Stock: {item.stockQuantity} units
                            </p>
                          </div>
                          <Badge
                            className={
                              item.trend === "up"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.trend === "down"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                            }
                          >
                            {item.trend}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Total forecast:</span>
                          <span className="text-base font-semibold text-foreground">
                            {item.totalForecast.toFixed(0)}
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {item.dailyForecast.map((point) => (
                            <div
                              key={point.date}
                              className="flex items-center justify-between text-xs"
                            >
                              <span>{formatDate(point.date)}</span>
                              <span>
                                {point.forecast_quantity.toFixed(0)} units
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/factory/dashboard">Back to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default FactoryForecast;
