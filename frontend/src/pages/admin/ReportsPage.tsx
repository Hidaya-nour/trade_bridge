import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Users,
  ShoppingCart,
  Package,
  Factory,
  Store,
  Truck,
  Activity,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Shield,
  FileText,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import {
  StatsCard,
  SectionHeader,
  EmptyState,
  StatusBadge,
} from "@/components/shared";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface TimeRange {
  value: string;
  label: string;
}

interface PlatformMetric {
  label: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
}

interface UserMetric {
  role: string;
  total: number;
  active: number;
  pending: number;
  suspended: number;
  icon: React.ElementType;
}

interface OrderMetric {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

interface VerificationMetric {
  type: string;
  pending: number;
  approved: number;
  rejected: number;
  icon: React.ElementType;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const timeRanges: TimeRange[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "This Year" },
];

const platformMetrics: PlatformMetric[] = [
  {
    label: "Total Users",
    value: 1250,
    change: 12.3,
    icon: Users,
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Active Users",
    value: 1024,
    change: 8.7,
    icon: UserCheck,
    color: "bg-green-100 text-green-600",
  },
  {
    label: "Pending Verifications",
    value: 24,
    change: -15.2,
    icon: Clock,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    label: "Active Disputes",
    value: 8,
    change: 33.3,
    icon: AlertCircle,
    color: "bg-red-100 text-red-600",
  },
];

const userMetrics: UserMetric[] = [
  {
    role: "Retailers",
    total: 980,
    active: 845,
    pending: 12,
    suspended: 8,
    icon: Store,
  },
  {
    role: "Distributors",
    total: 185,
    active: 162,
    pending: 8,
    suspended: 3,
    icon: Package,
  },
  {
    role: "Factories",
    total: 60,
    active: 52,
    pending: 4,
    suspended: 1,
    icon: Factory,
  },
  {
    role: "Drivers",
    total: 25,
    active: 22,
    pending: 2,
    suspended: 1,
    icon: Truck,
  },
];

const orderMetrics: OrderMetric[] = [
  { status: "Pending", count: 156, percentage: 15, color: "bg-yellow-500" },
  { status: "Processing", count: 234, percentage: 22, color: "bg-blue-500" },
  { status: "Shipped", count: 312, percentage: 30, color: "bg-indigo-500" },
  { status: "Delivered", count: 298, percentage: 28, color: "bg-green-500" },
  { status: "Cancelled", count: 45, percentage: 5, color: "bg-red-500" },
];

const verificationMetrics: VerificationMetric[] = [
  {
    type: "Factories",
    pending: 8,
    approved: 52,
    rejected: 3,
    icon: Factory,
  },
  {
    type: "Distributors",
    pending: 10,
    approved: 162,
    rejected: 5,
    icon: Package,
  },
  {
    type: "Drivers",
    pending: 6,
    approved: 22,
    rejected: 2,
    icon: Truck,
  },
];

const monthlyRegistrations = [
  { month: "Jan", count: 85 },
  { month: "Feb", count: 92 },
  { month: "Mar", count: 105 },
  { month: "Apr", count: 118 },
  { month: "May", count: 124 },
  { month: "Jun", count: 138 },
  { month: "Jul", count: 145 },
  { month: "Aug", count: 152 },
  { month: "Sep", count: 168 },
  { month: "Oct", count: 175 },
  { month: "Nov", count: 182 },
  { month: "Dec", count: 195 },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const ReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate summary stats
  const totalUsers = userMetrics.reduce((sum, u) => sum + u.total, 0);
  const activeUsers = userMetrics.reduce((sum, u) => sum + u.active, 0);
  const pendingVerifications = verificationMetrics.reduce(
    (sum, v) => sum + v.pending,
    0,
  );
  const totalOrders = orderMetrics.reduce((sum, o) => sum + o.count, 0);
  const activeDisputes = 8; // From platformMetrics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Platform Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor platform health, user activity, and verification status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Platform Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformMetrics.map((metric) => (
          <StatsCard
            key={metric.label}
            title={metric.label}
            value={metric.value.toLocaleString()}
            change={`${metric.change > 0 ? "+" : ""}${metric.change}%`}
            trend={metric.change > 0 ? "up" : "down"}
            icon={metric.icon}
            iconBg={metric.color.split(" ")[0]}
            iconColor={metric.color.split(" ")[1]}
          />
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* User Registrations Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Registrations</CardTitle>
              <CardDescription>Monthly new user signups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-end justify-between gap-2">
                {monthlyRegistrations.map((data) => {
                  const maxCount = Math.max(
                    ...monthlyRegistrations.map((d) => d.count),
                  );
                  const height = (data.count / maxCount) * 100;
                  return (
                    <div
                      key={data.month}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full bg-primary/20 rounded-t-lg relative group"
                        style={{ height: `${height}%`, minHeight: "30px" }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                          {data.count} users
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Distribution by Role */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>By role and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                      <div key={metric.role} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {metric.role}
                            </span>
                          </div>
                          <span className="text-sm font-bold">
                            {metric.total}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600 flex items-center">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {metric.active} active
                          </span>
                          <span className="text-yellow-600 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {metric.pending} pending
                          </span>
                          <span className="text-red-600 flex items-center">
                            <UserX className="h-3 w-3 mr-1" />
                            {metric.suspended} suspended
                          </span>
                        </div>
                        <Progress
                          value={(metric.active / metric.total) * 100}
                          className="h-1.5"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Current orders by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderMetrics.map((metric) => (
                    <div key={metric.status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{metric.status}</span>
                        <span className="font-medium">
                          {metric.count} ({metric.percentage}%)
                        </span>
                      </div>
                      <Progress
                        value={metric.percentage}
                        className={cn("h-2", metric.color)}
                      />
                    </div>
                  ))}
                  <div className="pt-2 text-sm text-muted-foreground">
                    Total Orders: {totalOrders}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Health Summary</CardTitle>
              <CardDescription>Key indicators at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-green-600 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Verified Suppliers
                  </p>
                  <p className="text-lg font-bold text-green-600">214</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Pending Verification
                  </p>
                  <p className="text-lg font-bold text-yellow-600">
                    {pendingVerifications}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Activity className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Active Users Today
                  </p>
                  <p className="text-lg font-bold text-blue-600">342</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 mx-auto text-red-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Open Disputes</p>
                  <p className="text-lg font-bold text-red-600">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
              <CardDescription>Detailed breakdown by user type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {userMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.role} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/5">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{metric.role}</h3>
                          <p className="text-sm text-muted-foreground">
                            Total: {metric.total} users
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 ml-12">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Active
                          </p>
                          <p className="text-lg font-semibold text-green-600">
                            {metric.active}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((metric.active / metric.total) * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Pending
                          </p>
                          <p className="text-lg font-semibold text-yellow-600">
                            {metric.pending}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((metric.pending / metric.total) * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Suspended
                          </p>
                          <p className="text-lg font-semibold text-red-600">
                            {metric.suspended}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(
                              (metric.suspended / metric.total) * 100,
                            )}
                            %
                          </p>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Volume</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-3xl font-bold">{totalOrders}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total orders
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      +12.3% vs last month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Status Breakdown</CardTitle>
                <CardDescription>Current orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderMetrics.map((metric) => (
                    <div
                      key={metric.status}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn("w-2 h-2 rounded-full", metric.color)}
                        />
                        <span className="text-sm">{metric.status}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {metric.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Verifications Tab */}
        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>
                Pending and processed verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {verificationMetrics.map((metric) => {
                  const Icon = metric.icon;
                  const total =
                    metric.pending + metric.approved + metric.rejected;
                  return (
                    <div key={metric.type} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">{metric.type}</h3>
                        <Badge variant="outline" className="ml-auto">
                          Total: {total}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            Pending
                          </p>
                          <p className="text-xl font-bold text-yellow-600">
                            {metric.pending}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            Approved
                          </p>
                          <p className="text-xl font-bold text-green-600">
                            {metric.approved}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            Rejected
                          </p>
                          <p className="text-xl font-bold text-red-600">
                            {metric.rejected}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Efficiency</CardTitle>
              <CardDescription>Average processing time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">2.4 days</p>
                  <p className="text-xs text-muted-foreground">
                    Factory verification
                  </p>
                </div>
                <div className="text-center p-4">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">1.8 days</p>
                  <p className="text-xs text-muted-foreground">
                    Distributor verification
                  </p>
                </div>
                <div className="text-center p-4">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">1.2 days</p>
                  <p className="text-xs text-muted-foreground">
                    Driver verification
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
