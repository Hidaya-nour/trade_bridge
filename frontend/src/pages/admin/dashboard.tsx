import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "@/components/shared";
import { formatPrice, formatCompactPrice, formatDate } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

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
  id: number;
  name: string;
  email: string;
  role: "retailer" | "distributor" | "factory" | "driver";
  business: string;
  status: "active" | "pending" | "suspended";
  joinedDate: string;
  avatar?: string;
  verified: boolean;
}

interface PendingApproval {
  id: number;
  type: "supplier" | "distributor" | "factory" | "driver";
  name: string;
  business: string;
  email: string;
  phone: string;
  submittedDate: string;
  documents: string[];
  priority: "high" | "medium" | "low";
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

// ============================================================================
// MOCK DATA
// ============================================================================

const platformStats: PlatformStats = {
  totalUsers: 1250,
  totalOrders: 15680,
  pendingApprovals: 24,
  activeDisputes: 8,
  platformGrowth: 18.5,
  userGrowth: 12.3,
  orderGrowth: 22.7,
  totalSuppliers: 245,
};

const recentUsers: RecentUser[] = [
  {
    id: 1,
    name: "Hidaya Nurmeika",
    email: "hidaya@abcretail.com",
    role: "retailer",
    business: "ABC Retail Shop",
    status: "active",
    joinedDate: "2026-02-10",
    verified: true,
  },
  {
    id: 2,
    name: "Abebe Kebede",
    email: "abebe@adama-wholesalers.com",
    role: "distributor",
    business: "Adama Wholesalers",
    status: "active",
    joinedDate: "2026-02-09",
    verified: true,
  },
  {
    id: 3,
    name: "Tadesse Haile",
    email: "tadesse@mugher.com",
    role: "factory",
    business: "Mugher Cement",
    status: "active",
    joinedDate: "2026-02-08",
    verified: true,
  },
  {
    id: 4,
    name: "Almaz Worku",
    email: "almaz@citymarket.com",
    role: "retailer",
    business: "City Supermarket",
    status: "pending",
    joinedDate: "2026-02-07",
    verified: false,
  },
  {
    id: 5,
    name: "Meron Assefa",
    email: "meron@bolesuper.com",
    role: "retailer",
    business: "Bole Superstore",
    status: "active",
    joinedDate: "2026-02-06",
    verified: true,
  },
  {
    id: 6,
    name: "Dawit Mekonnen",
    email: "dawit@driver.com",
    role: "driver",
    business: "Independent Driver",
    status: "active",
    joinedDate: "2026-02-05",
    verified: true,
  },
];

const pendingApprovals: PendingApproval[] = [
  {
    id: 101,
    type: "factory",
    name: "Bahir Dar Honey",
    business: "Bahir Dar Honey Processing",
    email: "info@bahirdarhoney.com",
    phone: "+251 58 234 5678",
    submittedDate: "2026-02-12",
    documents: ["license.pdf", "tin_certificate.pdf"],
    priority: "high",
  },
  {
    id: 102,
    type: "distributor",
    name: "Hawassa Wholesale",
    business: "Hawassa Wholesale Trading",
    email: "info@hawassawholesale.com",
    phone: "+251 46 123 4567",
    submittedDate: "2026-02-11",
    documents: ["license.pdf", "tax_clearance.pdf"],
    priority: "medium",
  },
  {
    id: 103,
    type: "driver",
    name: "Tsegaye Mulugeta",
    business: "Independent Driver",
    email: "tsegaye.m@driver.com",
    phone: "+251 91 234 5678",
    submittedDate: "2026-02-10",
    documents: ["license.pdf", "vehicle_reg.pdf"],
    priority: "low",
  },
  {
    id: 104,
    type: "factory",
    name: "Adama Plastics",
    business: "Adama Plastics Manufacturing",
    email: "info@adamaplastics.com",
    phone: "+251 22 678 9012",
    submittedDate: "2026-02-09",
    documents: ["license.pdf", "certificate.pdf"],
    priority: "high",
  },
];

const disputes: Dispute[] = [
  {
    id: "DSP-001",
    orderId: "ORD-2026-0245",
    raisedBy: "ABC Retail Shop",
    raisedByRole: "retailer",
    against: "Adama Wholesalers",
    againstRole: "distributor",
    reason: "Damaged goods on delivery",
    status: "open",
    amount: 12500,
    date: "2026-02-12",
    priority: "high",
  },
  {
    id: "DSP-002",
    orderId: "ORD-2026-0238",
    raisedBy: "Mekelle Steel Distributors",
    raisedByRole: "distributor",
    against: "Mekelle Steel",
    againstRole: "factory",
    reason: "Late delivery by 5 days",
    status: "investigating",
    amount: 150000,
    date: "2026-02-10",
    priority: "medium",
  },
  {
    id: "DSP-003",
    orderId: "ORD-2026-0232",
    raisedBy: "Addis Mart",
    raisedByRole: "retailer",
    against: "Adama Wholesalers",
    againstRole: "distributor",
    reason: "Wrong items delivered",
    status: "open",
    amount: 23400,
    date: "2026-02-09",
    priority: "high",
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const userStatusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  suspended: "bg-red-100 text-red-800 border-red-200",
};

const disputeStatusColors = {
  open: "bg-yellow-100 text-yellow-800 border-yellow-200",
  investigating: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  escalated: "bg-red-100 text-red-800 border-red-200",
};

const activityStatusColors = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error: "bg-red-100 text-red-800",
};

// ============================================================================
// COMPONENT
// ============================================================================

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("overview");

  const authUser = useAuthStore((state) => state.user);

  if (!authUser) return null; // prevent crash if not loaded

  const user = {
    name: authUser.full_name,
    business: authUser.business_name ?? "No Business Name",
    id: authUser.id,
    role: authUser.role,
    verified: authUser.verified,
  };

  // Calculate stats for cards
  const statsData = [
    {
      title: "Total Users",
      value: platformStats.totalUsers.toLocaleString(),
      change: `+${platformStats.userGrowth}%`,
      trend: "up" as const,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: platformStats.totalOrders.toLocaleString(),
      change: `+${platformStats.orderGrowth}%`,
      trend: "up" as const,
      icon: ShoppingCart,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },

    {
      title: "Pending Approvals",
      value: platformStats.pendingApprovals,
      change: "+8",
      trend: "up" as const,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Suppliers",
      value: platformStats.totalSuppliers,
      change: "+8",
      trend: "up" as const,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

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
            {platformStats.pendingApprovals > 0 && (
              <Badge variant="secondary" className="ml-2">
                {platformStats.pendingApprovals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="disputes">
            Active Disputes
            {platformStats.activeDisputes > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-red-100 text-red-800"
              >
                {platformStats.activeDisputes}
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
                  {recentUsers.slice(0, 5).map((user) => (
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/users/${user.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Suspend User</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                      +{platformStats.userGrowth}%
                    </span>
                  </div>
                  <Progress
                    value={platformStats.userGrowth * 5}
                    className="h-1.5"
                  />

                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-muted-foreground">Order Growth</span>
                    <span className="font-medium text-green-600">
                      +{platformStats.orderGrowth}%
                    </span>
                  </div>
                  <Progress
                    value={platformStats.orderGrowth * 4}
                    className="h-1.5"
                  />

                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-muted-foreground">
                      Platform Growth
                    </span>
                    <span className="font-medium text-green-600">
                      +{platformStats.platformGrowth}%
                    </span>
                  </div>
                  <Progress
                    value={platformStats.platformGrowth * 5}
                    className="h-1.5"
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Active Users
                    </span>
                    <span className="text-sm font-medium">1,024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Orders Today
                    </span>
                    <span className="text-sm font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Revenue Today
                    </span>
                    <span className="text-sm font-medium">
                      {formatCompactPrice(450000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg. Order Value
                    </span>
                    <span className="text-sm font-medium">
                      {formatPrice(2885)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <Link to="/admin/users">
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Manage Users</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <Link to="/admin/approvals">
                    <Shield className="h-5 w-5" />
                    <span className="text-xs">Review Approvals</span>
                    {platformStats.pendingApprovals > 0 && (
                      <Badge className="ml-auto bg-red-100 text-red-800">
                        {platformStats.pendingApprovals}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <Link to="/admin/products">
                    <Package className="h-5 w-5" />
                    <span className="text-xs">Product Listings</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <Link to="/admin/disputes">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="text-xs">Disputes</span>
                    {platformStats.activeDisputes > 0 && (
                      <Badge className="ml-auto bg-red-100 text-red-800">
                        {platformStats.activeDisputes}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== APPROVALS TAB ===== */}
        <TabsContent value="approvals" className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No pending approvals"
              description="All supplier and driver applications have been reviewed"
            />
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
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
                          <FileText className="h-4 w-4 mr-2" />
                          Review Docs
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
          {disputes.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="No active disputes"
              description="All disputes have been resolved"
            />
          ) : (
            <div className="space-y-4">
              {disputes.map((dispute) => (
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

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Investigate
                        </Button>
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
