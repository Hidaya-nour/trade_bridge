import React, { useEffect, useMemo, useState } from "react";
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
import { useAuthStore } from "@/stores/auth.store";
import deliveryService from "@/services/delivery.service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDeliveryStore } from "@/stores/delivery.store";
import toast from "react-hot-toast";

// ============================================================================
// TYPES
// ============================================================================

type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
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
  vehicleType?: string;
  licensePlate?: string;
}

interface DriverStats {
  totalDeliveries: number;
  completedToday: number;
  pendingDeliveries: number;

  totalDistance: number;
}

const mapApiDelivery = (delivery: any): Delivery => {
  const status = (delivery?.status || "pending") as DeliveryStatus;
  const items = Array.isArray(delivery?.order?.items)
    ? delivery.order.items.map((item: any) => ({
        name: item?.product?.name || "Item",
        quantity: Number(item?.quantity || 0),
        unit: item?.product?.unit_type || "unit",
      }))
    : [];

  const orderId = String(
    delivery?.order_id || delivery?.order?.id || delivery?.id || "",
  );
  const buyer = delivery?.order?.buyer;
  const supplier = delivery?.order?.supplier;
  const driver = delivery?.driver?.driverUser || delivery?.driver;
  const vehicleType =
    delivery?.driver?.vehicle_type ||
    delivery?.driver?.vehicleType ||
    driver?.vehicle_type ||
    driver?.vehicleType ||
    undefined;
  const licensePlate =
    delivery?.driver?.license_plate ||
    delivery?.driver?.licensePlate ||
    driver?.license_plate ||
    driver?.licensePlate ||
    undefined;

  return {
    id: String(delivery?.id || orderId),
    deliveryNumber: String(
      delivery?.delivery_number || delivery?.id || orderId,
    ),
    orderId,
    orderNumber: String(delivery?.order_number || orderId),
    pickupLocation: delivery?.pickup_location || "Pickup not set",
    pickupAddress:
      delivery?.pickup_address || delivery?.pickup_location || "Not provided",
    pickupContact:
      supplier?.business_name ||
      supplier?.full_name ||
      supplier?.user?.full_name ||
      "Supplier",
    pickupPhone: supplier?.phone || supplier?.user?.phone || "N/A",
    dropoffLocation: delivery?.dropoff_location || "Dropoff not set",
    dropoffAddress:
      delivery?.dropoff_address || delivery?.dropoff_location || "Not provided",
    dropoffContact: buyer?.business_name || buyer?.full_name || "Customer",
    dropoffPhone: buyer?.phone || "N/A",
    items,
    status,
    assignedAt: delivery?.created_at || new Date().toISOString(),
    pickedUpAt: delivery?.picked_up_at,
    deliveredAt: delivery?.completed_at,
    estimatedDelivery:
      delivery?.estimated_delivery ||
      delivery?.updated_at ||
      new Date().toISOString(),
    distance: Number(delivery?.distance_km || 'NA'),
    priority: items.length > 8 ? "high" : items.length > 3 ? "medium" : "low",
    notes: delivery?.notes,
    supplierName:
      supplier?.business_name ||
      supplier?.full_name ||
      supplier?.user?.full_name ||
      "Supplier",
    supplierPhone: supplier?.phone || supplier?.user?.phone || "N/A",
    customerName: buyer?.business_name || buyer?.full_name || "Customer",
    customerPhone: buyer?.phone || "N/A",
    vehicleType: vehicleType ? String(vehicleType) : undefined,
    licensePlate: licensePlate ? String(licensePlate) : undefined,
  };
};

// ============================================================================
// CONSTANTS
// ============================================================================

const statusColors: Record<DeliveryStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  picked_up: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

const statusIcons: Record<DeliveryStatus, React.ElementType> = {
  pending: Clock,
  assigned: Clock,
  picked_up: Package,
  delivered: CheckCircle2,
  failed: XCircle,
  cancelled: XCircle,
};

const statusLabels: Record<DeliveryStatus, string> = {
  pending: "Pending Acceptance",
  assigned: "Assigned",
  picked_up: "Picked Up",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const DriverDashboard: React.FC = () => {
  const authUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("active");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<DeliveryStatus>("assigned");
  const [issueReport, setIssueReport] = useState("");
  const [showIssueDialog, setShowIssueDialog] = useState(false);

  const reportIssue = useDeliveryStore((state) => state.reportIssue);
  const deliveryStoreError = useDeliveryStore((state) => state.error);

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        const response = await deliveryService.getMyDeliveries();
        const rows = response?.data?.deliveries || [];
        setDeliveries(Array.isArray(rows) ? rows.map(mapApiDelivery) : []);
      } catch {
        setDeliveries([]);
      }
    };

    loadDeliveries();
  }, []);

  if (!authUser) return null;
  const primaryVehicle =
    deliveries.find((d) => d.vehicleType || d.licensePlate) || null;
  const vehicleLabel = primaryVehicle?.vehicleType || "Vehicle not assigned";
  const plateLabel = primaryVehicle?.licensePlate || "Plate not assigned";

  const driverUser = {
    id: authUser.id,
    name: authUser.full_name,
    business: `${vehicleLabel} • ${plateLabel}`,
    role: authUser.role,
    verified: authUser.verified,
  };

  // Filter deliveries
  const activeDeliveries = useMemo(
    () =>
      deliveries.filter(
        (d) =>
          d.status !== "delivered" &&
          d.status !== "failed" &&
          d.status !== "cancelled",
      ),
    [deliveries],
  );
  const pendingDeliveries = useMemo(
    () => deliveries.filter((d) => d.status === "pending"),
    [deliveries],
  );
  const completedDeliveries = useMemo(
    () =>
      deliveries.filter(
        (d) =>
          d.status === "delivered" ||
          d.status === "failed" ||
          d.status === "cancelled",
      ),
    [deliveries],
  );

  // Calculate stats
  const stats: DriverStats = {
    totalDeliveries: deliveries.length,
    completedToday: completedDeliveries.filter((delivery) => {
      const deliveryDate = delivery.deliveredAt || delivery.assignedAt;
      return (
        new Date(deliveryDate).toDateString() === new Date().toDateString()
      );
    }).length,
    pendingDeliveries: pendingDeliveries.length,
    totalDistance: deliveries.reduce(
      (sum, delivery) => sum + delivery.distance,
      0,
    ),
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedDelivery) return;
    try {
      await deliveryService.updateStatus(selectedDelivery.id, newStatus);
      setDeliveries((current) =>
        current.map((delivery) =>
          delivery.id === selectedDelivery.id
            ? {
                ...delivery,
                status: newStatus,
                deliveredAt:
                  newStatus === "delivered"
                    ? new Date().toISOString()
                    : delivery.deliveredAt,
              }
            : delivery,
        ),
      );
    } catch (error) {
      console.error("Failed to update delivery status:", error);
    } finally {
      setShowStatusDialog(false);
      setSelectedDelivery(null);
    }
  };

  // Handle report issue
  const handleReportIssue = async () => {
    if (!selectedDelivery || !issueReport.trim()) return;

    const result = await reportIssue({
      deliveryId: selectedDelivery.id,
      description: issueReport.trim(),
      location:
        selectedDelivery.dropoffLocation || selectedDelivery.pickupLocation,
    });

    if (!result) {
      toast.error(deliveryStoreError || "Failed to report issue");
      return;
    }

    toast.success("Issue reported.");
    setShowIssueDialog(false);
    setIssueReport("");
    setSelectedDelivery(null);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <WelcomeHeader user={driverUser} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
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
                <p className="text-sm text-muted-foreground">Vehicle Type</p>
                <p className="font-medium">{vehicleLabel}</p>
              </div>
              <div className="border-l pl-4">
                <p className="text-sm text-muted-foreground">License Plate</p>
                <p className="font-medium">{plateLabel}</p>
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
                        
                        {delivery.status === "pending" && (
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setNewStatus("assigned");
                              setShowStatusDialog(true);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                        )}

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
                          delivery.status !== "pending" &&
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
