"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Crag } from "@/types/crag";
import { CragCardLarge } from "@/components/cards/CragCardLarge";

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

  const filtered = useMemo(() => {
    let xs = [...crags];
    if (activeTab === "nearby") xs = xs.filter((c) => c.distanceMinutes <= 90);
    if (activeTab === "weather")
      xs = xs.filter(
        (c) =>
          c.dryness.kind === "dry-cap" ||
          (c.dryness.kind === "dry" && c.dryness.days >= 3),
      );
    return xs.sort((a, b) => a.distanceMinutes - b.distanceMinutes);
  }, [crags, activeTab]);

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
        : `${filtered.length} felt i Norge`;

  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <Header />
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
                <CragCardLarge
                  key={c.id}
                  crag={c}
                  isActive={c.id === selectedId}
                />
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
        <span aria-hidden>{view === "list" ? "🗺" : "📋"}</span>
        {view === "list" ? "Vis kart" : "Vis liste"}
      </button>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-line/40 bg-bg/95 px-4 py-3 backdrop-blur md:px-8 md:py-4">
      <Link
        href="/"
        className="font-serif text-[22px] tracking-tight text-ink md:text-[28px]"
      >
        Felt
      </Link>

      <Link
        href="/utforsk"
        className="hidden max-w-md flex-1 items-center gap-3 rounded-full border border-line bg-card px-2 py-1.5 shadow-sm md:flex"
      >
        <span className="flex-1 px-3 text-[13px] font-semibold text-ink">
          Klatre i Norge
        </span>
        <span className="border-l border-line px-3 text-[13px] text-ink-2">
          Sport
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-ink">
          <span aria-hidden>⌕</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-[13px] font-medium text-ink-2 md:px-4 md:py-2"
        >
          <span aria-hidden>⇅</span>
          <span className="hidden md:inline">Filtre</span>
        </button>
        <Link
          href="/profil"
          className="hidden rounded-full border border-line bg-card px-3 py-2 text-[13px] font-medium text-ink md:inline-flex"
        >
          Logg inn
        </Link>
      </div>
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
