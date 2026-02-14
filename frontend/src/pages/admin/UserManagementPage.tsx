import React, { useState } from "react";
import { Link } from "react-router-dom";
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

// ============================================================================
// TYPES
// ============================================================================

type UserRole = "retailer" | "distributor" | "factory" | "driver" | "admin";
type UserStatus = "active" | "pending" | "suspended" | "inactive";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  business: string;
  location: string;
  joinedDate: string;
  lastActive: string;
  verified: boolean;
  avatar?: string;
  totalOrders?: number;
  totalSpent?: number;
  rating?: number;
  documents?: string[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockUsers: User[] = [
  {
    id: 1,
    name: "Hidaya Nurmeika",
    email: "hidaya@abcretail.com",
    phone: "+251 91 234 5678",
    role: "retailer",
    status: "active",
    business: "ABC Retail Shop",
    location: "Addis Ababa",
    joinedDate: "2026-01-15",
    lastActive: "2026-02-13",
    verified: true,
    totalOrders: 45,
    totalSpent: 125000,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Abebe Kebede",
    email: "abebe@adama-wholesalers.com",
    phone: "+251 92 345 6789",
    role: "distributor",
    status: "active",
    business: "Adama Wholesalers",
    location: "Adama",
    joinedDate: "2026-01-10",
    lastActive: "2026-02-13",
    verified: true,
    totalOrders: 230,
    totalSpent: 1250000,
    rating: 4.7,
    documents: ["license.pdf", "tin_certificate.pdf"],
  },
  {
    id: 3,
    name: "Tadesse Haile",
    email: "tadesse@mugher.com",
    phone: "+251 93 456 7890",
    role: "factory",
    status: "active",
    business: "Mugher Cement",
    location: "Addis Ababa",
    joinedDate: "2026-01-05",
    lastActive: "2026-02-12",
    verified: true,
    totalOrders: 180,
    totalSpent: 3500000,
    rating: 4.9,
    documents: ["license.pdf", "certificate.pdf"],
  },
  {
    id: 4,
    name: "Almaz Worku",
    email: "almaz@citymarket.com",
    phone: "+251 94 567 8901",
    role: "retailer",
    status: "pending",
    business: "City Supermarket",
    location: "Bahir Dar",
    joinedDate: "2026-02-07",
    lastActive: "2026-02-07",
    verified: false,
    documents: ["license.pdf"],
  },
  {
    id: 5,
    name: "Meron Assefa",
    email: "meron@bolesuper.com",
    phone: "+251 95 678 9012",
    role: "retailer",
    status: "active",
    business: "Bole Superstore",
    location: "Addis Ababa",
    joinedDate: "2026-01-20",
    lastActive: "2026-02-13",
    verified: true,
    totalOrders: 78,
    totalSpent: 890000,
    rating: 4.6,
  },
  {
    id: 6,
    name: "Dawit Mekonnen",
    email: "dawit@driver.com",
    phone: "+251 96 789 0123",
    role: "driver",
    status: "active",
    business: "Independent Driver",
    location: "Adama",
    joinedDate: "2026-01-25",
    lastActive: "2026-02-12",
    verified: true,
    documents: ["license.pdf", "vehicle_reg.pdf"],
  },
  {
    id: 7,
    name: "Birtukan Alemu",
    email: "birtukan@freshmart.com",
    phone: "+251 97 890 1234",
    role: "retailer",
    status: "suspended",
    business: "Fresh Mart",
    location: "Hawassa",
    joinedDate: "2025-12-10",
    lastActive: "2026-02-01",
    verified: true,
    totalOrders: 23,
    totalSpent: 340000,
    rating: 3.2,
  },
  {
    id: 8,
    name: "Tekle Berhan",
    email: "tekle@ethiopia-coffee.com",
    phone: "+251 98 901 2345",
    role: "distributor",
    status: "active",
    business: "Ethiopia Coffee Export",
    location: "Addis Ababa",
    joinedDate: "2025-11-15",
    lastActive: "2026-02-13",
    verified: true,
    totalOrders: 310,
    totalSpent: 4500000,
    rating: 4.9,
    documents: ["license.pdf", "export_cert.pdf"],
  },
  {
    id: 9,
    name: "Mulugeta Dessie",
    email: "mulugeta@bahirdarhoney.com",
    phone: "+251 99 012 3456",
    role: "factory",
    status: "pending",
    business: "Bahir Dar Honey",
    location: "Bahir Dar",
    joinedDate: "2026-02-12",
    lastActive: "2026-02-12",
    verified: false,
    documents: ["license.pdf", "certificate.pdf"],
  },
  {
    id: 10,
    name: "Eyerusalem Tsegaye",
    email: "eyerusalem@driver.com",
    phone: "+251 91 123 4567",
    role: "driver",
    status: "inactive",
    business: "Independent Driver",
    location: "Dire Dawa",
    joinedDate: "2026-01-03",
    lastActive: "2026-02-05",
    verified: true,
    documents: ["license.pdf"],
  },
  {
    id: 11,
    name: "Kebede Asfaw",
    email: "kebede@oromiadairy.com",
    phone: "+251 92 234 5678",
    role: "factory",
    status: "active",
    business: "Oromia Dairy",
    location: "Adama",
    joinedDate: "2025-10-20",
    lastActive: "2026-02-13",
    verified: true,
    totalOrders: 145,
    totalSpent: 2800000,
    rating: 4.7,
    documents: ["license.pdf", "health_cert.pdf"],
  },
  {
    id: 12,
    name: "Tsion Hailemariam",
    email: "tsion@addispharma.com",
    phone: "+251 93 345 6789",
    role: "distributor",
    status: "active",
    business: "Addis Pharmaceutical",
    location: "Addis Ababa",
    joinedDate: "2025-09-12",
    lastActive: "2026-02-13",
    verified: true,
    totalOrders: 420,
    totalSpent: 5800000,
    rating: 4.9,
    documents: ["license.pdf", "pharma_license.pdf"],
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "date" | "orders">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] =
    useState<User | null>(null);

  const itemsPerPage = 10;

  // Filter users
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    }
  };

  // Handle select user
  const handleSelectUser = (userId: number) => {
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
              <p className="text-xl font-bold">{mockUsers.length}</p>
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
                {mockUsers.filter((u) => u.role === "retailer").length}
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
                {mockUsers.filter((u) => u.role === "distributor").length}
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
                {mockUsers.filter((u) => u.role === "factory").length}
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
                {mockUsers.filter((u) => u.role === "driver").length}
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
              {paginatedUsers.map((user) => (
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
                    <div className="text-sm">{formatDate(user.joinedDate)}</div>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, sortedUsers.length)} of{" "}
            {sortedUsers.length} users
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
