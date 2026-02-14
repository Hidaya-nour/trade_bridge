import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  ArrowUpDown,
  MessageSquare,
  FileText,
  User,
  Store,
  Factory,
  Calendar,
  DollarSign,
  Scale,
  ThumbsUp,
  ThumbsDown,
  Flag,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

import {
  StatsCard,
  SectionHeader,
  StatusBadge,
  EmptyState,
  PaginationBar,
} from "@/components/shared";
import { formatPrice, formatDate, formatDateTime } from "@/lib/formatters";
import { cn, getInitials } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type DisputeStatus = "open" | "investigating" | "resolved" | "escalated" | "closed";
type DisputePriority = "high" | "medium" | "low";
type DisputeReason = 
  | "damaged_goods" 
  | "late_delivery" 
  | "wrong_items" 
  | "missing_items" 
  | "payment_issue" 
  | "quality_issue" 
  | "other";

interface DisputeMessage {
  id: string;
  userId: number;
  userName: string;
  userRole: "retailer" | "distributor" | "factory" | "admin";
  message: string;
  timestamp: string;
  attachments?: string[];
}

interface Dispute {
  id: string;
  disputeNumber: string;
  orderId: string;
  orderNumber: string;
  raisedBy: {
    id: number;
    name: string;
    role: "retailer" | "distributor" | "factory";
    business: string;
  };
  against: {
    id: number;
    name: string;
    role: "retailer" | "distributor" | "factory";
    business: string;
  };
  reason: DisputeReason;
  reasonText?: string;
  description: string;
  amount: number;
  status: DisputeStatus;
  priority: DisputePriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  evidence?: string[];
  messages: DisputeMessage[];
  assignedTo?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockDisputes: Dispute[] = [
  {
    id: "DSP-001",
    disputeNumber: "DSP-2026-001",
    orderId: "ORD-2026-0245",
    orderNumber: "ORD-2026-0245",
    raisedBy: {
      id: 1,
      name: "ABC Retail Shop",
      role: "retailer",
      business: "ABC Retail Shop",
    },
    against: {
      id: 102,
      name: "Adama Wholesalers",
      role: "distributor",
      business: "Adama Wholesalers",
    },
    reason: "damaged_goods",
    description: "Goods arrived with damaged packaging. Several items were crushed and unusable.",
    amount: 12500,
    status: "open",
    priority: "high",
    createdAt: "2026-02-12T10:30:00",
    updatedAt: "2026-02-12T10:30:00",
    messages: [
      {
        id: "MSG-001",
        userId: 1,
        userName: "ABC Retail Shop",
        userRole: "retailer",
        message: "The flour bags were torn and cement bags were broken. Please advise.",
        timestamp: "2026-02-12T10:30:00",
      },
    ],
  },
  {
    id: "DSP-002",
    disputeNumber: "DSP-2026-002",
    orderId: "ORD-2026-0238",
    orderNumber: "ORD-2026-0238",
    raisedBy: {
      id: 107,
      name: "Mekelle Steel Distributors",
      role: "distributor",
      business: "Mekelle Steel Distributors",
    },
    against: {
      id: 107,
      name: "Tigray Construction",
      role: "factory",
      business: "Tigray Construction",
    },
    reason: "late_delivery",
    description: "Order was delivered 5 days late causing production delays.",
    amount: 150000,
    status: "investigating",
    priority: "medium",
    createdAt: "2026-02-10T14:15:00",
    updatedAt: "2026-02-11T09:20:00",
    assignedTo: "Admin User",
    messages: [
      {
        id: "MSG-002",
        userId: 107,
        userName: "Mekelle Steel Distributors",
        userRole: "distributor",
        message: "We were promised delivery on Feb 9 but it arrived on Feb 14.",
        timestamp: "2026-02-10T14:15:00",
      },
      {
        id: "MSG-003",
        userId: 999,
        userName: "Admin User",
        userRole: "admin",
        message: "I've contacted the supplier. They claim weather caused delays.",
        timestamp: "2026-02-11T09:20:00",
      },
    ],
  },
  {
    id: "DSP-003",
    disputeNumber: "DSP-2026-003",
    orderId: "ORD-2026-0232",
    orderNumber: "ORD-2026-0232",
    raisedBy: {
      id: 5,
      name: "Addis Mart",
      role: "retailer",
      business: "Addis Mart",
    },
    against: {
      id: 102,
      name: "Adama Wholesalers",
      role: "distributor",
      business: "Adama Wholesalers",
    },
    reason: "wrong_items",
    description: "Received cooking oil instead of dairy products. Order was completely wrong.",
    amount: 11750,
    status: "escalated",
    priority: "high",
    createdAt: "2026-02-09T16:30:00",
    updatedAt: "2026-02-13T11:00:00",
    resolvedAt: "2026-02-13T11:00:00",
    resolvedBy: "Admin User",
    resolution: "Refund issued to customer. Supplier penalized.",
    messages: [
      {
        id: "MSG-004",
        userId: 5,
        userName: "Addis Mart",
        userRole: "retailer",
        message: "The driver delivered wrong items. We need a replacement urgently.",
        timestamp: "2026-02-09T16:30:00",
      },
      {
        id: "MSG-005",
        userId: 102,
        userName: "Adama Wholesalers",
        userRole: "distributor",
        message: "Our warehouse made an error. We can send correct items tomorrow.",
        timestamp: "2026-02-10T09:00:00",
      },
      {
        id: "MSG-006",
        userId: 999,
        userName: "Admin User",
        userRole: "admin",
        message: "Customer requested refund instead of replacement. Processing now.",
        timestamp: "2026-02-13T11:00:00",
      },
    ],
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const disputeStatusColors: Record<DisputeStatus, string> = {
  open: "bg-yellow-100 text-yellow-800 border-yellow-200",
  investigating: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  escalated: "bg-red-100 text-red-800 border-red-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColors: Record<DisputePriority, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const reasonLabels: Record<DisputeReason, string> = {
  damaged_goods: "Damaged Goods",
  late_delivery: "Late Delivery",
  wrong_items: "Wrong Items",
  missing_items: "Missing Items",
  payment_issue: "Payment Issue",
  quality_issue: "Quality Issue",
  other: "Other",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const DisputesManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolution, setResolution] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const itemsPerPage = 10;

  // Filter disputes
  const filteredDisputes = mockDisputes.filter((dispute) => {
    const matchesSearch =
      searchQuery === "" ||
      dispute.disputeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.raisedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.against.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "all" || dispute.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || dispute.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDisputes = filteredDisputes.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const stats = {
    total: mockDisputes.length,
    open: mockDisputes.filter((d) => d.status === "open").length,
    investigating: mockDisputes.filter((d) => d.status === "investigating").length,
    resolved: mockDisputes.filter((d) => d.status === "resolved").length,
    escalated: mockDisputes.filter((d) => d.status === "escalated").length,
    highPriority: mockDisputes.filter((d) => d.priority === "high").length,
  };

  // Handle resolve
  const handleResolve = () => {
    if (selectedDispute) {
      console.log("Resolving dispute:", selectedDispute.id, "Resolution:", resolution);
      setShowResolveDialog(false);
      setShowDetailsDialog(false);
      setResolution("");
      // In real app, call API
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    if (selectedDispute && newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
      // In real app, call API
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disputes Management</h1>
          <p className="text-muted-foreground mt-1">
            Handle disputes between retailers, distributors, and factories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Disputes"
          value={stats.total}
          icon={ShieldAlert}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatsCard
          title="Open"
          value={stats.open}
          icon={AlertCircle}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="Investigating"
          value={stats.investigating}
          icon={Clock}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Escalated"
          value={stats.escalated}
          icon={Flag}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="High Priority"
          value={stats.highPriority}
          icon={AlertCircle}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by dispute #, order #, parties..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      {paginatedDisputes.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No disputes found"
          description="All disputes have been resolved"
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute #</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Raised By</TableHead>
                  <TableHead>Against</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell>
                      <Link
                        to={`/admin/disputes/${dispute.id}`}
                        className="text-sm font-medium hover:text-primary"
                      >
                        {dispute.disputeNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/admin/orders/${dispute.orderId}`}
                        className="text-sm hover:text-primary"
                      >
                        {dispute.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback
                            className={cn(
                              dispute.raisedBy.role === "retailer"
                                ? "bg-blue-100 text-blue-700"
                                : dispute.raisedBy.role === "distributor"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-green-100 text-green-700",
                            )}
                          >
                            {getInitials(dispute.raisedBy.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            to={`/admin/users/${dispute.raisedBy.id}`}
                            className="text-sm hover:text-primary"
                          >
                            {dispute.raisedBy.name}
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback
                            className={cn(
                              dispute.against.role === "distributor"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700",
                            )}
                          >
                            {getInitials(dispute.against.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          to={`/admin/users/${dispute.against.id}`}
                          className="text-sm hover:text-primary"
                        >
                          {dispute.against.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {reasonLabels[dispute.reason]}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(dispute.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={disputeStatusColors[dispute.status]}>
                        {dispute.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[dispute.priority]}>
                        {dispute.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(dispute.createdAt)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredDisputes.length)} of{" "}
              {filteredDisputes.length} disputes
            </p>
            {totalPages > 1 && (
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </CardFooter>
        </Card>
      )}

      {/* Dispute Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              {selectedDispute?.disputeNumber} - {selectedDispute?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDispute && (
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex gap-4">
                <Badge className={disputeStatusColors[selectedDispute.status]}>
                  Status: {selectedDispute.status}
                </Badge>
                <Badge className={priorityColors[selectedDispute.priority]}>
                  Priority: {selectedDispute.priority}
                </Badge>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Raised By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback
                          className={cn(
                            selectedDispute.raisedBy.role === "retailer"
                              ? "bg-blue-100 text-blue-700"
                              : selectedDispute.raisedBy.role === "distributor"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700",
                          )}
                        >
                          {getInitials(selectedDispute.raisedBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedDispute.raisedBy.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDispute.raisedBy.role} • {selectedDispute.raisedBy.business}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Against</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback
                          className={cn(
                            selectedDispute.against.role === "distributor"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700",
                          )}
                        >
                          {getInitials(selectedDispute.against.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedDispute.against.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDispute.against.role} • {selectedDispute.against.business}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dispute Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Dispute Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Reason</p>
                    <Badge variant="outline" className="mt-1">
                      {reasonLabels[selectedDispute.reason]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                      {selectedDispute.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amount in Dispute</p>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(selectedDispute.amount)}
                    </p>
                  </div>
                  {selectedDispute.resolution && (
                    <div>
                      <p className="text-sm font-medium">Resolution</p>
                      <p className="text-sm mt-1 p-3 bg-green-50 rounded-lg">
                        {selectedDispute.resolution}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline / Messages */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Communication Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDispute.messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className={cn(
                              msg.userRole === "admin"
                                ? "bg-red-100 text-red-700"
                                : msg.userRole === "retailer"
                                  ? "bg-blue-100 text-blue-700"
                                  : msg.userRole === "distributor"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-green-100 text-green-700",
                            )}
                          >
                            {getInitials(msg.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{msg.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {msg.userRole}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(msg.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Message */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        rows={2}
                      />
                      <Button onClick={handleSendMessage} className="self-end">
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {selectedDispute.status !== "resolved" && selectedDispute.status !== "closed" && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResolveDialog(true);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                  <Button variant="destructive">
                    <Flag className="h-4 w-4 mr-2" />
                    Escalate
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Provide resolution details for this dispute
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="resolution">Resolution Details</Label>
            <Textarea
              id="resolution"
              placeholder="e.g., Refund issued, replacement sent, etc."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="mt-2"
              rows={4}
            />

            <div className="mt-4 space-y-2">
              <Label>Resolution Type</Label>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  In Favor of Buyer
                </Button>
                <Button variant="outline" className="flex-1">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  In Favor of Supplier
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolution.trim()}>
              Resolve Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};