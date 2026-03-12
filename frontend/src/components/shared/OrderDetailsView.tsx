import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

import { StatusBadge } from "@/components/shared";
import OrderTrackingDialog from "@/components/shared/OrderTrackingDialog";
import { formatPrice, formatDate, formatDateTime } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export type OrderStatus =
  | "pending"
  | "approved"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "approved" | "paid" | "refunded";

export type OrderParty = {
  id: number | string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  location?: string;
  rating?: number;
  verified?: boolean;
  previousOrders?: number;
};

export type OrderItem = {
  id: number | string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  stockAvailable?: number;
  image?: string | null;
};

export type OrderTimelineItem = {
  status: string;
  date?: string | null;
  completed: boolean;
};

export type OrderDriver = {
  id: number | string;
  name: string;
  vehicle?: string;
  available?: boolean;
  phone?: string;
};

export type OrderDelivery = {
  deliveryId?: string;
  address: string;
  recipient: string;
  phone: string;
  requestedDate?: string;
  estimatedDate?: string;
  actualDate?: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  driverId?: number | string | null;
  driverName?: string | null;
  driverPhone?: string | null;
};

export type OrderDetailsData = {
  id: string;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentTerms: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  notes?: string;
  invoice?: string;
  items: OrderItem[];
  timeline: OrderTimelineItem[];
  delivery: OrderDelivery;
  party: OrderParty;
  drivers?: OrderDriver[];
  canAssignDriver?: boolean;
  canCancel?: boolean;
  canReview?: boolean;
  canReorder?: boolean;
};

export type OrderDetailsLinks = {
  party?: (id: number | string) => string;
  product?: (id: number | string) => string;
  reorder?: (orderId: string) => string;
  message?: (partyId: number | string) => string;
};

type OrderDetailsViewProps = {
  initialOrder: OrderDetailsData;
  mode: "incoming" | "outgoing";
  partyLabel: string;
  links?: OrderDetailsLinks;
  cancelReasonOptions?: string[];
  onAssignDriver?: (deliveryId: string, driverId: string) => Promise<void>;
};

const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({
  initialOrder,
  mode,
  partyLabel,
  links,
  cancelReasonOptions,
  onAssignDriver,
}) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailsData>(initialOrder);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [cancellationReason, setCancellationReason] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
    setNewStatus(initialOrder.status);
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
      default:
        return [];
    }
  };

  const updateOrderStatus = () => {
    setOrder({ ...order, status: newStatus });
    setShowStatusDialog(false);
  };

  const assignDriver = async () => {
    const driver = order.drivers?.find(
      (d) => d.id.toString() === selectedDriver,
    );
    if (driver) {
      if (onAssignDriver && order.delivery?.deliveryId) {
        setAssignLoading(true);
        try {
          await onAssignDriver(order.delivery.deliveryId, driver.id.toString());
          setOrder({
            ...order,
            delivery: {
              ...order.delivery,
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
      } else {
        setOrder({
          ...order,
          delivery: {
            ...order.delivery,
            driverId: driver.id,
            driverName: driver.name,
            driverPhone: driver.phone,
          },
        });
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
        : "pending";

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

              {order.delivery.trackingNumber && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs font-medium text-purple-800">
                          Tracking Number
                        </p>
                        <p className="text-xs text-purple-600 font-mono">
                          {order.delivery.trackingNumber}
                        </p>
                        {order.delivery.carrier && (
                          <p className="text-xs text-purple-600">
                            Carrier: {order.delivery.carrier}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-white"
                      onClick={() => setShowTrackingDialog(true)}
                    >
                      Track Package
                    </Button>
                  </div>
                </div>
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
                  <span className="text-muted-foreground">VAT (15%)</span>
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
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <StatusBadge status={paymentBadgeStatus} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Terms</span>
                  <span className="font-medium">{order.paymentTerms}</span>
                </div>
                {order.invoice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-medium">{order.invoice}</span>
                  </div>
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
                {order.party.contact && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.party.contact}</span>
                  </div>
                )}
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
                    <span>{order.party.location}</span>
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
                  onClick={() => setShowStatusDialog(true)}
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
                    {order.delivery.driverName ? "Change Driver" : "Assign Driver"}
                  </Button>
                )}

              {mode === "outgoing" && order.canReorder && links?.reorder && (
                <Button className="w-full justify-start" asChild>
                  <Link to={links.reorder(order.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reorder Items
                  </Link>
                </Button>
              )}

              {mode === "outgoing" && order.canReview && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowReviewDialog(true)}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Rate & Review
                </Button>
              )}

              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Printer className="mr-2 h-4 w-4" />
                Print Order
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

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the current status of this order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve Order</SelectItem>
                  <SelectItem value="processing">Start Processing</SelectItem>
                  <SelectItem value="shipped">Mark as Shipped</SelectItem>
                  <SelectItem value="delivered">Mark as Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateOrderStatus}>Update Status</Button>
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

      {/* Live Tracking Dialog */}
      <OrderTrackingDialog
        open={showTrackingDialog}
        onOpenChange={setShowTrackingDialog}
        orderId={order.id}
        deliveryId={order.delivery.trackingNumber || undefined}
      />
    </div>
  );
};

export default OrderDetailsView;
