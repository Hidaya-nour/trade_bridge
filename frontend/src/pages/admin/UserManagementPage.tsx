import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  Eye,
  Shield,
  ShieldOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Store,
  Factory,
  Package,
  Truck,
  Edit,
  Trash2,
  Ban,
  CheckCheck,
  RefreshCw,
  ArrowUpDown,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { formatDate } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";
import { EmptyState } from "../../components/shared/EmptyState";
import { reportService } from "@/services/report.service";
// ============================================================================
// TYPES
// ============================================================================

type UserRole = "retailer" | "distributor" | "factory" | "driver" | "admin";
type UserStatus = "active" | "pending" | "suspended" | "inactive";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  business?: string;
  location?: string;
  joinedDate: string;
  lastActive?: string;
  verified: boolean;
  avatar?: string;
  totalOrders?: number;
  totalSpent?: number;
  rating?: number;
  documents?: string[];
}

import { useUserStore } from "@/stores/user.store";

// ============================================================================
// CONSTANTS
// ============================================================================

const roleColors: Record<UserRole, string> = {
  retailer: "bg-blue-100 text-blue-700 border-blue-200",
  distributor: "bg-purple-100 text-purple-700 border-purple-200",
  factory: "bg-green-100 text-green-700 border-green-200",
  driver: "bg-amber-100 text-amber-700 border-amber-200",
  admin: "bg-red-100 text-red-700 border-red-200",
};

const roleIcons: Record<UserRole, React.ElementType> = {
  retailer: Store,
  distributor: Package,
  factory: Factory,
  driver: Truck,
  admin: Shield,
};

const statusColors: Record<UserStatus, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  suspended: "bg-red-100 text-red-700 border-red-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const UserManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "date" | "orders">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [reportCountsByUser, setReportCountsByUser] = useState<
    Record<string, { total: number; open: number; last?: string }>
  >({});
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [reportsDialogLoading, setReportsDialogLoading] = useState(false);
  const [selectedReportUser, setSelectedReportUser] = useState<User | null>(
    null,
  );
  const [selectedUserReports, setSelectedUserReports] = useState<any[]>([]);

  const { users, total, loading, error, fetchUsers, setFilters, clearError } =
    useUserStore();

  const itemsPerPage = 10;

  useEffect(() => {
    const initialSearch = searchParams.get("search");
    if (initialSearch && !searchQuery) {
      setSearchQuery(initialSearch);
    }
  }, [searchParams, searchQuery]);

  // Load users on component mount and when filters change
  useEffect(() => {
    const role = selectedRole === "all" ? undefined : selectedRole;
    const status = selectedStatus === "all" ? undefined : selectedStatus;
    const search = searchQuery.trim() || undefined;

    setFilters({ role, status, search });
    fetchUsers(
      { role, status, search },
      { page: currentPage, limit: itemsPerPage },
    );
  }, [
    selectedRole,
    selectedStatus,
    searchQuery,
    currentPage,
    fetchUsers,
    setFilters,
  ]);

  useEffect(() => {
    const loadReportSummary = async () => {
      try {
        const response = await reportService.getAdminSummary();
        const summary = response?.data?.summary || [];
        const next: Record<string, { total: number; open: number; last?: string }> =
          {};
        summary.forEach((item: any) => {
          if (!item?.reported_user_id) return;
          next[item.reported_user_id] = {
            total: Number(item.total_reports || 0),
            open: Number(item.open_reports || 0),
            last: item.last_reported_at || undefined,
          };
        });
        setReportCountsByUser(next);
      } catch (err) {
        setReportCountsByUser({});
      }
    };

    loadReportSummary();
  }, []);

  const openUserReports = async (user: User) => {
    setSelectedReportUser(user);
    setReportsDialogOpen(true);
    setReportsDialogLoading(true);
    try {
      const response = await reportService.getAdminReportsForUser(user.id, {
        page: 1,
        limit: 50,
      });
      setSelectedUserReports(response?.data?.reports || []);
    } catch (err) {
      setSelectedUserReports([]);
    } finally {
      setReportsDialogLoading(false);
    }
  };

  // Convert store users to component format
  const formattedUsers: User[] = users.map((user) => ({
    id: user.id,
    name: user.full_name || user.business_name || "User",
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status as UserStatus,
    business: user.business_name || user.full_name,
    location: "", // Not available in current API
    joinedDate: user.created_at,
    lastActive: user.last_login || user.created_at,
    verified: user.verified,
    avatar: user.profile_image,
    // These fields are not available in current API
    totalOrders: undefined,
    totalSpent: undefined,
    rating: undefined,
    documents: undefined,
  }));

  // Sort users (client-side sorting for now)
  const sortedUsers = [...formattedUsers].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime()
        : new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
    } else if (sortBy === "orders") {
      const aOrders = a.totalOrders || 0;
      const bOrders = b.totalOrders || 0;
      return sortOrder === "asc" ? aOrders - bOrders : bOrders - aOrders;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers;

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    }
  };

  // Handle select user
  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Handle bulk action
  const handleBulkSuspend = () => {
    console.log("Suspending users:", selectedUsers);
    setShowSuspendDialog(false);
    // In real app, call API
  };

  // Get role icon
  const getRoleIcon = (role: UserRole) => {
    const Icon = roleIcons[role];
    return <Icon className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all platform users: retailers, distributors, factories, and
            drivers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-xl font-bold">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Retailers</p>
              <p className="text-xl font-bold">
                {users.filter((u) => u.role === "retailer").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Distributors</p>
              <p className="text-xl font-bold">
                {users.filter((u) => u.role === "distributor").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Factory className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Factories</p>
              <p className="text-xl font-bold">
                {users.filter((u) => u.role === "factory").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Truck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Drivers</p>
              <p className="text-xl font-bold">
                {users.filter((u) => u.role === "driver").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, business, phone..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="retailer">Retailers</SelectItem>
                <SelectItem value="distributor">Distributors</SelectItem>
                <SelectItem value="factory">Factories</SelectItem>
                <SelectItem value="driver">Drivers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <p className="text-sm text-red-700">{error}</p>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm">
            <span className="font-medium">{selectedUsers.length}</span> users
            selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedUsers([])}
            >
              Clear
            </Button>
            <Button size="sm" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-amber-600"
              onClick={() => setShowSuspendDialog(true)}
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
            <Button size="sm" variant="outline" className="text-green-600">
              <CheckCheck className="h-4 w-4 mr-2" />
              Verify
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      paginatedUsers.length > 0 &&
                      selectedUsers.length === paginatedUsers.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => {
                      setSortBy("name");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    User
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => {
                      setSortBy("date");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                  >
                    Joined
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <EmptyState
                      title="No users found"
                      description="Try adjusting your search or filters"
                      icon={Users}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={cn("text-xs", roleColors[user.role])}
                          >
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            to={`/admin/users/${user.id}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {user.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", roleColors[user.role])}>
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[user.status]}>
                        <span className="capitalize">{user.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{user.business}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {user.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const counts = reportCountsByUser[user.id];
                        if (!counts || counts.total === 0) {
                          return (
                            <span className="text-xs text-muted-foreground">
                              0
                            </span>
                          );
                        }
                        return (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => void openUserReports(user)}
                          >
                            <Badge variant="secondary" className="h-5 px-2">
                              {counts.total}
                            </Badge>
                            {counts.open > 0 && (
                              <Badge className="ml-1 h-5 px-2 bg-red-600">
                                {counts.open} open
                              </Badge>
                            )}
                          </Button>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(user.joinedDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/users/${user.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === "active" ? (
                            <DropdownMenuItem className="text-amber-600">
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          ) : user.status === "suspended" ? (
                            <DropdownMenuItem className="text-green-600">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          ) : null}
                          {!user.verified && (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Verify User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {total === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + paginatedUsers.length, total)} of {total} users
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i;
                }
                if (pageNum <= totalPages) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === pageNum}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      {/* User Reports Dialog */}
      <Dialog open={reportsDialogOpen} onOpenChange={setReportsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Reports{selectedReportUser ? `: ${selectedReportUser.name}` : ""}
            </DialogTitle>
            <DialogDescription>
              Review report history to spot repeated abuse and take action.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            {reportsDialogLoading ? (
              <div className="py-8 text-sm text-muted-foreground">
                Loading reports...
              </div>
            ) : selectedUserReports.length === 0 ? (
              <div className="py-8 text-sm text-muted-foreground">
                No reports found for this user.
              </div>
            ) : (
              <div className="space-y-3 py-1">
                {selectedUserReports.map((report: any) => (
                  <div
                    key={report.id}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {report.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.created_at
                            ? formatDate(report.created_at)
                            : ""}
                          {report.reporter?.full_name
                            ? ` • by ${report.reporter.full_name}`
                            : ""}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {String(report.status || "open")}
                      </Badge>
                    </div>
                    {report.description && (
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {report.description}
                      </p>
                    )}
                    {report.order_id && (
                      <p className="text-xs text-muted-foreground">
                        Order: {report.order_id}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Users</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {selectedUsers.length} selected
              user
              {selectedUsers.length !== 1 ? "s" : ""}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Suspended users will not be able to:
            </p>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Log in to the platform</li>
              <li>Place or receive orders</li>
              <li>Access their dashboard</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuspendDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkSuspend}>
              Suspend Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPage;
