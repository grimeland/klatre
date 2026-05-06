import type { Route } from "@/types/crag";

export function PopularRoutes({ routes }: { routes: Route[] }) {
  const popular = [...routes]
    .sort(
      (a, b) =>
        Number(b.isClassic) - Number(a.isClassic) || b.ascents - a.ascents,
    )
    .slice(0, 6);

  if (popular.length === 0) return null;

  return (
    <div className="relative md:max-w-2xl">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[48px] top-3 bottom-3 w-px bg-line"
      />

      <div className="space-y-6">
        {popular.map((r) => {
          const imgId = ((r.gradeNumeric % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
          return (
            <button
              key={r.id}
              type="button"
              className="relative flex w-full items-start gap-4 text-left transition active:opacity-70"
            >
              <div
                className={`relative z-10 h-24 w-24 flex-none overflow-hidden rounded-2xl bg-card crag-img-${imgId}`}
              >
                {r.isClassic && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-ink shadow-sm">
                    ★
                  </span>
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[16px] font-semibold leading-tight text-ink md:text-[17px]">
                    {r.name}
                  </h4>
                  <span className="font-mono rounded-md border border-line bg-card px-2 py-0.5 text-[11px] font-bold tracking-tight text-ink">
                    {r.grade}
                  </span>
                </div>
                <div className="mt-1 text-[12px] tracking-tight text-sun">
                  {"★".repeat(r.stars)}
                  {r.stars < 3 && (
                    <span className="text-line">
                      {"★".repeat(3 - r.stars)}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2 md:text-[14px]">
                  {r.lengthM} m · {labelForType(r.type)} · {r.ascents} har
                  klatret
                </p>
                {r.isClassic && (
                  <p className="mt-1 text-[12px] font-semibold text-primary">
                    Klassiker
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function labelForType(t: Route["type"]): string {
  if (t === "buldring") return "Buldring";
  if (t === "trad") return "Trad";
  return "Sport";
}
