import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  BarChart3,
  Calendar,
  Eye,
  AlertTriangle,
  Activity,
  Target,
  Minus,
  Plus,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  StatsCard,
  SectionHeader,
  StatusBadge,
  WelcomeHeader,
} from "@/components";
import { formatPrice, formatCompactPrice, formatDate } from "@/lib/formatters";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useOrderStore } from "@/stores/order.store";
import { useProductStore } from "@/stores/product.store";
import forecastService from "@/services/forecast.service";
import type { Order } from "@/types/order.types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FactoryStats {
  totalOrders: number;
  pendingApprovals: number;
  activeProduction: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  inventoryAlerts: number;
  productionCapacity: number;
  qualityRate: number;
  activeDistributors: number;
  newPartnershipRequests: number;
}

interface ProductionOrder {
  id: string;
  productName: string;
  productId: number;
  quantity: number;
  unit: string;
  distributorId: number;
  distributorName: string;
  orderDate: string;
  requestedDelivery: string;
  scheduledDate?: string;
  status:
    | "pending"
    | "approved"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  priority: "high" | "medium" | "low";
  value: number;
}

interface ProductForecast {
  id: number;
  name: string;
  category: string;
  forecastedDemand: number;
  currentStock: number;
  reorderPoint: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  seasonality: string;
}

interface InventoryAlert {
  id: number;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  status: "critical" | "low" | "reorder";
  category: string;
}

interface Distributor {
  id: number;
  name: string;
  location: string;
  orders: number;
  revenue: number;
  rating: number;
  avatar?: string;
}

const INVENTORY_ALERT_THRESHOLD = 40;

const getDemandTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    case "down":
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    default:
      return <Minus className="h-3 w-3 text-amber-600" />;
  }
};

const FactoryDashboard: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);
  const { orders, fetchOrdersAsSupplier } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const [productForecasts, setProductForecasts] = useState<
    Record<
      string,
      {
        totalForecast: number;
        trend: "up" | "down" | "stable";
      }
    >
  >({});
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const forecastFetchedRef = useRef(false);

  useEffect(() => {
    if (!authUser?.id) return;
    fetchOrdersAsSupplier({
      sortBy: "created_at",
      sortOrder: "DESC",
      limit: 20,
    });
    fetchProducts(
      { supplier_id: authUser?.id || '', sortBy: "created_at", sortOrder: "DESC", limit: 30 } as any,
      {
        replace: true,
      },
    );
  }, [fetchOrdersAsSupplier, fetchProducts, authUser?.id]);

  useEffect(() => {
    const loadForecasts = async () => {
      if (!products.length || forecastFetchedRef.current) return;

      forecastFetchedRef.current = true;
      setForecastLoading(true);
      setForecastError(null);

      try {
        const forecastEntries = await Promise.all(
          products.slice(0, 6).map(async (product: any) => {
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
                totalForecast > Number(product.stock_quantity || 0)
                  ? "up"
                  : totalForecast < Number(product.stock_quantity || 0)
                    ? "down"
                    : "stable";

              return [product.id, { totalForecast, trend }] as const;
            } catch (fetchError) {
              console.error(
                "Forecast load failed for product",
                product.id,
                fetchError,
              );
              return null;
            }
          }),
        );

        const validEntries = forecastEntries.filter((e) => e !== null) as [string, { totalForecast: number; trend: "up" | "down" | "stable" }][];
        setProductForecasts(Object.fromEntries(validEntries));
      } catch (error: any) {
        setForecastError(error.message || "Unable to load forecast");
      } finally {
        setForecastLoading(false);
      }
    };

    loadForecasts();
  }, [products]);


  const user = {
    name: authUser?.full_name || '',
    business: authUser?.business_name ?? "No Business Name",
    id: authUser?.id || '',
    role: authUser?.role || '',
    verified: authUser?.verified || false,
  };

  const recentOrders = useMemo<ProductionOrder[]>(() => {
    return (orders as Order[]).slice(0, 8).map((order) => {
      const firstItem = order.items?.[0];
      const itemQty =
        order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
      const amount = Number(order.total_price) || 0;
      const normalizedStatus: ProductionOrder["status"] =
        order.order_status === "closed" ? "delivered" : order.order_status;

      return {
        id: order.id,
        productName: firstItem?.product?.name || "Order items",
        productId: Number(firstItem?.product_id || 0),
        quantity: itemQty,
        unit: firstItem?.product?.unit_type || "units",
        distributorId: Number(order.buyer_id || 0),
        distributorName:
          order.buyer?.business_name || order.buyer?.full_name || "Distributor",
        orderDate: order.created_at,
        requestedDelivery: order.delivery?.completed_at || order.created_at,
        status: normalizedStatus,
        priority:
          amount >= 100000 ? "high" : amount >= 30000 ? "medium" : "low",
        value: amount,
      };
    });
  }, [orders]);

  const inventoryAlerts = useMemo<InventoryAlert[]>(() => {
    return products
      .filter(
        (product: any) =>
          Number(product.stock_quantity || 0) <= INVENTORY_ALERT_THRESHOLD,
      )
      .sort(
        (a: any, b: any) =>
          Number(a.stock_quantity || 0) - Number(b.stock_quantity || 0),
      )
      .slice(0, 8)
      .map((product: any) => ({
        id: Number(product.id),
        productName: product.name,
        sku: product.sku || String(product.id),
        currentStock: Number(product.stock_quantity || 0),
        minStock: INVENTORY_ALERT_THRESHOLD,
        status:
          Number(product.stock_quantity || 0) <= INVENTORY_ALERT_THRESHOLD / 2
            ? "critical"
            : "low",
        category: product.category || "General",
      }));
  }, [products]);

  const demandForecasts = useMemo<ProductForecast[]>(() => {
    if (forecastLoading || Object.keys(productForecasts).length === 0) return [];

    return products.slice(0, 6)
      .filter((product: any) => productForecasts[product.id] != null)
      .map((product: any) => {
        const stock = Number(product.stock_quantity || 0);
        const forecastData = productForecasts[product.id];
        const forecastedDemand = forecastData.totalForecast;
        const trend = forecastData.trend;

        return {
          id: Number(product.id),
          name: product.name,
          category: product.category || "General",
          forecastedDemand,
          currentStock: stock,
          reorderPoint: Math.max(10, Math.floor(stock * 0.6) || 10),
          confidence: Math.min(98, Math.max(65, 80 + Math.floor(stock / 20))),
          trend,
          seasonality: "This Week",
        };
      });
  }, [products, productForecasts, forecastLoading]);

  const productionSchedule = useMemo(() => {
    return recentOrders.slice(0, 3).map((order) => ({
      product: order.productName,
      quantity: order.quantity,
      unit: order.unit,
      date: order.requestedDelivery,
      status: order.status === "approved" ? "scheduled" : "planned",
    }));
  }, [recentOrders]);

  const factoryStats = useMemo<FactoryStats>(() => {
    const pendingApprovals = recentOrders.filter(
      (order) => order.status === "pending",
    ).length;
    const processingOrders = recentOrders.filter(
      (order) => order.status === "approved" || order.status === "processing",
    ).length;
    const monthlyRevenue = recentOrders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.value, 0);

    return {
      totalOrders: orders.length,
      pendingApprovals,
      activeProduction: processingOrders,
      monthlyRevenue,
      revenueGrowth: 0,
      inventoryAlerts: inventoryAlerts.length,
      productionCapacity: Math.min(100, processingOrders * 10),
      qualityRate: 95,
      activeDistributors: new Set(orders.map((order: Order) => order.buyer_id))
        .size,
      newPartnershipRequests: 0,
    };
  }, [recentOrders, orders, inventoryAlerts.length]);

  const statsData = [
    {
      title: "Total Orders",
      value: factoryStats.totalOrders.toString(),
      subtext: `${factoryStats.activeDistributors} active distributors`,
      icon: ShoppingCart,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Pending Approvals",
      value: factoryStats.pendingApprovals.toString(),
      subtext: "Awaiting review",
      icon: Clock,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
    },

    {
      title: "Inventory Alerts",
      value: factoryStats.inventoryAlerts.toString(),
      subtext: "Low stock items",
      icon: AlertTriangle,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-100",
    },
  ];

  if (!authUser) return null; // prevent crash if not loaded

  return (
    <div className="space-y-6">
      {/* Welcome Header - Using shared component */}
      <WelcomeHeader user={user} />

      {/* Stats Grid - Using shared StatsCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders / Approval Queue */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader
                title="Order Approval Queue"
                description={`${factoryStats.pendingApprovals} orders pending your review`}
                actionLabel="View All"
                actionHref="/factory/orders"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders
                  .filter(
                    (o) => o.status === "pending" || o.status === "approved",
                  )
                  .slice(0, 3)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            order.priority === "high"
                              ? "bg-red-100"
                              : order.priority === "medium"
                                ? "bg-amber-100"
                                : "bg-green-100"
                          }`}
                        >
                          <Package
                            className={`h-4 w-4 ${
                              order.priority === "high"
                                ? "text-red-600"
                                : order.priority === "medium"
                                  ? "text-amber-600"
                                  : "text-green-600"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/factory/orders/${order.id}`}
                              className="text-sm font-medium hover:text-primary"
                            >
                              {order.id}
                            </Link>
                            <StatusBadge status={order.priority} />
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.productName} • {order.quantity} {order.unit}{" "}
                            • {formatCompactPrice(order.value)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Link
                              to={`/factory/distributors/${order.distributorId}`}
                              className="hover:text-primary"
                            >
                              {order.distributorName}
                            </Link>{" "}
                            • Requested: {formatDate(order.requestedDelivery)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}
                        {order.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Schedule
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/factory/approve">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Process Pending Orders
                </Link>
              </Button>
            </CardFooter>
          </Card>
          {/* Inventory Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Inventory Alerts</CardTitle>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-red-200"
                >
                  {factoryStats.inventoryAlerts} alerts
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-3">
                  {inventoryAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-2 hover:bg-accent/50 rounded-lg"
                    >
                      <div
                        className={`p-1.5 rounded-full ${
                          alert.status === "critical"
                            ? "bg-red-100"
                            : alert.status === "low"
                              ? "bg-amber-100"
                              : "bg-blue-100"
                        }`}
                      >
                        <AlertTriangle
                          className={`h-3 w-3 ${
                            alert.status === "critical"
                              ? "text-red-600"
                              : alert.status === "low"
                                ? "text-amber-600"
                                : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">
                            {alert.productName}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              alert.status === "critical"
                                ? "bg-red-100 text-red-800"
                                : alert.status === "low"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                            }
                          >
                            {alert.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          SKU: {alert.sku} • Stock: {alert.currentStock} /{" "}
                          {alert.minStock} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="ghost" className="w-full text-xs" asChild>
                <Link to="/factory/inventory">
                  Manage Inventory
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column - 1 col */}
        <div className="space-y-6">
          {/* Demand Forecast */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Demand Forecast</CardTitle>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  ML Powered
                </Badge>
              </div>
              <CardDescription>
                Predicted demand for this week (next 7 days)
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <ScrollArea className="h-[240px] pr-3">
                <div className="space-y-4">
                  {forecastLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-xs text-muted-foreground">Loading ML forecast…</p>
                    </div>
                  ) : forecastError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 text-center">
                      {forecastError}
                    </div>
                  ) : demandForecasts.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                      No forecast data available for your products.
                    </div>
                  ) : (
                    demandForecasts.map((product) => (
                      <div key={product.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Stock: {product.currentStock} units • Min:{" "}
                              {product.reorderPoint}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold">
                                {product.forecastedDemand}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                units
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {getDemandTrendIcon(product.trend)}
                              <span className="text-xs text-muted-foreground ml-1">
                                {product.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-primary rounded-full"
                            style={{
                              width: `${Math.min(100, product.forecastedDemand > 0 ? (product.currentStock / product.forecastedDemand) * 100 : 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="ghost" className="w-full text-xs" asChild>
                <Link to="/factory/forecast">
                  View Full Forecast
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                asChild
              >
                <Link to="/factory/approve">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Process Orders
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                asChild
              ></Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                asChild
              >
                <Link to="/factory/announcements">
                  <Users className="mr-2 h-4 w-4" />
                  Broadcast Announcement
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                asChild
              >
                <Link to="/factory/reports">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FactoryDashboard;
