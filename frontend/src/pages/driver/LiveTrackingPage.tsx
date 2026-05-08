import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Clock,
  ExternalLink,
  LocateFixed,
  MapPin,
  Navigation,
  Play,
  RefreshCw,
  Route,
  Square,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import deliveryService from "@/services/delivery.service";
import driverLocationService from "@/services/driver-location.service";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type DriverDelivery = {
  id: string;
  order_id: string;
  pickup_location: string;
  dropoff_location: string;
  status:
    | "assigned"
    | "picked_up"
    | "delivered"
    | "failed"
    | "cancelled"
    | "pending";
  updated_at: string;
};

type DriverLocationPoint = {
  id: string;
  order_id?: string | null;
  driver_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
};

const MIN_POST_INTERVAL_MS = 5000;
const POLL_INTERVAL_MS = 5000;
const DEFAULT_CENTER = { lat: 9.03, lng: 38.74 };
const MIN_MOVEMENT_METERS = 20;

const markerIcon = new L.Icon({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url,
  ).toString(),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapCenterUpdater: React.FC<{ center: { lat: number; lng: number } }> = ({
  center,
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 14));
  }, [center, map]);

  return null;
};

const buildGoogleMapsSearchUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const buildGoogleMapsDirectionsUrl = (destination: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;

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

const statusColorMap: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  assigned: "bg-blue-100 text-blue-800",
  picked_up: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatStatus = (status: string) =>
  status.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

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

const DriverLiveTrackingPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DriverDelivery[]>([]);
  const [locations, setLocations] = useState<DriverLocationPoint[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
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
    () => deliveries.find((delivery) => delivery.id === activeDeliveryId) ?? null,
    [activeDeliveryId, deliveries],
  );

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

  const filteredLocations = useMemo(() => {
    if (sortedLocations.length <= 1) return sortedLocations;
    const kept: DriverLocationPoint[] = [sortedLocations[0]];

    for (let i = 1; i < sortedLocations.length; i += 1) {
      const prev = kept[kept.length - 1];
      const curr = sortedLocations[i];
      const moved = distanceMeters(
        { lat: prev.latitude, lng: prev.longitude },
        { lat: curr.latitude, lng: curr.longitude },
      );
      if (moved >= MIN_MOVEMENT_METERS) {
        kept.push(curr);
      }
    }

    if (kept[kept.length - 1]?.id !== sortedLocations[sortedLocations.length - 1]?.id) {
      kept.push(sortedLocations[sortedLocations.length - 1]);
    }

    return kept;
  }, [sortedLocations]);

  const latestLocation = filteredLocations[filteredLocations.length - 1] ?? null;
  const sharingStartLocation = filteredLocations[0] ?? null;
  const pickupCoords = parseLatLngFromText(activeDelivery?.pickup_location);
  const hasDropoff = hasUsableDropoff(activeDelivery?.dropoff_location);
  const dropoffCoords = hasDropoff
    ? parseLatLngFromText(activeDelivery?.dropoff_location)
    : null;
  const startPoint =
    pickupCoords ||
    (sharingStartLocation
      ? {
          lat: sharingStartLocation.latitude,
          lng: sharingStartLocation.longitude,
        }
      : null);

  const movedDistance =
    startPoint && latestLocation
      ? distanceMeters(
          startPoint,
          { lat: latestLocation.latitude, lng: latestLocation.longitude },
        )
      : 0;

  const currentCenter = latestLocation
    ? { lat: latestLocation.latitude, lng: latestLocation.longitude }
    : lastCoords || DEFAULT_CENTER;

  const traveledRoutePositions = (
    startPoint && latestLocation
      ? ([
          [startPoint.lat, startPoint.lng],
          [latestLocation.latitude, latestLocation.longitude],
        ] as [number, number][])
      : []
  );

  const remainingRoutePositions =
    latestLocation && dropoffCoords
      ? ([
          [latestLocation.latitude, latestLocation.longitude],
          [dropoffCoords.lat, dropoffCoords.lng],
        ] as [number, number][])
      : [];

  const loadMyDeliveries = async () => {
    try {
      setLoadingDeliveries(true);
      setError(null);
      const response = await deliveryService.getMyDeliveries();
      const rows = Array.isArray(response?.data?.deliveries)
        ? (response.data.deliveries as DriverDelivery[])
        : [];
      setDeliveries(rows);

      if (!rows.length) {
        setActiveDeliveryId(null);
        return;
      }

      setActiveDeliveryId((current) =>
        current && rows.some((delivery) => delivery.id === current)
          ? current
          : rows[0].id,
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load your deliveries.",
      );
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const loadLocations = async (orderId: string) => {
    try {
      setLoadingLocations(true);
      const response = await driverLocationService.getByOrderId(orderId);
      const rows = Array.isArray(response?.data)
        ? (response.data as DriverLocationPoint[])
        : Array.isArray(response)
          ? (response as DriverLocationPoint[])
          : [];
      setLocations(rows);

      if (rows.length) {
        const latest = rows.reduce((winner, current) =>
          new Date(current.recorded_at) > new Date(winner.recorded_at)
            ? current
            : winner,
        );
        setLastCoords({ lat: latest.latitude, lng: latest.longitude });
        setLastSentAt(latest.recorded_at);
      } else {
        setLocations([]);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load live driver location.",
      );
    } finally {
      setLoadingLocations(false);
    }
  };

  useEffect(() => {
    loadMyDeliveries();
  }, []);

  useEffect(() => {
    if (!activeDelivery?.order_id) {
      setLocations([]);
      return;
    }

    let cancelled = false;
    let intervalId: number | undefined;

    const fetchLoop = async () => {
      if (cancelled) return;
      await loadLocations(activeDelivery.order_id);
    };

    fetchLoop();
    intervalId = window.setInterval(fetchLoop, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [activeDelivery?.order_id]);

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
    const recordedAt = new Date(now).toISOString();
    setLastSentAt(recordedAt);
    setLastCoords({ lat, lng });
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsSharing(false);
    toast.success("Live location sharing stopped.");
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
            await loadLocations(activeDelivery.order_id);
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
      await loadLocations(activeDelivery.order_id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start transit.");
      stopSharing();
    }
  };

  const stats = {
    totalDeliveries: deliveries.length,
    activeTracking: isSharing ? 1 : 0,
    routePoints: locations.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Live Tracking</h1>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Truck className="h-3 w-3 mr-1" />
            Driver Workspace
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Share your current vehicle position, monitor the route being recorded,
          and jump into Google Maps whenever you need turn-by-turn navigation.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tracking Status</p>
                <p className="text-2xl font-bold">{isSharing ? "Live GPS" : "Standby"}</p>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                isSharing ? "bg-green-100" : "bg-gray-100"
              )}>
                <Navigation className={cn("h-5 w-5", isSharing ? "text-green-600" : "text-gray-600")} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Sync</p>
                <p className="text-lg font-semibold truncate">
                  {lastSentAt ? formatDateTime(lastSentAt) : "No updates yet"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Deliveries List */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Delivery Selection</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMyDeliveries}
                  disabled={loadingDeliveries}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", loadingDeliveries && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
                  {error}
                </div>
              )}

              {loadingDeliveries && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}

              {!loadingDeliveries && deliveries.length === 0 && !error && (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No driver deliveries are assigned right now.</p>
                </div>
              )}

              <div className="space-y-3">
                {deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    onClick={() => setActiveDeliveryId(delivery.id)}
                    className={cn(
                      "rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md",
                      activeDeliveryId === delivery.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        <div>
                          <p className="font-semibold">Order {delivery.order_id.slice(-8)}</p>
                          <div className="flex items-start gap-2 mt-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Pickup</p>
                              <p className="text-sm">{delivery.pickup_location}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 mt-1 text-sm">
                            <MapPin className="h-3 w-3 text-destructive mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Dropoff</p>
                              <p className="text-sm">{delivery.dropoff_location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className={cn("shrink-0", statusColorMap[delivery.status])}>
                        {formatStatus(delivery.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Map and Controls */}
        <div className="space-y-4">
          {/* Map Card */}
          <Card>
            <CardHeader>
              <CardTitle>Live Vehicle Map</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeDelivery ? (
                <>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <MapContainer
                      center={currentCenter}
                      zoom={13}
                      scrollWheelZoom
                      className="h-[400px] w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapCenterUpdater center={currentCenter} />
                      {traveledRoutePositions.length > 1 && movedDistance >= MIN_MOVEMENT_METERS && (
                        <Polyline
                          positions={traveledRoutePositions}
                          pathOptions={{
                            color: "hsl(var(--primary))",
                            weight: 4,
                            opacity: 0.3,
                          }}
                        />
                      )}
                      {remainingRoutePositions.length === 2 && (
                        <Polyline
                          positions={remainingRoutePositions}
                          pathOptions={{
                            color: "hsl(var(--primary))",
                            weight: 6,
                            opacity: 0.9,
                          }}
                        />
                      )}
                      {startPoint && (
                        <CircleMarker
                          center={{
                            lat: startPoint.lat,
                            lng: startPoint.lng,
                          }}
                          radius={6}
                          pathOptions={{
                            color: "#16a34a",
                            fillColor: "#22c55e",
                            fillOpacity: 0.9,
                            weight: 2,
                          }}
                        />
                      )}
                      {latestLocation && (
                        <Marker
                          position={{
                            lat: latestLocation.latitude,
                            lng: latestLocation.longitude,
                          }}
                          icon={markerIcon}
                        />
                      )}
                      {dropoffCoords && (
                        <CircleMarker
                          center={dropoffCoords}
                          radius={7}
                          pathOptions={{
                            color: "#dc2626",
                            fillColor: "#ef4444",
                            fillOpacity: 0.9,
                            weight: 2,
                          }}
                        />
                      )}
                    </MapContainer>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Current Run</p>
                      <p className="font-semibold mt-1">Order {activeDelivery.order_id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activeDelivery.pickup_location} → {activeDelivery.dropoff_location}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Tracking Controls</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={startSharing}
                          disabled={isSharing}
                          size="sm"
                          className="flex-1"
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </Button>
                        <Button
                          variant="outline"
                          onClick={stopSharing}
                          disabled={!isSharing}
                          size="sm"
                          className="flex-1"
                        >
                          <Square className="mr-1 h-3 w-3" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  </div>

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
                          <LocateFixed className="mr-2 h-3 w-3" />
                          Current Point
                        </a>
                      </Button>
                    )}
                    {hasDropoff && (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={buildGoogleMapsDirectionsUrl(activeDelivery.dropoff_location)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Navigation className="mr-2 h-3 w-3" />
                          Navigate to Dropoff
                        </a>
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a delivery to see its live tracking map.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  );
};

export default DriverLiveTrackingPage;
