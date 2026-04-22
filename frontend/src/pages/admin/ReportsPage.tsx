import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  ShoppingCart,
  Package,
  Factory,
  Store,
  Truck,
  Activity,
  Clock,
  AlertCircle,
  UserCheck,
  UserX,
  Shield,
  DollarSign,
  BadgeCheck,
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
import { Progress } from "@/components/ui/progress";

import { StatsCard, EmptyState, StatusBadge } from "@/components";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatters";
import { useUserStore } from "@/stores/user.store";
import { useOrderStore } from "@/stores/order.store";
import { useDisputeStore } from "@/stores/dispute.store";
import { useProductStore } from "@/stores/product.store";
import documentService from "@/services/document.service";

type TimeRange = "7d" | "30d" | "90d" | "1y";
type UserRole = "retailer" | "distributor" | "factory" | "driver" | "admin";

interface VerificationRoleMetric {
  role: string;
  pending: number;
  verified: number;
  rejected: number;
  icon: React.ElementType;
}

const timeRanges = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "1y", label: "This Year" },
] as const;

const roleIcons: Record<UserRole, React.ElementType> = {
  retailer: Store,
  distributor: Package,
  factory: Factory,
  driver: Truck,
  admin: Shield,
};

const roleLabels: Record<UserRole, string> = {
  retailer: "Retailers",
  distributor: "Distributors",
  factory: "Factories",
  driver: "Drivers",
  admin: "Admins",
};

const roleTone: Record<UserRole, string> = {
  retailer: "bg-blue-100 text-blue-700",
  distributor: "bg-purple-100 text-purple-700",
  factory: "bg-green-100 text-green-700",
  driver: "bg-amber-100 text-amber-700",
  admin: "bg-slate-100 text-slate-700",
};

export const ReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [documents, setDocuments] = useState<any[]>([]);

  const {
    users,
    total: totalUsers,
    fetchUsers,
  } = useUserStore();
  const { stats: orderStats, fetchOrderStats } = useOrderStore();
  const { items: disputeItems, fetchAll: fetchDisputes } = useDisputeStore();
  const {
    products,
    fetchProducts,
  } = useProductStore();

  useEffect(() => {
    fetchUsers({}, { page: 1, limit: 500 });
    fetchOrderStats();
    fetchDisputes({ limit: 200 });
    fetchProducts({ limit: 500 }, { replace: true });
  }, [fetchUsers, fetchOrderStats, fetchDisputes, fetchProducts]);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await documentService.getAllForAdmin();
        const data = response?.data || response || [];
        setDocuments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load analytics documents:", error);
        setDocuments([]);
      }
    };

    loadDocuments();
  }, []);

  const activeUsers = users.filter((user) => user.status === "active").length;
  const suspendedUsers = users.filter((user) => user.status === "suspended").length;
  const pendingUsers = users.filter((user) => user.status === "pending").length;
  const activeDisputes = disputeItems.filter(
    (item: any) => item.status !== "resolved",
  ).length;
  const activeProducts = products.filter((product) => product.is_available).length;
  const lowStockProducts = products.filter(
    (product) => product.stock_quantity <= product.min_order_amount,
  ).length;

  const userRoleMetrics = useMemo(() => {
    const roles: UserRole[] = [
      "retailer",
      "distributor",
      "factory",
      "driver",
      "admin",
    ];

    return roles.map((role) => {
      const matching = users.filter((user) => user.role === role);
      return {
        role,
        total: matching.length,
        active: matching.filter((user) => user.status === "active").length,
        pending: matching.filter((user) => user.status === "pending").length,
        suspended: matching.filter((user) => user.status === "suspended").length,
        icon: roleIcons[role],
      };
    });
  }, [users]);

  const verificationMetrics = useMemo<VerificationRoleMetric[]>(() => {
    const grouped = new Map<string, any[]>();

    documents.forEach((doc) => {
      const role = doc.user?.role;
      if (!role || role === "retailer" || role === "admin") return;
      if (!grouped.has(role)) grouped.set(role, []);
      grouped.get(role)!.push(doc);
    });

    return (["factory", "distributor", "driver"] as const).map((role) => {
      const docs = grouped.get(role) || [];
      return {
        role: roleLabels[role],
        pending: docs.filter((doc) => doc.verification_status === "pending").length,
        verified: docs.filter((doc) => doc.verification_status === "verified").length,
        rejected: docs.filter((doc) => doc.verification_status === "rejected").length,
        icon: roleIcons[role],
      };
    });
  }, [documents]);

  const categoryMetrics = useMemo(() => {
    const grouped = new Map<string, number>();
    products.forEach((product) => {
      grouped.set(product.category, (grouped.get(product.category) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [products]);

  const topSuppliers = useMemo(() => {
    const grouped = new Map<string, { name: string; count: number }>();
    products.forEach((product) => {
      const supplierId = product.supplier?.id || product.supplier_id;
      const supplierName =
        product.supplier?.business_name ||
        product.supplier?.full_name ||
        "Unknown Supplier";

      const current = grouped.get(supplierId);
      if (current) {
        current.count += 1;
      } else {
        grouped.set(supplierId, { name: supplierName, count: 1 });
      }
    });

    return Array.from(grouped.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [products]);

  const overviewStats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: Number(orderStats?.total_orders || 0),
      icon: ShoppingCart,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Active Products",
      value: activeProducts,
      icon: Package,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Active Disputes",
      value: activeDisputes,
      icon: AlertCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Platform Analytics
          </h1>
          <p className="mt-1 text-muted-foreground">
            Live visibility into users, commerce activity, catalog health, and verification load.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
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
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((metric) => (
          <StatsCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            iconBg={metric.iconBg}
            iconColor={metric.iconColor}
          />
        ))}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[520px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="commerce">Commerce</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>Operational snapshot for the selected range</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <UserCheck className="mb-2 h-5 w-5 text-blue-600" />
                  <p className="text-xs text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-blue-700">{activeUsers}</p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4">
                  <Clock className="mb-2 h-5 w-5 text-yellow-600" />
                  <p className="text-xs text-muted-foreground">Pending Users</p>
                  <p className="text-2xl font-bold text-yellow-700">{pendingUsers}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <DollarSign className="mb-2 h-5 w-5 text-green-600" />
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatPrice(Number(orderStats?.total_revenue || 0))}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <UserX className="mb-2 h-5 w-5 text-red-600" />
                  <p className="text-xs text-muted-foreground">Suspended Users</p>
                  <p className="text-2xl font-bold text-red-700">{suspendedUsers}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Catalog Health</CardTitle>
                <CardDescription>Availability and inventory quality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Active Listings</span>
                    <span className="font-medium">
                      {activeProducts} / {products.length}
                    </span>
                  </div>
                  <Progress
                    value={products.length === 0 ? 0 : (activeProducts / products.length) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Low Stock Products</span>
                    <span className="font-medium">{lowStockProducts}</span>
                  </div>
                  <Progress
                    value={products.length === 0 ? 0 : (lowStockProducts / products.length) * 100}
                    className="h-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Suppliers</p>
                    <p className="text-xl font-bold">
                      {Number(orderStats?.total_suppliers || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Orders Today</p>
                    <p className="text-xl font-bold">
                      {Number(orderStats?.orders_today || orderStats?.today_orders || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Product Categories</CardTitle>
                <CardDescription>Most populated catalog segments</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryMetrics.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No product data"
                    description="Product analytics will appear once listings exist."
                  />
                ) : (
                  <div className="space-y-3">
                    {categoryMetrics.map((metric) => (
                      <div key={metric.category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{metric.category}</span>
                          <span className="font-medium">{metric.count}</span>
                        </div>
                        <Progress
                          value={(metric.count / Math.max(...categoryMetrics.map((item) => item.count))) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Suppliers By Listings</CardTitle>
                <CardDescription>Suppliers with the largest product footprint</CardDescription>
              </CardHeader>
              <CardContent>
                {topSuppliers.length === 0 ? (
                  <EmptyState
                    icon={Store}
                    title="No supplier data"
                    description="Supplier listing insights will appear here."
                  />
                ) : (
                  <div className="space-y-3">
                    {topSuppliers.map((supplier) => (
                      <div
                        key={`${supplier.name}-${supplier.count}`}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{supplier.name}</span>
                        </div>
                        <Badge variant="outline">{supplier.count} products</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Composition</CardTitle>
              <CardDescription>Distribution by role and account status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {userRoleMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.role} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("rounded-lg p-2", roleTone[metric.role])}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{roleLabels[metric.role]}</p>
                          <p className="text-sm text-muted-foreground">
                            {metric.total} total accounts
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={metric.role} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 pl-14">
                      <div className="rounded-lg bg-green-50 p-3">
                        <p className="text-xs text-muted-foreground">Active</p>
                        <p className="text-lg font-semibold text-green-700">
                          {metric.active}
                        </p>
                      </div>
                      <div className="rounded-lg bg-yellow-50 p-3">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-lg font-semibold text-yellow-700">
                          {metric.pending}
                        </p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-3">
                        <p className="text-xs text-muted-foreground">Suspended</p>
                        <p className="text-lg font-semibold text-red-700">
                          {metric.suspended}
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={metric.total === 0 ? 0 : (metric.active / metric.total) * 100}
                      className="ml-14 h-2"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commerce" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Performance</CardTitle>
                <CardDescription>Live commerce indicators</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">
                    {Number(orderStats?.total_orders || 0)}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Orders Today</p>
                  <p className="text-2xl font-bold">
                    {Number(orderStats?.orders_today || orderStats?.today_orders || 0)}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(Number(orderStats?.total_revenue || 0))}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Revenue Today</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(
                      Number(orderStats?.revenue_today || orderStats?.today_revenue || 0),
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disputes And Catalog Risk</CardTitle>
                <CardDescription>Operational pressure points to watch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Active Disputes</p>
                      <p className="text-sm text-muted-foreground">
                        Cases not yet resolved
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-700">
                    {activeDisputes}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Low Stock Products</p>
                      <p className="text-sm text-muted-foreground">
                        Listings at or below minimum order threshold
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-amber-700">
                    {lowStockProducts}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Active Products</p>
                      <p className="text-sm text-muted-foreground">
                        Listings currently visible to buyers
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-700">
                    {activeProducts}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Workload</CardTitle>
              <CardDescription>
                Breakdown of document review volume by supplier role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationMetrics.length === 0 ? (
                <EmptyState
                  icon={Shield}
                  title="No verification data"
                  description="Verification analytics will appear after documents are submitted."
                />
              ) : (
                verificationMetrics.map((metric) => {
                  const Icon = metric.icon;
                  const total = metric.pending + metric.verified + metric.rejected;
                  return (
                    <div key={metric.role} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{metric.role}</p>
                            <p className="text-sm text-muted-foreground">
                              {total} total review records
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Total: {total}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-yellow-50 p-3">
                          <p className="text-xs text-muted-foreground">Pending</p>
                          <p className="text-xl font-bold text-yellow-700">
                            {metric.pending}
                          </p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-3">
                          <p className="text-xs text-muted-foreground">Verified</p>
                          <p className="text-xl font-bold text-green-700">
                            {metric.verified}
                          </p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-3">
                          <p className="text-xs text-muted-foreground">Rejected</p>
                          <p className="text-xl font-bold text-red-700">
                            {metric.rejected}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
