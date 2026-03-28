import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, Clock, MapPin, Navigation, Package, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

const POLL_INTERVAL_MS = 5000;

const mapMarkerIcon = new L.Icon({
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
    map.setView(center);
  }, [center, map]);

  return null;
};

const resolveFallbackBackPath = (pathname: string, orderId: string) => {
  if (pathname.startsWith("/retailer/")) return `/retailer/orders/${orderId}`;
  if (pathname.startsWith("/distributor/")) return `/distributor/orders/${orderId}`;
  if (pathname.startsWith("/factory/")) return `/factory/orders/${orderId}`;
  return "/";
};

const OrderTrackingPage: React.FC = () => {
  const { id: orderId = "" } = useParams<{ id: string }>();
  const location = useLocation();

  const [order, setOrder] = useState<Order | null>(null);
  const [locations, setLocations] = useState<DriverLocationPoint[]>([]);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
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
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load order details.");
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
    let intervalId: number | undefined;

    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const response = await driverLocationService.getByOrderId(orderId);
        const data = response?.data ?? response;
        if (!cancelled && Array.isArray(data)) {
          setLocations(data as DriverLocationPoint[]);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Failed to load driver location for this order.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLocations(false);
        }
      }
    };

    fetchLocations();
    intervalId = window.setInterval(fetchLocations, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [orderId]);

  const showEmpty = !isLoadingLocations && !latestLocation && !error;

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

          {latestLocation && (
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden border bg-white">
                <MapContainer
                  center={{
                    lat: latestLocation.latitude,
                    lng: latestLocation.longitude,
                  }}
                  zoom={14}
                  scrollWheelZoom
                  className="h-80 w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapCenterUpdater
                    center={{
                      lat: latestLocation.latitude,
                      lng: latestLocation.longitude,
                    }}
                  />
                  <Marker
                    position={{
                      lat: latestLocation.latitude,
                      lng: latestLocation.longitude,
                    }}
                    icon={mapMarkerIcon}
                  />
                </MapContainer>
              </div>
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

              {locations.length > 1 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recent Location Points</p>
                    <ScrollArea className="h-48 pr-3">
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
                              className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-xs"
                            >
                              <span>
                                Lat {loc.latitude}, Lng {loc.longitude}
                              </span>
                              <span className="text-muted-foreground">
                                {formatDateTime(loc.recorded_at)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTrackingPage;
