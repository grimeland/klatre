"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Crag } from "@/types/crag";
import { CragCardLarge } from "@/components/cards/CragCardLarge";
import { FilterModal } from "@/components/filters/FilterModal";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  DEFAULT_FILTERS,
  filterCount,
  filterCrags,
  type FilterState,
} from "@/components/filters/types";

const ExploreMap = dynamic(
  () => import("@/components/explore/ExploreMap").then((m) => m.ExploreMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-zinc-100" />,
  },
);

export type Bounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type CragWeather = {
  score: number;
  label: string;
  emoji: string;
  precipNext24hMm: number;
};

export type CragWeatherMap = Record<string, CragWeather>;

export function HomeView({
  crags,
  weather,
}: {
  crags: Crag[];
  weather?: CragWeatherMap;
}) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialFilterOpen = searchParams.get("openFilters") === "1";

  const [view, setView] = useState<"list" | "map">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(initialFilterOpen);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [query, setQuery] = useState(initialQuery);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [bounds, setBounds] = useState<Bounds | null>(null);

  const filtered = useMemo(() => {
    let xs = filterCrags(crags, filters);
    if (filters.goodWeatherOnly) {
      xs = xs.filter((c) => (weather?.[c.slug]?.score ?? 0) >= 60);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      xs = xs.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q),
      );
    }

    const baseSort = (a: Crag, b: Crag) => {
      if (filters.goodWeatherOnly) {
        return (
          (weather?.[b.slug]?.score ?? 0) - (weather?.[a.slug]?.score ?? 0)
        );
      }
      return a.distanceMinutes - b.distanceMinutes;
    };

    if (!bounds) return xs.sort(baseSort);

    return [...xs].sort((a, b) => {
      const aIn = isInBounds(a, bounds);
      const bIn = isInBounds(b, bounds);
      if (aIn && !bIn) return -1;
      if (!aIn && bIn) return 1;
      return baseSort(a, b);
    });
  }, [crags, filters, query, weather, bounds]);

  useEffect(() => {
    if (!filtered.find((c) => c.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  const summary = `${filtered.length} felt`;
  const filterBadge = filterCount(filters);

  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onOpenFilters={() => setFilterOpen(true)}
        filterBadge={filterBadge}
      />
      <div className="relative flex flex-1 min-h-0">
        <div
          className={`no-scrollbar overflow-y-auto transition-[width,opacity,padding] duration-300 ease-in-out ${
            mapFullscreen
              ? "md:w-0 md:opacity-0"
              : "flex-1 md:flex-none md:w-3/5 lg:w-1/2 md:opacity-100"
          } ${view === "map" ? "hidden md:block" : ""}`}
        >
          <div className="px-4 pb-28 pt-4 md:px-8 md:pb-12">
            <p className="text-[14px] font-semibold text-ink md:text-[15px]">
              {summary}
            </p>
            <div className="mt-4 grid gap-x-4 gap-y-7 md:grid-cols-2 md:gap-x-5 md:gap-y-9 lg:grid-cols-3">
              {filtered.map((c) => (
                <CragCardLarge
                  key={c.id}
                  crag={c}
                  weather={weather?.[c.slug]}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            view === "list"
              ? "hidden md:block"
              : "absolute inset-0 md:relative md:inset-auto"
          } md:flex-1`}
          style={{ zIndex: view === "map" ? 50 : "auto" }}
        >
          <div
            className={`h-full w-full transition-[padding] duration-300 ease-in-out md:p-4 ${
              mapFullscreen ? "" : "md:pl-0"
            }`}
          >
            <div className="h-full w-full overflow-hidden md:rounded-3xl">
              <ExploreMap
                crags={filtered}
                selectedId={selectedId}
                onSelect={setSelectedId}
                isFullscreen={mapFullscreen}
                onToggleFullscreen={() => setMapFullscreen((v) => !v)}
                onBoundsChange={setBounds}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setView(view === "list" ? "map" : "list")}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-white shadow-lg md:hidden"
        style={{ zIndex: 1200 }}
      >
        <span aria-hidden>{view === "list" ? "🗺" : "📋"}</span>
        {view === "list" ? "Vis kart" : "Vis liste"}
      </button>

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        visibleCount={filtered.length}
      />
    </div>
  );
}

function isInBounds(crag: Crag, b: Bounds): boolean {
  return (
    crag.location.lat >= b.minLat &&
    crag.location.lat <= b.maxLat &&
    crag.location.lng >= b.minLng &&
    crag.location.lng <= b.maxLng
  );
}
