import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  Truck,
  AlertCircle,
} from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/formatters";
import driverLocationService from "@/services/driver-location.service";

type DriverLocationPoint = {
  id: string;
  order_id?: string | null;
  driver_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
};

interface OrderTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  deliveryId?: string;
}

const POLL_INTERVAL_MS = 5000;

export const OrderTrackingDialog: React.FC<OrderTrackingDialogProps> = ({
  open,
  onOpenChange,
  orderId,
  deliveryId,
}) => {
  const [locations, setLocations] = useState<DriverLocationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestLocation = useMemo(
    () =>
      locations.length
        ? locations.reduce((latest, current) =>
            new Date(current.recorded_at) > new Date(latest.recorded_at)
              ? current
              : latest,
          )
        : null,
    [locations],
  );

  const hasLocationData = !!latestLocation;

  useEffect(() => {
    if (!open) return;

    let isCancelled = false;
    let intervalId: number | undefined;

    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await driverLocationService.getByOrderId(orderId);
        const data = response?.data ?? response;
        if (!isCancelled && Array.isArray(data)) {
          setLocations(data as DriverLocationPoint[]);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(
            err?.response?.data?.message ||
              "Failed to load driver location. Please try again.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchLocations();
    intervalId = window.setInterval(fetchLocations, POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [open, orderId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Live Delivery Tracking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Order {orderId.slice(-8)}</Badge>
              {deliveryId && (
                <Badge variant="outline" className="bg-purple-50">
                  Delivery {deliveryId.slice(0, 8)}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Updates every 5 seconds</span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading && !hasLocationData && (
            <p className="text-xs text-muted-foreground">
              Loading latest driver location...
            </p>
          )}

          {!isLoading && !hasLocationData && !error && (
            <p className="text-xs text-muted-foreground">
              No driver location has been recorded for this order yet. Once the
              driver starts the trip, you will see real-time updates here.
            </p>
          )}

          {hasLocationData && latestLocation && (
            <div className="space-y-3 rounded-lg border bg-muted/60 p-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Current Driver Position
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lat {latestLocation.latitude}, Lng {latestLocation.longitude}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>
                  Last updated at {formatDateTime(latestLocation.recorded_at)}
                </span>
              </div>
            </div>
          )}

          {locations.length > 1 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Recent Location History
                </p>
                <ScrollArea className="h-40 pr-3">
                  <div className="space-y-2">
                    {locations
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.recorded_at).getTime() -
                          new Date(a.recorded_at).getTime(),
                      )
                      .map((loc) => (
                        <div
                          key={loc.id}
                          className="flex items-center justify-between rounded-md border bg-background px-2 py-1.5 text-[11px]"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              Lat {loc.latitude}, Lng {loc.longitude}
                            </span>
                            <span className="text-muted-foreground">
                              {formatDateTime(loc.recorded_at)}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            Point
                          </Badge>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingDialog;

