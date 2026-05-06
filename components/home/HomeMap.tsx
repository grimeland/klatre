"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { Crag } from "@/types/crag";
import { formatDistance, formatDryness } from "@/lib/utils/format";

type Props = {
  crags: Crag[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  flyToTick: number;
  flyToId: string | null;
};

const OSLO: [number, number] = [59.9139, 10.7522];

export function HomeMap({
  crags,
  selectedId,
  onSelect,
  flyToTick,
  flyToId,
}: Props) {
  return (
    <MapContainer
      center={OSLO}
      zoom={7}
      zoomControl={false}
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
      <FitBoundsOnce crags={crags} />
      <FlyTo crags={crags} flyToId={flyToId} tick={flyToTick} />
      {crags.map((c) => (
        <CragMarker
          key={c.id}
          crag={c}
          selected={c.id === selectedId}
          onSelect={() => onSelect(c.id)}
        />
      ))}
    </MapContainer>
  );
}

function FitBoundsOnce({ crags }: { crags: Crag[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current) return;
    if (crags.length === 0) return;
    const bounds = L.latLngBounds(
      crags.map((c) => [c.location.lat, c.location.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 9 });
    fitted.current = true;
  }, [map, crags]);
  return null;
}

function FlyTo({
  crags,
  flyToId,
  tick,
}: {
  crags: Crag[];
  flyToId: string | null;
  tick: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!flyToId) return;
    const c = crags.find((x) => x.id === flyToId);
    if (!c) return;
    map.flyTo([c.location.lat, c.location.lng], 11, { duration: 0.8 });
  }, [tick, flyToId, crags, map]);
  return null;
}

function CragMarker({
  crag,
  selected,
  onSelect,
}: {
  crag: Crag;
  selected: boolean;
  onSelect: () => void;
}) {
  const formatted = formatDryness(crag.dryness);
  const icon = formatted?.icon ?? "📍";
  const distance = formatDistance(crag.distanceMinutes);

  const html = `<div class="felt-pin ${selected ? "selected" : ""}"><span class="ic">${icon}</span><span>${distance}</span></div>`;

  const divIcon = L.divIcon({
    className: "felt-pin-wrap",
    html,
    iconSize: undefined as unknown as L.PointExpression,
    iconAnchor: [0, 0],
  });

  return (
    <Marker
      position={[crag.location.lat, crag.location.lng]}
      icon={divIcon}
      eventHandlers={{ click: onSelect }}
    />
  );
}
