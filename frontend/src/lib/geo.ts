type LatLng = { lat: number; lng: number };

export const haversineKm = (a: LatLng, b: LatLng) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
};

const geocodeCache = new Map<string, LatLng | null>();

export const geocodeAreaName = async (query: string): Promise<LatLng | null> => {
  const normalized = String(query || "").trim();
  if (!normalized) return null;
  if (geocodeCache.has(normalized)) return geocodeCache.get(normalized) || null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    normalized,
  )}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    geocodeCache.set(normalized, null);
    return null;
  }

  const payload = (await response.json()) as Array<any>;
  const first = Array.isArray(payload) ? payload[0] : null;
  const lat = first ? Number(first.lat) : NaN;
  const lng = first ? Number(first.lon) : NaN;
  const coords =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  geocodeCache.set(normalized, coords);
  return coords;
};

