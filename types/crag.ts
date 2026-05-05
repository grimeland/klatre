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

export type LatLng = { lat: number; lng: number };

export type RouteStars = 0 | 1 | 2 | 3;

export type Route = {
  id: string;
  name: string;
  grade: string;
  gradeNumeric: number;
  lengthM: number;
  stars: RouteStars;
  type: "sport" | "trad" | "buldring";
  ascents: number;
  isClassic: boolean;
};

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
  parkingNote: string;
  approachNote: string;
  exposureNote: string;
  seasonNote: string;
  accessNote: string;
  localClub: string;
  dryness: Dryness;
  weatherNext3Days: { dayLabel: string; icon: string; tempC: number; label: string }[];
  drynessTimeline: { dayLabel: string; icon: string }[];
  routes: Route[];
  location: LatLng;
  imageId: 1 | 2 | 3 | 4 | 5 | 6;
  galleryImageIds: (1 | 2 | 3 | 4 | 5 | 6)[];
};
