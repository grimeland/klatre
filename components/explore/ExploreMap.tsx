"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Maximize2, Minus, Navigation, Plus, X } from "lucide-react";
import type { Crag } from "@/types/crag";
import { MapPreviewSheet } from "./MapPreviewSheet";

type Props = {
  crags: Crag[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
};

const OSLO: [number, number] = [59.9139, 10.7522];

type GeoStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

function useGeolocation() {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");

  const request = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      console.warn("[Felt] geolocation: navigator.geolocation unavailable");
      setStatus("unavailable");
      return;
    }
    console.log("[Felt] geolocation: requesting position…");
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("[Felt] geolocation: granted", pos.coords);
        setCoords([pos.coords.latitude, pos.coords.longitude]);
        setStatus("granted");
      },
      (err) => {
        console.warn("[Felt] geolocation: denied or failed", err.code, err.message);
        setStatus("denied");
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
    );
  };

  useEffect(() => {
    request();
  }, []);

  return { coords, status, request };
}

export function ExploreMap({
  crags,
  selectedId,
  onSelect,
  isFullscreen = false,
  onToggleFullscreen,
}: Props) {
  const selected = useMemo(
    () => crags.find((c) => c.id === selectedId) ?? null,
    [crags, selectedId],
  );
  const { coords: userCoords, status: geoStatus, request: requestGeo } =
    useGeolocation();

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
        <FitView crags={crags} userCoords={userCoords} />
        <FullscreenSync isFullscreen={isFullscreen} />
        <ClickToDeselect
          hasSelection={selectedId !== null}
          onDeselect={() => onSelect(null)}
        />
        {userCoords && <UserMarker coords={userCoords} />}
        {crags.map((c) => (
          <CragMarker
            key={c.id}
            crag={c}
            selected={c.id === selectedId}
            onSelect={() => onSelect(c.id)}
          />
        ))}
        {selected && (
          <MapPreviewSheet
            crag={selected}
            onClose={() => onSelect(null)}
          />
        )}
        <MapControls
          onLocate={requestGeo}
          geoBusy={geoStatus === "requesting"}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      </MapContainer>

      {(geoStatus === "denied" || geoStatus === "unavailable") && (
        <div className="absolute left-1/2 top-4 z-[400] flex -translate-x-1/2 items-center gap-3 rounded-full bg-white px-4 py-2 text-[13px] text-ink-2 shadow-lg ring-1 ring-black/5">
          <span>
            {geoStatus === "denied"
              ? "Posisjon avslått — sjekk nettleser-innstillinger"
              : "Posisjon ikke tilgjengelig"}
          </span>
          <button
            type="button"
            onClick={requestGeo}
            className="rounded-full bg-ink px-3 py-1 text-[12px] font-semibold text-white"
          >
            Prøv igjen
          </button>
        </div>
      )}
    </div>
  );
}

function MapControls({
  onLocate,
  geoBusy,
  isFullscreen,
  onToggleFullscreen,
}: {
  onLocate: () => void;
  geoBusy: boolean;
  isFullscreen: boolean;
  onToggleFullscreen?: () => void;
}) {
  const map = useMap();

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-[400] flex flex-col items-end gap-3">
      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "Lukk fullskjerm" : "Fullskjerm"}
          className="pointer-events-auto hidden h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-lg ring-1 ring-black/5 transition active:scale-95 md:flex"
        >
          {isFullscreen ? <X size={20} /> : <Maximize2 size={18} />}
        </button>
      )}

      <div className="pointer-events-auto flex flex-col overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-black/5">
        <button
          type="button"
          onClick={onLocate}
          disabled={geoBusy}
          aria-label="Sentrer på min posisjon"
          className={`flex h-11 w-11 items-center justify-center text-ink transition active:bg-bg disabled:opacity-60 ${
            geoBusy ? "animate-pulse" : ""
          }`}
        >
          <Navigation size={18} />
        </button>
        <button
          type="button"
          onClick={() => map.zoomIn()}
          aria-label="Zoom inn"
          className="flex h-11 w-11 items-center justify-center border-t border-line/40 text-ink transition active:bg-bg"
        >
          <Plus size={20} />
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          aria-label="Zoom ut"
          className="flex h-11 w-11 items-center justify-center border-t border-line/40 text-ink transition active:bg-bg"
        >
          <Minus size={20} />
        </button>
      </div>
    </div>
  );
}

function FullscreenSync({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();
  useEffect(() => {
    // Leaflet only renders tiles for the visible viewport. When the
    // container resizes (fullscreen toggle), we need to tell Leaflet to
    // recalculate after the CSS transition finishes.
    const t = setTimeout(() => map.invalidateSize(), 320);
    return () => clearTimeout(t);
  }, [map, isFullscreen]);
  return null;
}

function ClickToDeselect({
  hasSelection,
  onDeselect,
}: {
  hasSelection: boolean;
  onDeselect: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (!hasSelection) return;
    const handler = () => onDeselect();
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, hasSelection, onDeselect]);
  return null;
}

function FitView({
  crags,
  userCoords,
}: {
  crags: Crag[];
  userCoords: [number, number] | null;
}) {
  const map = useMap();
  const lastUserCoords = useRef<string | null>(null);
  const fittedAll = useRef(false);

  useEffect(() => {
    if (userCoords) {
      const key = userCoords.join(",");
      if (lastUserCoords.current === key) return;
      lastUserCoords.current = key;

      const nearestKm = crags.reduce((min, c) => {
        const d = distanceKm(userCoords, [c.location.lat, c.location.lng]);
        return d < min ? d : min;
      }, Infinity);

      const zoom =
        nearestKm < 3 ? 13
        : nearestKm < 10 ? 12
        : nearestKm < 30 ? 11
        : nearestKm < 80 ? 10
        : 8;

      console.log(
        `[Felt] map: centering on user, nearest crag ${nearestKm.toFixed(1)} km, zoom ${zoom}`,
      );
      map.flyTo(userCoords, zoom, { duration: 0.8 });
      return;
    }

    if (fittedAll.current || crags.length === 0) return;
    const bounds = L.latLngBounds(
      crags.map((c) => [c.location.lat, c.location.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 9 });
    fittedAll.current = true;
  }, [map, crags, userCoords]);

  return null;
}

function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function UserMarker({ coords }: { coords: [number, number] }) {
  const icon = L.divIcon({
    className: "felt-user-pin-wrap",
    html: '<div class="felt-user-pin"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
  return <Marker position={coords} icon={icon} interactive={false} />;
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
  const display = crag.name.length > 22
    ? `${crag.name.slice(0, 21).trim()}…`
    : crag.name;
  const html = `<div class="felt-pin ${selected ? "selected" : ""}">${escapeHtml(display)}</div>`;

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
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          onSelect();
        },
      }}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
