import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  Store,
  Factory,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Shield,
  BarChart3,
  Download,
  ChevronRight,
  Activity,
  UserPlus,
  Package,
  CreditCard,
  FileText,
  ShieldAlert,
  Truck,
  Star,
  MapPin,
  Calendar,
  Filter,
  MoreHorizontal,
  Search,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  StatsCard,
  SectionHeader,
  StatusBadge,
  WelcomeHeader,
  EmptyState,
  PaginationBar,
} from "@/components";
import { formatPrice, formatCompactPrice, formatDate } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";
import documentService from "@/services/document.service";
import { useAuthStore } from "@/stores/auth.store";
import { useOrderStore } from "@/stores/order.store";
import { useDisputeStore } from "@/stores/dispute.store";
import { useUserStore } from "@/stores/user.store";

// ============================================================================
// TYPES
// ============================================================================

interface PlatformStats {
  totalUsers: number;
  totalOrders: number;
  pendingApprovals: number;
  activeDisputes: number;
  platformGrowth: number;
  userGrowth: number;
  orderGrowth: number;
  totalSuppliers: number;
}

interface RecentUser {
  id: string | number;
  name: string;
  email: string;
  role: "retailer" | "distributor" | "factory" | "driver" | "supplier";
  business: string;
  status: "active" | "pending" | "suspended";
  joinedDate: string;
  avatar?: string;
  verified: boolean;
}

interface PendingApprovalDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  status: string;
  rejectionReason?: string;
}

interface PendingApproval {
  id: string;
  type: "supplier" | "distributor" | "factory" | "driver";
  name: string;
  business: string;
  email: string;
  phone: string;
  submittedDate: string;
  documents: PendingApprovalDocument[];
  priority: "high" | "medium" | "low";
  status: "pending" | "approved";
}

interface Dispute {
  id: string;
  orderId: string;
  raisedBy: string;
  raisedByRole: "retailer" | "distributor" | "factory";
  against: string;
  againstRole: "retailer" | "distributor" | "factory";
  reason: string;
  status: "open" | "investigating" | "resolved" | "escalated";
  amount: number;
  date: string;
  priority: "high" | "medium" | "low";
}

const mapDocType = (docType?: string): string => {
  switch (docType) {
    case "business_license":
      return "license";
    case "tax_certificate":
      return "tin";
    case "id_card":
      return "id";
    default:
      return "other";
  }
};

const buildPendingApprovals = (docs: any[]): PendingApproval[] => {
  const grouped = new Map<string, any[]>();

  docs.forEach((doc) => {
    const user = doc.user;
    if (!user?.id) return;
    if (!grouped.has(user.id)) grouped.set(user.id, []);
    grouped.get(user.id)!.push(doc);
  });

  return Array.from(grouped.entries()).flatMap(([userId, userDocs]) => {
    const sortedDocs = [...userDocs].sort((a, b) => {
      const aDate = new Date(a.uploaded_at || a.created_at || 0).getTime();
      const bDate = new Date(b.uploaded_at || b.created_at || 0).getTime();
      return bDate - aDate;
    });

    const user = sortedDocs[0]?.user;
    if (!user) return [];

    const verified = Boolean(user.verified) || Boolean(user.approved_at);
    if (verified) return [];

    return [
      {
        id: userId,
        type:
          user.role === "driver"
            ? "driver"
            : user.role === "factory"
              ? "factory"
              : user.role === "distributor"
                ? "distributor"
                : "supplier",
        name: user.full_name || user.business_name || "Supplier",
        business: user.business_name || user.full_name || "Business",
        email: user.email || "N/A",
        phone: user.phone || "N/A",
        submittedDate:
          sortedDocs[0]?.uploaded_at ||
          sortedDocs[0]?.created_at ||
          new Date().toISOString(),
        documents: sortedDocs.map((doc) => ({
          id: doc.id,
          name: doc.original_file_name || doc.document_type || "document",
          url: doc.file_secure_url || "#",
          type: mapDocType(doc.document_type),
          status: doc.verification_status || "pending",
          rejectionReason: doc.rejection_reason || undefined,
        })),
        priority: "medium",
        status: "pending",
      },
    ];
  });
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingApprovalsData, setPendingApprovalsData] = useState<
    PendingApproval[]
  >([]);
  const [disputesData, setDisputesData] = useState<Dispute[]>([]);
  const [recentUsersData, setRecentUsersData] = useState<RecentUser[]>([]);

  const authUser = useAuthStore((state) => state.user);
  const { stats: orderStats, fetchOrderStats } = useOrderStore();
  const { fetchAll: fetchDisputes, items: disputeItems } = useDisputeStore();
  const { fetchRecentUsers } = useUserStore();

  useEffect(() => {
    fetchOrderStats();
    fetchDisputes({ limit: 20 });
  }, [fetchOrderStats, fetchDisputes]);

  useEffect(() => {
    const loadApprovals = async () => {
      try {
        const response = await documentService.getAllForAdmin();
        const data = response.data || response;
        const approvals = buildPendingApprovals(data || []);
        setPendingApprovalsData(approvals);
      } catch (error) {
        console.error("Failed to load pending approvals:", error);
        setPendingApprovalsData([]);
      }
    };

    loadApprovals();
  }, []);

  useEffect(() => {
    const loadRecentUsers = async () => {
      try {
        const users = await fetchRecentUsers(10);
        const formattedUsers: RecentUser[] = users.map((user: any) => ({
          id: user.id,
          name: user.full_name || user.business_name || "User",
          email: user.email,
          role: user.role,
          business: user.business_name || user.full_name || "",
          status: user.status,
          joinedDate: user.created_at,
          avatar: user.profile_image,
          verified: user.verified || false,
        }));
        setRecentUsersData(formattedUsers);
      } catch (error) {
        console.error("Failed to load recent users:", error);
        setRecentUsersData([]);
      }
    };

    loadRecentUsers();
  }, [fetchRecentUsers]);

  useEffect(() => {
    const normalizedDisputes = (disputeItems || [])
      .slice(0, 10)
      .map((dispute: any) => ({
        id: String(dispute.id),
        orderId: String(dispute.order_id || dispute.orderId || "N/A"),
        raisedBy:
          dispute.raised_by?.business_name ||
          dispute.raised_by?.full_name ||
          dispute.raisedBy ||
          "User",
        raisedByRole: (dispute.raised_by?.role || "retailer") as
          | "retailer"
          | "distributor"
          | "factory",
        against:
          dispute.against?.business_name ||
          dispute.against?.full_name ||
          dispute.againstName ||
          "User",
        againstRole: (dispute.against?.role || "distributor") as
          | "retailer"
          | "distributor"
          | "factory",
        reason: dispute.reason || "No reason provided",
        status: (dispute.status || "open") as
          | "open"
          | "investigating"
          | "resolved"
          | "escalated",
        amount: Number(dispute.amount || dispute.order_total || 0),
        date: dispute.created_at || new Date().toISOString(),
        priority: (dispute.priority || "medium") as "high" | "medium" | "low",
      }));
    setDisputesData(normalizedDisputes);
  }, [disputeItems]);


  const user = {
    name: authUser?.full_name || '',
    business: authUser?.business_name ?? "No Business Name",
    id: authUser?.id || '',
    role: authUser?.role || '',
    verified: authUser?.verified || false,
  };

  const livePlatformStats = useMemo<PlatformStats>(
    () => ({
      totalUsers: Number(orderStats?.active_users || 0),
      totalOrders: Number(orderStats?.total_orders || 0),
      pendingApprovals: pendingApprovalsData.length,
      activeDisputes: disputesData.filter(
        (dispute) => dispute.status !== "resolved",
      ).length,
      platformGrowth: Number(orderStats?.platform_growth || 0),
      userGrowth: Number(orderStats?.user_growth || 0),
      orderGrowth: Number(orderStats?.order_growth || 0),
      totalSuppliers: Number(orderStats?.total_suppliers || 0),
    }),
    [orderStats, pendingApprovalsData.length, disputesData],
  );

  const platformHealth = useMemo(() => {
    const totalOrders = livePlatformStats.totalOrders || 0;
    const totalRevenue =
      Number(orderStats?.total_revenue || 0) ||
      Number(orderStats?.total_spent || 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      activeUsers: livePlatformStats.totalUsers,
      ordersToday: Number(
        orderStats?.orders_today || orderStats?.today_orders || 0,
      ),
      revenueToday: Number(
        orderStats?.revenue_today || orderStats?.today_revenue || 0,
      ),
      avgOrderValue,
    };
  }, [livePlatformStats.totalOrders, livePlatformStats.totalUsers, orderStats]);

  // Calculate stats for cards
  const statsData = [
    {
      title: "Total Users",
      value: livePlatformStats.totalUsers.toLocaleString(),
      change: `+${livePlatformStats.userGrowth}%`,
      trend: "up" as const,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: livePlatformStats.totalOrders.toLocaleString(),
      change: `+${livePlatformStats.orderGrowth}%`,
      trend: "up" as const,
      icon: ShoppingCart,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },

    {
      title: "Pending Approvals",
      value: livePlatformStats.pendingApprovals,
      change: `${pendingApprovalsData.length} awaiting review`,
      trend:
        pendingApprovalsData.length > 0
          ? ("up" as const)
          : ("neutral" as const),
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Suppliers",
      value: livePlatformStats.totalSuppliers,
      change: `${livePlatformStats.activeDisputes} active disputes`,
      trend: "up" as const,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  if (!authUser) return null; // prevent crash if not loaded

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader user={user} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">
            Pending Approvals
            {livePlatformStats.pendingApprovals > 0 && (
              <Badge variant="secondary" className="ml-2">
                {livePlatformStats.pendingApprovals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="disputes">
            Active Disputes
            {livePlatformStats.activeDisputes > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-red-100 text-red-800"
              >
                {livePlatformStats.activeDisputes}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <SectionHeader
                  title="Recent Users"
                  description="Latest registrations on the platform"
                  actionLabel="View All"
                  actionHref="/admin/users"
                />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsersData.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback
                            className={cn(
                              "text-xs font-medium",
                              user.role === "retailer"
                                ? "bg-blue-100 text-blue-700"
                                : user.role === "distributor"
                                  ? "bg-purple-100 text-purple-700"
                                  : user.role === "factory"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700",
                            )}
                          >
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/admin/users/${user.id}`}
                              className="text-sm font-medium hover:text-primary"
                            >
                              {user.name}
                            </Link>
                            <StatusBadge status={user.role} />
                            <StatusBadge status={user.status} />
                            {user.verified && (
                              <Badge
                                variant="outline"
                                className="h-5 px-1 bg-green-50 text-green-700 text-[10px]"
                              >
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {user.business} • {user.email} • Joined{" "}
                            {formatDate(user.joinedDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Platform Health</CardTitle>
                <CardDescription>Key metrics overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">User Growth</span>
                    <span className="font-medium text-green-600">
                      +{livePlatformStats.userGrowth}%
                    </span>
                  </div>
                  <Progress
                    value={livePlatformStats.userGrowth * 5}
                    className="h-1.5"
                  />

                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-muted-foreground">Order Growth</span>
                    <span className="font-medium text-green-600">
                      +{livePlatformStats.orderGrowth}%
                    </span>
                  </div>
                  <Progress
                    value={livePlatformStats.orderGrowth * 4}
                    className="h-1.5"
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Active Users
                    </span>
                    <span className="text-sm font-medium">
                      {platformHealth.activeUsers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Orders Today
                    </span>
                    <span className="text-sm font-medium">
                      {platformHealth.ordersToday.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== APPROVALS TAB ===== */}
        <TabsContent value="approvals" className="space-y-4">
          {pendingApprovalsData.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No pending approvals"
              description="All supplier and driver applications have been reviewed"
            />
          ) : (
            <div className="space-y-4">
              {pendingApprovalsData.map((approval) => (
                <Card key={approval.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            approval.type === "factory"
                              ? "bg-green-100"
                              : approval.type === "distributor"
                                ? "bg-purple-100"
                                : approval.type === "driver"
                                  ? "bg-amber-100"
                                  : "bg-blue-100",
                          )}
                        >
                          {approval.type === "factory" && (
                            <Factory className="h-5 w-5 text-green-600" />
                          )}
                          {approval.type === "distributor" && (
                            <Package className="h-5 w-5 text-purple-600" />
                          )}
                          {approval.type === "driver" && (
                            <Truck className="h-5 w-5 text-amber-600" />
                          )}
                          {approval.type === "supplier" && (
                            <Store className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold">
                              {approval.name}
                            </h3>
                            <StatusBadge status={approval.type} />
                            <Badge
                              className={cn(
                                "text-xs",
                                approval.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : approval.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800",
                              )}
                            >
                              {approval.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {approval.business} • {approval.email} •{" "}
                            {approval.phone}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {formatDate(approval.submittedDate)} •
                            Documents: {approval.documents.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />x Review Docs
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== DISPUTES TAB ===== */}
        <TabsContent value="disputes" className="space-y-4">
          {disputesData.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="No active disputes"
              description="All disputes have been resolved"
            />
          ) : (
            <div className="space-y-4">
              {disputesData.map((dispute) => (
                <Card key={dispute.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">
                            Dispute #{dispute.id}
                          </h3>
                          <StatusBadge status={dispute.status} />
                          <Badge
                            className={cn(
                              "text-xs",
                              dispute.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : dispute.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800",
                            )}
                          >
                            {dispute.priority} priority
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Raised By
                            </p>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-[10px]">
                                  {getInitials(dispute.raisedBy)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {dispute.raisedBy}
                                </p>
                                <StatusBadge status={dispute.raisedByRole} />
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">
                              Against
                            </p>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-purple-100 text-purple-700 text-[10px]">
                                  {getInitials(dispute.against)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {dispute.against}
                                </p>
                                <StatusBadge status={dispute.againstRole} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm font-medium">Reason</p>
                          <p className="text-sm text-muted-foreground">
                            {dispute.reason}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className="text-muted-foreground">
                            Order: {dispute.orderId}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            Amount: {formatPrice(dispute.amount)}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            Filed: {formatDate(dispute.date)}
                          </span>
                        </div>
                      </div>

                      
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
