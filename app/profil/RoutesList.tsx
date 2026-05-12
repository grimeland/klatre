"use client";

import { useState } from "react";
import type { Route } from "@/types/crag";
import type { RouteTick } from "@/lib/logbook/load";
import { RouteSheet } from "@/components/logbook/RouteSheet";

export type RouteEntry = {
  route: Route;
  cragSlug: string;
  cragName: string;
  ticks: RouteTick[];
  bestStyle: RouteTick["sendStyle"];
  lastClimbedOn: string;
  lastComment: string | null;
};

const STYLE_LABEL: Record<RouteTick["sendStyle"], string> = {
  onsight: "Onsight",
  flash: "Flash",
  redpoint: "Redpoint",
  top_rope: "Topptau",
  tried: "Prøvd",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export function RoutesList({ entries }: { entries: RouteEntry[] }) {
  const [active, setActive] = useState<RouteEntry | null>(null);

  return (
    <>
      <ul className="flex flex-col gap-2">
        {entries.map((e) => (
          <li key={e.route.id}>
            <button
              type="button"
              onClick={() => setActive(e)}
              className="flex w-full items-start gap-3 rounded-2xl bg-card px-4 py-3 text-left transition active:opacity-80"
            >
              <span className="font-mono mt-0.5 flex-none rounded bg-bg px-2 py-1 text-[11px] font-semibold text-ink-2">
                {STYLE_LABEL[e.bestStyle]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-ink">
                  {e.route.name}
                  <span className="ml-2 font-mono text-[12px] text-ink-3">
                    {e.route.grade}
                  </span>
                  {e.ticks.length > 1 && (
                    <span className="ml-2 text-[12px] text-ink-3">
                      · {e.ticks.length} ganger
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-3">
                  {e.cragName || "Ukjent felt"} ·{" "}
                  {formatDate(e.lastClimbedOn)}
                </p>
                {e.lastComment && (
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
                    {e.lastComment}
                  </p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <RouteSheet
          open
          onClose={() => setActive(null)}
          route={active.route}
          cragSlug={active.cragSlug}
          isAuthenticated
          isProject={false}
          ticks={active.ticks}
        />
      )}
    </>
  );
}
