import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import deliveryService from "@/services/delivery.service";
import { useOrderStore } from "@/stores/order.store";

type MarketplaceDriver = {
  id: string;
  vehicle_type?: string | null;
  license_plate?: string | null;
  driverUser?: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
  } | null;
  supplier?: {
    id: string;
    full_name: string;
    business_name?: string;
    phone?: string;
  } | null;
};

const unwrap = (payload: any) => payload?.data ?? payload;

const getReturnPath = (pathname: string, orderId: string) => {
  const role = pathname.split("/")[1];
  if (role === "retailer") return `/retailer/orders/${orderId}`;
  if (role === "distributor") {
    if (pathname.includes("/purchase-orders/")) return `/distributor/purchase-orders/${orderId}`;
    return `/distributor/orders/${orderId}`;
  }
  return `/retailer/orders/${orderId}`;
};

const RequestDriverPage: React.FC = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentOrder, fetchOrderById, isLoading: orderLoading } = useOrderStore();

  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<MarketplaceDriver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const returnPath = useMemo(() => {
    if (!orderId) return "/retailer/orders";
    return getReturnPath(location.pathname, orderId);
  }, [location.pathname, orderId]);

  useEffect(() => {
    if (!orderId) return;
    void fetchOrderById(orderId);
  }, [orderId, fetchOrderById]);

  const loadDrivers = async (query?: string) => {
    setDriversLoading(true);
    try {
      const response = await deliveryService.getAvailableDrivers(query);
      const data = unwrap(response);
      const rows = (data?.drivers ?? data?.data?.drivers ?? []) as MarketplaceDriver[];
      setDrivers(rows);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load drivers.");
    } finally {
      setDriversLoading(false);
    }
  };

  useEffect(() => {
    void loadDrivers();
  }, []);

  const handleAssign = async () => {
    if (!orderId) return;
    if (!selectedDriverId) {
      toast.error("Please select a driver.");
      return;
    }
    if (!dropoffLocation.trim()) {
      toast.error("Drop-off location is required.");
      return;
    }

    setSubmitting(true);
    try {
      await deliveryService.assignDriverForBuyer(orderId, {
        driver_id: selectedDriverId,
        pickup_location: pickupLocation.trim() || undefined,
        dropoff_location: dropoffLocation.trim(),
      });
      toast.success("Driver assigned successfully.");
      navigate(returnPath);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign driver.");
    } finally {
      setSubmitting(false);
    }
  };

  const supplierLabel =
    currentOrder?.supplier?.business_name ||
    currentOrder?.supplier?.full_name ||
    currentOrder?.supplier_id ||
    "Supplier";

  const deliveryAlreadyExists = Boolean(currentOrder?.delivery);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Request a Driver</h1>
          <p className="text-sm text-muted-foreground">
            Order: {orderId} • Supplier: {supplierLabel}
          </p>
          {deliveryAlreadyExists ? (
            <p className="mt-1 text-sm text-muted-foreground">
              A delivery record already exists for this order. Assigning a driver here will update it.
            </p>
          ) : null}
        </div>
        <Button variant="outline" onClick={() => navigate(returnPath)}>
          Back to Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pickup">Pickup location (optional)</Label>
            <Textarea
              id="pickup"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g., Supplier warehouse, Industrial area..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dropoff">Drop-off location</Label>
            <Textarea
              id="dropoff"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
              placeholder="e.g., Your shop address, City, landmark..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose a Driver</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by driver name, phone, vehicle, plate..."
            />
            <Button
              variant="outline"
              disabled={driversLoading}
              onClick={() => void loadDrivers(search)}
            >
              Search
            </Button>
          </div>

          {driversLoading ? (
            <div className="text-sm text-muted-foreground">Loading drivers...</div>
          ) : drivers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No drivers found. Try a different search.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {drivers.map((driver) => {
                const name = driver.driverUser?.full_name || "Driver";
                const phone = driver.driverUser?.phone;
                const vehicle = driver.vehicle_type || "Vehicle not specified";
                const plate = driver.license_plate || "Plate not specified";
                const supplier =
                  driver.supplier?.business_name || driver.supplier?.full_name || "Supplier";
                const selected = selectedDriverId === driver.id;

                return (
                  <button
                    key={driver.id}
                    type="button"
                    onClick={() => setSelectedDriverId(driver.id)}
                    className={cn(
                      "text-left rounded-lg border p-3 transition-colors",
                      selected ? "border-primary bg-primary/5" : "hover:bg-muted",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground">
                          {vehicle} • {plate}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {phone ? `Phone: ${phone}` : "Phone: N/A"} • From: {supplier}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "h-4 w-4 rounded-full border",
                          selected ? "border-primary bg-primary" : "border-muted-foreground/40",
                        )}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={submitting || driversLoading || orderLoading || !orderId}
              onClick={() => void handleAssign()}
            >
              {submitting ? "Assigning..." : "Assign Driver"}
            </Button>
            <Button variant="ghost" onClick={() => navigate(returnPath)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestDriverPage;
