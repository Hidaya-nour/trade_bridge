import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Download,
  Calendar,
  MapPin,
  Repeat,
  Star,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Progress } from "@/components/ui/progress";
import {
  StatusBadge,
  EmptyState,
  PaginationBar,
  StatsCard,
  PaymentDialog,
  type PaymentMethod,
  type PaymentDetails,
} from "@/components/shared";
import { formatPrice, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import type { Order } from "@/types/order.types";
import toast from "react-hot-toast";

interface OrderListProps {
  config: {
    role: "retailer" | "distributor";
    type: "sales" | "purchases";
    title: string;
    description: string;
    partyLabel: string;
    partyPath: string;
    icon: React.ElementType;
    showRating: boolean;
    showReorder: boolean;
    showCancel: boolean;
    stats: {
      totalSpent: number;
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
    };
    paymentConfig?: {
      vatPercentage?: number;
      bankAccounts?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        branch?: string;
      }[];
      creditTerms?: {
        enabled: boolean;
        maxCreditAmount?: number;
        dueDays?: number;
        interestRate?: number;
      };
      chapaEnabled?: boolean;
    };
  };
  orders?: Order[];
  onCancelOrder?: (orderId: string, reason: string) => void | Promise<boolean>;
  onReorder?: (order: Order) => void;
  onRateProduct?: (
    productId: string,
    rating: number,
    review: string,
    orderId: string,
  ) => void;
  onProcessPayment?: (
    orderId: string,
    paymentMethod: string,
    paymentDetails?: any,
    documents?: File[],
  ) => Promise<boolean>;
  isLoading?: boolean;
  error?: string | null;
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export const OrderList: React.FC<OrderListProps> = ({
  config,
  orders: propOrders = [],
  onCancelOrder,
  onReorder,
  onRateProduct,
  onProcessPayment,
  isLoading = false,
  error = null,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    orderId: string;
  } | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [ratedProducts, setRatedProducts] = useState<
    Record<string, { rating: number; review: string }>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, supplierFilter]);

  // Get unique suppliers for filter
  const suppliers = Array.from(
    new Set(
      propOrders
        .map(
          (order) =>
            order.supplier?.business_name ||
            order.supplier?.full_name ||
            "Unknown",
        )
        .filter(Boolean),
    ),
  ).sort();

  // Filter orders
  const filteredOrders = propOrders.filter((order) => {
    const supplierName =
      order.supplier?.business_name || order.supplier?.full_name || "Unknown";

    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.order_status === statusFilter;
    const matchesSupplier =
      supplierFilter === "all" || supplierName === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  // Check if order needs payment (no payment record OR payment status is pending/failed)
  const needsPayment = (order: Order): boolean => {
    if (order.order_status === "cancelled") {
      return false;
    }

    // Cash on delivery does not require an online "Pay Now" action.
    if (
      order.payment?.payment_method === "cash" &&
      order.payment.payment_status === "pending"
    ) {
      return false;
    }

    // If there's no payment record at all, it needs payment
    if (!order.payment) {
      return true;
    }
    // If there is a payment record, check if it's pending or failed
    return ["pending", "failed"].includes(order.payment.payment_status);
  };

  // Handle payment submission
  const handlePaymentSubmit = async (
    method: PaymentMethod,
    details: PaymentDetails,
    documents?: File[],
  ): Promise<boolean> => {
    if (!selectedOrder || !onProcessPayment) return false;

    setPaymentProcessing(true);
    try {
      const success = await onProcessPayment(
        selectedOrder.id,
        method,
        details,
        documents,
      );

      if (success) {
        toast.success(
          method === "credit"
            ? "Credit request submitted successfully! Awaiting approval."
            : "Payment processed successfully!",
        );
        return true;
      } else {
        toast.error("Payment failed. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error((error as Error)?.message || "Failed to process payment");
      return false;
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (selectedOrder) {
      await onCancelOrder?.(selectedOrder.id, cancellationReason);
    }
    setShowCancelDialog(false);
    setSelectedOrder(null);
    setCancellationReason("");
  };

  const handleRateProduct = () => {
    if (selectedProduct) {
      onRateProduct?.(
        selectedProduct.id,
        rating,
        review,
        selectedProduct.orderId,
      );
      setRatedProducts((prev) => ({
        ...prev,
        [selectedProduct.id]: { rating, review },
      }));
      toast.success("Thank you for your review!");
    }
    setShowRateDialog(false);
    setSelectedProduct(null);
    setRating(5);
    setReview("");
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 20;
      case "approved":
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

  // Check if a product has been rated
  const isProductRated = (productId: string) => {
    return !!ratedProducts[productId];
  };

  const getStatsCards = (config: OrderListProps["config"], orders: Order[]) => [
    {
      title: "Pending",
      value: config.stats.pending,
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Approved",
      value: orders.filter((o) => o.order_status === "approved").length,
      icon: CheckCircle2,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Shipped",
      value: config.stats.shipped,
      icon: Truck,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Delivered",
      value: config.stats.delivered,
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

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
              {propOrders.length} Total Orders
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {getStatsCards(config, propOrders).map((card, index) => (
          <StatsCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Loading orders...
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={`Search by order number or ${config.partyLabel.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={`All ${config.partyLabel}s`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {config.partyLabel}s</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {sortedOrders.length === 0 ? 0 : indexOfFirstItem + 1}-
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
                        order.order_status === "pending"
                          ? "bg-yellow-100"
                          : order.order_status === "approved"
                            ? "bg-blue-100"
                            : order.order_status === "processing"
                              ? "bg-indigo-100"
                              : order.order_status === "shipped"
                                ? "bg-purple-100"
                                : order.order_status === "delivered"
                                  ? "bg-green-100"
                                  : "bg-red-100",
                      )}
                    >
                      {order.order_status === "pending" && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {order.order_status === "approved" && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      )}
                      {order.order_status === "processing" && (
                        <Package className="h-5 w-5 text-indigo-600" />
                      )}
                      {order.order_status === "shipped" && (
                        <Truck className="h-5 w-5 text-purple-600" />
                      )}
                      {order.order_status === "delivered" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {order.order_status === "cancelled" && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/${config.role}/${config.type === "purchases" ? "purchase-orders" : "orders"}/${order.id}`}
                          className="text-lg font-semibold hover:text-primary"
                        >
                          Order #{order.id.slice(-8)}
                        </Link>
                        <StatusBadge status={order.order_status} />
                        {/* Payment Status Badge - only show if payment exists */}
                        {order.payment && (
                          <Badge
                            variant="outline"
                            className={
                              paymentStatusColors[order.payment.payment_status]
                            }
                          >
                            Payment: {order.payment.payment_status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <config.icon className="h-3 w-3 text-blue-600" />
                          </div>
                          <Link
                            to={`/${config.role}${config.partyPath}/${order.supplier_id}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {order.supplier?.business_name ||
                              order.supplier?.full_name ||
                              "Unknown"}
                          </Link>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Ordered: {formatDate(order.created_at)}
                        </span>
                        {order.delivery && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {order.delivery.dropoff_location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(order.total_price)}
                    </p>
                    {/* Payment method badge - only show if payment exists */}
                    {order.payment && (
                      <Badge
                        variant="outline"
                        className={
                          paymentStatusColors[order.payment.payment_status]
                        }
                      >
                        {order.payment.payment_method} •{" "}
                        {order.payment.payment_status}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Payment Reminder for Unpaid Orders */}
                {needsPayment(order) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-yellow-800 mb-1">
                          Payment Required
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          {!order.payment
                            ? "This order requires payment to proceed. Complete your payment to process the order."
                            : "Your payment is pending. Complete the payment to process your order."}
                        </p>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowPaymentDialog(true);
                            }}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </Button>
                          <p className="text-xs text-yellow-600">
                            Amount due: {formatPrice(order.total_price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Progress */}
                {order.order_status !== "cancelled" &&
                  order.order_status !== "delivered" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">
                          Order Progress
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getStatusProgress(order.order_status)}%
                        </span>
                      </div>
                      <Progress
                        value={getStatusProgress(order.order_status)}
                        className="h-2"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          Pending
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Approved
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

                {/* Order Items with Product Ratings */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">
                        Order Items ({order.items.length})
                      </span>
                      {order.delivery?.completed_at && (
                        <span className="text-xs text-muted-foreground">
                          Delivered: {formatDate(order.delivery.completed_at)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => {
                        const productId = item.product_id;
                        const isRated = isProductRated(productId);
                        const productRating = ratedProducts[productId];

                        return (
                          <div key={idx} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {item.product?.name ||
                                      `Product ${item.product_id}`}{" "}
                                    x{item.quantity}{" "}
                                    {item.product?.unit_type || "unit"}
                                  </span>
                                  <span className="font-medium">
                                    {formatPrice(
                                      item.quantity * item.unit_price,
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Rating button for delivered orders */}
                              {config.showRating &&
                                order.order_status === "delivered" &&
                                !isRated && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="ml-2 h-7 text-xs"
                                    onClick={() => {
                                      setSelectedProduct({
                                        id: productId,
                                        name:
                                          item.product?.name ||
                                          `Product ${item.product_id}`,
                                        orderId: order.id,
                                      });
                                      setShowRateDialog(true);
                                    }}
                                  >
                                    <Star className="h-3 w-3 mr-1" />
                                    Rate
                                  </Button>
                                )}

                              {/* Show rating if already rated */}
                              {isRated && (
                                <div className="flex items-center gap-1 ml-2 bg-yellow-50 px-2 py-1 rounded">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium">
                                    {productRating?.rating}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Show review if exists */}
                            {isRated && productRating?.review && (
                              <p className="text-xs text-muted-foreground pl-2 border-l-2 border-gray-200">
                                "{productRating.review}"
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tracking Info */}
                {order.delivery && order.delivery.id && (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs font-medium text-purple-800">
                            Tracking Number
                          </p>
                          <p className="text-xs text-purple-600 font-mono">
                            {order.delivery.id}
                          </p>
                          {order.delivery.driver && (
                            <p className="text-xs text-purple-600">
                              Driver: {order.delivery.driver.full_name}
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
                {order.order_status === "delivered" && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs font-medium text-green-800">
                          Delivered
                        </p>
                        <p className="text-xs text-green-700">
                          {order.delivery?.completed_at && (
                            <>
                              Delivered on:{" "}
                              {formatDate(order.delivery.completed_at)}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancellation Info */}
                {order.order_status === "cancelled" && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-red-800">
                          Order Cancelled
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {order.items && order.items.length > 0 && (
                      <Badge variant="outline" className="bg-blue-50">
                        {order.items.length} items
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Payment Button for Unpaid Orders */}
                    {needsPayment(order) && (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowPaymentDialog(true);
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    )}

                    {config.showCancel && order.order_status === "pending" && (
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

                    {config.showReorder &&
                      order.order_status === "delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReorder?.(order)}
                        >
                          <Repeat className="h-4 w-4 mr-2" />
                          Reorder
                        </Button>
                      )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.location.href = `/${config.role}/${config.type === "purchases" ? "purchase-orders" : "orders"}/${order.id}`;
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
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

      {/* Payment Dialog */}
      {selectedOrder && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.id.slice(-8)}
          amount={selectedOrder.total_price}
          onPaymentSubmit={handlePaymentSubmit}
          isProcessing={paymentProcessing}
          config={{
            allowedMethods: [
              "cash",
              "credit",
              "cheque",
              "mobile_banking",
              "chapa",
            ],
            creditTerms: config.paymentConfig?.creditTerms || {
              enabled: true,
              maxCreditAmount: 50000,
              dueDays: 30,
              interestRate: 2.5,
            },
            bankAccounts: config.paymentConfig?.bankAccounts || [
              {
                bankName: "Commercial Bank of Ethiopia",
                accountNumber: "1000134567890",
                accountName: "TradeBridge Trading PLC",
                branch: "Head Office",
              },
            ],
            chapaEnabled: config.paymentConfig?.chapaEnabled || true,
            requireApprovalFor: ["credit"],
            maxDocumentSize: 5,
          }}
        />
      )}

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order #
              {selectedOrder?.id.slice(-8)} from{" "}
              {selectedOrder?.supplier?.business_name ||
                selectedOrder?.supplier?.full_name}
              ?
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

      {/* Rate Product Dialog */}
      <AlertDialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rate Product</AlertDialogTitle>
            <AlertDialogDescription>
              Share your feedback about {selectedProduct?.name}
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
              onClick={handleRateProduct}
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
