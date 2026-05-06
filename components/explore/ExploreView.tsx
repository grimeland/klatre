"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Crag } from "@/types/crag";
import { CragCardLarge } from "@/components/cards/CragCardLarge";

const ExploreMap = dynamic(
  () => import("./ExploreMap").then((m) => m.ExploreMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-zinc-100 text-ink-3">
        Laster kart …
      </div>
    ),
  },
);

const FILTER_CHIPS = [
  { id: "sport", label: "Sport" },
  { id: "trad", label: "Trad" },
  { id: "buldring", label: "Buldring" },
  { id: "dry-3", label: "Tørt 3+ dager" },
];

type ViewMode = "list" | "map";

export function ExploreView({ crags }: { crags: Crag[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialView: ViewMode = searchParams?.get("view") === "map" ? "map" : "list";

  const [view, setView] = useState<ViewMode>(initialView);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const next: ViewMode = searchParams?.get("view") === "map" ? "map" : "list";
    setView(next);
  }, [searchParams]);

  function toggleView() {
    const next = view === "list" ? "map" : "list";
    setView(next);
    const params = new URLSearchParams(searchParams?.toString());
    if (next === "map") params.set("view", "map");
    else params.delete("view");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function toggleFilter(id: string) {
    setActiveFilters((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-shrink-0 items-center gap-2 px-4 pt-3 pb-3 md:px-8 md:pt-6 md:pb-5">
        <Link
          href="/"
          aria-label="Tilbake"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-line bg-card text-ink"
        >
          <span aria-hidden>←</span>
        </Link>
        <button
          type="button"
          className="flex flex-1 flex-col items-center rounded-full border border-line bg-card px-4 py-2 text-center shadow-sm md:px-6 md:py-3"
        >
          <span className="text-[14px] font-semibold text-ink md:text-[15px]">
            Klatre nær Oslo
          </span>
          <span className="text-[11px] text-ink-3 md:text-[12px]">
            {crags.length} felt · sortert etter avstand
          </span>
        </button>
        <button
          type="button"
          aria-label="Filtre"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-line bg-card text-ink"
        >
          <span aria-hidden>⇅</span>
        </button>
      </header>

      <div className="no-scrollbar flex flex-shrink-0 gap-2 overflow-x-auto px-4 pb-3 md:px-8 md:pb-5">
        {FILTER_CHIPS.map((c) => {
          const on = activeFilters.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleFilter(c.id)}
              className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                on
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-card text-ink-2"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 min-h-0">
        {view === "list" ? (
          <div className="grid gap-4 px-4 pb-28 md:grid-cols-2 md:gap-6 md:px-8 md:pb-12 lg:grid-cols-3">
            {crags.map((c) => (
              <CragCardLarge key={c.id} crag={c} />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0">
            <ExploreMap
              crags={crags}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        )}

        <button
          type="button"
          onClick={toggleView}
          className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg md:bottom-8"
        >
          <span aria-hidden>{view === "list" ? "🗺" : "📋"}</span>
          {view === "list" ? "Vis kart" : "Vis liste"}
        </button>
      </div>
    </div>
  );
}
