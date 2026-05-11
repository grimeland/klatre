import type { WeatherSummary } from "@/lib/met/forecast";

export function DrynessBlock({ weather }: { weather: WeatherSummary }) {
  const { precipNext24hMm, daily } = weather;
  const headline = headlineFor(precipNext24hMm);
  const sub = subFor(precipNext24hMm, daily);

  return (
    <div className="rounded-2xl bg-card p-4 md:p-6">
      <div className="text-[18px] font-semibold text-ink md:text-[22px]">
        {headline}
      </div>
      <div className="mt-1 text-[13px] text-ink-3 md:text-[14px]">{sub}</div>

      <div className="mt-4 flex justify-between gap-1 pt-4 md:gap-2">
        {daily.slice(0, 7).map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-ink-3">{d.dayLabel}</span>
            <span className="text-base md:text-lg" aria-hidden>
              {d.emoji}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function headlineFor(precipNext24h: number): string {
  if (precipNext24h < 0.2) return "☀ Tørt neste døgn";
  if (precipNext24h < 2) return "🌦 Lett nedbør neste døgn";
  if (precipNext24h < 8) return "🌧 Regn neste døgn";
  return "🌧 Mye regn neste døgn";
}

function subFor(precipNext24h: number, daily: { precipMm: number }[]): string {
  if (precipNext24h < 0.2) {
    const nextRainDay = daily.findIndex((d, i) => i > 0 && d.precipMm > 1);
    if (nextRainDay > 0) {
      return `Mulig regn fra dag ${nextRainDay + 1}`;
    }
    return "Ingen nedbør i sikte";
  }
  return `${precipNext24h.toFixed(1)} mm forventet`;
}
