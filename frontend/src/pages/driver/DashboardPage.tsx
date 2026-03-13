import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Navigation,
  Phone,
  User,
  Calendar,
  Star,
  TrendingUp,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  StatsCard,
  StatusBadge,
  EmptyState,
  WelcomeHeader,
} from "@/components";
import {
  formatDate,
  formatTime,
  formatPhone,
  formatDateTime,
} from "@/lib/formatters";
import { cn, getInitials } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type DeliveryStatus =
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed"
  | "cancelled";

interface Delivery {
  id: string;
  deliveryNumber: string;
  orderId: string;
  orderNumber: string;
  pickupLocation: string;
  pickupAddress: string;
  pickupContact: string;
  pickupPhone: string;
  dropoffLocation: string;
  dropoffAddress: string;
  dropoffContact: string;
  dropoffPhone: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  status: DeliveryStatus;
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  estimatedDelivery: string;
  distance: number; // in km
  notes?: string;
  priority: "high" | "medium" | "low";
  supplierName: string;
  supplierPhone: string;
  customerName: string;
  customerPhone: string;
}

interface DriverStats {
  totalDeliveries: number;
  completedToday: number;
  pendingDeliveries: number;
  onTimeRate: number;
  totalDistance: number;
  rating: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

// ============================================================================
// MOCK DATA - UPDATED to match WelcomeHeader props
// ============================================================================

const mockDriver = {
  id: "6", // Changed to string
  name: "Dawit Mekonnen",
  business: "Independent Driver", // Added business field
  role: "driver" as const, // Added role field
  verified: true, // Added verified field
  email: "dawit@driver.com",
  phone: "+251 91 234 5678",
  vehicleType: "Truck",
  vehiclePlate: "AA-1234-AB",
  joinedDate: "2026-01-15",
  rating: 4.8,
  totalDeliveries: 342,
  completedToday: 4,
};

const mockDeliveries: Delivery[] = [
  {
    id: "DEL-001",
    deliveryNumber: "DEL-2026-001",
    orderId: "ORD-001",
    orderNumber: "ORD-2026-0245",
    pickupLocation: "Adama Wholesalers",
    pickupAddress: "Adama Industrial Zone, Adama",
    pickupContact: "Abebe Kebede",
    pickupPhone: "+251 92 345 6789",
    dropoffLocation: "ABC Retail Shop",
    dropoffAddress: "Bole Road, Addis Ababa",
    dropoffContact: "Hidaya Nurmeika",
    dropoffPhone: "+251 91 234 5678",
    items: [
      { name: "Premium Wheat Flour", quantity: 50, unit: "kg" },
      { name: "Cooking Oil", quantity: 20, unit: "liters" },
    ],
    status: "assigned",
    assignedAt: "2026-02-14T08:30:00",
    estimatedDelivery: "2026-02-14T14:00:00",
    distance: 85,
    priority: "high",
    supplierName: "Adama Wholesalers",
    supplierPhone: "+251 92 345 6789",
    customerName: "ABC Retail Shop",
    customerPhone: "+251 91 234 5678",
  },
  {
    id: "DEL-002",
    deliveryNumber: "DEL-2026-002",
    orderId: "ORD-002",
    orderNumber: "ORD-2026-0250",
    pickupLocation: "Mugher Cement",
    pickupAddress: "Mugher Factory, Addis Ababa",
    pickupContact: "Tadesse Haile",
    pickupPhone: "+251 93 456 7890",
    dropoffLocation: "Adama Wholesalers",
    dropoffAddress: "Adama Industrial Zone, Adama",
    dropoffContact: "Abebe Kebede",
    dropoffPhone: "+251 92 345 6789",
    items: [{ name: "Industrial Grade Cement", quantity: 500, unit: "bags" }],
    status: "in_transit",
    assignedAt: "2026-02-14T09:00:00",
    pickedUpAt: "2026-02-14T10:15:00",
    estimatedDelivery: "2026-02-14T16:00:00",
    distance: 95,
    priority: "medium",
    supplierName: "Mugher Cement",
    supplierPhone: "+251 93 456 7890",
    customerName: "Adama Wholesalers",
    customerPhone: "+251 92 345 6789",
  },
  {
    id: "DEL-003",
    deliveryNumber: "DEL-2026-003",
    orderId: "ORD-003",
    orderNumber: "ORD-2026-0255",
    pickupLocation: "Bahir Dar Honey",
    pickupAddress: "Bahir Dar City Center, Bahir Dar",
    pickupContact: "Mulugeta Dessie",
    pickupPhone: "+251 99 012 3456",
    dropoffLocation: "City Supermarket",
    dropoffAddress: "Piazza, Bahir Dar",
    dropoffContact: "Almaz Worku",
    dropoffPhone: "+251 94 567 8901",
    items: [{ name: "Pure White Honey", quantity: 30, unit: "kg" }],
    status: "delivered",
    assignedAt: "2026-02-13T10:00:00",
    pickedUpAt: "2026-02-13T11:30:00",
    deliveredAt: "2026-02-13T14:45:00",
    estimatedDelivery: "2026-02-13T15:00:00",
    distance: 15,
    priority: "low",
    supplierName: "Bahir Dar Honey",
    supplierPhone: "+251 99 012 3456",
    customerName: "City Supermarket",
    customerPhone: "+251 94 567 8901",
  },
  {
    id: "DEL-004",
    deliveryNumber: "DEL-2026-004",
    orderId: "ORD-004",
    orderNumber: "ORD-2026-0238",
    pickupLocation: "Tigray Construction",
    pickupAddress: "Industrial Area, Mekelle",
    pickupContact: "Berhanu Tekle",
    pickupPhone: "+251 34 567 8901",
    dropoffLocation: "Mekelle Steel Distributors",
    dropoffAddress: "Main Market, Mekelle",
    dropoffContact: "Tekle Berhan",
    dropoffPhone: "+251 34 678 9012",
    items: [{ name: "Construction Steel", quantity: 100, unit: "pieces" }],
    status: "failed",
    assignedAt: "2026-02-13T13:00:00",
    pickedUpAt: "2026-02-13T14:30:00",
    estimatedDelivery: "2026-02-13T17:00:00",
    distance: 12,
    priority: "high",
    notes: "Customer unavailable at delivery location",
    supplierName: "Tigray Construction",
    supplierPhone: "+251 34 567 8901",
    customerName: "Mekelle Steel Distributors",
    customerPhone: "+251 34 678 9012",
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const statusColors: Record<DeliveryStatus, string> = {
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  picked_up: "bg-purple-100 text-purple-800 border-purple-200",
  in_transit: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons: Record<DeliveryStatus, React.ElementType> = {
  assigned: Clock,
  picked_up: Package,
  in_transit: Truck,
  delivered: CheckCircle2,
  failed: XCircle,
  cancelled: XCircle,
};

const statusLabels: Record<DeliveryStatus, string> = {
  assigned: "Assigned",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const DriverDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<DeliveryStatus>("assigned");
  const [issueReport, setIssueReport] = useState("");
  const [showIssueDialog, setShowIssueDialog] = useState(false);

  // Filter deliveries
  const activeDeliveries = mockDeliveries.filter(
    (d) =>
      d.status !== "delivered" &&
      d.status !== "failed" &&
      d.status !== "cancelled",
  );
  const completedDeliveries = mockDeliveries.filter(
    (d) =>
      d.status === "delivered" ||
      d.status === "failed" ||
      d.status === "cancelled",
  );

  // Calculate stats
  const stats: DriverStats = {
    totalDeliveries: mockDriver.totalDeliveries,
    completedToday: mockDriver.completedToday,
    pendingDeliveries: activeDeliveries.length,
    onTimeRate: 96,
    totalDistance: 187,
    rating: mockDriver.rating,
  };

  // Handle status update
  const handleUpdateStatus = () => {
    if (selectedDelivery) {
      console.log("Updating delivery:", selectedDelivery.id, "to:", newStatus);
      setShowStatusDialog(false);
      setSelectedDelivery(null);
      // In real app, call API
    }
  };

  // Handle report issue
  const handleReportIssue = () => {
    if (selectedDelivery && issueReport.trim()) {
      console.log(
        "Reporting issue for:",
        selectedDelivery.id,
        "Issue:",
        issueReport,
      );
      setShowIssueDialog(false);
      setIssueReport("");
      setSelectedDelivery(null);
      // In real app, call API
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader user={mockDriver} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Deliveries"
          value={stats.totalDeliveries}
          icon={Package}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Today"
          value={stats.completedToday}
          icon={CheckCircle2}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingDeliveries}
          icon={Clock}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="On-Time Rate"
          value={`${stats.onTimeRate}%`}
          icon={TrendingUp}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Distance"
          value={`${stats.totalDistance}km`}
          icon={Navigation}
          iconBg="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatsCard
          title="Rating"
          value={stats.rating.toFixed(1)}
          icon={Star}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Vehicle Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">{mockDriver.vehicleType}</p>
              </div>
              <div className="border-l pl-4">
                <p className="text-sm text-muted-foreground">License Plate</p>
                <p className="font-medium">{mockDriver.vehiclePlate}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Available
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="active">
            Active Deliveries
            {stats.pendingDeliveries > 0 && (
              <Badge className="ml-2 bg-primary text-white">
                {stats.pendingDeliveries}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {activeDeliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No active deliveries"
              description="You don't have any active deliveries at the moment"
            />
          ) : (
            activeDeliveries.map((delivery) => {
              const StatusIcon = statusIcons[delivery.status];
              return (
                <Card
                  key={delivery.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={statusColors[delivery.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabels[delivery.status]}
                          </Badge>
                          <Badge
                            className={cn(
                              delivery.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : delivery.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800",
                            )}
                          >
                            {delivery.priority} priority
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            #{delivery.deliveryNumber}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Pickup */}
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Pickup</p>
                                <p className="text-sm">
                                  {delivery.pickupLocation}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {delivery.pickupAddress}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs">
                                  <Phone className="h-3 w-3" />
                                  {formatPhone(delivery.pickupPhone)}
                                </div>
                                {delivery.pickedUpAt && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Picked up: {formatTime(delivery.pickedUpAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dropoff */}
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">Delivery</p>
                                <p className="text-sm">
                                  {delivery.dropoffLocation}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {delivery.dropoffAddress}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs">
                                  <Phone className="h-3 w-3" />
                                  {formatPhone(delivery.dropoffPhone)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Items Summary */}
                        <div className="mt-3 p-2 bg-muted/30 rounded-lg">
                          <p className="text-xs font-medium mb-1">Items:</p>
                          <div className="flex flex-wrap gap-2">
                            {delivery.items.map((item, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs"
                              >
                                {item.name}: {item.quantity} {item.unit}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Navigation className="h-3 w-3 mr-1" />
                            {delivery.distance} km
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Est: {formatTime(delivery.estimatedDelivery)}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Assigned: {formatTime(delivery.assignedAt)}
                          </span>
                        </div>

                        {delivery.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-yellow-700">
                              {delivery.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>

                        {delivery.status === "assigned" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-blue-600"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setNewStatus("picked_up");
                              setShowStatusDialog(true);
                            }}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Picked Up
                          </Button>
                        )}

                        {delivery.status === "picked_up" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-indigo-600"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setNewStatus("in_transit");
                              setShowStatusDialog(true);
                            }}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Start Trip
                          </Button>
                        )}

                        {delivery.status === "in_transit" && (
                          <Button
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setNewStatus("delivered");
                              setShowStatusDialog(true);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Delivered
                          </Button>
                        )}

                        {delivery.status !== "delivered" &&
                          delivery.status !== "failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-red-600"
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setShowIssueDialog(true);
                              }}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Report Issue
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-4">
          {completedDeliveries.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="No completed deliveries"
              description="Your completed deliveries will appear here"
            />
          ) : (
            completedDeliveries.map((delivery) => {
              const StatusIcon = statusIcons[delivery.status];
              return (
                <Card key={delivery.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            statusColors[delivery.status],
                          )}
                        >
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              #{delivery.deliveryNumber}
                            </span>
                            <Badge className={statusColors[delivery.status]}>
                              {statusLabels[delivery.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {delivery.dropoffLocation} •{" "}
                            {formatDate(
                              delivery.deliveredAt || delivery.assignedAt,
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Delivery Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>
              {selectedDelivery?.deliveryNumber} - Order #
              {selectedDelivery?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex gap-2">
                <Badge className={statusColors[selectedDelivery.status]}>
                  {statusLabels[selectedDelivery.status]}
                </Badge>
                <Badge
                  className={cn(
                    selectedDelivery.priority === "high"
                      ? "bg-red-100 text-red-800"
                      : selectedDelivery.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800",
                  )}
                >
                  {selectedDelivery.priority} priority
                </Badge>
              </div>

              {/* Pickup Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Pickup Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {selectedDelivery.pickupLocation}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDelivery.pickupAddress}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedDelivery.pickupContact}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {formatPhone(selectedDelivery.pickupPhone)}
                    </span>
                  </div>
                  {selectedDelivery.pickedUpAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Picked up: {formatDateTime(selectedDelivery.pickedUpAt)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Dropoff Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    Delivery Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">
                    {selectedDelivery.dropoffLocation}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDelivery.dropoffAddress}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedDelivery.dropoffContact}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {formatPhone(selectedDelivery.dropoffPhone)}
                    </span>
                  </div>
                  {selectedDelivery.deliveredAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Delivered: {formatDateTime(selectedDelivery.deliveredAt)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedDelivery.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Distance</p>
                  <p className="font-medium">{selectedDelivery.distance} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estimated Delivery</p>
                  <p className="font-medium">
                    {formatTime(selectedDelivery.estimatedDelivery)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assigned</p>
                  <p className="font-medium">
                    {formatTime(selectedDelivery.assignedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Supplier</p>
                  <p className="font-medium">{selectedDelivery.supplierName}</p>
                </div>
              </div>

              {selectedDelivery.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    {selectedDelivery.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <DialogDescription>
              Confirm status change for delivery{" "}
              {selectedDelivery?.deliveryNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm mb-4">
              Are you sure you want to mark this delivery as{" "}
              <span className="font-semibold">
                {newStatus.replace("_", " ")}
              </span>
              ?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Confirm Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Delivery Issue</DialogTitle>
            <DialogDescription>
              Describe the issue you're experiencing with this delivery
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="issue">Issue Details</Label>
            <Textarea
              id="issue"
              placeholder="e.g., Customer unavailable, wrong address, traffic delay, etc."
              value={issueReport}
              onChange={(e) => setIssueReport(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReportIssue}
              disabled={!issueReport.trim()}
            >
              Report Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
