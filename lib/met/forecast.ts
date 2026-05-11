/**
 * MET Locationforecast 2.0 — Yr's underlying API.
 * Public, no key. User-Agent must identify the app.
 * https://api.met.no/weatherapi/locationforecast/2.0/documentation
 */

const BASE = "https://api.met.no/weatherapi/locationforecast/2.0/compact";

type RawTimeseriesEntry = {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature?: number;
        wind_speed?: number;
        cloud_area_fraction?: number;
        relative_humidity?: number;
      };
    };
    next_1_hours?: {
      summary: { symbol_code: string };
      details?: { precipitation_amount?: number };
    };
    next_6_hours?: {
      summary?: { symbol_code: string };
      details?: { precipitation_amount?: number };
    };
    next_12_hours?: {
      summary?: { symbol_code: string };
    };
  };
};

type RawForecast = {
  properties: {
    meta: { updated_at: string };
    timeseries: RawTimeseriesEntry[];
  };
};

export type DailyForecast = {
  date: string;
  dayLabel: string;
  emoji: string;
  conditionLabel: string;
  tempMinC: number;
  tempMaxC: number;
  precipMm: number;
  symbolCode: string;
};

export type WeatherSummary = {
  fetchedAt: string;
  metaUpdatedAt: string;
  daily: DailyForecast[];
  precipNext24hMm: number;
  hasRainNext24h: boolean;
  score: number;
  scoreLabel: string;
  scoreEmoji: string;
};

const USER_AGENT =
  process.env.MET_USER_AGENT ??
  "Felt klatreapp / kontakt@grime.land";

export async function fetchForecast(
  lat: number,
  lng: number,
): Promise<WeatherSummary | null> {
  const lat4 = lat.toFixed(4);
  const lng4 = lng.toFixed(4);
  const url = `${BASE}?lat=${lat4}&lon=${lng4}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 1800 },
    });
    if (!res.ok) {
      console.warn(`[MET] ${res.status} ${res.statusText} for ${lat4},${lng4}`);
      return null;
    }
    const json = (await res.json()) as RawForecast;
    return summarize(json);
  } catch (err) {
    console.warn(`[MET] fetch failed`, err);
    return null;
  }
}

function summarize(raw: RawForecast): WeatherSummary {
  const ts = raw.properties.timeseries;
  const now = ts[0]?.time ? new Date(ts[0].time) : new Date();

  const next24 = ts.filter((t) => {
    const diffH = (new Date(t.time).getTime() - now.getTime()) / 3_600_000;
    return diffH >= 0 && diffH <= 24;
  });
  const precipNext24hMm = next24.reduce((sum, t) => {
    const p = t.data.next_1_hours?.details?.precipitation_amount ?? 0;
    return sum + p;
  }, 0);

  const byDay = new Map<string, RawTimeseriesEntry[]>();
  for (const entry of ts) {
    const day = osloDateKey(new Date(entry.time));
    const arr = byDay.get(day) ?? [];
    arr.push(entry);
    byDay.set(day, arr);
  }

  const dayKeys = Array.from(byDay.keys()).slice(0, 7);
  const daily: DailyForecast[] = dayKeys.map((key) => {
    const entries = byDay.get(key)!;
    const noonEntry = pickNoon(entries);
    const symbolCode =
      noonEntry?.data.next_6_hours?.summary?.symbol_code ??
      noonEntry?.data.next_1_hours?.summary?.symbol_code ??
      "fair_day";

    const temps = entries
      .map((e) => e.data.instant.details.air_temperature)
      .filter((t): t is number => typeof t === "number");
    const tempMinC = temps.length > 0 ? Math.round(Math.min(...temps)) : 0;
    const tempMaxC = temps.length > 0 ? Math.round(Math.max(...temps)) : 0;

    const precipMm = entries.reduce((sum, e) => {
      const p =
        e.data.next_1_hours?.details?.precipitation_amount ??
        e.data.next_6_hours?.details?.precipitation_amount ?? 0;
      return sum + (e.data.next_1_hours ? p : p / 6);
    }, 0);

    const date = key;
    return {
      date,
      dayLabel: dayLabelFor(new Date(`${date}T12:00:00`)),
      emoji: symbolToEmoji(symbolCode),
      conditionLabel: symbolToLabel(symbolCode),
      tempMinC,
      tempMaxC,
      precipMm: Math.round(precipMm * 10) / 10,
      symbolCode,
    };
  });

  const { score, label: scoreLabel, emoji: scoreEmoji } = computeScore(
    precipNext24hMm,
    daily,
  );

  return {
    fetchedAt: new Date().toISOString(),
    metaUpdatedAt: raw.properties.meta.updated_at,
    daily,
    precipNext24hMm: Math.round(precipNext24hMm * 10) / 10,
    hasRainNext24h: precipNext24hMm >= 0.5,
    score,
    scoreLabel,
    scoreEmoji,
  };
}

/**
 * Climbing weather score 0-100.
 *
 * Score combines:
 * - Next 24h precipitation (rock should be dry now)
 * - Next 3 days outlook (planning ahead)
 * - Temperature suitability for climbing (5-25°C ideal)
 *
 * Label/emoji is tied to the *actual* weather symbol for the next 24h —
 * "Sol" only when it's literally sunny. Score still drives sorting.
 *
 * No history yet (Frost API). When that's wired, "tørt i en periode" can
 * be weighted in too.
 */
function computeScore(
  precipNext24h: number,
  daily: DailyForecast[],
): { score: number; label: string; emoji: string } {
  const now = precipNext24h < 0.2 ? 1 : precipNext24h < 1 ? 0.7 : precipNext24h < 4 ? 0.3 : 0;

  const next3 = daily.slice(0, 3);
  const dryDays = next3.filter((d) => d.precipMm < 1).length;
  const outlook = next3.length > 0 ? dryDays / next3.length : 0;

  const temps = next3.map((d) => (d.tempMaxC + d.tempMinC) / 2);
  const tempScore =
    temps.length > 0
      ? Math.max(...temps.map((t) => tempSuitability(t)))
      : 0.5;

  const raw = now * 0.55 + outlook * 0.3 + tempScore * 0.15;
  const score = Math.round(raw * 100);

  const todaySymbol = (daily[0]?.symbolCode ?? "").replace(
    /_(day|night|polartwilight)$/,
    "",
  );
  const dryNow = precipNext24h < 0.2;

  if (todaySymbol === "clearsky" && dryNow) {
    return { score, label: "Sol", emoji: "☀️" };
  }
  if (todaySymbol === "fair" && dryNow) {
    return { score, label: "Lettskyet", emoji: "🌤" };
  }
  if (todaySymbol === "partlycloudy" && dryNow) {
    return { score, label: "Delvis skyet", emoji: "⛅" };
  }
  if ((todaySymbol === "cloudy" || todaySymbol === "fog") && dryNow) {
    return { score, label: "Skyet", emoji: "☁️" };
  }
  if (precipNext24h < 1) return { score, label: "Lett regn", emoji: "🌦" };
  if (precipNext24h < 5) return { score, label: "Regn", emoji: "🌧" };
  return { score, label: "Mye regn", emoji: "🌧" };
}

function tempSuitability(temp: number): number {
  if (temp < -5 || temp > 35) return 0;
  if (temp >= 8 && temp <= 22) return 1;
  if (temp >= 5 && temp <= 25) return 0.8;
  if (temp >= 0 && temp <= 30) return 0.5;
  return 0.3;
}

function pickNoon(entries: RawTimeseriesEntry[]): RawTimeseriesEntry | undefined {
  let best: RawTimeseriesEntry | undefined;
  let bestDiff = Infinity;
  for (const e of entries) {
    const hour = osloHour(new Date(e.time));
    const diff = Math.abs(hour - 12);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = e;
    }
  }
  return best;
}

function osloDateKey(d: Date): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

function osloHour(d: Date): number {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    hour12: false,
  });
  return parseInt(fmt.format(d), 10);
}

function dayLabelFor(d: Date): string {
  const today = osloDateKey(new Date());
  const tomorrow = osloDateKey(new Date(Date.now() + 86_400_000));
  const dKey = osloDateKey(d);
  if (dKey === today) return "I dag";
  if (dKey === tomorrow) return "I morgen";
  const fmt = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "short",
  });
  const label = fmt.format(d);
  return label.charAt(0).toUpperCase() + label.slice(1).replace(".", "");
}

function symbolToEmoji(code: string): string {
  const base = code.replace(/_(day|night|polartwilight)$/, "");
  switch (base) {
    case "clearsky":
    case "fair":
      return "☀️";
    case "partlycloudy":
      return "🌤";
    case "cloudy":
      return "☁️";
    case "fog":
      return "🌫";
    case "lightrainshowers":
    case "rainshowers":
    case "lightrain":
    case "rain":
    case "heavyrain":
    case "heavyrainshowers":
      return "🌧";
    case "lightsleet":
    case "sleet":
    case "heavysleet":
    case "lightsleetshowers":
    case "sleetshowers":
    case "heavysleetshowers":
      return "🌨";
    case "lightsnow":
    case "snow":
    case "heavysnow":
    case "lightsnowshowers":
    case "snowshowers":
    case "heavysnowshowers":
      return "❄";
    case "rainshowersandthunder":
    case "rainandthunder":
    case "heavyrainandthunder":
      return "⛈";
    default:
      return "🌥";
  }
}

function symbolToLabel(code: string): string {
  const base = code.replace(/_(day|night|polartwilight)$/, "");
  switch (base) {
    case "clearsky":
      return "Klart";
    case "fair":
      return "Lettskyet";
    case "partlycloudy":
      return "Delvis skyet";
    case "cloudy":
      return "Skyet";
    case "fog":
      return "Tåke";
    case "lightrain":
    case "lightrainshowers":
      return "Lett regn";
    case "rain":
    case "rainshowers":
      return "Regn";
    case "heavyrain":
    case "heavyrainshowers":
      return "Mye regn";
    case "lightsnow":
    case "lightsnowshowers":
      return "Lett snø";
    case "snow":
    case "snowshowers":
      return "Snø";
    case "heavysnow":
    case "heavysnowshowers":
      return "Mye snø";
    case "sleet":
    case "lightsleet":
    case "lightsleetshowers":
    case "sleetshowers":
      return "Sludd";
    case "heavysleet":
    case "heavysleetshowers":
      return "Mye sludd";
    case "rainandthunder":
    case "rainshowersandthunder":
      return "Regn og torden";
    case "heavyrainandthunder":
      return "Mye regn og torden";
    default:
      return "Vekslende";
  }
}
