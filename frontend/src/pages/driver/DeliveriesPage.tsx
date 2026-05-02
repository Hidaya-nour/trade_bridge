import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  MapPin,
  Navigation,
  Package2,
  Phone,
  Search,
  Truck,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import deliveryService from "@/services/delivery.service";
import {
  mapApiDeliveryToDriverDelivery,
  type DeliveryPriority,
  type DeliveryStatus,
  type DriverDelivery,
} from "../../lib/driver-delivery.utils";

type DeliveryTab = "pending" | "assigned" | "picked_up" | "delivered" | "cancelled";

const deliveryTabs: DeliveryTab[] = ["pending", "assigned", "picked_up", "delivered", "cancelled"];

const formatStatus = (status: DeliveryStatus) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const statusColorMap: Record<DeliveryStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  picked_up: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
};

const priorityColorMap: Record<DeliveryPriority, string> = {
  standard: "bg-gray-100 text-gray-700",
  urgent: "bg-red-100 text-red-700",
  fragile: "bg-orange-100 text-orange-700",
};

const matchesTab = (delivery: DriverDelivery, tab: DeliveryTab) =>
  tab === "picked_up" ? ["picked_up"].includes(delivery.status) : delivery.status === tab;

const tabLabels: Record<DeliveryTab, string> = {
  pending: "Pending",
  assigned: "Assigned",
  picked_up: "Picked Up",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const getLoadTotal = (delivery: DriverDelivery) =>
  delivery.products.reduce((total, product) => total + product.quantity, 0);

export const ActiveDeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<DeliveryTab>("pending");
  const [selectedDelivery, setSelectedDelivery] = useState<DriverDelivery | null>(null);

  useEffect(() => {
    const loadDeliveries = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await deliveryService.getMyDeliveries();
        const rows: any[] = Array.isArray(response?.data?.deliveries)
          ? response.data.deliveries
          : [];
        const mapped = rows.map(mapApiDeliveryToDriverDelivery);

        setDeliveries(mapped);

        const defaultTab = deliveryTabs.find((tab) =>
          mapped.some((delivery) => matchesTab(delivery, tab)),
        );
        if (defaultTab) setActiveTab(defaultTab);
      } catch (loadError: any) {
        setError(
          loadError?.response?.data?.message || "Failed to load deliveries from the backend.",
        );
        setDeliveries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeliveries();
  }, []);

  const filteredDeliveries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return deliveries.filter((delivery) => {
      const matchesSearch =
        !query ||
        [
          delivery.orderCode,
          delivery.supplierName,
          delivery.buyerName,
          delivery.destination,
          delivery.pickupPoint,
        ].some((value) => value.toLowerCase().includes(query));

      return matchesSearch && matchesTab(delivery, activeTab);
    });
  }, [activeTab, deliveries, searchQuery]);

  // Reset selected delivery when tab or search changes
  useEffect(() => {
    setSelectedDelivery(filteredDeliveries[0] || null);
  }, [activeTab, searchQuery, filteredDeliveries]);

  const tabCounts = useMemo(
    () =>
      deliveryTabs.reduce(
        (counts, tab) => {
          counts[tab] = deliveries.filter((delivery) => matchesTab(delivery, tab)).length;
          return counts;
        },
        {} as Record<DeliveryTab, number>,
      ),
    [deliveries],
  );

  // Stats for the header
  const stats = {
    pending: tabCounts.pending,
    assigned: tabCounts.assigned,
    picked_up: tabCounts.picked_up,
    delivered: tabCounts.delivered,
    cancelled: tabCounts.cancelled,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">My Deliveries</h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Truck className="h-3 w-3 mr-1" />
            {deliveries.length} Total Deliveries
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Track and manage your assigned deliveries in one place
        </p>
      </div>

   

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by order, customer, or destination..."
                className="pl-9"
              />
            </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DeliveryTab)}>
            <TabsList className="mb-4">
              {deliveryTabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tabLabels[tab]}
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                    {tabCounts[tab]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {deliveryTabs.map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Loading deliveries...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                ) : filteredDeliveries.length === 0 ? (
                  <div className="text-center py-12">
                    <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No deliveries found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No deliveries match your search criteria."
                        : `You have no ${tabLabels[tab].toLowerCase()} deliveries.`}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* Delivery Cards List */}
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {filteredDeliveries.map((delivery) => {
                        const loadTotal = getLoadTotal(delivery);
                        return (
                          <div
                            key={delivery.id}
                            onClick={() => setSelectedDelivery(delivery)}
                            className={cn(
                              "rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md",
                              selectedDelivery?.id === delivery.id
                                ? "border-primary bg-primary/5"
                                : "border-border",
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold">{delivery.orderCode}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {delivery.supplierName} → {delivery.buyerName}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge className={statusColorMap[delivery.status]}>
                                  {formatStatus(delivery.status)}
                                </Badge>
                                <Badge variant="outline" className={priorityColorMap[delivery.priority]}>
                                  {delivery.priority}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Load</p>
                                <p className="font-medium">{loadTotal} units</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Distance</p>
                                <p className="font-medium">{delivery.distanceKm} km</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">ETA</p>
                                <p className="font-medium">{delivery.etaMinutes} min</p>
                              </div>
                            </div>

                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{delivery.routeProgress}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${delivery.routeProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delivery Details Panel */}
                    {selectedDelivery ? (
                      <Card className="border-border">
                        <CardContent className="p-4 space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg">{selectedDelivery.orderCode}</h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedDelivery.supplierName} to {selectedDelivery.buyerName}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground">Status</p>
                              <Badge className={cn("mt-1", statusColorMap[selectedDelivery.status])}>
                                {formatStatus(selectedDelivery.status)}
                              </Badge>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground">Priority</p>
                              <Badge
                                variant="outline"
                                className={cn("mt-1", priorityColorMap[selectedDelivery.priority])}
                              >
                                {selectedDelivery.priority}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Route</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Pickup</p>
                                  <p>{selectedDelivery.pickupPoint}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-destructive mt-0.5" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Dropoff</p>
                                  <p>{selectedDelivery.destination}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Recipient</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <UserRound className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedDelivery.contactPerson}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedDelivery.contactPhone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Products</h4>
                            <div className="space-y-2">
                              {selectedDelivery.products.map((product) => (
                                <div
                                  key={product.name}
                                  className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm"
                                >
                                  <span>{product.name}</span>
                                  <span className="font-medium">
                                    {product.quantity} {product.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {selectedDelivery.status !== "delivered" && (
                              <Button asChild className="w-full">
                                <Link to="/driver/tracking">
                                  <Navigation className="mr-2 h-4 w-4" />
                                  Open Live Tracking
                                </Link>
                              </Button>
                            )}
                            <Button asChild variant="outline" className="w-full">
                              <Link to={`/driver/issues?deliveryId=${selectedDelivery.id}`}>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                {selectedDelivery.issueReported ? "View Issue Log" : "Report Issue"}
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-border bg-muted/20">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-center text-muted-foreground">
                            Select a delivery from the list to view details
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveDeliveriesPage;