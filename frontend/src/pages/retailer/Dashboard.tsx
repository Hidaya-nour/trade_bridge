import React, { useState } from "react";
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
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for retailer dashboard
const mockStats = [
  {
    title: "Total Orders",
    value: "156",
    change: "+12%",
    trend: "up",
    icon: Package,
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    title: "Active Orders",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Truck,
    color: "text-green-500",
    bg: "bg-green-100",
  },
  {
    title: "Total Spent",
    value: "ETB 45,200",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    color: "text-purple-500",
    bg: "bg-purple-100",
  },
  {
    title: "Saved Suppliers",
    value: "24",
    change: "+3",
    trend: "up",
    icon: Users,
    color: "text-amber-500",
    bg: "bg-amber-100",
  },
];

// Mock recent orders
const recentOrders = [
  {
    id: "TB-2026-0892",
    date: "2026-02-10",
    supplier: "Ethiopia Coffee Export",
    items: 3,
    total: "ETB 12,500",
    status: "delivered",
    statusColor: "bg-green-100 text-green-700 border-green-200",
    statusIcon: CheckCircle2,
  },
  {
    id: "TB-2026-0885",
    date: "2026-02-09",
    supplier: "Adama Wholesalers",
    items: 5,
    total: "ETB 8,750",
    status: "shipped",
    statusColor: "bg-blue-100 text-blue-700 border-blue-200",
    statusIcon: Truck,
  },
  {
    id: "TB-2026-0878",
    date: "2026-02-08",
    supplier: "Ethiopian Textile",
    items: 2,
    total: "ETB 3,200",
    status: "processing",
    statusColor: "bg-amber-100 text-amber-700 border-amber-200",
    statusIcon: Clock,
  },
  {
    id: "TB-2026-0862",
    date: "2026-02-07",
    supplier: "Bahir Dar Honey",
    items: 1,
    total: "ETB 950",
    status: "pending",
    statusColor: "bg-gray-100 text-gray-700 border-gray-200",
    statusIcon: AlertCircle,
  },
  {
    id: "TB-2026-0851",
    date: "2026-02-06",
    supplier: "Mekelle Steel",
    items: 4,
    total: "ETB 15,800",
    status: "delivered",
    statusColor: "bg-green-100 text-green-700 border-green-200",
    statusIcon: CheckCircle2,
  },
];

// Mock recommended suppliers
const recommendedSuppliers = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    price: "ETB 450",
    unit: "kg",
    orders: 24,
    image: null,
  },
  {
    id: 2,
    name: "White Teff Flour",
    supplier: "Adama Wholesalers",
    price: "ETB 120",
    unit: "kg",
    orders: 18,
    image: null,
  },
  {
    id: 3,
    name: "Cotton Fabric",
    supplier: "Ethiopian Textile",
    price: "ETB 320",
    unit: "meter",
    orders: 15,
    image: null,
  },
  {
    id: 4,
    name: "Pure Honey",
    supplier: "Bahir Dar Honey",
    price: "ETB 280",
    unit: "jar",
    orders: 12,
    image: null,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "delivered":
      return { label: "Delivered", icon: CheckCircle2, class: "bg-green-100 text-green-700 border-green-200" };
    case "shipped":
      return { label: "Shipped", icon: Truck, class: "bg-blue-100 text-blue-700 border-blue-200" };
    case "processing":
      return { label: "Processing", icon: Clock, class: "bg-amber-100 text-amber-700 border-amber-200" };
    case "pending":
      return { label: "Pending", icon: AlertCircle, class: "bg-gray-100 text-gray-700 border-gray-200" };
    case "cancelled":
      return { label: "Cancelled", icon: XCircle, class: "bg-red-100 text-red-700 border-red-200" };
    default:
      return { label: status, icon: AlertCircle, class: "bg-gray-100 text-gray-700 border-gray-200" };
  }
};

const RetailerDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState("week");

  // Mock user from sidebar context or auth
  const user = {
    name: "Hidaya Nurmeika",
    business: "ABC Retail Shop",
    id: "UGR/25677/14",
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name.split(" ")[0]}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            <Store className="h-3.5 w-3.5 mr-1" />
            {user.business}
          </Badge>
        
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.bg} p-3 rounded-full`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
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
          {/* Recent Orders Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest orders and their status</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/retailer/orders" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.slice(0, 4).map((order) => {
                  const status = getStatusBadge(order.status);
                  const StatusIcon = status.icon;
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${status.class.split(" ")[0]}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{order.id}</p>
                            <Badge variant="outline" className={status.class}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.supplier} • {order.items} items • {order.total}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(order.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/retailer/tracking/${order.id}`}>
                          Track
                        </Link>
                      </Button>
                    </div>
                  );
                })}
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Frequently Ordered</CardTitle>
                <CardDescription>Products you buy regularly</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/retailer/products" className="gap-1">
                  Browse All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {frequentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.supplier}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-primary">{product.price}</span>
                          <span className="text-xs text-muted-foreground">/ {product.unit}</span>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your purchase history</CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                ML Powered
              </Badge>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px] pr-3">
                <div className="space-y-4">
                  {recommendedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-start gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {supplier.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium">{supplier.name}</p>
                            {supplier.verified && (
                              <Badge variant="outline" className="h-4 px-1 text-[10px] bg-primary/5">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-[10px] h-5">
                            {supplier.match} match
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {supplier.category} • {supplier.deliveryTime}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium ml-1">{supplier.rating}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({supplier.reviews})
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{supplier.price}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="default" className="h-7 text-xs" asChild>
                            <Link to={`/retailer/suppliers/${supplier.id}`}>
                              View Profile
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                            <Link to={`/retailer/compare?supplier=${supplier.id}`}>
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
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link to="/retailer/products">
                  <Store className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/retailer/cart">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Cart
                  <Badge className="ml-auto">3</Badge>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/retailer/compare">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Compare Suppliers
                </Link>
              </Button>
              
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">Delivered</span>
                </div>
                <span className="text-xs font-medium">45</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-muted-foreground">Shipped</span>
                </div>
                <span className="text-xs font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-muted-foreground">Processing</span>
                </div>
                <span className="text-xs font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
                <span className="text-xs font-medium">5</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Total Orders</span>
                <span className="text-sm font-bold">156</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;