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

type Tab = "all" | "nearby" | "weather";
const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Alle felt" },
  { id: "nearby", label: "Nær deg" },
  { id: "weather", label: "Bra vær" },
];

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
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(initialFilterOpen);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [query, setQuery] = useState(initialQuery);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  const filtered = useMemo(() => {
    let xs = filterCrags(crags, filters);
    if (activeTab === "nearby") xs = xs.filter((c) => c.distanceMinutes <= 90);
    if (activeTab === "weather") {
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
    if (activeTab === "weather") {
      return xs.sort(
        (a, b) =>
          (weather?.[b.slug]?.score ?? 0) - (weather?.[a.slug]?.score ?? 0),
      );
    }
    return xs.sort((a, b) => a.distanceMinutes - b.distanceMinutes);
  }, [crags, filters, activeTab, query, weather]);

  useEffect(() => {
    if (!filtered.find((c) => c.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  const summary =
    activeTab === "weather"
      ? `${filtered.length} felt med bra vær`
      : activeTab === "nearby"
        ? `${filtered.length} felt innen 90 min fra Oslo`
        : `${filtered.length} felt`;

  const filterBadge = filterCount(filters);

  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onOpenFilters={() => setFilterOpen(true)}
        filterBadge={filterBadge}
      />
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

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
            className={`h-full w-full transition-[padding] duration-300 ease-in-out ${
              mapFullscreen ? "" : "md:p-4 md:pl-0"
            }`}
          >
            <div
              className={`h-full w-full overflow-hidden transition-[border-radius] duration-300 ease-in-out ${
                mapFullscreen ? "" : "md:rounded-3xl"
              }`}
            >
              <ExploreMap
                crags={filtered}
                selectedId={selectedId}
                onSelect={setSelectedId}
                isFullscreen={mapFullscreen}
                onToggleFullscreen={() => setMapFullscreen((v) => !v)}
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

function Tabs({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="no-scrollbar flex flex-shrink-0 gap-2 overflow-x-auto px-4 py-3 md:px-8">
      {TABS.map((t) => {
        const on = t.id === activeTab;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition ${
              on
                ? "border-ink bg-ink text-white"
                : "border-line bg-card text-ink-2"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
