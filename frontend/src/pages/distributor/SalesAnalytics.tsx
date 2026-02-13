import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Store,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  Star,
  Truck,
  Clock,
  Award,
  Target,
  PieChart,
  LineChart,
  FileText,
  Printer,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SalesData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  profit: number;
}

interface TopProduct {
  id: number;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  growth: number;
  margin: number;
}

interface TopCustomer {
  id: number;
  name: string;
  location: string;
  orders: number;
  revenue: number;
  averageOrderValue: number;
  growth: number;
}

interface CategoryPerformance {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
  share: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const monthlySales: SalesData[] = [
  {
    month: "Jan",
    revenue: 420000,
    orders: 45,
    customers: 28,
    averageOrderValue: 9333,
    profit: 63000,
  },
  {
    month: "Feb",
    revenue: 480000,
    orders: 52,
    customers: 32,
    averageOrderValue: 9231,
    profit: 72000,
  },
  {
    month: "Mar",
    revenue: 510000,
    orders: 58,
    customers: 35,
    averageOrderValue: 8793,
    profit: 76500,
  },
  {
    month: "Apr",
    revenue: 540000,
    orders: 62,
    customers: 38,
    averageOrderValue: 8710,
    profit: 81000,
  },
  {
    month: "May",
    revenue: 590000,
    orders: 68,
    customers: 42,
    averageOrderValue: 8676,
    profit: 88500,
  },
  {
    month: "Jun",
    revenue: 620000,
    orders: 72,
    customers: 45,
    averageOrderValue: 8611,
    profit: 93000,
  },
  {
    month: "Jul",
    revenue: 680000,
    orders: 78,
    customers: 48,
    averageOrderValue: 8718,
    profit: 102000,
  },
  {
    month: "Aug",
    revenue: 720000,
    orders: 84,
    customers: 52,
    averageOrderValue: 8571,
    profit: 108000,
  },
  {
    month: "Sep",
    revenue: 780000,
    orders: 91,
    customers: 56,
    averageOrderValue: 8571,
    profit: 117000,
  },
  {
    month: "Oct",
    revenue: 820000,
    orders: 96,
    customers: 60,
    averageOrderValue: 8542,
    profit: 123000,
  },
  {
    month: "Nov",
    revenue: 840000,
    orders: 98,
    customers: 62,
    averageOrderValue: 8571,
    profit: 126000,
  },
  {
    month: "Dec",
    revenue: 845000,
    orders: 99,
    customers: 63,
    averageOrderValue: 8535,
    profit: 126750,
  },
];

const topProducts: TopProduct[] = [
  {
    id: 1,
    name: "White Teff Flour",
    category: "Grains",
    unitsSold: 3450,
    revenue: 414000,
    growth: 12.5,
    margin: 18.5,
  },
  {
    id: 2,
    name: "Cement",
    category: "Construction",
    unitsSold: 1850,
    revenue: 1147000,
    growth: 8.2,
    margin: 15.2,
  },
  {
    id: 3,
    name: "Yirgacheffe Coffee",
    category: "Beverages",
    unitsSold: 1250,
    revenue: 562500,
    growth: 15.8,
    margin: 22.5,
  },
  {
    id: 4,
    name: "Steel Rebars",
    category: "Construction",
    unitsSold: 180,
    revenue: 1530000,
    growth: 5.6,
    margin: 12.8,
  },
  {
    id: 5,
    name: "Soybean Oil",
    category: "Food",
    unitsSold: 5200,
    revenue: 936000,
    growth: 10.2,
    margin: 14.5,
  },
  {
    id: 6,
    name: "Tomato Paste",
    category: "Food",
    unitsSold: 8900,
    revenue: 756500,
    growth: 7.8,
    margin: 11.2,
  },
  {
    id: 7,
    name: "Notebooks",
    category: "Stationery",
    unitsSold: 12500,
    revenue: 562500,
    growth: 18.2,
    margin: 25.5,
  },
  {
    id: 8,
    name: "Plastic Chairs",
    category: "Furniture",
    unitsSold: 850,
    revenue: 382500,
    growth: 4.5,
    margin: 20.8,
  },
];

const topCustomers: TopCustomer[] = [
  {
    id: 201,
    name: "ABC Retail Shop",
    location: "Adama",
    orders: 45,
    revenue: 385000,
    averageOrderValue: 8556,
    growth: 15.2,
  },
  {
    id: 202,
    name: "Mega Mart",
    location: "Addis Ababa",
    orders: 38,
    revenue: 412000,
    averageOrderValue: 10842,
    growth: 12.8,
  },
  {
    id: 203,
    name: "City Supermarket",
    location: "Adama",
    orders: 32,
    revenue: 298000,
    averageOrderValue: 9313,
    growth: 8.5,
  },
  {
    id: 204,
    name: "Addis Mart",
    location: "Addis Ababa",
    orders: 29,
    revenue: 275000,
    averageOrderValue: 9483,
    growth: 10.2,
  },
  {
    id: 205,
    name: "Bole Superstore",
    location: "Addis Ababa",
    orders: 26,
    revenue: 312000,
    averageOrderValue: 12000,
    growth: 18.5,
  },
  {
    id: 206,
    name: "Hawassa Wholesale",
    location: "Hawassa",
    orders: 22,
    revenue: 189000,
    averageOrderValue: 8591,
    growth: 6.5,
  },
];

const categoryPerformance: CategoryPerformance[] = [
  {
    category: "Construction",
    revenue: 2677000,
    orders: 245,
    growth: 7.8,
    share: 32.5,
  },
  { category: "Food", revenue: 1692500, orders: 312, growth: 9.2, share: 20.5 },
  {
    category: "Beverages",
    revenue: 562500,
    orders: 98,
    growth: 15.8,
    share: 6.8,
  },
  { category: "Grains", revenue: 414000, orders: 76, growth: 12.5, share: 5.0 },
  {
    category: "Stationery",
    revenue: 562500,
    orders: 145,
    growth: 18.2,
    share: 6.8,
  },
  {
    category: "Furniture",
    revenue: 382500,
    orders: 52,
    growth: 4.5,
    share: 4.6,
  },
  {
    category: "Textiles",
    revenue: 736000,
    orders: 38,
    growth: 3.2,
    share: 8.9,
  },
  {
    category: "Household",
    revenue: 382500,
    orders: 41,
    growth: 5.5,
    share: 4.6,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const SalesAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState("year");
  const [selectedView, setSelectedView] = useState("revenue");

  // Calculate summary stats
  const currentMonth = monthlySales[monthlySales.length - 1];
  const previousMonth = monthlySales[monthlySales.length - 2];

  const totalRevenue = monthlySales.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = monthlySales.reduce((sum, m) => sum + m.orders, 0);
  const totalCustomers = monthlySales.reduce((sum, m) => sum + m.customers, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  const revenueGrowth =
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) *
    100;
  const ordersGrowth =
    ((currentMonth.orders - previousMonth.orders) / previousMonth.orders) * 100;
  const customersGrowth =
    ((currentMonth.customers - previousMonth.customers) /
      previousMonth.customers) *
    100;

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  const formatCompactPrice = (price: number) => {
    if (price >= 1000000) {
      return `ETB ${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `ETB ${(price / 1000).toFixed(0)}K`;
    }
    return `ETB ${price}`;
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const handleExport = (
    format: "pdf" | "excel" | "csv",
    reportType: string,
  ) => {
    console.log(`Exporting ${reportType} report as ${format}`);
    // Implementation would connect to export service
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Sales Analytics
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <BarChart3 className="h-3 w-3 mr-1" />
              Real-time
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Comprehensive sales performance, trends, and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Export Report</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleExport("pdf", "sales-summary")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Sales Summary (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("excel", "sales-detailed")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Detailed Sales (Excel)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv", "products")}>
                <FileText className="h-4 w-4 mr-2" />
                Product Performance (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("csv", "customers")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Customer Analysis (CSV)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatPrice(totalRevenue)}
                </h3>
                <div className="flex items-center mt-2">
                  {revenueGrowth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      revenueGrowth > 0 ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {formatPercentage(revenueGrowth)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  {totalOrders.toLocaleString()}
                </h3>
                <div className="flex items-center mt-2">
                  {ordersGrowth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      ordersGrowth > 0 ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {formatPercentage(ordersGrowth)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Customers
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  {totalCustomers.toLocaleString()}
                </h3>
                <div className="flex items-center mt-2">
                  {customersGrowth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      customersGrowth > 0 ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {formatPercentage(customersGrowth)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg. Order Value
                </p>
                <h3 className="text-2xl font-bold mt-2">
                  {formatPrice(avgOrderValue)}
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-green-600">
                    +5.2%
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue and order trends for{" "}
              {dateRange === "year" ? "2026" : "selected period"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedView} onValueChange={setSelectedView}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end justify-between gap-2">
            {monthlySales.map((month, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="relative w-full px-1">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all duration-300 hover:opacity-90",
                      selectedView === "revenue" &&
                        "bg-gradient-to-t from-primary to-primary/70",
                      selectedView === "orders" &&
                        "bg-gradient-to-t from-blue-500 to-blue-400",
                      selectedView === "customers" &&
                        "bg-gradient-to-t from-purple-500 to-purple-400",
                    )}
                    style={{
                      height:
                        selectedView === "revenue"
                          ? `${(month.revenue / 900000) * 250}px`
                          : selectedView === "orders"
                            ? `${(month.orders / 100) * 250}px`
                            : `${(month.customers / 70) * 250}px`,
                      minHeight: "30px",
                    }}
                  >
                    {selectedView === "revenue" && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded px-2 py-1">
                        {formatCompactPrice(month.revenue)}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-3 font-medium">
                  {month.month}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {selectedView === "revenue" &&
                    formatCompactPrice(month.revenue)}
                  {selectedView === "orders" && `${month.orders} orders`}
                  {selectedView === "customers" && `${month.customers} cust`}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-xs text-muted-foreground">Orders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <span className="text-xs text-muted-foreground">Customers</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Performance & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Performance - Pie Chart Representation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Revenue distribution across product categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformance.slice(0, 6).map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                            "#ec4899",
                          ][index % 6],
                        }}
                      />
                      <span className="text-sm font-medium">
                        {category.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatCompactPrice(category.revenue)}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {category.share}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={category.share} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{category.orders} orders</span>
                    <span
                      className={
                        category.growth > 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {category.growth > 0 ? "+" : ""}
                      {category.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs">
              View All Categories
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Best performing products by revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-semibold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {product.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {product.unitsSold.toLocaleString()} units
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCompactPrice(product.revenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {product.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-medium",
                          product.growth > 0
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {product.growth > 0 ? "+" : ""}
                        {product.growth}%
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Margin: {product.margin}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs" asChild>
              <Link to="/distributor/analytics/products">
                View All Products
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers & Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Customers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Highest revenue generating retailers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    <TableCell className="font-medium">
                      <Link
                        to={`/distributor/retailers/${customer.id}`}
                        className="hover:text-primary"
                      >
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.location}</TableCell>
                    <TableCell className="text-right">
                      {customer.orders}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCompactPrice(customer.revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          customer.growth > 0
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {customer.growth > 0 ? "+" : ""}
                        {customer.growth}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="ghost" className="w-full mt-4 text-xs" asChild>
              <Link to="/distributor/analytics/customers">
                View All Customers
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="text-lg font-bold">
                  {formatPrice(currentMonth.revenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Orders</span>
                <span className="text-lg font-bold">{currentMonth.orders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Customers</span>
                <span className="text-lg font-bold">
                  {currentMonth.customers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Avg. Order Value
                </span>
                <span className="text-lg font-bold">
                  {formatPrice(currentMonth.averageOrderValue)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Profit Margin</span>
                <span className="text-lg font-bold text-green-600">
                  {((currentMonth.profit / currentMonth.revenue) * 100).toFixed(
                    1,
                  )}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Estimated Profit
                </span>
                <span className="text-base font-semibold">
                  {formatPrice(currentMonth.profit)}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4">
              <h4 className="text-xs font-semibold mb-3 flex items-center">
                <Award className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Achievements
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">
                    Revenue target:{" "}
                    <span className="font-medium text-foreground">92%</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">
                    Customer retention:{" "}
                    <span className="font-medium text-foreground">94%</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    On-time delivery:{" "}
                    <span className="font-medium text-foreground">98%</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options Bar */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Export Sales Reports</h4>
                <p className="text-xs text-muted-foreground">
                  Download detailed analytics in your preferred format
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("pdf", "sales-summary")}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("excel", "sales-detailed")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Excel Report
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv", "complete")}
              >
                <FileText className="h-4 w-4 mr-2" />
                CSV Data
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Mail className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalyticsPage;
