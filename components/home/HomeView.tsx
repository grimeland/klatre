"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Crag } from "@/types/crag";
import { HomePanel, type Tab } from "./HomePanel";

const HomeMap = dynamic(() => import("./HomeMap").then((m) => m.HomeMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#e9e3d5]" />,
});

export function HomeView({ crags }: { crags: Crag[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("nearby");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyToTick, setFlyToTick] = useState(0);
  const [flyToId, setFlyToId] = useState<string | null>(null);

  const filteredCrags = useMemo(() => {
    if (activeTab === "nearby") {
      return crags
        .filter((c) => c.distanceMinutes <= 90)
        .sort((a, b) => a.distanceMinutes - b.distanceMinutes);
    }
    if (activeTab === "weather") {
      return crags
        .filter(
          (c) =>
            c.dryness.kind === "dry-cap" ||
            (c.dryness.kind === "dry" && c.dryness.days >= 3),
        )
        .sort((a, b) => a.distanceMinutes - b.distanceMinutes);
    }
    return [...crags].sort((a, b) => a.distanceMinutes - b.distanceMinutes);
  }, [crags, activeTab]);

  function showOnMap(id: string) {
    setSelectedId(id);
    setFlyToId(id);
    setFlyToTick((t) => t + 1);
  }

  return (
    <div className="fixed inset-0 bg-[#e9e3d5]">
      <div className="absolute inset-0">
        <HomeMap
          crags={crags}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          flyToTick={flyToTick}
          flyToId={flyToId}
        />
      </div>

      <div
        className="
          absolute overflow-hidden bg-white shadow-2xl
          inset-x-2 bottom-2 top-[40%] rounded-3xl
          md:inset-y-4 md:left-4 md:right-auto md:top-4 md:w-[400px] md:rounded-3xl
        "
        style={{ zIndex: 1100 }}
      >
        <HomePanel
          crags={filteredCrags}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedId={selectedId}
          onShowOnMap={showOnMap}
        />
      </div>

      <div
        className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 md:bottom-6"
        style={{ zIndex: 1200 }}
      >
        <Link
          href="/utforsk"
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-white shadow-xl transition active:scale-[0.98]"
        >
          <span aria-hidden>⌕</span>
          Søk og filtrer
        </Link>
      </div>
    </div>
  );
}
