import React, { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type LatLngPoint = {
  lat: number;
  lng: number;
};

type LiveRouteMapProps = {
  center: LatLngPoint;
  startPoint?: LatLngPoint | null;
  currentPoint?: LatLngPoint | null;
  dropoffPoint?: LatLngPoint | null;
  traveledRoute?: [number, number][];
  remainingRoute?: [number, number][];
  className?: string;
};

const createRouteIcon = (label: string, color: string) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:34px;
        height:34px;
        border-radius:9999px;
        border:3px solid white;
        background:${color};
        color:white;
        font-size:11px;
        font-weight:700;
        box-shadow:0 8px 18px rgba(15,23,42,0.25);
      ">${label}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });

const startIcon = createRouteIcon("S", "#16a34a");
const currentIcon = createRouteIcon("D", "#2563eb");
const dropoffIcon = createRouteIcon("E", "#dc2626");

const MapViewportUpdater: React.FC<{
  center: LatLngPoint;
  boundsPoints: LatLngPoint[];
  viewportKey: string;
}> = ({ center, boundsPoints, viewportKey }) => {
  const map = useMap();
  const lastViewportKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastViewportKeyRef.current === viewportKey) {
      return;
    }

    lastViewportKeyRef.current = viewportKey;

    if (boundsPoints.length > 1) {
      map.fitBounds(
        L.latLngBounds(boundsPoints.map((point) => [point.lat, point.lng])),
        { padding: [36, 36], maxZoom: 15 },
      );
      return;
    }

    map.setView(center, Math.max(map.getZoom(), 14));
  }, [boundsPoints, center, map, viewportKey]);

  return null;
};

const LiveRouteMap: React.FC<LiveRouteMapProps> = ({
  center,
  startPoint,
  currentPoint,
  dropoffPoint,
  traveledRoute = [],
  remainingRoute = [],
  className = "h-80 w-full",
}) => {
  const boundsPoints = useMemo(
    () =>
      [startPoint, currentPoint, dropoffPoint].filter(
        Boolean,
      ) as LatLngPoint[],
    [currentPoint, dropoffPoint, startPoint],
  );
  const viewportKey = useMemo(
    () =>
      [startPoint, dropoffPoint]
        .map((point) => (point ? `${point.lat},${point.lng}` : "none"))
        .join("|"),
    [dropoffPoint, startPoint],
  );

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewportUpdater
        center={center}
        boundsPoints={boundsPoints}
        viewportKey={viewportKey}
      />
      {traveledRoute.length > 1 && (
        <Polyline
          positions={traveledRoute}
          pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.9 }}
        />
      )}
      {remainingRoute.length === 2 && (
        <Polyline
          positions={remainingRoute}
          pathOptions={{ color: "#93c5fd", weight: 5, opacity: 0.9 }}
        />
      )}
      {startPoint && (
        <Marker position={startPoint} icon={startIcon}>
          <Tooltip direction="top" offset={[0, -12]}>
            Start / pickup
          </Tooltip>
        </Marker>
      )}
      {currentPoint && (
        <Marker position={currentPoint} icon={currentIcon}>
          <Tooltip direction="top" offset={[0, -12]}>
            Current driver position
          </Tooltip>
        </Marker>
      )}
      {dropoffPoint && (
        <Marker position={dropoffPoint} icon={dropoffIcon}>
          <Tooltip direction="top" offset={[0, -12]}>
            Drop-off / destination
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LiveRouteMap;
