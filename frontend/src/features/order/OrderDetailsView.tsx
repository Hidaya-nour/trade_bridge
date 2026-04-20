import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Download,
  Printer,
  Star,
  RotateCcw,
  MessageSquare,
  User,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { StatusBadge } from "@/components";
import { PlaceOrderDialog } from "@/components/order/PlaceOrderDialog";
import { formatPrice, formatDate, formatDateTime } from "@/lib/formatters";
import { getPaymentMethodLabel } from "@/lib/payment-method-utils";
import { getInitials, cn } from "@/lib/utils";
import deliveryService from "@/services/delivery.service";
import disputeService from "@/services/dispute.service";
import toast from "react-hot-toast";
import type {
  OrderStatus,
  OrderDetailsData,
  OrderDetailsLinks,
} from "@/types/order.types";
import { Textarea } from "@/components/ui/textarea";

type OrderDetailsViewProps = {
  initialOrder: OrderDetailsData;
  mode: "incoming" | "outgoing";
  partyLabel: string;
  links?: OrderDetailsLinks;
  cancelReasonOptions?: string[];
  onAssignDriver?: (deliveryId: string, driverId: string) => Promise<void>;
  onUpdateStatus?: (status: OrderStatus) => Promise<boolean> | boolean | void;
  onApprovePayment?: (
    paymentId: string,
    amountPaid?: number,
  ) => Promise<boolean> | boolean | void;
  onReorderPlaceOrder?: (
    paymentMethod?: string,
    deliveryOption?: string,
  ) => Promise<{
    primaryOrderId: string;
    orderIds?: string[];
    total?: number;
  } | void>;
  onProcessPayment?: (
    orderId: string,
    paymentMethod: string,
    paymentDetails?: any,
    documents?: File[],
  ) => Promise<boolean>;
  ordersPath?: string;
  role?: "retailer" | "distributor" | "factory";
};

const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({
  initialOrder,
  mode,
  partyLabel,
  links,
  cancelReasonOptions,
  onAssignDriver,
  onUpdateStatus,
  onApprovePayment,
  onReorderPlaceOrder,
  onProcessPayment,
  ordersPath,
  role = "retailer",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<OrderDetailsData>(initialOrder);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showReorderDialog, setShowReorderDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [disputeReason, setDisputeReason] = useState<string>("late_delivery");
  const [disputeDescription, setDisputeDescription] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [paymentApproving, setPaymentApproving] = useState(false);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const getStatusProgress = (status: OrderStatus): number => {
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
      case "closed":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  const getNextStatusOptions = (): { value: OrderStatus; label: string }[] => {
    switch (order.status) {
      case "pending":
        return [{ value: "approved", label: "Approve Order" }];
      case "approved":
        return [{ value: "processing", label: "Start Processing" }];
      case "processing":
        return [{ value: "shipped", label: "Mark as Shipped" }];
      case "shipped":
        return [{ value: "delivered", label: "Mark as Delivered" }];
      case "delivered":
        if (order.paymentStatus === "paid") {
          return [{ value: "closed", label: "Close Order" }];
        }
        return [];
      default:
        return [];
    }
  };

  const updateOrderStatus = async (nextStatus: OrderStatus) => {
    if (onUpdateStatus) {
      const result = await onUpdateStatus(nextStatus);
      if (result === false) return;
    }
    setOrder((prev) => ({ ...prev, status: nextStatus }));
  };

  const handleAdvanceStatus = async () => {
    const next = getNextStatusOptions()[0];
    if (!next) return;
    await updateOrderStatus(next.value);
  };

  const handleApprovePayment = async () => {
    if (!onApprovePayment || !order.paymentId) return;
    setPaymentApproving(true);
    try {
      const amountPaid =
        typeof order.paymentAmount === "number" && order.paymentAmount > 0
          ? order.paymentAmount
          : order.total;
      const result = await onApprovePayment(order.paymentId, amountPaid);
      if (result === false) return;
      setOrder((prev) => ({
        ...prev,
        paymentStatus: "paid",
        paymentPaid: amountPaid,
      }));
    } finally {
      setPaymentApproving(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (!order?.id || !order?.party?.id) {
      toast.error("Unable to raise dispute for this order.");
      return;
    }

    const reason = disputeReason.trim();
    const details = disputeDescription.trim();
    if (!details) {
      toast.error("Please describe the issue.");
      return;
    }

    setDisputeSubmitting(true);
    try {
      await disputeService.create({
        order_id: order.id,
        against_user: order.party.id,
        reason,
        description: details,
      });
      toast.success("Dispute raised. Our team will review it.");
      setShowDisputeDialog(false);
      setDisputeReason("late_delivery");
      setDisputeDescription("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to raise dispute. Please try again.",
      );
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const assignDriver = async () => {
    const driver = order.drivers?.find(
      (d) => d.id.toString() === selectedDriver,
    );
    if (driver) {
      setAssignLoading(true);
      try {
        let deliveryId = order.delivery?.deliveryId;
        if (!deliveryId) {
          const createPayload: any = {
            order_id: order.id,
            dropoff_location: order.delivery?.address || "Not provided",
            pickup_location: "Not provided",
          };
          const created = await deliveryService.create(createPayload);
          deliveryId = created?.data?.id || created?.id;
        }

        if (!deliveryId) {
          toast.error("Failed to create delivery record.");
          return;
        }

        if (onAssignDriver) {
          await onAssignDriver(deliveryId, driver.id.toString());
        } else {
          await deliveryService.assignDriver(deliveryId, driver.id.toString());
        }

        setOrder({
          ...order,
          delivery: {
            ...order.delivery,
            deliveryId,
            driverId: driver.id,
            driverName: driver.name,
            driverPhone: driver.phone,
          },
        });
        toast.success(`Driver ${driver.name} assigned.`);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message ||
            "Failed to assign driver. Please try again.",
        );
        return;
      } finally {
        setAssignLoading(false);
      }
    }
    setShowAssignDialog(false);
  };

  const handleCancelOrder = () => {
    setOrder({ ...order, status: "cancelled" });
    setShowCancelDialog(false);
  };

  const getTimelineIcon = (status: string, completed: boolean) => {
    if (!completed) return <Clock className="h-5 w-5 text-gray-300" />;

    switch (status) {
      case "Order Placed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "Order Approved":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      case "Processing":
        return <Package className="h-5 w-5 text-indigo-600" />;
      case "Shipped":
        return <Truck className="h-5 w-5 text-purple-600" />;
      case "Delivered":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-300" />;
    }
  };

  const paymentBadgeStatus =
    order.paymentStatus === "paid"
      ? "paid"
      : order.paymentStatus === "approved"
        ? "approved"
        : order.paymentStatus === "refunded"
          ? "refunded"
          : "pending";
  const paymentMethodLabel =
    !order.paymentMethod || order.paymentMethod === "N/A"
      ? "Not selected"
      : getPaymentMethodLabel(order.paymentMethod);
  const orderBasePath = ordersPath || `/${role}/orders`;
  const receiptUrl = `${orderBasePath}/${order.id}/receipt`;

  const deliveryDates = [
    { label: "Requested Delivery", value: order.delivery.requestedDate },
    { label: "Estimated Delivery", value: order.delivery.estimatedDate },
    {
      label: "Actual Delivery",
      value: order.delivery.actualDate,
      className: "text-green-600",
    },
  ].filter((item) => Boolean(item.value));

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Order {order.id}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground mt-1">
            Placed on {formatDateTime(order.orderDate)}
          </p>
        </div>
      </div>

      {/* Order Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Order Progress</h3>
            <span className="text-sm font-medium">
              {getStatusProgress(order.status)}% Complete
            </span>
          </div>
          <Progress
            value={getStatusProgress(order.status)}
            className="h-2 mb-6"
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {order.timeline.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                    item.completed ? "bg-primary/10" : "bg-muted",
                  )}
                >
                  {getTimelineIcon(item.status, item.completed)}
                </div>
                <p className="text-xs font-medium">{item.status}</p>
                {item.date && (
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(item.date)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{order.items.length} items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-3 hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    <div className="h-16 w-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-8 w-8 text-primary/30" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div>
                          {links?.product ? (
                            <Link
                              to={links.product(item.id)}
                              className="text-sm font-medium hover:text-primary"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <p className="text-sm font-medium">{item.name}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            SKU: {item.sku}
                            {item.stockAvailable !== undefined
                              ? ` - In Stock: ${item.stockAvailable}`
                              : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatPrice(item.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} {item.unit} x{" "}
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Delivery Address
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{order.delivery.address}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{order.delivery.recipient}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{order.delivery.phone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {deliveryDates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deliveryDates.map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.label}
                      </p>
                      <p className={cn("text-sm font-medium", item.className)}>
                        {formatDate(item.value as string)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {order.status === "shipped" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs bg-white"
                  onClick={() =>
                    navigate(
                      `/${role}/tracking/${order.id}?from=${encodeURIComponent(location.pathname)}`,
                    )
                  }
                >
                  Track Driver
                </Button>
              )}

              {order.delivery.driverName && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-blue-800">
                        Delivery Driver
                      </p>
                      <p className="text-xs text-blue-700">
                        {order.delivery.driverName} -{" "}
                        {order.delivery.driverPhone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {mode === "incoming" ? "Customer Notes" : "Order Notes"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mode === "incoming" ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-sm text-amber-800">{order.notes}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - 1 col */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {formatPrice(order.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT</span>
                  <span className="font-medium">{formatPrice(order.tax)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{paymentMethodLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <StatusBadge status={paymentBadgeStatus} />
                </div>
                {typeof order.paymentAmount === "number" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Due</span>
                    <span className="font-medium">
                      {formatPrice(order.paymentAmount)}
                    </span>
                  </div>
                )}
                {typeof order.paymentPaid === "number" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-medium">
                      {formatPrice(order.paymentPaid)}
                    </span>
                  </div>
                )}
                {!order.paymentId && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                    No payment has been submitted yet.
                  </div>
                )}

                {order.paymentProofUrl && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment Proof</span>
                    <Button size="sm" variant="outline" className="h-7" asChild>
                      <a
                        href={order.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Proof
                      </a>
                    </Button>
                  </div>
                )}
                {mode === "incoming" &&
                  order.paymentId &&
                  order.paymentStatus !== "paid" &&
                  order.paymentStatus !== "refunded" && (
                    <Button
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleApprovePayment}
                      disabled={paymentApproving}
                    >
                      {paymentApproving ? "Approving..." : "Approve Payment"}
                    </Button>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Party Information */}
          <Card>
            <CardHeader>
              <CardTitle>{partyLabel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(order.party.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {links?.party ? (
                    <Link
                      to={links.party(order.party.id)}
                      className="text-base font-semibold hover:text-primary"
                    >
                      {order.party.name}
                    </Link>
                  ) : (
                    <p className="text-base font-semibold">
                      {order.party.name}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {typeof order.party.rating === "number" && (
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1">
                          {order.party.rating}
                        </span>
                      </div>
                    )}
                    {typeof order.party.previousOrders === "number" && (
                      <span className="text-xs text-muted-foreground">
                        - {order.party.previousOrders} orders
                      </span>
                    )}
                    {order.party.verified && (
                      <Badge
                        variant="outline"
                        className="h-5 px-1 text-[10px] bg-green-50 text-green-700"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{order.party.contact}</span>
                </div>
                {order.party.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.party.phone}</span>
                  </div>
                )}
                {order.party.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.party.email}</span>
                  </div>
                )}
                {order.party.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{order.party.location.city}</span>
                  </div>
                )}
              </div>

              {links?.message && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to={links.message(order.party.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact {partyLabel}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4 space-y-2">
              {mode === "incoming" && getNextStatusOptions().length > 0 && (
                <Button
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  onClick={handleAdvanceStatus}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {getNextStatusOptions()[0].label}
                </Button>
              )}

              {mode === "incoming" &&
                order.canAssignDriver &&
                order.status === "processing" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowAssignDialog(true)}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    {order.delivery.driverName
                      ? "Change Driver"
                      : "Assign Driver"}
                  </Button>
                )}

              {mode === "outgoing" &&
                order.canReorder &&
                onReorderPlaceOrder && (
                  <Button
                    className="w-full justify-start"
                    onClick={() => setShowReorderDialog(true)}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reorder Items
                  </Button>
                )}

              {mode === "outgoing" &&
                (order.status === "delivered" || order.status === "closed") && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowReviewDialog(true)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Rate & Review
                  </Button>
                )}

              {mode === "outgoing" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowDisputeDialog(true)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Raise Dispute
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link to={receiptUrl}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`${receiptUrl}?print=1`)}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>

              {order.canCancel && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelReasonOptions?.length
                ? "Are you sure you want to cancel this order? Please provide a reason."
                : "Are you sure you want to cancel this order? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {cancelReasonOptions?.length ? (
            <div className="py-4">
              <Label>Reason</Label>
              <Select
                value={cancellationReason}
                onValueChange={setCancellationReason}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {cancelReasonOptions.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={
                Boolean(cancelReasonOptions?.length) && !cancellationReason
              }
              onClick={handleCancelOrder}
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Raise Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise a Dispute</DialogTitle>
            <DialogDescription>
              Tell us what went wrong so we can help resolve it quickly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={disputeReason} onValueChange={setDisputeReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="late_delivery">Late delivery</SelectItem>
                  <SelectItem value="damaged_items">Damaged items</SelectItem>
                  <SelectItem value="wrong_items">Wrong items</SelectItem>
                  <SelectItem value="missing_items">Missing items</SelectItem>
                  <SelectItem value="quality_issue">Quality issue</SelectItem>
                  <SelectItem value="payment_issue">Payment issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                placeholder="Describe the issue (include item names, quantities, and any evidence you have)."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              disabled={disputeSubmitting}
              onClick={() => setShowDisputeDialog(false)}
            >
              Cancel
            </Button>
            <Button disabled={disputeSubmitting} onClick={handleRaiseDispute}>
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
            <DialogDescription>
              Select a driver for this delivery
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Available Drivers</Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {order.drivers
                    ?.filter((d) => d.available !== false)
                    .map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.name}
                        {driver.vehicle ? ` - ${driver.vehicle}` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
              onClick={assignDriver}
              disabled={!selectedDriver || assignLoading}
            >
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rate & Review</DialogTitle>
            <DialogDescription>
              Share your feedback about this order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300",
                      )}
                    />
                  </button>
                ))}
                <span className="text-sm ml-2">{rating}/5</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="review" className="text-sm font-medium">
                Review (Optional)
              </label>
              <textarea
                id="review"
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Tell us about your experience..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setShowReviewDialog(false)}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reorder Dialog */}
      {onReorderPlaceOrder && (
        <PlaceOrderDialog
          open={showReorderDialog}
          onOpenChange={setShowReorderDialog}
          items={order.items.map((item) => ({
            id: String(item.id),
            order_id: "",
            product_id: item.productId || String(item.id),
            quantity: item.quantity,
            unit_price: item.price,
            product: {
              id: item.productId || String(item.id),
              name: item.name,
              unit_type: item.unit,
            } as any,
          }))}
          summary={{
            subtotal: order.subtotal,
            shipping: order.shipping,
            discount: 0,
            tax: order.tax,
            total: order.total,
            promoApplied: false,
            vatPercentage:
              order.subtotal > 0 && order.tax > 0
                ? Number((order.tax / order.subtotal).toFixed(4))
                : 0,
          }}
          config={{
            role,
            ordersPath: ordersPath || "/orders",
          }}
          onPlaceOrder={onReorderPlaceOrder}
          onProcessPayment={onProcessPayment as any}
        />
      )}
    </div>
  );
};

export default OrderDetailsView;
