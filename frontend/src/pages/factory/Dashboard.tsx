import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Factory,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  DollarSign,
  BarChart3,
  Calendar,
  Eye,
  Shield,
  AlertTriangle,
  Activity,
  Target,
  Star,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  StatsCard,
  SectionHeader,
  StatusBadge,
  WelcomeHeader,
} from "@/components/shared";
import { formatPrice, formatCompactPrice, formatDate } from "@/lib/formatters";
import { getInitials } from "@/lib/utils";

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

// ============================================================================
// MOCK DATA
// ============================================================================

const mockStats: FactoryStats = {
  totalOrders: 342,
  pendingApprovals: 12,
  activeProduction: 8,
  monthlyRevenue: 12450000,
  revenueGrowth: 15.8,
  inventoryAlerts: 5,
  productionCapacity: 78,
  qualityRate: 97.5,
  activeDistributors: 45,
  newPartnershipRequests: 3,
};

const recentOrders: ProductionOrder[] = [
  {
    id: "PO-2026-0124",
    productName: "Portland Cement",
    productId: 1001,
    quantity: 500,
    unit: "bags",
    distributorId: 102,
    distributorName: "Adama Wholesalers",
    orderDate: "2026-02-12T09:30:00",
    requestedDelivery: "2026-02-20",
    scheduledDate: "2026-02-18",
    status: "pending",
    priority: "high",
    value: 260000,
  },
  {
    id: "PO-2026-0122",
    productName: "Steel Rebars 12mm",
    productId: 1002,
    quantity: 20,
    unit: "tons",
    distributorId: 105,
    distributorName: "Mekelle Steel Distributors",
    orderDate: "2026-02-11T14:15:00",
    requestedDelivery: "2026-02-25",
    scheduledDate: "2026-02-23",
    status: "approved",
    priority: "medium",
    value: 150000,
  },
  {
    id: "PO-2026-0120",
    productName: "Yirgacheffe Coffee",
    productId: 1004,
    quantity: 200,
    unit: "kg",
    distributorId: 101,
    distributorName: "Ethiopia Coffee Export",
    orderDate: "2026-02-10T11:45:00",
    requestedDelivery: "2026-02-22",
    scheduledDate: "2026-02-21",
    status: "processing",
    priority: "medium",
    value: 76000,
  },
  {
    id: "PO-2026-0118",
    productName: "White Teff Flour",
    productId: 1005,
    quantity: 1000,
    unit: "kg",
    distributorId: 102,
    distributorName: "Adama Wholesalers",
    orderDate: "2026-02-09T10:30:00",
    requestedDelivery: "2026-02-19",
    scheduledDate: "2026-02-18",
    status: "shipped",
    priority: "low",
    value: 95000,
  },
];

const demandForecasts: ProductForecast[] = [
  {
    id: 1001,
    name: "Portland Cement",
    category: "Construction",
    forecastedDemand: 3200,
    currentStock: 2800,
    reorderPoint: 2000,
    confidence: 92,
    trend: "up",
    seasonality: "High",
  },
  {
    id: 1002,
    name: "Steel Rebars 12mm",
    category: "Construction",
    forecastedDemand: 180,
    currentStock: 120,
    reorderPoint: 100,
    confidence: 88,
    trend: "up",
    seasonality: "Medium",
  },
  {
    id: 1004,
    name: "Yirgacheffe Coffee",
    category: "Beverages",
    forecastedDemand: 450,
    currentStock: 350,
    reorderPoint: 200,
    confidence: 95,
    trend: "stable",
    seasonality: "Low",
  },
  {
    id: 1005,
    name: "White Teff Flour",
    category: "Grains",
    forecastedDemand: 2500,
    currentStock: 1800,
    reorderPoint: 1500,
    confidence: 90,
    trend: "up",
    seasonality: "Medium",
  },
];

const inventoryAlerts: InventoryAlert[] = [
  {
    id: 1,
    productName: "Steel Rebars 12mm",
    sku: "STL-010",
    currentStock: 120,
    minStock: 150,
    status: "low",
    category: "Construction",
  },
  {
    id: 2,
    productName: "Cement Packaging Bags",
    sku: "PKG-001",
    currentStock: 5000,
    minStock: 10000,
    status: "critical",
    category: "Packaging",
  },
  {
    id: 3,
    productName: "Coffee Beans - Green",
    sku: "COF-004",
    currentStock: 350,
    minStock: 500,
    status: "low",
    category: "Raw Materials",
  },
  {
    id: 4,
    productName: "Lubricant Oil",
    sku: "LUB-001",
    currentStock: 45,
    minStock: 100,
    status: "critical",
    category: "Maintenance",
  },
];

const topDistributors: Distributor[] = [
  {
    id: 102,
    name: "Adama Wholesalers",
    location: "Adama",
    orders: 45,
    revenue: 1250000,
    rating: 4.8,
  },
  {
    id: 101,
    name: "Ethiopia Coffee Export",
    location: "Addis Ababa",
    orders: 38,
    revenue: 980000,
    rating: 4.9,
  },
  {
    id: 105,
    name: "Mekelle Steel Distributors",
    location: "Mekelle",
    orders: 32,
    revenue: 2450000,
    rating: 4.7,
  },
  {
    id: 108,
    name: "Dire Dawa Trading",
    location: "Dire Dawa",
    orders: 28,
    revenue: 820000,
    rating: 4.6,
  },
];

const productionSchedule = [
  {
    product: "Portland Cement",
    quantity: 500,
    unit: "bags",
    date: "2026-02-14",
    status: "scheduled",
  },
  {
    product: "Steel Rebars 12mm",
    quantity: 25,
    unit: "tons",
    date: "2026-02-15",
    status: "scheduled",
  },
  {
    product: "Yirgacheffe Coffee",
    quantity: 300,
    unit: "kg",
    date: "2026-02-16",
    status: "planned",
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const statsData = [
  {
    title: "Monthly Revenue",
    value: formatCompactPrice(mockStats.monthlyRevenue),
    change: `+${mockStats.revenueGrowth}%`,
    trend: "up" as const,
    icon: DollarSign,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    title: "Total Orders",
    value: mockStats.totalOrders.toString(),
    subtext: "+24 this month",
    icon: ShoppingCart,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    title: "Pending Approvals",
    value: mockStats.pendingApprovals.toString(),
    subtext: "Awaiting review",
    icon: Clock,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    title: "Active Production",
    value: mockStats.activeProduction.toString(),
    subtext: `${mockStats.productionCapacity}% capacity`,
    icon: Activity,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
  },
  {
    title: "Quality Rate",
    value: `${mockStats.qualityRate}%`,
    subtext: "Above target",
    icon: Target,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
];

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
  // Mock user
  const user = {
    name: "Tadesse Haile",
    business: "Mugher Cement",
    id: "FAC/501/15",
    role: "factory" as const,
    verified: true,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header - Using shared component */}
      <WelcomeHeader user={user} />

      {/* Stats Grid - Using shared StatsCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Production Capacity & Quality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Production Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Current utilization
                    </span>
                    <span className="font-semibold">
                      {mockStats.productionCapacity}%
                    </span>
                  </div>
                  <Progress
                    value={mockStats.productionCapacity}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground pt-2">
                    <span>Target: 85%</span>
                    <span className="text-green-600">+12% vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Defect rate</span>
                    <span className="font-semibold">2.5%</span>
                  </div>
                  <Progress value={97.5} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground pt-2">
                    <span>Industry avg: 3.8%</span>
                    <span className="text-green-600">-1.3% vs avg</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders / Approval Queue */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader
                title="Order Approval Queue"
                description={`${mockStats.pendingApprovals} orders pending your review`}
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

          {/* Production Schedule */}
          <Card>
            <CardHeader className="pb-2">
              <SectionHeader
                title="Production Schedule"
                description="Next 3 days"
                actionLabel="Manage Schedule"
                actionHref="/factory/production"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productionSchedule.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.product}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit} • {formatDate(item.date)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.status === "scheduled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
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
                Predicted demand for next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <ScrollArea className="h-[240px] pr-3">
                <div className="space-y-4">
                  {demandForecasts.map((product) => (
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
                            <span
                              className={`text-xs font-medium ${
                                product.trend === "up"
                                  ? "text-green-600"
                                  : product.trend === "down"
                                    ? "text-red-600"
                                    : "text-amber-600"
                              }`}
                            >
                              {product.trend === "up"
                                ? "+12%"
                                : product.trend === "down"
                                  ? "-5%"
                                  : "0%"}
                            </span>
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
                            width: `${(product.currentStock / product.forecastedDemand) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
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

          {/* Inventory Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Inventory Alerts</CardTitle>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-red-200"
                >
                  {mockStats.inventoryAlerts} alerts
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

          {/* Top Distributors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Distributors</CardTitle>
              <CardDescription>By order volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDistributors.map((distributor) => (
                  <div
                    key={distributor.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(distributor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          to={`/factory/distributors/${distributor.id}`}
                          className="text-xs font-medium hover:text-primary"
                        >
                          {distributor.name}
                        </Link>
                        <p className="text-[10px] text-muted-foreground">
                          {distributor.location} • {distributor.orders} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">
                        {formatCompactPrice(distributor.revenue)}
                      </p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] text-muted-foreground">
                          {distributor.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="ghost" className="w-full text-xs" asChild>
                <Link to="/factory/partners">
                  View All Partners
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
              <Button className="w-full justify-start" size="sm" asChild>
                <Link to="/factory/production/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Production Batch
                </Link>
              </Button>
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
              >
                <Link to="/factory/inventory/update">
                  <Package className="mr-2 h-4 w-4" />
                  Update Inventory
                </Link>
              </Button>
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

          {/* Partnership Requests */}
          {mockStats.newPartnershipRequests > 0 && (
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      {mockStats.newPartnershipRequests} New Partnership
                      Requests
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Distributors waiting to connect with your factory
                    </p>
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0 mt-2 text-xs text-blue-800"
                      asChild
                    >
                      <Link to="/factory/partners/requests">
                        Review requests
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FactoryDashboard;
