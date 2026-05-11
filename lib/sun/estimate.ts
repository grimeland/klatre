/**
 * Sun-on-crag estimator.
 *
 * Given a crag's location and which directions its walls face, computes
 * roughly when sun hits the wall today. Uses SunCalc for sun position and
 * checks each minute against the wall's facing cone (±90°).
 *
 * Limitations: ignores terrain shading (mountains blocking the sun before
 * it sets), trees, neighbouring walls. So a south-facing wall in a deep
 * valley still reads as sunny here when in practice it isn't. Good enough
 * for "ca. 6 t sol i dag" — refine later with horizon profiles.
 */
import SunCalc from "suncalc";
import type { Exposure } from "@/types/crag";

const EXPOSURE_AZIMUTH_RAD: Record<Exposure, number> = {
  S: 0,
  V: Math.PI / 2,
  Ø: -Math.PI / 2,
  N: Math.PI,
};

const ACCEPT_HALF_CONE = Math.PI / 2;

export type SunEstimate = {
  sunriseISO: string;
  sunsetISO: string;
  daylightHours: number;
  sunOnCragHours: number;
  sunOnCragStartISO: string | null;
  sunOnCragEndISO: string | null;
};

export function estimateSunOnCrag(
  lat: number,
  lng: number,
  exposures: Exposure[],
  date: Date = new Date(),
): SunEstimate | null {
  const dayStart = startOfOsloDay(date);
  const times = SunCalc.getTimes(dayStart, lat, lng);
  if (
    isNaN(times.sunrise.getTime()) ||
    isNaN(times.sunset.getTime())
  ) {
    return null;
  }

  const daylightMs = times.sunset.getTime() - times.sunrise.getTime();
  const daylightHours = daylightMs / 3_600_000;

  if (exposures.length === 0) {
    return {
      sunriseISO: times.sunrise.toISOString(),
      sunsetISO: times.sunset.toISOString(),
      daylightHours: Math.round(daylightHours * 10) / 10,
      sunOnCragHours: 0,
      sunOnCragStartISO: null,
      sunOnCragEndISO: null,
    };
  }

  const wallAzimuths = exposures.map((e) => EXPOSURE_AZIMUTH_RAD[e]);

  const stepMinutes = 5;
  const totalSteps = Math.floor(daylightHours * 60 / stepMinutes);
  let firstSunny: Date | null = null;
  let lastSunny: Date | null = null;
  let sunnyMinutes = 0;

  for (let i = 0; i <= totalSteps; i++) {
    const t = new Date(times.sunrise.getTime() + i * stepMinutes * 60_000);
    if (t > times.sunset) break;
    const pos = SunCalc.getPosition(t, lat, lng);
    if (pos.altitude <= 0) continue;

    const sunAzimuth = pos.azimuth;
    const inSun = wallAzimuths.some(
      (wallAz) => angularDiff(wallAz, sunAzimuth) <= ACCEPT_HALF_CONE,
    );
    if (inSun) {
      sunnyMinutes += stepMinutes;
      if (!firstSunny) firstSunny = t;
      lastSunny = t;
    }
  }

  return {
    sunriseISO: times.sunrise.toISOString(),
    sunsetISO: times.sunset.toISOString(),
    daylightHours: Math.round(daylightHours * 10) / 10,
    sunOnCragHours: Math.round((sunnyMinutes / 60) * 10) / 10,
    sunOnCragStartISO: firstSunny?.toISOString() ?? null,
    sunOnCragEndISO: lastSunny?.toISOString() ?? null,
  };
}

function angularDiff(a: number, b: number): number {
  let d = Math.abs(a - b);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return d;
}

function startOfOsloDay(d: Date): Date {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const isoDay = `${get("year")}-${get("month")}-${get("day")}T12:00:00+02:00`;
  return new Date(isoDay);
}

export function formatHHMMOslo(iso: string): string {
  const fmt = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return fmt.format(new Date(iso));
}
