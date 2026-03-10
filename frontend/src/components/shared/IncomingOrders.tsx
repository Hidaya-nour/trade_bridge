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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

import {
  StatusBadge,
  StatsCard,
  EmptyState,
  PaginationBar,
  SearchFilter,
} from "@/components/shared";
import { formatPrice, formatDate, formatDateTime } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type OrderRole = "distributor" | "factory";

export interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface IncomingOrder {
  id: string;
  customerId: number;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  customerLocation: string;
  orderDate: string;
  requestedDelivery: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status:
    | "pending"
    | "processing"
    | "approved"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: string;
  paymentMethod: string;
  paymentAmount?: number;
  paymentPaid?: number;
  paymentProofUrl?: string;
  paymentProofName?: string;
  notes?: string;
  trackingNumber?: string;
  driver?: string;
  driverId?: number;
  deliveredDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  customerRating: number | null;
  previousOrders: number;
}

export interface IncomingOrdersConfig {
  role: OrderRole;
  title: string;
  description: string;
  customerLabel: string; // "Retailer" or "Distributor"
  customerPath: string; // "/retailers" or "/distributors"
  icon: React.ElementType; // Store or Factory
  stats: {
    pending: number;
    processing: number;
    approved: number;
    totalRevenue: number;
  };
}

// ============================================================================
// PROPS
// ============================================================================

interface IncomingOrdersProps {
  config: IncomingOrdersConfig;
  orders: IncomingOrder[];
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string, reason: string) => void;
  onProcessOrder: (orderId: string) => void;
  onAssignDriver?: (orderId: string) => void; // Only for distributor
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
}) => {
  const [orders, setOrders] = useState<IncomingOrder[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(
    null,
  );
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

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
                      config.role === "distributor" &&
                      onAssignDriver && (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          asChild
                        >
                          <Link
                            to={`/${config.role}/delivery/assign/${order.id}`}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Assign Driver
                          </Link>
                        </Button>
                      )}

                    {order.status === "shipped" && order.trackingNumber && (
                      <Badge variant="outline" className="bg-purple-50">
                        Tracking: {order.trackingNumber}
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
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

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Complete order information and{" "}
              {config.customerLabel.toLowerCase()} details
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6 py-2">
                {/* Customer Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CustomerIcon className="h-4 w-4" />
                    {config.customerLabel} Information
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Business Name
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Contact Person
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.customerContact}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Phone
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.customerPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Location
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.customerLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Information
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Order Date
                      </span>
                      <span className="text-xs font-medium">
                        {formatDateTime(selectedOrder.orderDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Requested Delivery
                      </span>
                      <span className="text-xs font-medium">
                        {formatDate(selectedOrder.requestedDelivery)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Payment Method
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Payment Status
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          selectedOrder.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : selectedOrder.paymentStatus === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                          <span className="text-sm font-bold">
                            {formatPrice(item.total)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>SKU: {item.sku}</span>
                          <span>
                            {item.quantity} {item.unit} ×{" "}
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Order Summary</h4>
                  <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatPrice(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (15%)</span>
                      <span>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      {config.customerLabel} Notes
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.cancellationReason && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-red-600">
                      Cancellation Reason
                    </h4>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        {selectedOrder.cancellationReason}
                      </p>
                      {selectedOrder.cancelledDate && (
                        <p className="text-xs text-red-600 mt-1">
                          Cancelled on:{" "}
                          {formatDate(selectedOrder.cancelledDate)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.deliveredDate && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-green-600">
                      Delivery Information
                    </h4>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        Delivered on: {formatDate(selectedOrder.deliveredDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Close
            </Button>
            <Button asChild>
              <Link to={`/${config.role}/orders/${selectedOrder?.id}`}>
                View Full Order
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
};
