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
  Flag,
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
import driverIssueService from "@/services/driver-issue.service";
import disputeService from "@/services/dispute.service";
import orderService from "@/services/order.service";
import { reportService } from "@/services/report.service";
import toast from "react-hot-toast";
import type {
  OrderStatus,
  OrderDetailsData,
  OrderDetailsLinks,
  DeliveryStatus,
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
    deliveryAddress?: string,
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
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState<string>("fraud");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [deliveryRecord, setDeliveryRecord] = useState<any | null>(null);
  const [deliveryFetching, setDeliveryFetching] = useState(false);
  const [driverIssueReports, setDriverIssueReports] = useState<any[]>([]);
  const [driverIssueLoading, setDriverIssueLoading] = useState(false);
  const [driverIssueError, setDriverIssueError] = useState<string | null>(null);
  const [driverReview, setDriverReview] = useState<any | null>(null);
  const [driverReviewLoading, setDriverReviewLoading] = useState(false);
  const [showDriverReviewDialog, setShowDriverReviewDialog] = useState(false);
  const [driverRating, setDriverRating] = useState(5);
  const [driverReviewComment, setDriverReviewComment] = useState("");
  const [driverReviewSubmitting, setDriverReviewSubmitting] = useState(false);

  const availableDrivers = (order.drivers || []).filter(
    (d) => d && d.available !== false,
  );

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  useEffect(() => {
    const deliveryId = order.delivery?.deliveryId;
    if (!deliveryId) {
      setDeliveryRecord(null);
      return;
    }

    let cancelled = false;
    setDeliveryFetching(true);
    (async () => {
      try {
        const res = await deliveryService.getById(String(deliveryId));
        const nextDelivery =
          res?.data?.delivery || res?.data || res?.delivery || null;
        if (!cancelled) setDeliveryRecord(nextDelivery);
      } catch {
        if (!cancelled) setDeliveryRecord(null);
      } finally {
        if (!cancelled) setDeliveryFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [order.delivery?.deliveryId]);

  useEffect(() => {
    if (!order?.id) {
      setDriverIssueReports([]);
      setDriverIssueError(null);
      return;
    }

    let cancelled = false;
    setDriverIssueLoading(true);
    setDriverIssueError(null);

    (async () => {
      try {
        const res = await driverIssueService.getForOrder(String(order.id));
        const reports = Array.isArray(res?.data?.reports)
          ? res.data.reports
          : [];
        if (!cancelled) setDriverIssueReports(reports);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load driver issues";
        if (!cancelled) {
          setDriverIssueReports([]);
          setDriverIssueError(message);
        }
      } finally {
        if (!cancelled) setDriverIssueLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [order?.id]);

  useEffect(() => {
    if (!order?.id) {
      setDriverReview(null);
      return;
    }

    if (mode !== "outgoing") {
      setDriverReview(null);
      return;
    }

    if (role !== "retailer" && role !== "distributor") {
      setDriverReview(null);
      return;
    }

    let cancelled = false;
    setDriverReviewLoading(true);

    (async () => {
      try {
        const res = await orderService.getDriverReview(String(order.id));
        const review = res?.data?.review || null;
        if (!cancelled) setDriverReview(review);
      } catch {
        if (!cancelled) setDriverReview(null);
      } finally {
        if (!cancelled) setDriverReviewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, order?.id, role]);

  const getDeliveryStatusBadge = (status?: DeliveryStatus | string | null) => {
    const raw = String(status || "")
      .trim()
      .toLowerCase();
    if (!raw) return <StatusBadge status={"pending" as any} />;

    const normalized = raw.replace(/_/g, "-");
    return <StatusBadge status={normalized as any} />;
  };

  const normalizeTel = (value?: string | null) => {
    const raw = String(value || "").trim();
    if (!raw) return null;
    return raw;
  };

  const normalizeWhatsapp = (value?: string | null) => {
    const raw = String(value || "");
    const digits = raw.replace(/[^\d]/g, "");
    return digits ? digits : null;
  };

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

  const handleSubmitReport = async () => {
    if (!order?.id || !order?.party?.id) {
      toast.error("Unable to submit report right now.");
      return;
    }

    const reason = reportReason.trim();
    const details = reportDescription.trim();

    if (!reason) {
      toast.error("Please select a report reason.");
      return;
    }

    if (!details) {
      toast.error("Please describe what happened.");
      return;
    }

    setReportSubmitting(true);
    try {
      await reportService.create({
        reported_user_id: order.party.id,
        reason,
        description: details,
        order_id: order.id,
      });
      toast.success("Report submitted. Our team will review it.");
      setShowReportDialog(false);
      setReportReason("fraud");
      setReportDescription("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to submit report. Please try again.",
      );
    } finally {
      setReportSubmitting(false);
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
            pickup_location: "",
          };
          const created = await deliveryService.create(createPayload);
          deliveryId =
            created?.data?.delivery?.id || created?.data?.id || created?.id;
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

  const effectivePickupLocation =
    deliveryRecord?.pickup_location ||
    (order.delivery as any)?.pickupLocation ||
    "Not provided";
  const effectiveDeliveryStatus =
    deliveryRecord?.status || (order.delivery as any)?.status || "pending";
  const effectiveDriverName =
    deliveryRecord?.driver?.driverUser?.full_name ||
    deliveryRecord?.driver?.full_name ||
    order.delivery?.driverName ||
    null;
  const effectiveDriverPhone =
    deliveryRecord?.driver?.driverUser?.phone ||
    deliveryRecord?.driver?.phone ||
    order.delivery?.driverPhone ||
    null;
  const effectiveDriverUserId =
    deliveryRecord?.driver?.driverUser?.id || order.delivery?.driverUserId || null;
  const telPhone = normalizeTel(effectiveDriverPhone);
  const waPhone = normalizeWhatsapp(effectiveDriverPhone);
  const driverChatLink = effectiveDriverUserId
    ? `/messages?user=${encodeURIComponent(String(effectiveDriverUserId))}&order=${encodeURIComponent(order.id)}`
    : null;

  const canRateDriver =
    mode === "outgoing" &&
    (role === "retailer" || role === "distributor") &&
    String(effectiveDeliveryStatus || "")
      .trim()
      .toLowerCase() === "delivered" &&
    Boolean(effectiveDriverName || effectiveDriverPhone);

  const handleSubmitDriverReview = async () => {
    if (!order?.id || driverReviewSubmitting) return;

    setDriverReviewSubmitting(true);
    try {
      const payload = {
        rating: driverRating,
        comment: driverReviewComment.trim() || undefined,
      };
      const res = await orderService.submitDriverReview(String(order.id), payload);
      const review = res?.data?.review || null;
      setDriverReview(review);
      toast.success("Driver rated successfully.");
      setShowDriverReviewDialog(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit driver rating.";
      toast.error(message);
    } finally {
      setDriverReviewSubmitting(false);
    }
  };

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
                    Pickup Location
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{effectivePickupLocation}</p>
                  </div>
                </div>
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
                  <p className="text-xs text-muted-foreground">
                    Delivery Status
                  </p>
                  <div className="flex items-center gap-2">
                    {deliveryFetching ? (
                      <Badge variant="outline">Loading...</Badge>
                    ) : (
                      getDeliveryStatusBadge(effectiveDeliveryStatus)
                    )}
                  </div>
                </div>
                {mode === "incoming" && (
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
                )}
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

              {(effectiveDriverName || effectiveDriverPhone) && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-800">
                          Delivery Driver
                        </p>
                        <p className="text-xs text-blue-700">
                          {[effectiveDriverName, effectiveDriverPhone]
                            .filter(Boolean)
                            .join(" - ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      {canRateDriver ? (
                        driverReviewLoading ? (
                          <Badge variant="outline" className="h-7 text-xs bg-white">
                            Loading ratingâ€¦
                          </Badge>
                        ) : driverReview ? (
                          <Badge variant="outline" className="h-7 text-xs bg-white">
                            <Star className="h-3.5 w-3.5 mr-1.5 fill-yellow-400 text-yellow-400" />
                            {Number(driverReview.rating || 0)}/5
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs bg-white"
                            onClick={() => {
                              setDriverRating(5);
                              setDriverReviewComment("");
                              setShowDriverReviewDialog(true);
                            }}
                          >
                            <Star className="h-3.5 w-3.5 mr-1.5" />
                            Rate Driver
                          </Button>
                        )
                      ) : null}
                      {driverChatLink ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-white"
                          asChild
                        >
                          <Link to={driverChatLink}>
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            Message
                          </Link>
                        </Button>
                      ) : null}
                      {waPhone ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-white"
                          asChild
                        >
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                            WhatsApp
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Driver Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Driver Issues</CardTitle>
              <CardDescription>
                Reports submitted by the assigned driver for this order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {driverIssueLoading ? (
                <Badge variant="outline">Loading driver issues…</Badge>
              ) : driverIssueError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {driverIssueError}
                </div>
              ) : driverIssueReports.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No driver issues have been reported for this order.
                </div>
              ) : (
                driverIssueReports.map((report) => (
                  <div
                    key={String(report.id)}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <p className="text-sm font-medium">
                            {String(report.category || "issue")}
                          </p>
                          {report.urgency ? (
                            <Badge variant="secondary">
                              {String(report.urgency)}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {String(report.sub_type || "")}
                        </p>
                        {report.driverUser ? (
                          <p className="text-xs text-muted-foreground">
                            Driver:{" "}
                            {report.driverUser.business_name ||
                              report.driverUser.full_name ||
                              report.driver_id}
                          </p>
                        ) : null}
                      </div>

                      {report.created_at ? (
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(String(report.created_at))}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-2 space-y-2">
                      {report.location ? (
                        <div className="text-xs text-muted-foreground">
                          Location: {String(report.location)}
                        </div>
                      ) : null}
                      {report.concerned_party ? (
                        <div className="text-xs text-muted-foreground">
                          Concerned party: {String(report.concerned_party)}
                        </div>
                      ) : null}
                      {report.description ? (
                        <div className="text-sm">
                          {String(report.description)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
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

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowReportDialog(true)}
              >
                <Flag className="h-4 w-4 mr-2" />
                Report {partyLabel}
              </Button>
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

      {/* Report User Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {partyLabel}</DialogTitle>
            <DialogDescription>
              Submit a report so admins can investigate repeated issues and take
              action if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fraud">Fraud / Scam</SelectItem>
                  <SelectItem value="payment_issue">Payment issue</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea
                placeholder="Describe what happened (include dates, amounts, evidence details, etc.)"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
              disabled={reportSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmitReport()}
              disabled={reportSubmitting}
            >
              {reportSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

          {availableDrivers.length === 0 &&
          (role === "distributor" || role === "factory") ? (
            <div className="space-y-3 py-4">
              <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">No drivers available</div>
                  <div className="text-muted-foreground">
                    Add or link at least one driver before assigning deliveries.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Available Drivers</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.name}
                        {driver.vehicle ? ` - ${driver.vehicle}` : ""}
                        {driver.phone ? ` - ${driver.phone}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            {availableDrivers.length === 0 &&
            (role === "distributor" || role === "factory") ? (
              <Button
                onClick={() => {
                  setShowAssignDialog(false);
                  navigate(`/${role}/delivery?tab=drivers`);
                }}
              >
                Manage Drivers
              </Button>
            ) : (
              <Button
                onClick={assignDriver}
                disabled={!selectedDriver || assignLoading}
              >
                Assign Driver
              </Button>
            )}
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

      {/* Driver Rating Dialog */}
      <Dialog
        open={showDriverReviewDialog}
        onOpenChange={setShowDriverReviewDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Rate Driver</DialogTitle>
            <DialogDescription>
              Share feedback about your delivery experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDriverRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        star <= driverRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300",
                      )}
                    />
                  </button>
                ))}
                <span className="text-sm ml-2">{driverRating}/5</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverReview" className="text-sm font-medium">
                Comment (Optional)
              </Label>
              <Textarea
                id="driverReview"
                rows={4}
                placeholder="e.g., on time, professional, careful with items..."
                value={driverReviewComment}
                onChange={(e) => setDriverReviewComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDriverReviewDialog(false)}
              disabled={driverReviewSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitDriverReview} disabled={driverReviewSubmitting}>
              Submit Rating
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
