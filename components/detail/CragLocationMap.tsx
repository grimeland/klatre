"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LatLng } from "@/types/crag";

export function CragLocationMap({
  location,
  name,
}: {
  location: LatLng;
  name: string;
}) {
  const html = `<div class="felt-pin selected"><span class="ic">📍</span><span>${escapeHtml(name)}</span></div>`;
  const icon = L.divIcon({
    className: "felt-pin-wrap",
    html,
    iconSize: undefined as unknown as L.PointExpression,
    iconAnchor: [0, 0],
  });

  return (
    <div className="h-[260px] w-full overflow-hidden rounded-2xl md:h-[320px]">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={11}
        zoomControl={false}
        scrollWheelZoom={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
          opacity={0.85}
        />
        <Marker position={[location.lat, location.lng]} icon={icon} />
      </MapContainer>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
