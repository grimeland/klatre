"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { Crag } from "@/types/crag";
import { formatDryness, formatDistance } from "@/lib/utils/format";
import { ExploreBottomSheet } from "./ExploreBottomSheet";

type Props = {
  crags: Crag[];
};

const OSLO: [number, number] = [59.9139, 10.7522];

export function ExploreMap({ crags }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => crags.find((c) => c.id === selectedId) ?? null,
    [crags, selectedId],
  );

  return (
    <div className="relative h-full w-full">
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
        <FitBounds crags={crags} />
        {crags.map((c) => (
          <CragMarker
            key={c.id}
            crag={c}
            selected={c.id === selectedId}
            onSelect={() => setSelectedId(c.id)}
          />
        ))}
      </MapContainer>

      {selected && (
        <ExploreBottomSheet
          crag={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function FitBounds({ crags }: { crags: Crag[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current) return;
    if (crags.length === 0) return;
    const bounds = L.latLngBounds(
      crags.map((c) => [c.location.lat, c.location.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 9 });
    fitted.current = true;
  }, [map, crags]);
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
