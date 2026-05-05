"use client";

import { useState } from "react";
import type { Route } from "@/types/crag";

const TABS = [
  { id: "all", label: "Alle", min: 0, max: 99 },
  { id: "easy", label: "4–5", min: 8, max: 13 },
  { id: "six", label: "6", min: 14, max: 17 },
  { id: "seven", label: "7", min: 18, max: 21 },
  { id: "hard", label: "8a+", min: 22, max: 99 },
] as const;

export function RouteList({ routes }: { routes: Route[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = routes.filter((r) => {
    const t = TABS.find((x) => x.id === tab);
    if (!t) return true;
    return r.gradeNumeric >= t.min && r.gradeNumeric <= t.max;
  });

  const visible = showAll ? filtered : filtered.slice(0, 8);

  return (
    <div>
      <div className="flex gap-1 rounded-full border border-line bg-card p-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-full px-3 py-2 text-[13px] font-medium transition ${
                active ? "bg-ink text-white" : "text-ink-2"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 px-4 py-6 text-center text-[14px] text-ink-3">
          Ingen ruter i denne grad-gruppen
        </p>
      ) : (
        <div className="mt-3 rounded-2xl bg-card p-1.5 md:p-2">
          {visible.map((r, i) => (
            <button
              key={r.id}
              type="button"
              className={`flex w-full items-center gap-3 px-3 py-3 text-left transition active:bg-bg ${
                i < visible.length - 1 ? "" : ""
              }`}
            >
              <span
                aria-label={`${r.stars} stjerner`}
                className="w-9 flex-none text-[11px] tracking-tighter text-sun"
              >
                {"★".repeat(r.stars) || "·"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-ink">
                  {r.name}
                  {r.isClassic && (
                    <span className="ml-2 text-[10px] font-bold tracking-wider text-primary">
                      Klassiker
                    </span>
                  )}
                </span>
                <span className="block text-[12px] text-ink-3">
                  {r.lengthM} m · {labelForType(r.type)} · {r.ascents}{" "}
                  sendinger
                </span>
              </span>
              <span className="font-mono flex-none rounded-lg bg-bg px-2.5 py-1.5 text-[12px] font-bold tracking-tight text-ink">
                {r.grade}
              </span>
            </button>
          ))}
        </div>
      )}

      {!showAll && filtered.length > 8 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 w-full rounded-full border border-line bg-card py-3 text-[14px] font-semibold text-ink"
        >
          Vis alle {filtered.length} ruter
        </button>
      )}
    </div>
  );
}

function labelForType(t: Route["type"]): string {
  if (t === "buldring") return "Buldring";
  if (t === "trad") return "Trad";
  return "Sport";
}
