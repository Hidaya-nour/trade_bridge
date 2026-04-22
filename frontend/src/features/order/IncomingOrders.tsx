import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  AlertCircle,
  ChevronRight,
  Download,
  Store,
  User,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Printer,
  MoreVertical,
  Factory,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

import {
  StatusBadge,
  StatsCard,
  EmptyState,
  PaginationBar,
  SearchFilter,
} from "@/components";
import { formatPrice, formatDate, formatDateTime } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";
import { useDriverStore } from "@/stores/driver.store";
import deliveryService from "@/services/delivery.service";
import toast from "react-hot-toast";
import type { IncomingOrder, IncomingOrdersConfig } from "@/types/order.types";

// ============================================================================
// PROPS
// ============================================================================

interface IncomingOrdersProps {
  config: IncomingOrdersConfig;
  orders: IncomingOrder[];
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string, reason: string) => void;
  onProcessOrder: (orderId: string) => void;
  onAssignDriver?: (
    orderId: string,
    deliveryId: string,
    driverId: string,
  ) => void | Promise<void>;
  onConfirmPayment?: (
    orderId: string,
    paymentId: string,
    amountPaid?: number,
  ) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const IncomingOrders: React.FC<IncomingOrdersProps> = ({
  config,
  orders: initialOrders,
  onApproveOrder,
  onRejectOrder,
  onProcessOrder,
  onAssignDriver,
  onConfirmPayment,
}) => {
  const [orders, setOrders] = useState<IncomingOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(
    null,
  );
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showConfirmPaymentDialog, setShowConfirmPaymentDialog] =
    useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState<IncomingOrder | null>(
    null,
  );
  const [selectedDriver, setSelectedDriver] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const {
    drivers,
    fetchMyDrivers,
    isLoading: driversLoading,
    error: driversError,
  } = useDriverStore();

  const driverOptions = React.useMemo(
    () =>
      drivers
        .filter((d) => d.active)
        .map((d) => ({
          id: d.id,
          name: d.driver?.full_name ?? "Driver",
          phone: d.driver?.phone ?? "",
          vehicleType: d.vehicle_type || "Vehicle",
          licensePlate: d.license_plate || "",
        })),
    [drivers],
  );

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    if (config.role === "distributor" || config.role === "factory") {
      fetchMyDrivers();
    }
  }, [config.role, fetchMyDrivers]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerContact.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const handleApprove = (orderId: string) => {
    onApproveOrder(orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "approved", paymentStatus: "approved" }
          : o,
      ),
    );
    setShowApproveDialog(false);
    setSelectedOrder(null);
  };

  const handleReject = (orderId: string) => {
    onRejectOrder(orderId, rejectionReason);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled",
              paymentStatus: "refunded",
              cancellationReason: rejectionReason,
              cancelledDate: new Date().toISOString().split("T")[0],
            }
          : o,
      ),
    );
    setShowRejectDialog(false);
    setSelectedOrder(null);
    setRejectionReason("");
  };

  const handleProcess = (orderId: string) => {
    onProcessOrder(orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "processing" } : o)),
    );
  };

  const handleConfirmPayment = () => {
    if (!selectedOrder?.paymentId || !onConfirmPayment) return;
    const amountPaid =
      typeof selectedOrder.paymentAmount === "number"
        ? selectedOrder.paymentAmount
        : selectedOrder.paymentPaid;
    onConfirmPayment(selectedOrder.id, selectedOrder.paymentId, amountPaid);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              paymentStatus: "paid",
              paymentPaid:
                typeof amountPaid === "number" ? amountPaid : o.paymentPaid,
            }
          : o,
      ),
    );
    setShowConfirmPaymentDialog(false);
    setSelectedOrder(null);
  };

  const openAssignDialog = (order: IncomingOrder) => {
    setAssigningOrder(order);
    setSelectedDriver("");
    setShowAssignDialog(true);
  };

  const handleAssignDriver = async () => {
    if (!assigningOrder || !selectedDriver) return;
    const driver = driverOptions.find((d) => d.id === selectedDriver);
    if (!driver) return;

    setAssignLoading(true);
    try {
      let deliveryId = assigningOrder.deliveryId;
      if (!deliveryId) {
        const createPayload: any = {
          order_id: assigningOrder.id,
          dropoff_location: assigningOrder.customerLocation || "Not provided",
          pickup_location: "Not provided",
        };
        const created = await deliveryService.create(createPayload);
        deliveryId =
          created?.data?.delivery?.id ||
          created?.data?.id ||
          created?.id;
      }

      if (!deliveryId) {
        toast.error("Failed to create delivery record.");
        return;
      }

      await deliveryService.assignDriver(deliveryId, selectedDriver);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === assigningOrder.id
            ? {
                ...o,
                deliveryId,
                driver: driver.name,
                driverPhone: driver.phone,
                driverId: selectedDriver,
              }
            : o,
        ),
      );
      if (onAssignDriver) {
        await onAssignDriver(
          assigningOrder.id,
          deliveryId,
          selectedDriver,
        );
      }
      toast.success(`Driver ${driver.name} assigned.`);
      setShowAssignDialog(false);
      setAssigningOrder(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to assign driver. Please try again.",
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const statsData = [
    {
      title: "Total Revenue",
      value: formatPrice(config.stats.totalRevenue),
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Pending",
      value: config.stats.pending,
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Processing",
      value: config.stats.processing,
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Approved",
      value: config.stats.approved,
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  const CustomerIcon = config.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {config.title}
            </h1>
            {config.stats.pending > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {config.stats.pending} Pending
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{config.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <SearchFilter
            placeholder={`Search by order ID, ${config.customerLabel.toLowerCase()} name, or contact...`}
            onSearch={setSearchQuery}
            filterComponent={
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, sortedOrders.length)} of{" "}
          {sortedOrders.length} orders
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Package className="h-3 w-3 mr-1" />
          {sortedOrders.length} orders
        </Badge>
      </div>

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={`No incoming orders match your current filters`}
          actionLabel="Clear filters"
          onAction={() => {
            setSearchQuery("");
            setStatusFilter("all");
          }}
        />
      ) : (
        <div className="space-y-4">
          {currentOrders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                {/* Order Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        order.status === "pending"
                          ? "bg-yellow-100"
                          : order.status === "processing"
                            ? "bg-blue-100"
                            : order.status === "approved"
                              ? "bg-green-100"
                              : order.status === "shipped"
                                ? "bg-purple-100"
                                : order.status === "delivered"
                                  ? "bg-emerald-100"
                                  : "bg-red-100",
                      )}
                    >
                      {order.status === "pending" && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {order.status === "processing" && (
                        <Package className="h-5 w-5 text-blue-600" />
                      )}
                      {order.status === "approved" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {order.status === "shipped" && (
                        <Truck className="h-5 w-5 text-purple-600" />
                      )}
                      {order.status === "delivered" && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      )}
                      {order.status === "cancelled" && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/${config.role}/orders/${order.id}`}
                          className="text-lg font-semibold hover:text-primary"
                        >
                          {order.id}
                        </Link>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(order.customerName)}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            to={`/${config.role}${config.customerPath}/${order.customerId}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {order.customerName}
                          </Link>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Ordered: {formatDate(order.orderDate)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {order.customerLocation.split(",")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(order.total)}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "approved"
                            ? "bg-blue-100 text-blue-800"
                            : order.paymentStatus === "refunded"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {order.paymentMethod} • {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">
                      Order Items ({order.items.length})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Requested Delivery: {formatDate(order.requestedDelivery)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} x{item.quantity} {item.unit}
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.total)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Customer Notes */}
                {order.notes && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-800">
                          {config.customerLabel} Note:
                        </p>
                        <p className="text-xs text-blue-700">{order.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Info & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-2 border-t">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerContact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerPhone}</span>
                    </div>
                    {order.customerRating && (
                      <Badge variant="outline" className="bg-yellow-50">
                        ★ {order.customerRating} • {order.previousOrders} prev
                        orders
                      </Badge>
                    )}
                    {!order.customerRating && order.previousOrders === 0 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        New {config.customerLabel}
                      </Badge>
                    )}
                    {order.driver && (
                      <Badge variant="outline" className="bg-purple-50">
                        <Truck className="h-3 w-3 mr-1" />
                        Driver: {order.driver}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowApproveDialog(true);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve Order
                        </Button>
                      </>
                    )}

                    {order.status === "approved" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleProcess(order.id)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Start Processing
                      </Button>
                    )}

                    {order.status === "processing" &&
                      (config.role === "distributor" ||
                        config.role === "factory") &&
                      order.deliveryId && (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => openAssignDialog(order)}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          {order.driver ? "Change Driver" : "Assign Driver"}
                        </Button>
                      )}

                    {order.status === "shipped" && order.trackingNumber && (
                      <Badge variant="outline" className="bg-purple-50">
                        Tracking: {order.trackingNumber}
                      </Badge>
                    )}

                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/${config.role}/orders/${order.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/${config.role}/orders/${order.id}/edit`}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Contact {config.customerLabel}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Approve Order Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve order {selectedOrder?.id} for{" "}
              {selectedOrder?.customerName}?
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Order Total:{" "}
                  {selectedOrder && formatPrice(selectedOrder.total)}
                </p>
                <div className="mt-3 rounded-lg bg-white/60 p-3">
                  <p className="text-xs text-green-800">
                    Payment Method: {selectedOrder?.paymentMethod || "N/A"}
                  </p>
                  <p className="text-xs text-green-800">
                    Payment Status: {selectedOrder?.paymentStatus || "N/A"}
                  </p>
                  {typeof selectedOrder?.paymentAmount === "number" && (
                    <p className="text-xs text-green-800">
                      Amount Due: {formatPrice(selectedOrder.paymentAmount)}
                    </p>
                  )}
                  {typeof selectedOrder?.paymentPaid === "number" && (
                    <p className="text-xs text-green-800">
                      Amount Paid: {formatPrice(selectedOrder.paymentPaid)}
                    </p>
                  )}
                  {selectedOrder?.paymentProofUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-7 text-xs"
                      asChild
                    >
                      <a
                        href={selectedOrder.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Proof Document
                      </a>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Approving this order will:
                </p>
                <ul className="text-xs text-green-700 list-disc list-inside mt-1">
                  <li>
                    Confirm the order with the{" "}
                    {config.customerLabel.toLowerCase()}
                  </li>
                  <li>Apply credit terms if applicable</li>
                  <li>Move order to processing queue</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedOrder && handleApprove(selectedOrder.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Order Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={rejectionReason} onValueChange={setRejectionReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select rejection reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Out of stock">Out of stock</SelectItem>
                <SelectItem value="Unable to meet delivery date">
                  Unable to meet delivery date
                </SelectItem>
                <SelectItem value="Payment verification failed">
                  Payment verification failed
                </SelectItem>
                <SelectItem value="Customer credit limit exceeded">
                  Customer credit limit exceeded
                </SelectItem>
                <SelectItem value="Pricing discrepancy">
                  Pricing discrepancy
                </SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {rejectionReason === "Other" && (
              <Input
                className="mt-3"
                placeholder="Enter rejection reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedOrder && handleReject(selectedOrder.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionReason}
            >
              Reject Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Payment Dialog */}
      <AlertDialog
        open={showConfirmPaymentDialog}
        onOpenChange={setShowConfirmPaymentDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm that payment has been received for order{" "}
              {selectedOrder?.id}.
              {typeof selectedOrder?.paymentAmount === "number" && (
                <div className="mt-3 text-sm">
                  Amount Due: {formatPrice(selectedOrder.paymentAmount)}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPayment}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Mark as Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Driver Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
            <DialogDescription>
              {assigningOrder?.id
                ? `Select a driver for order ${assigningOrder.id}`
                : "Select a driver for this order"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Available Drivers</Label>
              {driversLoading && driverOptions.length === 0 ? (
                <div className="rounded-md border border-muted p-3 text-sm text-muted-foreground">
                  Loading your drivers...
                </div>
              ) : driverOptions.length === 0 ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  No drivers linked yet. Add drivers in the Delivery page to
                  assign them here.
                </div>
              ) : (
                <Select
                  value={selectedDriver}
                  onValueChange={setSelectedDriver}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {driverOptions.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{driver.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {driver.vehicleType} • {driver.licensePlate}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {driversError && (
                <p className="text-xs text-red-600">{driversError}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignDriver}
              disabled={
                !selectedDriver || assignLoading || driverOptions.length === 0
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
