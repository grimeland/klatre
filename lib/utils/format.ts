import type { Dryness } from "@/types/crag";

export function formatDistance(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours} t`;
  return `${hours} t ${rest}`;
}

export function formatDryness(
  d: Dryness,
): { icon: string; text: string } | null {
  switch (d.kind) {
    case "unknown":
      return null;
    case "dry-cap":
      return { icon: "☀", text: "Tørt i minst en uke" };
    case "dry":
      return {
        icon: "☀",
        text: `Tørt i ${d.days} ${d.days === 1 ? "dag" : "dager"}`,
      };
    case "rain-today":
      return { icon: "🌧", text: "Regn i dag" };
    case "rain-yesterday":
      return { icon: "🌧", text: "Regn i går" };
    case "rain-recent":
      return { icon: "🌧", text: `Regn ${d.daysAgo} dager siden` };
  }
}

export function formatGradeRange(low: string, high: string): string {
  return `${low}–${high}`;
}
