"use client";

import { useMemo, useState } from "react";
import type { Route } from "@/types/crag";
import type { RouteTick } from "@/lib/logbook/load";
import { RouteSheet } from "@/components/logbook/RouteSheet";

const TABS = [
  { id: "all", label: "Alle", min: 0, max: 99 },
  { id: "easy", label: "2–4", min: 0, max: 9 },
  { id: "five", label: "5", min: 10, max: 12 },
  { id: "six", label: "6", min: 13, max: 15 },
  { id: "seven", label: "7", min: 16, max: 18 },
  { id: "hard", label: "8+", min: 19, max: 99 },
] as const;

const COLLAPSED_LIMIT_PER_SECTOR = 6;

export type RouteListLogbook = {
  isAuthenticated: boolean;
  tickedRouteIds: Set<string>;
  projectRouteIds: Set<string>;
  ticksByRoute: Map<string, RouteTick[]>;
};

export function RouteList({
  routes,
  cragSlug,
  logbook,
}: {
  routes: Route[];
  cragSlug: string;
  logbook: RouteListLogbook;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);

  const filtered = useMemo(() => {
    return routes.filter((r) => {
      const t = TABS.find((x) => x.id === tab);
      if (!t) return true;
      return r.gradeNumeric >= t.min && r.gradeNumeric <= t.max;
    });
  }, [routes, tab]);

  const sectors = useMemo(() => groupBySector(filtered), [filtered]);
  const allSectors = useMemo(() => groupBySector(routes), [routes]);

  const toggleSector = (sector: string) => {
    setExpandedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) next.delete(sector);
      else next.add(sector);
      return next;
    });
  };

  const hasSectors = sectors.some((s) => s.sector !== UNGROUPED);
  const sectorChips = allSectors.filter((s) => s.sector !== UNGROUPED);

  const scrollToSector = (sector: string) => {
    const el = document.getElementById(`sektor-${slugify(sector)}`);
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div>
      {sectorChips.length > 1 && (
        <div className="-mx-2 mb-3 flex gap-2 overflow-x-auto px-2 pb-1 no-scrollbar">
          {sectorChips.map(({ sector, routes: sectorRoutes }) => (
            <button
              key={sector}
              type="button"
              onClick={() => scrollToSector(sector)}
              className="flex-none whitespace-nowrap rounded-full border border-line bg-card px-4 py-2 text-[13px] font-medium text-ink-2 transition hover:border-ink/30"
            >
              {sector}{" "}
              <span className="ml-1 text-ink-3">{sectorRoutes.length}</span>
            </button>
          ))}
        </div>
      )}

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

      {filtered.length === 0 && (
        <p className="mt-4 px-4 py-6 text-center text-[14px] text-ink-3">
          Ingen ruter i denne grad-gruppen
        </p>
      )}

      {sectors.map(({ sector, routes: sectorRoutes }) => {
        const expanded = expandedSectors.has(sector);
        const visibleRoutes = expanded
          ? sectorRoutes
          : sectorRoutes.slice(0, COLLAPSED_LIMIT_PER_SECTOR);
        const hidden = sectorRoutes.length - visibleRoutes.length;

        return (
          <section key={sector} className="mt-6 first:mt-4">
            {hasSectors && sector !== UNGROUPED && (
              <header className="mb-3 flex items-baseline justify-between px-2">
                <h3
                  id={`sektor-${slugify(sector)}`}
                  className="font-serif text-[18px] leading-tight tracking-tight text-ink md:text-[20px]"
                >
                  {sector}
                </h3>
                <span className="text-[12px] text-ink-3">
                  {sectorRoutes.length}{" "}
                  {sectorRoutes.length === 1 ? "rute" : "ruter"}
                </span>
              </header>
            )}

            <div className="rounded-2xl bg-card p-1.5 md:p-2">
              {visibleRoutes.map((r) => {
                const ticked = logbook.tickedRouteIds.has(r.id);
                const project = logbook.projectRouteIds.has(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveRoute(r)}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left transition active:bg-bg"
                  >
                    <span
                      aria-label={ticked ? "Tikket" : project ? "Prosjekt" : `${r.stars} stjerner`}
                      className="w-9 flex-none text-[11px] tracking-tighter"
                    >
                      {ticked ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 12l5 5L20 7"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      ) : project ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink">
                          <span className="block h-2 w-2 rounded-full bg-ink" />
                        </span>
                      ) : (
                        <span className="text-sun">
                          {"★".repeat(r.stars) || "·"}
                        </span>
                      )}
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
                        {r.lengthM > 0 && `${r.lengthM} m · `}
                        {labelForType(r.type)}
                        {r.faBy && ` · ${shortenFa(r.faBy)}`}
                        {r.faYear && ` ${r.faYear}`}
                      </span>
                    </span>
                    <span className="font-mono flex-none rounded-lg bg-bg px-2.5 py-1.5 text-[12px] font-bold tracking-tight text-ink">
                      {r.grade}
                    </span>
                  </button>
                );
              })}
            </div>

            {hidden > 0 && (
              <button
                type="button"
                onClick={() => toggleSector(sector)}
                className="mt-3 w-full rounded-full border border-line bg-card py-3 text-[14px] font-semibold text-ink"
              >
                Vis alle {sectorRoutes.length} ruter i {sector !== UNGROUPED ? sector : "denne sektoren"}
              </button>
            )}
            {expanded && sectorRoutes.length > COLLAPSED_LIMIT_PER_SECTOR && (
              <button
                type="button"
                onClick={() => toggleSector(sector)}
                className="mt-3 w-full rounded-full border border-line bg-card py-3 text-[14px] font-semibold text-ink-2"
              >
                Skjul
              </button>
            )}
          </section>
        );
      })}

      {activeRoute && (
        <RouteSheet
          open
          onClose={() => setActiveRoute(null)}
          route={activeRoute}
          cragSlug={cragSlug}
          isAuthenticated={logbook.isAuthenticated}
          isProject={logbook.projectRouteIds.has(activeRoute.id)}
          ticks={logbook.ticksByRoute.get(activeRoute.id) ?? []}
        />
      )}
    </div>
  );
}

const UNGROUPED = "__ungrouped__";

function groupBySector(routes: Route[]): { sector: string; routes: Route[] }[] {
  const map = new Map<string, Route[]>();
  for (const r of routes) {
    const key = r.sector ?? UNGROUPED;
    const arr = map.get(key) ?? [];
    arr.push(r);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([sector, routes]) => ({
    sector,
    routes,
  }));
}

function shortenFa(fa: string): string {
  const firstName = fa.split(",")[0].split(" og ")[0].split(/\s\(/)[0].trim();
  return firstName;
}

function labelForType(t: Route["type"]): string {
  if (t === "buldring") return "Buldring";
  if (t === "trad") return "Trad";
  return "Sport";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
