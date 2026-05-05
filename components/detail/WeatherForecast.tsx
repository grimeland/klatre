import type { Crag } from "@/types/crag";

export function WeatherForecast({ crag }: { crag: Crag }) {
  return (
    <div className="flex gap-2 md:gap-3">
      {crag.weatherNext3Days.map((d, i) => (
        <div
          key={i}
          className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-card p-3 md:p-4"
        >
          <span className="text-[11px] text-ink-3 md:text-[12px]">
            {d.dayLabel}
          </span>
          <span className="text-xl md:text-2xl" aria-hidden>
            {d.icon}
          </span>
          <span className="text-[13px] font-semibold text-ink md:text-[15px]">
            {d.tempC}°
          </span>
          <span className="text-[10px] text-ink-3 md:text-[11px]">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
