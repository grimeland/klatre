"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Map as MapIcon, List } from "lucide-react";
import type { Crag } from "@/types/crag";
import { CragCardLarge } from "@/components/cards/CragCardLarge";
import { FilterModal } from "@/components/filters/FilterModal";
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

export function HomeView({ crags }: { crags: Crag[] }) {
  const [view, setView] = useState<"list" | "map">("list");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let xs = filterCrags(crags, filters);
    if (activeTab === "nearby") xs = xs.filter((c) => c.distanceMinutes <= 90);
    if (activeTab === "weather")
      xs = xs.filter(
        (c) =>
          c.dryness.kind === "dry-cap" ||
          (c.dryness.kind === "dry" && c.dryness.days >= 3),
      );
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      xs = xs.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q),
      );
    }
    return xs.sort((a, b) => a.distanceMinutes - b.distanceMinutes);
  }, [crags, filters, activeTab, query]);

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
      <Header
        query={query}
        onQuery={setQuery}
        onOpenFilters={() => setFilterOpen(true)}
        filterBadge={filterBadge}
      />
      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="relative flex flex-1 min-h-0">
        <div
          className={`no-scrollbar flex-1 overflow-y-auto md:flex-none md:w-3/5 lg:w-1/2 ${
            view === "map" ? "hidden md:block" : ""
          }`}
        >
          <div className="px-4 pb-28 pt-4 md:px-8 md:pb-12">
            <p className="text-[14px] font-semibold text-ink md:text-[15px]">
              {summary}
            </p>
            <div className="mt-4 grid gap-x-4 gap-y-7 md:grid-cols-2 md:gap-x-5 md:gap-y-9 lg:grid-cols-3">
              {filtered.map((c) => (
                <CragCardLarge key={c.id} crag={c} />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`${
            view === "list"
              ? "hidden md:block"
              : "absolute inset-0 md:relative md:inset-auto"
          } md:flex-1`}
          style={{ zIndex: view === "map" ? 50 : "auto" }}
        >
          <div className="h-full w-full md:p-4 md:pl-0">
            <div className="h-full w-full overflow-hidden md:rounded-3xl">
              <ExploreMap
                crags={filtered}
                selectedId={selectedId}
                onSelect={setSelectedId}
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
        {view === "list" ? <MapIcon size={16} /> : <List size={16} />}
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

function Header({
  query,
  onQuery,
  onOpenFilters,
  filterBadge,
}: {
  query: string;
  onQuery: (s: string) => void;
  onOpenFilters: () => void;
  filterBadge: number;
}) {
  return (
    <header className="flex flex-shrink-0 items-center gap-3 border-b border-line/40 bg-bg/95 px-4 py-3 backdrop-blur md:px-8 md:py-4">
      <Link
        href="/"
        className="flex-shrink-0 font-serif text-[22px] tracking-tight text-ink md:text-[28px]"
      >
        Felt
      </Link>

      <div className="flex flex-1 items-center gap-2 md:max-w-xl">
        <label
          htmlFor="felt-search"
          className="flex flex-1 items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 shadow-sm focus-within:border-ink"
        >
          <Search size={16} className="text-ink-2" />
          <input
            id="felt-search"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Søk i felt"
            className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
        </label>

        <button
          type="button"
          onClick={onOpenFilters}
          aria-label="Filtre"
          className="relative flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-[13px] font-medium text-ink-2 hover:border-ink md:px-4"
        >
          <SlidersHorizontal size={16} />
          <span className="hidden md:inline">Filtre</span>
          {filterBadge > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[10px] font-bold text-white">
              {filterBadge}
            </span>
          )}
        </button>
      </div>

      <Link
        href="/profil"
        className="hidden flex-shrink-0 rounded-full border border-line bg-card px-4 py-2 text-[13px] font-medium text-ink md:inline-flex"
      >
        Logg inn
      </Link>
    </header>
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
