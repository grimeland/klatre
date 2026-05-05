export type ClimbingType =
  | "sport"
  | "trad"
  | "buldring"
  | "multipitch"
  | "is"
  | "alpin";

export type Exposure = "S" | "V" | "Ø" | "N";

export type Dryness =
  | { kind: "dry"; days: number }
  | { kind: "dry-cap" }
  | { kind: "rain-today" }
  | { kind: "rain-yesterday" }
  | { kind: "rain-recent"; daysAgo: number }
  | { kind: "unknown" };

export type RockType =
  | "Gneis"
  | "Granitt"
  | "Sandstein"
  | "Kalkstein"
  | "Konglomerat";

export type Crag = {
  id: string;
  slug: string;
  name: string;
  area: string;
  distanceMinutes: number;
  routeCount: number;
  gradeLow: string;
  gradeHigh: string;
  climbingTypes: ClimbingType[];
  rockType: RockType;
  exposure: Exposure[];
  approachMinutes: number;
  dryness: Dryness;
  imageId: 1 | 2 | 3 | 4 | 5 | 6;
};
