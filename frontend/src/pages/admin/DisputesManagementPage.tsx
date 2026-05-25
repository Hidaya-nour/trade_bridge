import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Flag,
  Store,
  Factory,
  Package,
  RefreshCw,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  StatsCard,
  EmptyState,
  PaginationBar,
  StatusBadge,
} from "@/components";
import { formatPrice, formatDate, formatDateTime } from "@/lib/formatters";
import { cn, getInitials } from "@/lib/utils";
import { useDisputeStore } from "@/stores/dispute.store";

type DisputeStatus =
  | "open"
  | "investigating"
  | "resolved"
  | "escalated"
  | "closed";
type DisputePriority = "high" | "medium" | "low";
type PartyRole = "retailer" | "distributor" | "factory" | "driver" | "admin";

interface AdminDispute {
  id: string;
  orderId: string;
  orderNumber: string;
  orderPlacedAt?: string | null;
  orderUpdatedAt?: string | null;
  orderStatus?: string | null;
  raisedBy: {
    id: string;
    name: string;
    role: PartyRole;
    business: string;
    email?: string;
  };
  against: {
    id: string;
    name: string;
    role: PartyRole;
    business: string;
    email?: string;
  };
  reason: string;
  description: string;
  amount: number;
  status: DisputeStatus;
  priority: DisputePriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  resolution?: string | null;
  resolvedBy?: string | null;
}

const roleTone: Record<PartyRole, string> = {
  retailer: "bg-blue-100 text-blue-700",
  distributor: "bg-purple-100 text-purple-700",
  factory: "bg-green-100 text-green-700",
  driver: "bg-amber-100 text-amber-700",
  admin: "bg-slate-100 text-slate-700",
};

const priorityTone: Record<DisputePriority, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const prettifyReason = (reason?: string) =>
  (reason || "other")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const derivePriority = (amount: number, status: string): DisputePriority => {
  if (status === "escalated" || amount >= 100000) return "high";
  if (status === "investigating" || amount >= 25000) return "medium";
  return "low";
};

const toOrderNumber = (orderId?: string) =>
  orderId ? `ORD-${orderId.slice(0, 8).toUpperCase()}` : "N/A";

const normalizeDispute = (dispute: any): AdminDispute => {
  const raisedBy = dispute.raised_by || {};
  const against = dispute.against || {};
  const amount = Number(dispute.amount || dispute.order_total || 0);
  const status = (dispute.status || "open") as DisputeStatus;
  const order = dispute.order || null;

  return {
    id: String(dispute.id),
    orderId: String(dispute.order_id || dispute.order?.id || ""),
    orderNumber: toOrderNumber(dispute.order_id || dispute.order?.id),
    orderPlacedAt: order?.created_at || null,
    orderUpdatedAt: order?.updated_at || null,
    orderStatus: order?.order_status || null,
    raisedBy: {
      id: String(raisedBy.id || ""),
      name: raisedBy.business_name || raisedBy.full_name || "Unknown User",
      role: (raisedBy.role || "retailer") as PartyRole,
      business:
        raisedBy.business_name || raisedBy.full_name || "Unknown Business",
      email: raisedBy.email,
    },
    against: {
      id: String(against.id || ""),
      name: against.business_name || against.full_name || "Unknown User",
      role: (against.role || "distributor") as PartyRole,
      business:
        against.business_name || against.full_name || "Unknown Business",
      email: against.email,
    },
    reason: dispute.reason || "other",
    description: dispute.description || "No description provided",
    amount,
    status,
    priority: derivePriority(amount, status),
    createdAt: dispute.created_at || new Date().toISOString(),
    updatedAt:
      dispute.updated_at || dispute.created_at || new Date().toISOString(),
    resolvedAt: dispute.resolved_at || null,
    resolution: dispute.resolution || null,
    resolvedBy:
      dispute.resolved_by?.business_name ||
      dispute.resolved_by?.full_name ||
      null,
  };
};

export const DisputesManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(
    null,
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolution, setResolution] = useState("");

  const { items, isLoading, error, fetchAll, update } = useDisputeStore();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAll({ limit: 100 });
  }, [fetchAll]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  const disputes = useMemo(() => (items || []).map(normalizeDispute), [items]);

  const filteredDisputes = useMemo(() => {
    return disputes.filter((dispute) => {
      const needle = searchQuery.trim().toLowerCase();
      const matchesSearch =
        needle === "" ||
        dispute.id.toLowerCase().includes(needle) ||
        dispute.orderNumber.toLowerCase().includes(needle) ||
        dispute.raisedBy.name.toLowerCase().includes(needle) ||
        dispute.against.name.toLowerCase().includes(needle) ||
        dispute.description.toLowerCase().includes(needle);

      const matchesStatus =
        selectedStatus === "all" || dispute.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [disputes, searchQuery, selectedStatus]);

  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDisputes = filteredDisputes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const stats = useMemo(
    () => ({
      total: disputes.length,
      open: disputes.filter((d) => d.status === "open").length,
      investigating: disputes.filter((d) => d.status === "investigating")
        .length,
      escalated: disputes.filter((d) => d.status === "escalated").length,
      resolved: disputes.filter((d) => d.status === "resolved").length,
      highPriority: disputes.filter((d) => d.priority === "high").length,
    }),
    [disputes],
  );

  const handleStatusUpdate = async (
    dispute: AdminDispute,
    status: DisputeStatus,
    nextResolution?: string,
  ) => {
    await update(dispute.id, {
      status,
      resolution: nextResolution,
    });

    await fetchAll({ limit: 100 });

    if (selectedDispute?.id === dispute.id) {
      setSelectedDispute({
        ...selectedDispute,
        status,
        resolution: nextResolution || selectedDispute.resolution,
        resolvedAt:
          status === "resolved"
            ? new Date().toISOString()
            : selectedDispute.resolvedAt,
      });
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute || !resolution.trim()) return;

    await handleStatusUpdate(selectedDispute, "resolved", resolution.trim());
    setShowResolveDialog(false);
    setShowDetailsDialog(false);
    setResolution("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Disputes Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review, investigate, and resolve platform disputes from live data.
          </p>
        </div>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by dispute, order, or party..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All statuses" />
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
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading disputes...
          </CardContent>
        </Card>
      ) : paginatedDisputes.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No disputes found"
          description="Try adjusting your filters or check back once disputes are created."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute</TableHead>
                  <TableHead>Order</TableHead>
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
                    <TableCell className="font-medium">
                      DSP-{dispute.id.slice(0, 8).toUpperCase()}
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
                        <Avatar className="h-7 w-7">
                          <AvatarFallback
                            className={roleTone[dispute.raisedBy.role]}
                          >
                            {getInitials(dispute.raisedBy.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {dispute.raisedBy.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dispute.raisedBy.business}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback
                            className={roleTone[dispute.against.role]}
                          >
                            {getInitials(dispute.against.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {dispute.against.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dispute.against.business}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {prettifyReason(dispute.reason)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(dispute.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={dispute.status} />
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityTone[dispute.priority]}>
                        {dispute.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(dispute.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setResolution(dispute.resolution || "");
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDisputes.length === 0 ? 0 : startIndex + 1}-
              {Math.min(
                startIndex + paginatedDisputes.length,
                filteredDisputes.length,
              )}{" "}
              of {filteredDisputes.length} disputes
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

     <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
  <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
    <DialogHeader className="flex-shrink-0">
      <DialogTitle>Dispute Details</DialogTitle>
      <DialogDescription>
        {selectedDispute
          ? `DSP-${selectedDispute.id.slice(0, 8).toUpperCase()}`
          : "Selected dispute"}
      </DialogDescription>
    </DialogHeader>

    {selectedDispute && (
      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={selectedDispute.status} />
            <Badge className={priorityTone[selectedDispute.priority]}>
              {selectedDispute.priority} priority
            </Badge>
            <Badge variant="outline">
              {prettifyReason(selectedDispute.reason)}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Raised By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback
                      className={roleTone[selectedDispute.raisedBy.role]}
                    >
                      {getInitials(selectedDispute.raisedBy.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedDispute.raisedBy.name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedDispute.raisedBy.business}
                    </p>
                  </div>
                </div>
                <StatusBadge status={selectedDispute.raisedBy.role} />
                {selectedDispute.raisedBy.email && (
                  <p className="text-muted-foreground">
                    {selectedDispute.raisedBy.email}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Against</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback
                      className={roleTone[selectedDispute.against.role]}
                    >
                      {getInitials(selectedDispute.against.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedDispute.against.name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedDispute.against.business}
                    </p>
                  </div>
                </div>
                <StatusBadge status={selectedDispute.against.role} />
                {selectedDispute.against.email && (
                  <p className="text-muted-foreground">
                    {selectedDispute.against.email}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Dispute Information</CardTitle>
              <CardDescription>
                Dispute opened {formatDateTime(selectedDispute.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Order Placed
                  </p>
                  <p className="font-medium">
                    {selectedDispute.orderPlacedAt
                      ? formatDateTime(selectedDispute.orderPlacedAt)
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Order Status
                  </p>
                  <p className="font-medium capitalize">
                    {selectedDispute.orderStatus || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  Amount in dispute: {formatPrice(selectedDispute.amount)}
                </span>
              </div>
              <div className="rounded-lg bg-muted p-3">
                {selectedDispute.description}
              </div>
              {selectedDispute.resolution && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="font-medium text-green-800">Resolution</p>
                  <p className="mt-1 text-green-700">
                    {selectedDispute.resolution}
                  </p>
                  {selectedDispute.resolvedAt && (
                    <p className="mt-2 text-xs text-green-700">
                      Resolved {formatDateTime(selectedDispute.resolvedAt)}
                      {selectedDispute.resolvedBy
                        ? ` by ${selectedDispute.resolvedBy}`
                        : ""}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Investigation Shortcuts</CardTitle>
              <CardDescription>
                Jump into the supplier profile, catalog, and order context.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {selectedDispute.orderId ? (
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/admin/orders/${selectedDispute.orderId}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Order
                  </Link>
                </Button>
              ) : null}
              {selectedDispute.against?.id ? (
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/admin/users?search=${selectedDispute.against.id}`}>
                    <Store className="mr-2 h-4 w-4" />
                    Supplier Profile
                  </Link>
                </Button>
              ) : null}
              {selectedDispute.against?.id ? (
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/admin/products?supplier_id=${selectedDispute.against.id}`}>
                    <Package className="mr-2 h-4 w-4" />
                    Supplier Products
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {selectedDispute.status !== "resolved" &&
            selectedDispute.status !== "closed" && (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleStatusUpdate(selectedDispute, "investigating")
                  }
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Mark Investigating
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600"
                  onClick={() =>
                    handleStatusUpdate(selectedDispute, "escalated")
                  }
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Escalate
                </Button>
                <Button onClick={() => setShowResolveDialog(true)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Resolve
                </Button>
              </div>
            )}
        </div>
      </div>
    )}

    <DialogFooter className="flex-shrink-0 mt-4">
      <Button
        variant="outline"
        onClick={() => setShowDetailsDialog(false)}
      >
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Add a clear resolution note before closing this dispute.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="resolution">Resolution Details</Label>
            <Textarea
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe how the dispute was resolved..."
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResolveDialog(false)}
            >
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

export default DisputesManagementPage;
