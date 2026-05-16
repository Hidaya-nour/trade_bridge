import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Navigation, Package, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import LiveRouteMap from "@/components/tracking/LiveRouteMap";
import { formatDateTime } from "@/lib/formatters";
import orderService from "@/services/order.service";
import driverLocationService from "@/services/driver-location.service";
import type { Order } from "@/types/order.types";

type DriverLocationPoint = {
  id: string;
  order_id?: string | null;
  driver_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
};

type AddressRow = {
  common_name?: string | null;
  subcity?: string | null;
  city?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  created_at?: string;
};

type OrderWithAddressContext = Order & {
  buyer?: Order["buyer"] & { addresses?: AddressRow[] };
  supplier?: Order["supplier"] & { addresses?: AddressRow[] };
};

const POLL_INTERVAL_MS = 5000;
const MIN_MOVEMENT_METERS = 20;

const buildGoogleMapsSearchUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const getErrorMessage = (err: unknown, fallback: string) => {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { message?: unknown } } }).response?.data
      ?.message === "string"
  ) {
    return (err as { response: { data: { message: string } } }).response.data
      .message;
  }

  return fallback;
};

const parseLatLngFromText = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
};

const hasUsableDropoff = (value?: string | null) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return false;
  const blocked = new Set([
    "n/a",
    "na",
    "none",
    "unknown",
    "not provided",
    "not available",
    "null",
    "undefined",
    "-",
    "--",
  ]);
  return !blocked.has(normalized);
};

const parseCoord = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const latestAddressCoords = (addresses?: AddressRow[]) => {
  if (!Array.isArray(addresses) || !addresses.length) return null;
  const sorted = addresses.slice().sort(
    (a, b) =>
      new Date(b?.created_at || 0).getTime() -
      new Date(a?.created_at || 0).getTime(),
  );

  for (const row of sorted) {
    const lat = parseCoord(row?.latitude);
    const lng = parseCoord(row?.longitude);
    if (lat === null || lng === null) continue;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
    return { lat, lng };
  }

  return null;
};

const addressLabel = (addresses?: AddressRow[]) => {
  const first = Array.isArray(addresses) && addresses.length ? addresses[0] : null;
  return [first?.common_name, first?.subcity, first?.city]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .join(", ");
};

const resolveFallbackBackPath = (pathname: string, orderId: string) => {
  if (pathname.startsWith("/retailer/")) return `/retailer/orders/${orderId}`;
  if (pathname.startsWith("/distributor/")) return `/distributor/orders/${orderId}`;
  if (pathname.startsWith("/factory/")) return `/factory/orders/${orderId}`;
  return "/";
};

const toRadians = (deg: number) => (deg * Math.PI) / 180;

const distanceMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) => {
  const earthRadius = 6371000;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return earthRadius * y;
};

const filterMeaningfulLocations = (rows: DriverLocationPoint[]) => {
  if (rows.length <= 1) return rows;
  const kept: DriverLocationPoint[] = [rows[0]];

  for (let i = 1; i < rows.length; i += 1) {
    const prev = kept[kept.length - 1];
    const curr = rows[i];
    const moved = distanceMeters(
      { lat: prev.latitude, lng: prev.longitude },
      { lat: curr.latitude, lng: curr.longitude },
    );

    if (moved >= MIN_MOVEMENT_METERS) {
      kept.push(curr);
    }
  }

  if (kept[kept.length - 1]?.id !== rows[rows.length - 1]?.id) {
    kept.push(rows[rows.length - 1]);
  }

  return kept;
};

const OrderTrackingPage: React.FC = () => {
  const { id: orderId = "" } = useParams<{ id: string }>();
  const location = useLocation();

  const [order, setOrder] = useState<Order | null>(null);
  const [locations, setLocations] = useState<DriverLocationPoint[]>([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const orderWithAddresses = order as OrderWithAddressContext | null;

  const sortedLocations = useMemo(
    () =>
      locations
        .slice()
        .sort(
          (a, b) =>
            new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
        ),
    [locations],
  );
  const filteredLocations = useMemo(
    () => filterMeaningfulLocations(sortedLocations),
    [sortedLocations],
  );
  const latestLocation = filteredLocations[filteredLocations.length - 1] ?? null;
  const startLocation = filteredLocations[0] ?? null;
  const pickupCoords =
    parseLatLngFromText(order?.delivery?.pickup_location) ||
    latestAddressCoords(orderWithAddresses?.supplier?.addresses);
  const hasDropoff = hasUsableDropoff(order?.delivery?.dropoff_location);
  const dropoffCoords =
    parseLatLngFromText(order?.delivery?.dropoff_location) ||
    latestAddressCoords(orderWithAddresses?.buyer?.addresses);
  const resolvedDropoffLabel = hasDropoff
    ? order?.delivery?.dropoff_location
    : addressLabel(orderWithAddresses?.buyer?.addresses) || "Not provided";
  const routePositions = filteredLocations.map((loc) => [loc.latitude, loc.longitude]) as [
    number,
    number,
  ][];
  const remainingRoutePositions =
    latestLocation && dropoffCoords
      ? ([
          [latestLocation.latitude, latestLocation.longitude],
          [dropoffCoords.lat, dropoffCoords.lng],
        ] as [number, number][])
      : [];
  const startPoint =
    pickupCoords ||
    (startLocation
      ? { lat: startLocation.latitude, lng: startLocation.longitude }
      : null);
  const currentCenter =
    latestLocation
      ? { lat: latestLocation.latitude, lng: latestLocation.longitude }
      : (startPoint || dropoffCoords || null);

  const backFrom = new URLSearchParams(location.search).get("from");
  const backPath = backFrom || resolveFallbackBackPath(location.pathname, orderId);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    const fetchOrder = async () => {
      try {
        setIsLoadingOrder(true);
        setError(null);
        const response = await orderService.getOrderById(orderId);
        const fetchedOrder = response?.data?.order ?? null;
        if (!cancelled) {
          setOrder(fetchedOrder);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load order details."));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrder(false);
        }
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;

    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const response = await driverLocationService.getByOrderId(orderId);
        const data = response?.data ?? response;
        if (!cancelled && Array.isArray(data)) {
          setLocations(data as DriverLocationPoint[]);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Failed to load driver location for this order.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLocations(false);
        }
      }
    };

    fetchLocations();
    const intervalId = window.setInterval(fetchLocations, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [orderId]);

  const showEmpty = !isLoadingLocations && !currentCenter && !error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Live Order Tracking</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Driver location updates every 5 seconds.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to={backPath}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            <span>Order {orderId.slice(-8)}</span>
            {order?.delivery?.id && (
              <Badge variant="outline" className="bg-purple-50">
                Delivery {order.delivery.id.slice(0, 8)}
              </Badge>
            )}
            {order?.delivery?.driver?.full_name && (
              <Badge variant="outline">Driver: {order.delivery.driver.full_name}</Badge>
            )}
            <Badge variant="outline" className="ml-auto">
              <Clock className="mr-1 h-3 w-3" />
              Auto-refresh
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {isLoadingOrder && !order && (
            <p className="text-sm text-muted-foreground">Loading order details...</p>
          )}

          {isLoadingLocations && !latestLocation && (
            <p className="text-sm text-muted-foreground">Loading live driver location...</p>
          )}

          {showEmpty && (
            <p className="text-sm text-muted-foreground">
              No location points yet. Once the driver shares GPS updates, they will
              appear here.
            </p>
          )}

          {currentCenter && (
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden border bg-white">
                <LiveRouteMap
                  center={currentCenter}
                  startPoint={startPoint}
                  currentPoint={
                    latestLocation
                      ? {
                          lat: latestLocation.latitude,
                          lng: latestLocation.longitude,
                        }
                      : null
                  }
                  dropoffPoint={dropoffCoords}
                  traveledRoute={routePositions}
                  remainingRoute={remainingRoutePositions}
                  className="h-80 w-full"
                />
              </div>
              {latestLocation && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Last updated at {formatDateTime(latestLocation.recorded_at)}
                  </span>
                  <Navigation className="ml-2 h-4 w-4" />
                  <span>
                    {latestLocation.latitude}, {latestLocation.longitude}
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Pickup: {order?.delivery?.pickup_location || "Not provided"} {"->"} {resolvedDropoffLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                Markers: S is start/pickup, D is driver, E is drop-off. Blue
                line shows traveled route; light blue shows current-to-drop-off.
              </p>

              <div className="flex flex-wrap gap-2">
                {latestLocation && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={buildGoogleMapsSearchUrl(
                        latestLocation.latitude,
                        latestLocation.longitude,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Navigation className="mr-2 h-3 w-3" />
                      Current Point
                    </a>
                  </Button>
                )}
                {dropoffCoords && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={buildGoogleMapsSearchUrl(dropoffCoords.lat, dropoffCoords.lng)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin className="mr-2 h-3 w-3" />
                      Open Drop-off
                    </a>
                  </Button>
                )}
              </div>

             
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTrackingPage;
