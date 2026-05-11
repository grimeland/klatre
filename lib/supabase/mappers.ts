import { estimateDriveMinutesFromOslo } from "@/lib/utils/distance";
import type {
  ClimbingType,
  Crag,
  Exposure,
  RockType,
  Route,
  RouteStars,
} from "@/types/crag";
import type { Database } from "@/types/database";

type CragRow = Database["public"]["Tables"]["crags"]["Row"];
type RouteRow = Database["public"]["Tables"]["routes"]["Row"];
type CragImageRow = Database["public"]["Tables"]["crag_images"]["Row"];

type PlaceholderId = Crag["imageId"];

const PLACEHOLDER_VALUES: ReadonlySet<number> = new Set([1, 2, 3, 4, 5, 6]);

function toPlaceholder(id: number | null): PlaceholderId {
  if (id !== null && PLACEHOLDER_VALUES.has(id)) return id as PlaceholderId;
  return 1;
}

function toRouteStars(stars: number): RouteStars {
  if (stars <= 0) return 0;
  if (stars >= 3) return 3;
  return stars as RouteStars;
}

export function mapRouteRow(row: RouteRow): Route {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    gradeNumeric: row.grade_numeric,
    lengthM: row.length_m ?? 0,
    stars: toRouteStars(row.stars),
    type: row.type,
    ascents: row.ascents,
    isClassic: row.is_classic,
    sector: row.sector ?? undefined,
    faYear: row.fa_year ?? undefined,
    faBy: row.fa_by ?? undefined,
    description: row.description ?? undefined,
  };
}

type MapCragInput = {
  crag: CragRow;
  routes: RouteRow[];
  images: CragImageRow[];
};

export function mapCragRow({ crag, routes, images }: MapCragInput): Crag {
  const lat = crag.lat ?? 0;
  const lng = crag.lng ?? 0;
  const location = { lat, lng };

  const sortedImages = [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
  );
  const primary = sortedImages[0];
  const imageId = toPlaceholder(primary?.placeholder_id ?? null);
  const galleryImageIds = sortedImages.map((img) =>
    toPlaceholder(img.placeholder_id),
  );

  const sortedRoutes = [...routes].sort(
    (a, b) => a.grade_numeric - b.grade_numeric || a.display_order - b.display_order,
  );

  return {
    id: crag.slug,
    slug: crag.slug,
    name: crag.name,
    area: crag.area,
    distanceMinutes: estimateDriveMinutesFromOslo(location),
    routeCount: crag.route_count ?? undefined,
    gradeLow: crag.grade_low ?? undefined,
    gradeHigh: crag.grade_high ?? undefined,
    climbingTypes: crag.climbing_types as ClimbingType[],
    rockType: (crag.rock_type as RockType | null) ?? undefined,
    exposure: crag.exposure as Exposure[],
    approachMinutes: crag.approach_minutes ?? undefined,
    parkingNote: crag.parking_note ?? undefined,
    approachNote: crag.approach_note ?? undefined,
    exposureNote: crag.exposure_note ?? undefined,
    seasonNote: crag.season_note ?? undefined,
    accessNote: crag.access_note ?? undefined,
    localClub: crag.local_club ?? undefined,
    description: crag.description ?? undefined,
    dryness: { kind: "unknown" },
    weatherNext3Days: [],
    drynessTimeline: [],
    routes: sortedRoutes.map(mapRouteRow),
    location,
    imageId,
    galleryImageIds: galleryImageIds.length > 0 ? galleryImageIds : [imageId],
  };
}
