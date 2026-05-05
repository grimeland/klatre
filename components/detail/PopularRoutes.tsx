import type { Route } from "@/types/crag";

export function PopularRoutes({ routes }: { routes: Route[] }) {
  const popular = [...routes]
    .sort((a, b) => Number(b.isClassic) - Number(a.isClassic) || b.ascents - a.ascents)
    .slice(0, 5);

  if (popular.length === 0) return null;

  return (
    <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4 [scroll-snap-type:x_mandatory] [&>*]:[scroll-snap-align:start]">
      {popular.map((r) => {
        const imgId = ((r.gradeNumeric % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
        return (
          <button
            key={r.id}
            type="button"
            className="block w-[190px] flex-none overflow-hidden rounded-2xl bg-card text-left transition active:scale-[0.98] md:w-auto md:flex-auto"
          >
            <div className={`relative h-[130px] crag-img-${imgId} md:h-[160px]`}>
              {r.isClassic && (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold tracking-tight text-ink">
                  ★ Klassiker
                </span>
              )}
            </div>
            <div className="p-3.5">
              <div className="text-[11px] tracking-tight text-sun">
                {"★".repeat(r.stars)}
              </div>
              <div className="mt-1 text-[15px] font-semibold leading-tight text-ink">
                {r.name}
              </div>
              <div className="mt-1 text-[12px] text-ink-3">
                {r.grade} · {r.lengthM} m · Sport
              </div>
              <div className="mt-1.5 text-[11px] text-ink-3">
                {r.ascents} har klatret
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
