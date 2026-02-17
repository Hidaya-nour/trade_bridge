import React from "react";
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
} from "@/components/shared";
import { formatPrice, formatDate } from "@/lib/formatters";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

// Mock data for retailer dashboard
const mockStats = [
  {
    title: "Total Orders",
    value: "156",
    change: "+12%",
    trend: "up" as const,
    icon: Package,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    title: "Active Orders",
    value: "8",
    change: "+2",
    trend: "up" as const,
    icon: ShoppingBag,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    title: "Total Spent",
    value: "ETB 45,200",
    change: "+18%",
    trend: "up" as const,
    icon: DollarSign,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
];

// Mock recent orders
const recentOrders = [
  {
    id: "TB-2026-0892",
    date: "2026-02-10",
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    items: 3,
    total: 12500,
    status: "delivered" as const,
  },
  {
    id: "TB-2026-0885",
    date: "2026-02-09",
    supplier: "Adama Wholesalers",
    supplierId: 102,
    items: 5,
    total: 8750,
    status: "shipped" as const,
  },
  {
    id: "TB-2026-0878",
    date: "2026-02-08",
    supplier: "Ethiopian Textile",
    supplierId: 103,
    items: 2,
    total: 3200,
    status: "processing" as const,
  },
  {
    id: "TB-2026-0862",
    date: "2026-02-07",
    supplier: "Bahir Dar Honey",
    supplierId: 104,
    items: 1,
    total: 950,
    status: "pending" as const,
  },
];

// Mock recommended suppliers
const recommendedSuppliers = [
  {
    id: 101,
    name: "Ethiopia Coffee Export",
    category: "Beverages",
    rating: 4.9,
    reviews: 128,
    deliveryTime: "2-3 days",
    price: "$$",
    match: "98%",
    avatar: "EC",
    verified: true,
  },
  {
    id: 102,
    name: "Adama Wholesalers",
    category: "Groceries",
    rating: 4.7,
    reviews: 95,
    deliveryTime: "1-2 days",
    price: "$$",
    match: "95%",
    avatar: "AW",
    verified: true,
  },
  {
    id: 103,
    name: "Ethiopian Textile",
    category: "Fabrics",
    rating: 4.5,
    reviews: 67,
    deliveryTime: "3-5 days",
    price: "$$$",
    match: "89%",
    avatar: "ET",
    verified: false,
  },
  {
    id: 104,
    name: "Bahir Dar Honey",
    category: "Food",
    rating: 4.8,
    reviews: 42,
    deliveryTime: "2-4 days",
    price: "$$",
    match: "87%",
    avatar: "BH",
    verified: true,
  },
];

// Mock frequently ordered products
const frequentProducts = [
  {
    id: 1,
    name: "Yirgacheffe Coffee",
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    price: 450,
    unit: "kg",
    orders: 24,
  },
  {
    id: 2,
    name: "White Teff Flour",
    supplier: "Adama Wholesalers",
    supplierId: 102,
    price: 120,
    unit: "kg",
    orders: 18,
  },
  {
    id: 3,
    name: "Cotton Fabric",
    supplier: "Ethiopian Textile",
    supplierId: 103,
    price: 320,
    unit: "meter",
    orders: 15,
  },
  {
    id: 4,
    name: "Pure Honey",
    supplier: "Bahir Dar Honey",
    supplierId: 104,
    price: 280,
    unit: "jar",
    orders: 12,
  },
];

const RetailerDashboard: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);

  if (!authUser) return null; // prevent crash if not loaded

  const user = {
    name: authUser.full_name,
    business: authUser.business_name ?? "No Business Name",
    id: authUser.id,
    role: authUser.role,
    verified: authUser.verified,
  };
  // Order summary data
  const orderSummary = {
    delivered: 45,
    shipped: 12,
    processing: 8,
    pending: 5,
    total: 156,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header - Using shared component */}
      <WelcomeHeader user={user} />

      {/* Stats Grid - Using shared StatsCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
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
                            to={`/retailer/suppliers/${order.supplierId}`}
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
                  <Badge className="ml-auto">3</Badge>
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
