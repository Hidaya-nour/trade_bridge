import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Truck,
  Store,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  CheckCheck,
  XCircle,
  TrendingUp,
  BarChart3,
  Download,
  Filter,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import deliveryService from "@/services/delivery.service";
import type { Order } from "@/types/order.types";

const LOW_STOCK_THRESHOLD = 30;

type DashboardIncomingOrder = {
  id: string;
  retailer: string;
  retailerId?: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "approved" | "shipped" | "delivered";
  date: string;
  priority: "high" | "medium" | "low";
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <StatusBadge status="high" />;
    case "medium":
      return <StatusBadge status="medium" />;
    case "low":
      return <StatusBadge status="low" />;
    default:
      return null;
  }
};

const getStockStatus = (stock: number, minStock: number) => {
  const ratio = stock / minStock;
  if (ratio < 0.3)
    return {
      label: "Critical",
      color: "bg-red-100 text-red-800",
      progress: 30,
    };
  if (ratio < 0.6)
    return { label: "Low", color: "bg-amber-100 text-amber-800", progress: 60 };
  return {
    label: "Adequate",
    color: "bg-green-100 text-green-800",
    progress: 100,
  };
};

const DistributorDashboard: React.FC = () => {
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const authUser = useAuthStore((state) => state.user);
  const { orders, fetchOrdersAsSupplier } = useOrderStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchOrdersAsSupplier({ sortBy: "created_at", sortOrder: "DESC", limit: 20 });
    fetchProducts({ sortBy: "created_at", sortOrder: "DESC", limit: 30 } as any, {
      replace: true,
    });
  }, [fetchOrdersAsSupplier, fetchProducts]);

  useEffect(() => {
    const loadShipments = async () => {
      try {
        const response = await deliveryService.getAll({ limit: 10 });
        const rows = response?.data?.deliveries || response?.data || response || [];
        const normalized = Array.isArray(rows) ? rows : [];
        setRecentShipments(normalized);
      } catch {
        setRecentShipments([]);
      }
    };

    loadShipments();
  }, []);

  if (!authUser) return null; // prevent crash if not loaded

  const user = {
    name: authUser.full_name,
    business: authUser.business_name ?? "No Business Name",
    id: authUser.id,
    role: authUser.role,
    verified: authUser.verified,
  };

  const incomingOrders = useMemo<DashboardIncomingOrder[]>(() => {
    return (orders as Order[])
      .slice(0, 4)
      .map((order) => {
        const buyer = order.buyer?.business_name || order.buyer?.full_name || "Retailer";
        const totalItems = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        const amount = Number(order.total_price) || 0;
        const status = order.order_status as DashboardIncomingOrder["status"];
        return {
          id: order.id,
          retailer: buyer,
          retailerId: order.buyer?.id,
          items: totalItems,
          total: amount,
          status,
          date: order.created_at,
          priority: amount >= 100000 ? "high" : amount >= 30000 ? "medium" : "low",
        };
      });
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((product: any) => Number(product.stock_quantity || 0) <= LOW_STOCK_THRESHOLD)
      .sort(
        (a: any, b: any) => Number(a.stock_quantity || 0) - Number(b.stock_quantity || 0),
      )
      .slice(0, 10)
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        sku: product.sku || String(product.id),
        stock: Number(product.stock_quantity || 0),
        minStock: LOW_STOCK_THRESHOLD,
        supplier:
          product.supplier?.business_name ||
          product.supplier?.full_name ||
          authUser.business_name ||
          "Current supplier",
      }));
  }, [products, authUser.business_name]);

  const stats = useMemo(
    () => [
      {
        title: "Total Orders",
        value: orders.length.toString(),
        change: `${orders.filter((o: Order) => o.order_status === "approved").length} approved`,
        trend: "up" as const,
        icon: ShoppingCart,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
      },
      {
        title: "Pending Orders",
        value: orders.filter((o: Order) => o.order_status === "pending").length.toString(),
        change: `${orders.filter((o: Order) => o.order_status === "processing").length} processing`,
        trend: "neutral" as const,
        icon: Clock,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-100",
      },
      {
        title: "Low Stock Items",
        value: lowStockProducts.length.toString(),
        change: `${products.length} total products`,
        trend: lowStockProducts.length > 0 ? ("up" as const) : ("neutral" as const),
        icon: AlertCircle,
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },
    ],
    [orders, lowStockProducts.length, products.length],
  );

  const shipmentRows = useMemo(() => {
    return recentShipments.slice(0, 4).map((shipment: any) => {
      const shipmentStatus = String(shipment.status || "pending");
      return {
        id: shipment.id || shipment.delivery_number || shipment.order_id,
        orderId: shipment.order_id || shipment.orderId || "N/A",
        retailer:
          shipment?.order?.buyer?.business_name ||
          shipment?.order?.buyer?.full_name ||
          shipment.dropoff_location ||
          "Retailer",
        driver:
          shipment?.driver?.full_name ||
          shipment?.driver?.driverUser?.full_name ||
          "Unassigned",
        status:
          shipmentStatus === "in_transit"
            ? "in-transit"
            : shipmentStatus === "picked_up"
              ? "in-transit"
              : shipmentStatus,
        date: shipment.updated_at || shipment.created_at || new Date().toISOString(),
      };
    });
  }, [recentShipments]);

  const todaySchedule = useMemo(() => {
    const today = new Date().toDateString();
    const deliveriesToday = shipmentRows.filter(
      (shipment) => new Date(shipment.date).toDateString() === today,
    );
    const pendingPickupCount = incomingOrders.filter(
      (order) => order.status === "pending" || order.status === "approved",
    ).length;

    return {
      scheduled: deliveriesToday.length,
      remaining: deliveriesToday.filter((delivery) => delivery.status !== "delivered").length,
      pendingPickups: pendingPickupCount,
    };
  }, [shipmentRows, incomingOrders]);

  return (
    <div className="space-y-6">
      {/* Welcome Header - Using shared component */}
      <WelcomeHeader user={user} />

      {/* Stats Grid - Using shared StatsCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incoming Orders */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader
                title="Incoming Orders"
                description={`${incomingOrders.filter((o) => o.status === "pending").length} orders pending approval`}
                actionLabel="View All"
                actionHref="/distributor/orders"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incomingOrders.slice(0, 4).map((order) => (
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
                        <ShoppingCart
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
                            to={`/distributor/orders/${order.id}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {order.id}
                          </Link>
                          {getPriorityBadge(order.priority)}
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Link
                            to={`/distributor/retailers/${order.retailerId}`}
                            className="hover:text-primary"
                          >
                            {order.retailer}
                          </Link>{" "}
                          • {order.items} items • {formatPrice(order.total)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(order.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/distributor/orders/${order.id}`}>
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/distributor/approve">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Approve Pending Orders
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Recent Shipments */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader
                title="Recent Shipments"
                description="Track your ongoing deliveries"
                actionLabel="Manage Deliveries"
                actionHref="/distributor/delivery"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipmentRows.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          shipment.status === "delivered"
                            ? "bg-green-100"
                            : shipment.status === "in-transit"
                              ? "bg-blue-100"
                              : "bg-amber-100"
                        }`}
                      >
                        <Truck
                          className={`h-4 w-4 ${
                            shipment.status === "delivered"
                              ? "text-green-600"
                              : shipment.status === "in-transit"
                                ? "text-blue-600"
                                : "text-amber-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{shipment.id}</p>
                          <StatusBadge status={shipment.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Order {shipment.orderId} • {shipment.retailer}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Driver: {shipment.driver}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/distributor/tracking/${shipment.orderId}`}>
                        Track
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1 col */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Low Stock Alert</CardTitle>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-red-200"
                >
                  {lowStockProducts.length} items
                </Badge>
              </div>
              <CardDescription>
                Products below minimum stock level
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <ScrollArea className="h-[280px] pr-3">
                <div className="space-y-4">
                  {lowStockProducts.map((product) => {
                    const stockStatus = getStockStatus(
                      product.stock,
                      product.minStock,
                    );
                    return (
                      <div key={product.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku} • {product.supplier}
                            </p>
                          </div>
                          <Badge className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Stock</span>
                            <span className="font-medium">
                              {product.stock} / {product.minStock} min
                            </span>
                          </div>
                          <Progress
                            value={stockStatus.progress}
                            className="h-1.5"
                          />
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs flex-1"
                            asChild
                          >
                            <Link to={`/distributor/inventory/${product.id}`}>
                              Restock
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                          >
                            <Filter className="h-3 w-3" />
                          </Button>
                        </div>
                        <Separator className="mt-2" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/distributor/inventory">
                  Manage Inventory
                  <ChevronRight className="h-4 w-4 ml-1" />
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
              <Button className="w-full justify-start" asChild>
                <Link to="/distributor/products/add">
                  <Package className="mr-2 h-4 w-4" />
                  Add New Product
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/distributor/promotions">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Broadcast Promotion
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/distributor/reports">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/distributor/partners">
                  <Store className="mr-2 h-4 w-4" />
                  Manage Suppliers
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/distributor/delivery">
                  <Truck className="mr-2 h-4 w-4" />
                  Assign Driver
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Deliveries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">
                      {todaySchedule.scheduled} deliveries scheduled
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {todaySchedule.remaining} remaining
                    </p>
                  </div>
                  <Badge>Today</Badge>
                </div>
                <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                  <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">
                      {todaySchedule.pendingPickups} pending pickups
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Awaiting driver assignment
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;
