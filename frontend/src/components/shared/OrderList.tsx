import React, { useState } from "react";
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
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Printer,
  MoreVertical,
  FileText,
  Repeat,
  Star,
  Factory,
  Store,
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
  EmptyState,
  PaginationBar,
  SearchFilter,
  StatsCard,
} from "@/components/shared";
import { formatPrice, formatDate, formatDateTime } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";
import { Label } from "../ui/label";

// ============================================================================
// TYPES
// ============================================================================

export type OrderRole = "retailer" | "distributor";
export type OrderType = "sales" | "purchases";

export interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  partyId: number;
  partyName: string;
  partyContact: string;
  partyPhone: string;
  partyLocation: string;
  orderDate: string;
  requestedDelivery: string;
  estimatedDelivery: string;
  actualDelivery?: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "approved" | "refunded";
  paymentMethod: string;
  paymentTerms: string;
  priority: "high" | "medium" | "low";
  notes?: string;
  trackingNumber?: string;
  carrier?: string;
  cancellationReason?: string;
  cancelledDate?: string;
  receivedBy?: string;
  receivedDate?: string;
  invoiceUrl?: string;
  rating?: number | null;
  review?: string;
}

export interface OrderListConfig {
  role: OrderRole;
  type: OrderType;
  title: string;
  description: string;
  partyLabel: string; // "Supplier", "Distributor", "Factory"
  partyPath: string; // "/suppliers", "/distributors", "/factories"
  icon: React.ElementType;
  showRating: boolean; // Retailers rate suppliers
  showReorder: boolean; // Can reorder from this party
  showCancel: boolean; // Can cancel orders
  stats: {
    totalSpent: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
}

// ============================================================================
// PROPS
// ============================================================================

interface OrderListProps {
  config: OrderListConfig;
  orders: Order[];
  onCancelOrder?: (orderId: string, reason: string) => void;
  onReorder?: (orderId: string) => void;
  onRate?: (orderId: string, rating: number, review: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-gray-100 text-gray-800",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const OrderList: React.FC<OrderListProps> = ({
  config,
  orders: initialOrders,
  onCancelOrder,
  onReorder,
  onRate,
}) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partyFilter, setPartyFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get unique parties for filter
  const parties = Array.from(new Set(orders.map((o) => o.partyName))).sort();

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.partyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesParty =
      partyFilter === "all" || order.partyName === partyFilter;

    return matchesSearch && matchesStatus && matchesParty;
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

  const handleCancelOrder = () => {
    if (selectedOrder && onCancelOrder) {
      onCancelOrder(selectedOrder.id, cancellationReason);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: "cancelled",
                paymentStatus: "refunded",
                cancellationReason,
                cancelledDate: new Date().toISOString().split("T")[0],
              }
            : o,
        ),
      );
    }
    setShowCancelDialog(false);
    setSelectedOrder(null);
    setCancellationReason("");
  };

  const handleRate = () => {
    if (selectedOrder && onRate) {
      onRate(selectedOrder.id, rating, review);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                rating,
                review,
              }
            : o,
        ),
      );
    }
    setShowRateDialog(false);
    setSelectedOrder(null);
    setRating(5);
    setReview("");
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 20;
      case "confirmed":
        return 40;
      case "processing":
        return 60;
      case "shipped":
        return 80;
      case "delivered":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  const PartyIcon = config.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {config.title}
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Package className="h-3 w-3 mr-1" />
              {orders.length} Total Orders
            </Badge>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Spent"
          value={formatPrice(config.stats.totalSpent)}
          icon={DollarSign}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Pending"
          value={config.stats.pending}
          icon={Clock}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="Processing"
          value={config.stats.processing}
          icon={Package}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Shipped"
          value={config.stats.shipped}
          icon={Truck}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Delivered"
          value={config.stats.delivered}
          icon={CheckCircle2}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <SearchFilter
            placeholder={`Search by order number, ${config.partyLabel.toLowerCase()}...`}
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={partyFilter} onValueChange={setPartyFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={`All ${config.partyLabel}s`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All {config.partyLabel}s
                    </SelectItem>
                    {parties.map((party) => (
                      <SelectItem key={party} value={party}>
                        {party}
                      </SelectItem>
                    ))}
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
          title={`No ${config.type === "purchases" ? "purchase" : "sales"} orders found`}
          description={`You haven't placed any orders with ${config.partyLabel.toLowerCase()}s yet`}
          actionLabel={`Browse ${config.partyLabel}s`}
          actionHref={`/${config.role}${config.partyPath}`}
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
                          : order.status === "confirmed"
                            ? "bg-blue-100"
                            : order.status === "processing"
                              ? "bg-indigo-100"
                              : order.status === "shipped"
                                ? "bg-purple-100"
                                : order.status === "delivered"
                                  ? "bg-green-100"
                                  : "bg-red-100",
                      )}
                    >
                      {order.status === "pending" && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {order.status === "confirmed" && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      )}
                      {order.status === "processing" && (
                        <Package className="h-5 w-5 text-indigo-600" />
                      )}
                      {order.status === "shipped" && (
                        <Truck className="h-5 w-5 text-purple-600" />
                      )}
                      {order.status === "delivered" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {order.status === "cancelled" && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/${config.role}/${config.type === "purchases" ? "purchase-orders" : "orders"}/${order.id}`}
                          className="text-lg font-semibold hover:text-primary"
                        >
                          {order.orderNumber}
                        </Link>
                        <StatusBadge status={order.status} />
                        <StatusBadge status={order.priority} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <PartyIcon className="h-3 w-3 text-blue-600" />
                          </div>
                          <Link
                            to={`/${config.role}${config.partyPath}/${order.partyId}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {order.partyName}
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
                          {order.partyLocation}
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
                      className={paymentStatusColors[order.paymentStatus]}
                    >
                      {order.paymentMethod} • {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Order Progress */}
                {order.status !== "cancelled" &&
                  order.status !== "delivered" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">
                          Order Progress
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getStatusProgress(order.status)}%
                        </span>
                      </div>
                      <Progress
                        value={getStatusProgress(order.status)}
                        className="h-2"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          Pending
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Confirmed
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Processing
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Shipped
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Delivered
                        </span>
                      </div>
                    </div>
                  )}

                {/* Order Items Preview */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">
                      Order Items ({order.items.length})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Est. Delivery: {formatDate(order.estimatedDelivery)}
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

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs font-medium text-purple-800">
                            Tracking Number
                          </p>
                          <p className="text-xs text-purple-600 font-mono">
                            {order.trackingNumber}
                          </p>
                          {order.carrier && (
                            <p className="text-xs text-purple-600">
                              Carrier: {order.carrier}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs bg-white"
                      >
                        Track Shipment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delivery Confirmation */}
                {order.status === "delivered" && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs font-medium text-green-800">
                            Delivered
                          </p>
                          <p className="text-xs text-green-700">
                            Received by: {order.receivedBy} on{" "}
                            {formatDate(order.receivedDate || "")}
                          </p>
                        </div>
                      </div>
                      {config.showRating && order.rating ? (
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">
                            {order.rating}
                          </span>
                        </div>
                      ) : config.showRating && !order.rating ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-white"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRateDialog(true);
                          }}
                        >
                          Rate Order
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Cancellation Info */}
                {order.status === "cancelled" && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-red-800">
                          Order Cancelled
                        </p>
                        <p className="text-xs text-red-700">
                          Reason: {order.cancellationReason}
                        </p>
                        {order.cancelledDate && (
                          <p className="text-xs text-red-600 mt-1">
                            Cancelled on: {formatDate(order.cancelledDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-amber-800">Note</p>
                    <p className="text-xs text-amber-700">{order.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50">
                      Payment: {order.paymentTerms}
                    </Badge>
                    {order.notes && (
                      <Badge variant="outline" className="bg-amber-50">
                        Has Notes
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {config.showCancel && order.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowCancelDialog(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    )}

                    {config.showReorder && order.status === "delivered" && (
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          to={`/${config.role}${config.partyPath}?reorder=${order.id}`}
                        >
                          <Repeat className="h-4 w-4 mr-2" />
                          Reorder
                        </Link>
                      </Button>
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

                    {order.invoiceUrl && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Printer className="h-4 w-4 mr-2" />
                          Print Order
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Contact {config.partyLabel}
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
            <DialogTitle>
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Complete order information and {config.partyLabel.toLowerCase()}{" "}
              details
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6 py-2">
                {/* Party Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <PartyIcon className="h-4 w-4" />
                    {config.partyLabel} Information
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        {config.partyLabel} Name
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.partyName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Contact Person
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.partyContact}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Phone
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.partyPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Location
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.partyLocation}
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
                        Order Number
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.orderNumber}
                      </span>
                    </div>
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
                        Estimated Delivery
                      </span>
                      <span className="text-xs font-medium">
                        {formatDate(selectedOrder.estimatedDelivery)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Payment Terms
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.paymentTerms}
                      </span>
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
                    <h4 className="text-sm font-medium">Notes</h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {selectedOrder.notes}
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
              <Link
                to={`/${config.role}/${config.type === "purchases" ? "purchase-orders" : "orders"}/${selectedOrder?.id}`}
              >
                View Full Order
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {selectedOrder?.orderNumber}{" "}
              from {selectedOrder?.partyName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={cancellationReason}
              onValueChange={setCancellationReason}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cancellation reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Changed requirements">
                  Changed requirements
                </SelectItem>
                <SelectItem value="Found better price">
                  Found better price
                </SelectItem>
                <SelectItem value="Delivery too late">
                  Delivery too late
                </SelectItem>
                <SelectItem value="Ordered by mistake">
                  Ordered by mistake
                </SelectItem>
                <SelectItem value="Supplier issue">Supplier issue</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {cancellationReason === "Other" && (
              <Input
                className="mt-3"
                placeholder="Enter cancellation reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancellationReason}
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rate Order Dialog */}
      <AlertDialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rate & Review</AlertDialogTitle>
            <AlertDialogDescription>
              Share your feedback about order {selectedOrder?.orderNumber}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </Button>
                ))}
                <span className="text-sm ml-2">{rating}/5</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review">Review (Optional)</Label>
              <Input
                id="review"
                placeholder="Write your review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
