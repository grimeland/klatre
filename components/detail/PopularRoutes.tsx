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
    <div className="md:max-w-2xl">
      <ul className="flex flex-col gap-5">
        {popular.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 text-left transition active:opacity-70"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-[16px] font-semibold leading-tight text-ink md:text-[17px]">
                    {r.name}
                  </h4>
                  {r.isClassic && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary">
                      Klassiker
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[12px] tracking-tight text-sun">
                  {"★".repeat(r.stars)}
                  {r.stars < 3 && (
                    <span className="text-line">
                      {"★".repeat(3 - r.stars)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-2 md:text-[14px]">
                  {r.lengthM > 0 && `${r.lengthM} m · `}
                  {labelForType(r.type)} · {r.ascents} har klatret
                </p>
              </div>
              <span className="font-mono flex-none rounded-lg bg-card px-2.5 py-1.5 text-[12px] font-bold tracking-tight text-ink">
                {r.grade}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function labelForType(t: Route["type"]): string {
  if (t === "buldring") return "Buldring";
  if (t === "trad") return "Trad";
  return "Sport";
}
