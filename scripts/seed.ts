/**
 * Seeds Supabase from lib/fixtures/crags.ts.
 * Idempotent: re-runnable, replaces routes and image rows for each crag.
 *
 * Run with: npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import type { Crag } from "../types/crag";
import type { Database } from "../types/database";
import { fixtureCrags } from "../lib/fixtures/crags";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

const supabase = createClient<Database>(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function locationWkt({ lat, lng }: Crag["location"]): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

async function seedCrag(crag: Crag): Promise<void> {
  const { error: cragError } = await supabase.from("crags").upsert(
    {
      slug: crag.slug,
      name: crag.name,
      area: crag.area,
      description: crag.description ?? null,
      location: locationWkt(crag.location),
      climbing_types: crag.climbingTypes,
      exposure: crag.exposure,
      rock_type: crag.rockType ?? null,
      route_count: crag.routeCount ?? null,
      grade_low: crag.gradeLow ?? null,
      grade_high: crag.gradeHigh ?? null,
      approach_minutes: crag.approachMinutes ?? null,
      parking_note: crag.parkingNote ?? null,
      approach_note: crag.approachNote ?? null,
      exposure_note: crag.exposureNote ?? null,
      season_note: crag.seasonNote ?? null,
      access_note: crag.accessNote ?? null,
      local_club: crag.localClub ?? null,
    },
    { onConflict: "slug" },
  );
  if (cragError) throw new Error(`crag ${crag.slug}: ${cragError.message}`);

  const { error: deleteRoutesError } = await supabase
    .from("routes")
    .delete()
    .eq("crag_slug", crag.slug);
  if (deleteRoutesError) throw deleteRoutesError;

  if (crag.routes.length > 0) {
    const { error: routesError } = await supabase.from("routes").insert(
      crag.routes.map((r, idx) => ({
        crag_slug: crag.slug,
        name: r.name,
        grade: r.grade,
        grade_numeric: r.gradeNumeric,
        length_m: r.lengthM,
        stars: r.stars,
        type: r.type,
        ascents: r.ascents,
        is_classic: r.isClassic,
        display_order: idx,
      })),
    );
    if (routesError) throw new Error(`routes ${crag.slug}: ${routesError.message}`);
  }

  const { error: deleteImagesError } = await supabase
    .from("crag_images")
    .delete()
    .eq("crag_slug", crag.slug);
  if (deleteImagesError) throw deleteImagesError;

  const galleryIds = crag.galleryImageIds.length > 0
    ? crag.galleryImageIds
    : [crag.imageId];

  const { error: imagesError } = await supabase.from("crag_images").insert(
    galleryIds.map((placeholderId, idx) => ({
      crag_slug: crag.slug,
      placeholder_id: placeholderId,
      display_order: idx,
      is_primary: idx === 0,
    })),
  );
  if (imagesError) throw new Error(`images ${crag.slug}: ${imagesError.message}`);
}

async function main() {
  console.log(`Seeding ${fixtureCrags.length} crags…`);
  for (const crag of fixtureCrags) {
    await seedCrag(crag);
    console.log(`  ✓ ${crag.slug}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
