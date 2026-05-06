import type { ClimbingType, Crag, Exposure, RockType } from "@/types/crag";

export type Feature =
  | "easy-approach"
  | "family-friendly"
  | "parking-at-crag"
  | "bolt"
  | "mobile-coverage";

export type Conditions = "any" | "dry-now" | "dry-3" | "dry-week";

export type FilterState = {
  climbingTypes: Set<ClimbingType>;
  conditions: Conditions;
  maxDriveMinutes: number;
  exposure: Set<Exposure>;
  rockType: Set<RockType>;
  features: Set<Feature>;
};

export const DEFAULT_FILTERS: FilterState = {
  climbingTypes: new Set<ClimbingType>(),
  conditions: "any",
  maxDriveMinutes: 480,
  exposure: new Set<Exposure>(),
  rockType: new Set<RockType>(),
  features: new Set<Feature>(),
};

export function isFilterActive(f: FilterState): boolean {
  return (
    f.climbingTypes.size > 0 ||
    f.conditions !== "any" ||
    f.maxDriveMinutes < 480 ||
    f.exposure.size > 0 ||
    f.rockType.size > 0 ||
    f.features.size > 0
  );
}

export function filterCount(f: FilterState): number {
  let n = 0;
  n += f.climbingTypes.size;
  if (f.conditions !== "any") n += 1;
  if (f.maxDriveMinutes < 480) n += 1;
  n += f.exposure.size;
  n += f.rockType.size;
  n += f.features.size;
  return n;
}

export function filterCrags(crags: Crag[], f: FilterState): Crag[] {
  return crags.filter((c) => {
    if (f.climbingTypes.size > 0) {
      const match = c.climbingTypes.some((t) => f.climbingTypes.has(t));
      if (!match) return false;
    }

    if (f.maxDriveMinutes < 480 && c.distanceMinutes > f.maxDriveMinutes) {
      return false;
    }

    if (f.conditions !== "any") {
      const dry = c.dryness;
      if (f.conditions === "dry-now") {
        if (dry.kind !== "dry" && dry.kind !== "dry-cap") return false;
      }
      if (f.conditions === "dry-3") {
        if (dry.kind === "dry-cap") return true;
        if (dry.kind !== "dry" || dry.days < 3) return false;
      }
      if (f.conditions === "dry-week") {
        if (dry.kind !== "dry-cap") return false;
      }
    }

    if (f.exposure.size > 0) {
      const match = c.exposure.some((e) => f.exposure.has(e));
      if (!match) return false;
    }

    if (f.rockType.size > 0) {
      if (!c.rockType || !f.rockType.has(c.rockType)) return false;
    }

    if (f.features.has("easy-approach")) {
      if (!c.approachMinutes || c.approachMinutes > 15) return false;
    }
    if (f.features.has("family-friendly")) {
      if (!c.gradeLow || !c.gradeLow.match(/^[3-5]/)) return false;
    }

    return true;
  });
}
