import type { Crag } from "@/types/crag";
import { formatDryness } from "@/lib/utils/format";

export function DrynessBlock({ crag }: { crag: Crag }) {
  const formatted = formatDryness(crag.dryness);

  return (
    <div className="rounded-2xl bg-card p-4 md:p-6">
      <div className="text-[18px] font-semibold text-ink md:text-[22px]">
        {formatted ? `${formatted.icon} ${formatted.text}` : "Ukjent forhold"}
      </div>
      <div className="mt-1 text-[13px] text-ink-3 md:text-[14px]">
        {drynessSubLabel(crag)}
      </div>

      <div className="mt-4 flex justify-between gap-1 pt-4 md:gap-2">
        {crag.drynessTimeline.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-ink-3">{d.dayLabel}</span>
            <span className="text-base md:text-lg" aria-hidden>
              {d.icon}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function drynessSubLabel(crag: Crag): string {
  const last = crag.drynessTimeline.findLast?.((d) => d.icon === "🌧");
  if (last) return `Sist regn: ${last.dayLabel.toLowerCase()}`;
  return "Ingen regn registrert siste 7 dager";
}
