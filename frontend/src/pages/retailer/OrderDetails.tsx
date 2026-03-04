import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  FileText,
  Download,
  Printer,
  Star,
  RotateCcw,
  MessageSquare,
  Building2,
  User,
  CreditCard,
  ChevronRight,
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { StatusBadge } from "@/components/shared";
import { formatPrice, formatDate, formatDateTime } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";

// ============================================================================
// MOCK DATA (would come from API)
// ============================================================================

const mockOrder = {
  id: "TB-2026-0892",
  orderDate: "2026-02-10T10:30:00",
  status: "pending" as const,
  paymentStatus: "paid" as const,
  paymentMethod: "Credit",
  paymentTerms: "30 days",
  subtotal: 12750,
  shipping: 600,
  tax: 1912.5,
  total: 15262.5,
  notes: "Please deliver during business hours.",

  supplier: {
    id: 101,
    name: "Ethiopia Coffee Export",
    contact: "Bereket Tesfaye",
    phone: "+251 11 345 6789",
    email: "bereket.t@ethiopiacoffee.com",
    location: "Addis Ababa",
    verified: true,
    rating: 4.9,
  },

  delivery: {
    address: "Bole Road, Near Edna Mall, Adama",
    recipient: "Hidaya Nurmeika",
    phone: "+251 91 234 5678",
    requestedDate: "2026-02-15",
    estimatedDate: "2026-02-13",
    actualDate: "2026-02-12",
    trackingNumber: "TRK-7892-01",
    carrier: "Ethiopia Logistics",
    driverName: "Abebe Kebede",
    driverPhone: "+251 91 234 5678",
    signature: "signature_7892.png",
  },

  items: [
    {
      id: 1,
      name: "Yirgacheffe Coffee",
      sku: "COF-004",
      quantity: 15,
      unit: "kg",
      price: 450,
      total: 6750,
      image: null,
    },
    {
      id: 2,
      name: "White Teff Flour",
      sku: "TFF-001",
      quantity: 50,
      unit: "kg",
      price: 120,
      total: 6000,
      image: null,
    },
  ],

  timeline: [
    { status: "Order Placed", date: "2026-02-10T10:30:00", completed: true },
    { status: "Order Approved", date: "2026-02-10T14:20:00", completed: true },
    { status: "Processing", date: "2026-02-11T09:15:00", completed: true },
    { status: "Shipped", date: "2026-02-12T08:30:00", completed: true },
    { status: "Delivered", date: "2026-02-12T14:30:00", completed: true },
  ],

  canReview: true,
  canReorder: true,
  canCancel: false,
  invoice: "#INV-2026-0892",
};

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  // In real app, fetch order by id
  const order = mockOrder;

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
            <StatusBadge
              status={order.paymentStatus === "paid" ? "paid" : "pending"}
            />
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
                {item.completed && (
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
                          <Link
                            to={`/retailer/products/${item.id}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-1">
                            SKU: {item.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatPrice(item.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} {item.unit} ×{" "}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Requested Delivery
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(order.delivery.requestedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Estimated Delivery
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(order.delivery.estimatedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Actual Delivery
                  </p>
                  <p className="text-sm font-medium text-green-600">
                    {formatDate(order.delivery.actualDate)}
                  </p>
                </div>
              </div>

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
                        <p className="text-xs text-purple-600">
                          Carrier: {order.delivery.carrier}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-white"
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
                        {order.delivery.driverName} •{" "}
                        {order.delivery.driverPhone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
                  <StatusBadge
                    status={order.paymentStatus === "paid" ? "paid" : "pending"}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Terms</span>
                  <span className="font-medium">{order.paymentTerms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-medium">{order.invoice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(order.supplier.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    to={`/retailer/suppliers/${order.supplier.id}`}
                    className="text-base font-semibold hover:text-primary"
                  >
                    {order.supplier.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs ml-1">
                        {order.supplier.rating}
                      </span>
                    </div>
                    {order.supplier.verified && (
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
                  <span>{order.supplier.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{order.supplier.location}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link to={`/messages?supplier=${order.supplier.id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Supplier
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {order.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4 space-y-2">
              {order.canReorder && (
                <Button className="w-full justify-start" asChild>
                  <Link to={`/retailer/reorder?order=${order.id}`}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reorder Items
                  </Link>
                </Button>
              )}

              {order.canReview && (
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
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </div>
  );
};

export default OrderDetailsPage;
