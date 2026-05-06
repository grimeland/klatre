import type { LatLng } from "@/types/crag";

const OSLO: LatLng = { lat: 59.9139, lng: 10.7522 };

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function estimateDriveMinutesFromOslo(to: LatLng): number {
  const km = haversineKm(OSLO, to);
  const drivingKm = km * 1.35;
  const minutes = (drivingKm / 70) * 60;
  return Math.round(minutes);
}

export function googleMapsDirectionsUrl(to: LatLng, name?: string): string {
  const dest = `${to.lat},${to.lng}`;
  const params = new URLSearchParams({
    api: "1",
    destination: dest,
  });
  if (name) params.set("destination_place_id", "");
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
