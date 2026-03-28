import React, { useEffect, useMemo, useRef, useState } from "react";
import { Clock, MapPin, Navigation, Play, Square, Truck } from "lucide-react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import deliveryService from "@/services/delivery.service";
import driverLocationService from "@/services/driver-location.service";
import { formatDateTime } from "@/lib/formatters";

type DriverDelivery = {
  id: string;
  order_id: string;
  pickup_location: string;
  dropoff_location: string;
  status:
    | "assigned"
    | "picked_up"
    | "in_transit"
    | "delivered"
    | "failed"
    | "cancelled"
    | "pending";
  updated_at: string;
};

const MIN_POST_INTERVAL_MS = 5000;

const DriverLiveTrackingPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeDeliveryId, setActiveDeliveryId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [lastCoords, setLastCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastPostMsRef = useRef(0);

  const activeDelivery = useMemo(
    () => deliveries.find((d) => d.id === activeDeliveryId) ?? null,
    [deliveries, activeDeliveryId],
  );

  const loadMyDeliveries = async () => {
    try {
      setLoadingDeliveries(true);
      setError(null);
      const response = await deliveryService.getMyDeliveries();
      const rows = response?.data?.deliveries || [];
      setDeliveries(rows);
      if (!activeDeliveryId && rows.length > 0) {
        setActiveDeliveryId(rows[0].id);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load your deliveries.",
      );
    } finally {
      setLoadingDeliveries(false);
    }
  };

  useEffect(() => {
    loadMyDeliveries();
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const pushLocation = async (
    delivery: DriverDelivery,
    lat: number,
    lng: number,
    force = false,
  ) => {
    const now = Date.now();
    if (!force && now - lastPostMsRef.current < MIN_POST_INTERVAL_MS) return;

    await driverLocationService.create({
      order_id: delivery.order_id,
      latitude: lat,
      longitude: lng,
    });

    lastPostMsRef.current = now;
    setLastSentAt(new Date(now).toISOString());
    setLastCoords({ lat, lng });
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharing(false);
  };

  const startSharing = async () => {
    if (!activeDelivery) {
      toast.error("Select a delivery first.");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }

    try {
      if (
        activeDelivery.status === "assigned" ||
        activeDelivery.status === "picked_up" ||
        activeDelivery.status === "pending"
      ) {
        await deliveryService.updateStatus(activeDelivery.id, "in_transit");
      }

      const initialPosition = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        },
      );

      await pushLocation(
        activeDelivery,
        initialPosition.coords.latitude,
        initialPosition.coords.longitude,
        true,
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            await pushLocation(
              activeDelivery,
              position.coords.latitude,
              position.coords.longitude,
            );
          } catch (err) {
            console.error("Failed to send driver location:", err);
          }
        },
        (geoErr) => {
          console.error("Geolocation watch error:", geoErr);
          toast.error("GPS permission/location error. Sharing stopped.");
          stopSharing();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        },
      );

      setIsSharing(true);
      toast.success("Transit started. Live location sharing is now active.");
      await loadMyDeliveries();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start transit.");
      stopSharing();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Driver Live Tracking
          </h1>
          <p className="text-sm text-muted-foreground">
            Start transit to share your GPS location with buyers in real time.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadMyDeliveries}
          disabled={loadingDeliveries}
        >
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            Your Active Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <p className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {loadingDeliveries && (
            <p className="text-sm text-muted-foreground">
              Loading deliveries...
            </p>
          )}
          {!loadingDeliveries && deliveries.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">
              No active deliveries assigned to your account.
            </p>
          )}

          {deliveries.map((delivery) => (
            <button
              key={delivery.id}
              type="button"
              onClick={() => setActiveDeliveryId(delivery.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                activeDeliveryId === delivery.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Order {delivery.order_id.slice(-8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {delivery.pickup_location} - {delivery.dropoff_location}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {delivery.status.replace("_", " ")}
                </Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transit Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!activeDelivery && (
            <p className="text-sm text-muted-foreground">
              Select a delivery above to begin sharing location.
            </p>
          )}

          {activeDelivery && (
            <>
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium">Selected delivery</p>
                <p className="text-muted-foreground">
                  Delivery ID: {activeDelivery.id}
                </p>
                <p className="text-muted-foreground">
                  Order ID: {activeDelivery.order_id}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={startSharing}
                  disabled={isSharing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Transit & Share GPS
                </Button>
                <Button
                  variant="outline"
                  onClick={stopSharing}
                  disabled={!isSharing}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Sharing
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  <span>
                    Status: {isSharing ? "Sharing live GPS" : "Not sharing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last sync:{" "}
                    {lastSentAt ? formatDateTime(lastSentAt) : "No updates yet"}
                  </span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Coordinates:{" "}
                    {lastCoords
                      ? `${lastCoords.lat}, ${lastCoords.lng}`
                      : "Waiting for GPS..."}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverLiveTrackingPage;
