import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Printer,
  Star,
  User,
  CreditCard,
  Store,
  Shield,
  ChevronRight,
  Edit,
  Save,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { StatusBadge } from "@/components/shared";
import { formatPrice, formatDate, formatDateTime } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type OrderStatus =
  | "pending"
  | "approved"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
type PaymentStatus = "pending" | "approved" | "paid" | "refunded";

// ============================================================================
// MOCK DATA (would come from API)
// ============================================================================

const mockOrder = {
  id: "ORD-2026-0892",
  orderDate: "2026-02-10T10:30:00",
  status: "processing" as OrderStatus,
  paymentStatus: "approved" as PaymentStatus,
  paymentMethod: "Credit",
  paymentTerms: "30 days",
  subtotal: 12750,
  shipping: 600,
  tax: 1912.5,
  total: 15262.5,
  notes: "Urgent delivery requested. Business running low on stock.",

  customer: {
    id: 201,
    name: "ABC Retail Shop",
    contact: "Hidaya Nurmeika",
    phone: "+251 91 234 5678",
    email: "hidaya@abcretail.com",
    location: "Adama, Bole Road",
    rating: 4.8,
    previousOrders: 12,
    verified: true,
  },

  delivery: {
    address: "Bole Road, Near Edna Mall, Adama",
    recipient: "Hidaya Nurmeika",
    phone: "+251 91 234 5678",
    requestedDate: "2026-02-15",
    estimatedDate: "2026-02-18",
    driverId: null as number | null,
    driverName: null as string | null,
    driverPhone: null as string | null,
    trackingNumber: null as string | null,
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
      stockAvailable: 2450,
    },
    {
      id: 2,
      name: "White Teff Flour",
      sku: "TFF-001",
      quantity: 50,
      unit: "kg",
      price: 120,
      total: 6000,
      stockAvailable: 5200,
    },
  ],

  timeline: [
    { status: "Order Placed", date: "2026-02-10T10:30:00", completed: true },
    { status: "Order Approved", date: "2026-02-10T14:20:00", completed: true },
    { status: "Processing", date: "2026-02-11T09:15:00", completed: true },
    { status: "Shipped", date: null as string | null, completed: false },
    { status: "Delivered", date: null as string | null, completed: false },
  ],

  drivers: [
    { id: 301, name: "Abebe Kebede", vehicle: "Truck", available: true },
    { id: 302, name: "Tigist Haile", vehicle: "Van", available: true },
    { id: 303, name: "Almaz Worku", vehicle: "Truck", available: false },
  ],

  canProcess: true,
  canAssignDriver: true,
  canCancel: true,
  invoice: "#INV-2026-0892",
};

// Type for the order state
type OrderType = typeof mockOrder;

const DistributorOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderType>(mockOrder);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [cancellationReason, setCancellationReason] = useState("");

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

  const assignDriver = () => {
    const driver = order.drivers.find(
      (d) => d.id.toString() === selectedDriver,
    );
    if (driver) {
      setOrder({
        ...order,
        delivery: {
          ...order.delivery,
          driverId: driver.id,
          driverName: driver.name,
          driverPhone: "+251 91 234 5678", // Mock phone
          trackingNumber: `TRK-${order.id}-01`,
        },
        status: "shipped",
      });
    }
    setShowAssignDialog(false);
  };

  const handleCancelOrder = () => {
    // In a real app, you'd call an API here
    setOrder({ ...order, status: "cancelled" });
    setShowCancelDialog(false);
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
              status={order.paymentStatus === "paid" ? "paid" : "approved"}
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
                  {item.status === "Order Placed" && (
                    <CheckCircle2
                      className={cn(
                        "h-5 w-5",
                        item.completed ? "text-green-600" : "text-gray-300",
                      )}
                    />
                  )}
                  {item.status === "Order Approved" && (
                    <CheckCircle2
                      className={cn(
                        "h-5 w-5",
                        item.completed ? "text-blue-600" : "text-gray-300",
                      )}
                    />
                  )}
                  {item.status === "Processing" && (
                    <Package
                      className={cn(
                        "h-5 w-5",
                        item.completed ? "text-indigo-600" : "text-gray-300",
                      )}
                    />
                  )}
                  {item.status === "Shipped" && (
                    <Truck
                      className={cn(
                        "h-5 w-5",
                        item.completed ? "text-purple-600" : "text-gray-300",
                      )}
                    />
                  )}
                  {item.status === "Delivered" && (
                    <CheckCircle2
                      className={cn(
                        "h-5 w-5",
                        item.completed ? "text-green-600" : "text-gray-300",
                      )}
                    />
                  )}
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
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            SKU: {item.sku} • In Stock: {item.stockAvailable}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {order.delivery.driverName && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-blue-800">
                        Assigned Driver
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

          {/* Customer Notes */}
          {order.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <p className="text-sm text-amber-800">{order.notes}</p>
                </div>
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
                  <StatusBadge
                    status={
                      order.paymentStatus === "paid" ? "paid" : "approved"
                    }
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Terms</span>
                  <span className="font-medium">{order.paymentTerms}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(order.customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    to={`/distributor/retailers/${order.customer.id}`}
                    className="text-base font-semibold hover:text-primary"
                  >
                    {order.customer.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs ml-1">
                        {order.customer.rating}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      • {order.customer.previousOrders} orders
                    </span>
                    {order.customer.verified && (
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
                  <span>{order.customer.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4 space-y-2">
              {/* Status Update */}
              {getNextStatusOptions().length > 0 && (
                <Button
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowStatusDialog(true)}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {getNextStatusOptions()[0].label}
                </Button>
              )}

              {/* Assign Driver - only if eligible */}
              {order.canAssignDriver && order.status === "processing" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAssignDialog(true)}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Assign Driver
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
              Are you sure you want to cancel this order? Please provide a
              reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={cancellationReason}
              onValueChange={setCancellationReason}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Out of stock">Out of stock</SelectItem>
                <SelectItem value="Customer request">
                  Customer request
                </SelectItem>
                <SelectItem value="Payment issue">Payment issue</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancellationReason}
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
                    .filter((d) => d.available)
                    .map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.name} • {driver.vehicle}
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
            <Button onClick={assignDriver} disabled={!selectedDriver}>
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
    </div>
  );
};

export default DistributorOrderDetailsPage;
