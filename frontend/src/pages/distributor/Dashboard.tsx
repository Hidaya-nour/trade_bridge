import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  Store,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  BarChart3,
  Download,
  Filter,
  Eye,
  CheckCheck,
  XCircle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Mock distributor stats
const stats = [
  {
    title: "Total Orders",
    value: "156",
    change: "+12",
    trend: "up",
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Pending Orders",
    value: "24",
    change: "-5",
    trend: "down",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    title: "Low Stock Items",
    value: "12",
    change: "+3",
    trend: "up",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  {
    title: "Active Suppliers",
    value: "18",
    change: "+2",
    trend: "up",
    icon: Store,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

// Mock incoming orders
const incomingOrders = [
  {
    id: "ORD-2026-0245",
    retailer: "ABC Retail Shop",
    retailerId: 201,
    items: 5,
    total: "ETB 12,500",
    status: "pending",
    date: "2026-02-12T09:30:00",
    priority: "high",
  },
  {
    id: "ORD-2026-0244",
    retailer: "Mega Mart",
    retailerId: 202,
    items: 12,
    total: "ETB 45,800",
    status: "pending",
    date: "2026-02-12T08:15:00",
    priority: "high",
  },
  {
    id: "ORD-2026-0243",
    retailer: "City Supermarket",
    retailerId: 203,
    items: 3,
    total: "ETB 8,900",
    status: "processing",
    date: "2026-02-11T15:45:00",
    priority: "medium",
  },
  {
    id: "ORD-2026-0242",
    retailer: "Addis Mart",
    retailerId: 204,
    items: 8,
    total: "ETB 23,400",
    status: "approved",
    date: "2026-02-11T11:20:00",
    priority: "low",
  },
  {
    id: "ORD-2026-0241",
    retailer: "Bole Superstore",
    retailerId: 205,
    items: 15,
    total: "ETB 67,200",
    status: "shipped",
    date: "2026-02-10T14:30:00",
    priority: "medium",
  },
];

// Mock low stock products
const lowStockProducts = [
  {
    id: 1,
    name: "White Teff Flour",
    sku: "TFF-001",
    stock: 25,
    minStock: 50,
    supplier: "Ethiopia Agri",
    status: "critical",
  },
  {
    id: 2,
    name: "Soybean Oil",
    sku: "OIL-002",
    stock: 120,
    minStock: 200,
    supplier: "Adama Wholesalers",
    status: "low",
  },
  {
    id: 3,
    name: "Tomato Paste",
    sku: "TOM-003",
    stock: 45,
    minStock: 100,
    supplier: "Ethiopia Agri",
    status: "critical",
  },
  {
    id: 4,
    name: "Yirgacheffe Coffee",
    sku: "COF-004",
    stock: 80,
    minStock: 150,
    supplier: "Ethiopia Coffee Export",
    status: "low",
  },
];

// Mock recent shipments
const recentShipments = [
  {
    id: "SHP-2026-0892",
    orderId: "ORD-2026-0238",
    retailer: "ABC Retail Shop",
    driver: "Tsegaye Mulugeta",
    status: "delivered",
    date: "2026-02-11",
  },
  {
    id: "SHP-2026-0891",
    orderId: "ORD-2026-0235",
    retailer: "City Supermarket",
    driver: "Abebe Kebede",
    status: "in-transit",
    date: "2026-02-11",
  },
  {
    id: "SHP-2026-0890",
    orderId: "ORD-2026-0232",
    retailer: "Mega Mart",
    driver: "Almaz Worku",
    status: "pending",
    date: "2026-02-10",
  },
];

// Mock sales data for chart
const salesData = [
  { month: "Jan", sales: 42000 },
  { month: "Feb", sales: 48000 },
  { month: "Mar", sales: 51000 },
  { month: "Apr", sales: 54000 },
  { month: "May", sales: 59000 },
  { month: "Jun", sales: 62000 },
  { month: "Jul", sales: 68000 },
  { month: "Aug", sales: 72000 },
  { month: "Sep", sales: 78000 },
  { month: "Oct", sales: 82000 },
  { month: "Nov", sales: 84000 },
  { month: "Dec", sales: 84500 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "approved":
      return "bg-green-100 text-green-800 border-green-200";
    case "shipped":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "delivered":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "in-transit":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
      );
    case "medium":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          Medium
        </Badge>
      );
    case "low":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Low
        </Badge>
      );
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
  const [timeRange, setTimeRange] = useState("month");

  // Mock user
  const user = {
    name: "Abebe Kebede",
    business: "Adama Wholesalers",
    id: "DIS/102/21",
    verified: true,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user.name.split(" ")[0]}! 👋
            </h1>
            {user.verified && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified Distributor
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your distribution business today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-lg font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`${stat.bg} p-2 rounded-full`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sales Overview Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Your revenue performance over time
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={timeRange} onValueChange={setTimeRange}>
                  <TabsList className="h-8">
                    <TabsTrigger value="week" className="text-xs">
                      Week
                    </TabsTrigger>
                    <TabsTrigger value="month" className="text-xs">
                      Month
                    </TabsTrigger>
                    <TabsTrigger value="year" className="text-xs">
                      Year
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end justify-between gap-2">
                {salesData.slice(-7).map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className="w-full bg-primary/20 rounded-t-md hover:bg-primary/30 transition-colors"
                      style={{
                        height: `${(data.sales / 90000) * 150}px`,
                        minHeight: "30px",
                      }}
                    />
                    <span className="text-xs text-muted-foreground mt-2">
                      {data.month}
                    </span>
                    <span className="text-xs font-medium">
                      ETB {Math.round(data.sales / 1000)}k
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Incoming Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Incoming Orders</CardTitle>
                <CardDescription>
                  {incomingOrders.filter((o) => o.status === "pending").length}{" "}
                  orders pending approval
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/distributor/orders" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
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
                          <p className="text-sm font-medium">{order.id}</p>
                          {getPriorityBadge(order.priority)}
                          <Badge
                            variant="outline"
                            className={getStatusColor(order.status)}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Link
                            to={`/distributor/retailers/${order.retailerId}`}
                            className="hover:text-primary"
                          >
                            {order.retailer}
                          </Link>{" "}
                          • {order.items} items • {order.total}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(order.date).toLocaleString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            month: "short",
                            day: "numeric",
                          })}
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Shipments</CardTitle>
                <CardDescription>Track your ongoing deliveries</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/distributor/delivery" className="gap-1">
                  Manage Deliveries
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentShipments.map((shipment) => (
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
                          <Badge
                            variant="outline"
                            className={getStatusColor(shipment.status)}
                          >
                            {shipment.status}
                          </Badge>
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

          {/* Performance Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Order Fulfillment
                  </span>
                  <span className="font-medium">94.2%</span>
                </div>
                <Progress value={94.2} className="h-1.5" />

                <div className="flex justify-between text-sm mt-3">
                  <span className="text-muted-foreground">
                    On-Time Delivery
                  </span>
                  <span className="font-medium">97.8%</span>
                </div>
                <Progress value={97.8} className="h-1.5" />

                <div className="flex justify-between text-sm mt-3">
                  <span className="text-muted-foreground">
                    Customer Satisfaction
                  </span>
                  <span className="font-medium">4.8/5.0</span>
                </div>
                <Progress value={96} className="h-1.5" />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Active Drivers
                  </span>
                  <span className="text-sm font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Retailers
                  </span>
                  <span className="text-sm font-medium">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Avg. Order Value
                  </span>
                  <span className="text-sm font-medium">ETB 8,450</span>
                </div>
              </div>
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
                      12 deliveries scheduled
                    </p>
                    <p className="text-xs text-muted-foreground">8 remaining</p>
                  </div>
                  <Badge>Today</Badge>
                </div>
                <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                  <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">3 pending pickups</p>
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
