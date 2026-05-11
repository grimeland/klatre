import type { DailyForecast } from "@/lib/met/forecast";

export function WeatherForecast({ days }: { days: DailyForecast[] }) {
  return (
    <div className="flex gap-2 md:gap-3">
      {days.map((d) => (
        <div
          key={d.date}
          className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-card p-3 md:p-4"
        >
          <span className="text-[11px] text-ink-3 md:text-[12px]">
            {d.dayLabel}
          </span>
          <span className="text-xl md:text-2xl" aria-hidden>
            {d.emoji}
          </span>
          <span className="text-[13px] font-semibold text-ink md:text-[15px]">
            {d.tempMaxC}°
          </span>
          <span className="text-[10px] text-ink-3 md:text-[11px]">
            {d.conditionLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
