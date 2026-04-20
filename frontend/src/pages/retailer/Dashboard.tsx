import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Truck,
  Star,
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  Store,
  ShoppingBag,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  StatsCard,
  SectionHeader,
  StatusBadge,
  WelcomeHeader,
  OrderSummaryCard,
} from "@/components";
import { ActivePromotionsPanel } from "@/components/shared/ActivePromotionsPanel";
import { formatPrice, formatDate } from "@/lib/formatters";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useOrderStore } from "@/stores/order.store";
import { useSupplierStore } from "@/stores/supplier.store";
import { useProductStore } from "@/stores/product.store";
import orderService from "@/services/order.service";
import broadcastService from "@/services/broadcast.service";
import type { BroadcastRecord } from "@/types/broadcast.types";

const RetailerDashboard: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);
  const { stats: orderStats, fetchOrderStats } = useOrderStore();
  const { getTopSuppliers } = useSupplierStore();
  const { products, fetchProducts } = useProductStore();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recommendedSuppliers, setRecommendedSuppliers] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<BroadcastRecord[]>([]);

  // Fetch stats on component mount
  useEffect(() => {
    fetchOrderStats();
  }, [fetchOrderStats]);

  useEffect(() => {
    fetchProducts({ limit: 8, sortBy: "created_at", sortOrder: "DESC" } as any, {
      replace: true,
    });
  }, [fetchProducts]);

  useEffect(() => {
    const loadTopSuppliers = async () => {
      const suppliers = await getTopSuppliers(6);
      const normalized = (suppliers || []).map((supplier) => ({
        id: supplier.id,
        name: supplier.business_name || supplier.full_name || "Supplier",
        category: supplier.role,
        rating: 4.5,
        reviews: supplier.total_orders || 0,
        deliveryTime: "2-5 days",
        price: "$$",
        match: `${Math.min(99, 80 + (supplier.total_products || 0))}%`,
        avatar: getInitials(supplier.business_name || supplier.full_name || "SP"),
        verified: supplier.is_verified,
      }));
      setRecommendedSuppliers(normalized);
    };

    loadTopSuppliers();
  }, [getTopSuppliers]);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const response = await broadcastService.getActive(["distributor"]);
        setPromotions(response.data || []);
      } catch (error) {
        console.error("Failed to load dashboard promotions:", error);
        setPromotions([]);
      }
    };

    loadPromotions();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders({
          limit: 4, // only recent 4
          sortBy: "created_at",
          sortOrder: "DESC",
        });

        const orders = response?.data?.orders ?? [];
        const normalizedOrders = orders.map((order: any) => {
          const supplierObj =
            order && typeof order.supplier === "object" ? order.supplier : null;
          const supplierName =
            (typeof order.supplier === "string" && order.supplier) ||
            order.supplier_name ||
            supplierObj?.business_name ||
            supplierObj?.full_name ||
            "Unknown Supplier";

          return {
            id: order.id,
            status: order.status || order.order_status || "pending",
            supplierId:
              order.supplierId || order.supplier_id || supplierObj?.id,
            supplier: supplierName,
            items: order.items?.length ?? order.item_count ?? 0,
            total: order.total ?? order.total_price ?? 0,
            date: order.date || order.created_at || new Date().toISOString(),
          };
        });

        setRecentOrders(normalizedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // Calculate stats cards data from real order stats
  const statsCards = [
    {
      title: "Total Orders",
      value: orderStats?.total_orders?.toString() || "0",
      change: orderStats?.order_growth ? `+${orderStats.order_growth}%` : "+0%",
      trend:
        (orderStats?.order_growth || 0) > 0
          ? ("up" as const)
          : ("neutral" as const),
      icon: Package,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      title: "Active Orders",
      value: (
        (orderStats?.processing_count || 0) + (orderStats?.shipped_count || 0)
      ).toString(),
      change: "+2", // You might want to calculate this dynamically
      trend: "up" as const,
      icon: ShoppingBag,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
    },
    {
      title: "Total Spent",
      value: formatPrice(orderStats?.total_spent || 0),
      change: orderStats?.spent_growth ? `+${orderStats.spent_growth}%` : "+0%",
      trend:
        (orderStats?.spent_growth || 0) > 0
          ? ("up" as const)
          : ("neutral" as const),
      icon: DollarSign,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
    },
  ];
  if (!authUser) return null; // prevent crash if not loaded

  const user = {
    name: authUser.full_name,
    business: authUser.business_name ?? "No Business Name",
    id: authUser.id,
    role: authUser.role,
    verified: authUser.verified,
  };

  const frequentProducts = useMemo(() => {
    return products.slice(0, 4).map((product: any) => ({
      id: product.id,
      name: product.name,
      supplier:
        product.supplier?.business_name ||
        product.supplier?.full_name ||
        "Supplier",
      supplierId: product.supplier_id || product.supplier?.id,
      price: Number(product.price || 0),
      unit: product.unit_type || "unit",
      orders: Number(product.order_count || 0),
    }));
  }, [products]);

  // Order summary data
  const orderSummary = useMemo(
    () => ({
      delivered: orderStats?.delivered_count || 0,
      shipped: orderStats?.shipped_count || 0,
      processing: orderStats?.processing_count || 0,
      pending: orderStats?.pending_count || 0,
      total: orderStats?.total_orders || 0,
    }),
    [orderStats],
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header - Using shared component */}
      <WelcomeHeader user={user} />

      {/* Stats Grid - Using shared StatsCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {promotions.length > 0 && (
            <ActivePromotionsPanel
              title="Offers For You"
              description="Current distributor promotions matched to retailer buying activity."
              items={promotions.slice(0, 4)}
              compact
              emptyTitle="No active offers right now"
              emptyDescription="Distributor promotions will appear here when they go live."
            />
          )}
          {/* Recent Orders Card */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader
                title="Recent Orders"
                description="Your latest orders and their status"
                actionLabel="View All"
                actionHref="/retailer/orders"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/retailer/orders/${order.id}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {order.id}
                          </Link>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Link
                            to={`/retailer/supplier/${order.supplierId ?? ""}`}
                            className="hover:text-primary"
                          >
                            {order.supplier}
                          </Link>{" "}
                          • {order.items} items • {formatPrice(order.total)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(order.date)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild={order.status === "shipped"}
                      disabled={order.status !== "shipped"}
                      className={
                        order.status !== "shipped"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    >
                      {order.status === "shipped" ? (
                        <Link to={`/retailer/tracking/${order.id}`}>Track</Link>
                      ) : (
                        <span>Track</span>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/retailer/orders">
                  <Package className="h-4 w-4 mr-2" />
                  Manage All Orders
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Frequently Ordered Products */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader
                title="Frequently Ordered"
                description="Products you buy regularly"
                actionLabel="Browse All"
                actionHref="/retailer/products"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frequentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <Link
                          to={`/retailer/suppliers/${product.supplierId}`}
                          className="text-xs text-muted-foreground hover:text-primary"
                        >
                          {product.supplier}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            / {product.unit}
                          </span>
                          <Badge variant="outline" className="text-[10px] h-5">
                            {product.orders} orders
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/retailer/cart?add=${product.id}`}>
                        <ShoppingCart className="h-4 w-4" />
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
          {/* Recommended Suppliers */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Recommended for You
                  </CardTitle>
                  <CardDescription>
                    Based on your purchase history
                  </CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  ML Powered
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px] pr-3">
                <div className="space-y-4">
                  {recommendedSuppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors"
                    >
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {supplier.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Link
                              to={`/retailer/suppliers/${supplier.id}`}
                              className="text-sm font-medium hover:text-primary"
                            >
                              {supplier.name}
                            </Link>
                            {supplier.verified && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1 text-[10px] bg-primary/5"
                              >
                                ✓
                              </Badge>
                            )}
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5"
                          >
                            {supplier.match} match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {supplier.category} • {supplier.deliveryTime}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium ml-1">
                              {supplier.rating}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({supplier.reviews})
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {supplier.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs"
                            asChild
                          >
                            <Link to={`/retailer/suppliers/${supplier.id}`}>
                              View Profile
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            asChild
                          >
                            <Link
                              to={`/retailer/compare?supplier=${supplier.id}`}
                            >
                              Compare
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/retailer/suppliers">
                  View All Suppliers
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
                <Link to="/retailer/products">
                  <Store className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/retailer/cart">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Cart
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to="/retailer/compare">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Compare Suppliers
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Order Summary - Using new shared component */}
          <OrderSummaryCard {...orderSummary} />
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;
