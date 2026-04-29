import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
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

  const latestLocation = sortedLocations[sortedLocations.length - 1] ?? null;
  const currentCenter = latestLocation
    ? { lat: latestLocation.latitude, lng: latestLocation.longitude }
    : lastCoords || DEFAULT_CENTER;
  const routePositions = sortedLocations.map((location) => [
    location.latitude,
    location.longitude,
  ]) as [number, number][];

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

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
                Driver Workspace
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Live Tracking
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Share your current vehicle position, monitor the route being
                recorded, and jump into Google Maps whenever you need turn-by-turn
                navigation.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Tracking status
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {isSharing ? "Live GPS active" : "Standing by"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Last sync
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {lastSentAt ? formatDateTime(lastSentAt) : "No updates yet"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Route points
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {locations.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
              Current Run
            </p>
            {activeDelivery ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-2xl font-bold text-slate-950">
                    Order {activeDelivery.order_id.slice(-8)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {activeDelivery.pickup_location} to{" "}
                    {activeDelivery.dropoff_location}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize bg-white">
                    {activeDelivery.status.replace("_", " ")}
                  </Badge>
                 
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={startSharing}
                    disabled={isSharing}
                    className="rounded-2xl bg-sky-600 hover:bg-sky-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start live sharing
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopSharing}
                    disabled={!isSharing}
                    className="rounded-2xl border-slate-200"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Stop sharing
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                Pick one of your assigned deliveries to begin tracking.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4" />
              Delivery Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={loadMyDeliveries}
                disabled={loadingDeliveries}
                className="rounded-2xl border-slate-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh deliveries
              </Button>
            </div>

            {error && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            {loadingDeliveries && (
              <p className="text-sm text-slate-500">Loading your deliveries...</p>
            )}

            {!loadingDeliveries && deliveries.length === 0 && !error && (
              <p className="text-sm text-slate-500">
                No driver deliveries are assigned right now.
              </p>
            )}

            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <button
                  key={delivery.id}
                  type="button"
                  onClick={() => setActiveDeliveryId(delivery.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    activeDeliveryId === delivery.id
                      ? "border-sky-500 bg-sky-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-950">
                        Order {delivery.order_id.slice(-8)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {delivery.pickup_location}
                      </p>
                      <p className="text-sm text-slate-500">
                        {delivery.dropoff_location}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {delivery.status.replace("_", " ")}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Route className="h-4 w-4" />
                Live Vehicle Map
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeDelivery ? (
                <>
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <MapContainer
                      center={currentCenter}
                      zoom={13}
                      scrollWheelZoom
                      className="h-[420px] w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapCenterUpdater center={currentCenter} />
                      {routePositions.length > 1 && (
                        <Polyline
                          positions={routePositions}
                          pathOptions={{ color: "#0284c7", weight: 5 }}
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
                    </MapContainer>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                    
                   
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Pickup
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {activeDelivery.pickup_location}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Dropoff
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        {activeDelivery.dropoff_location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {latestLocation && (
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-2xl border-slate-200"
                      >
                        <a
                          href={buildGoogleMapsSearchUrl(
                            latestLocation.latitude,
                            latestLocation.longitude,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LocateFixed className="mr-2 h-4 w-4" />
                          Open current point in Google Maps
                        </a>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-2xl border-slate-200"
                    >
                      <a
                        href={buildGoogleMapsDirectionsUrl(
                          activeDelivery.dropoff_location,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Navigate to dropoff
                      </a>
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Select a delivery to see its live tracking map.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tracking Feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Navigation className="h-4 w-4 text-sky-600" />
                  <span>{isSharing ? "Sharing live GPS" : "Not sharing yet"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-sky-600" />
                  <span>
                    {lastSentAt
                      ? `Last sync ${formatDateTime(lastSentAt)}`
                      : "No GPS sync recorded"}
                  </span>
                </div>
              </div>

              <Separator />

             
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverLiveTrackingPage;
