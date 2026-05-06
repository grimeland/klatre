"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Crag } from "@/types/crag";
import { formatDistance } from "@/lib/utils/format";
import { DrynessBadge } from "@/components/ui/DrynessBadge";

export type Tab = "nearby" | "weather" | "all";

const TABS: { id: Tab; label: string }[] = [
  { id: "nearby", label: "Nær deg" },
  { id: "weather", label: "Bra vær" },
  { id: "all", label: "Alle felt" },
];

type Props = {
  crags: Crag[];
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  selectedId: string | null;
  onShowOnMap: (id: string) => void;
};

export function HomePanel({
  crags,
  activeTab,
  onTabChange,
  selectedId,
  onShowOnMap,
}: Props) {
  const refs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!selectedId) return;
    const el = refs.current.get(selectedId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-line/60 px-5 pb-3 pt-5">
        <Link
          href="/"
          aria-label="Felt"
          className="font-serif text-[24px] leading-none tracking-tight text-ink"
        >
          Felt
        </Link>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-[12px] font-medium text-ink-2"
          aria-label="Info"
        >
          <span aria-hidden>ⓘ</span>
          <span>Info</span>
        </button>
      </div>

      <div className="flex flex-shrink-0 gap-1 border-b border-line/60 px-3 pb-3 pt-3">
        {TABS.map((t) => {
          const on = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`flex-1 rounded-full px-4 py-2 text-[13px] font-medium transition ${
                on ? "bg-ink text-white" : "text-ink-2 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {crags.length === 0 ? (
          <p className="px-3 py-8 text-center text-[14px] text-ink-3">
            Ingen felt matcher dette filteret.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {crags.map((crag) => (
              <div
                key={crag.id}
                ref={(el) => {
                  if (el) refs.current.set(crag.id, el);
                  else refs.current.delete(crag.id);
                }}
                className={`overflow-hidden rounded-2xl bg-card transition ${
                  crag.id === selectedId ? "ring-2 ring-ink" : "ring-0"
                }`}
              >
                <Link
                  href={`/felt/${crag.slug}`}
                  className="block transition active:scale-[0.99]"
                >
                  <div className="relative">
                    <div className="absolute right-2 top-2 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onShowOnMap(crag.id);
                        }}
                        className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-ink shadow-sm"
                      >
                        <span aria-hidden>🗺</span>
                        Vis i kart
                      </button>
                    </div>
                    <div className="absolute left-2 top-2 z-10">
                      <DrynessBadge dryness={crag.dryness} />
                    </div>
                    <div
                      className={`h-[110px] w-full crag-img-${crag.imageId}`}
                      aria-hidden
                    />
                  </div>
                  <div className="px-3 pb-3 pt-2.5">
                    <div className="text-[14px] font-semibold leading-tight text-ink">
                      {crag.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-3">
                      {formatDistance(crag.distanceMinutes)} · {crag.area}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
