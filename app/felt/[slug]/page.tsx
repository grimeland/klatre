import { notFound } from "next/navigation";
import { getCragBySlug } from "@/lib/fixtures/crags";
import {
  formatDistance,
  formatGradeRange,
} from "@/lib/utils/format";
import { googleMapsDirectionsUrl } from "@/lib/utils/distance";
import { Gallery } from "@/components/detail/Gallery";
import { DrynessBlock } from "@/components/detail/DrynessBlock";
import { WeatherForecast } from "@/components/detail/WeatherForecast";
import { PopularRoutes } from "@/components/detail/PopularRoutes";
import { RouteList } from "@/components/detail/RouteList";
import { InfoBlock, InfoLine } from "@/components/detail/InfoBlock";
import { CragLocationMapClient } from "@/components/detail/CragLocationMapClient";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapRouteRow } from "@/lib/supabase/mappers";
import { fetchForecast } from "@/lib/met/forecast";
import { estimateSunOnCrag, formatHHMMOslo } from "@/lib/sun/estimate";
import { loadLogbookForCrag } from "@/lib/logbook/load";
import { SaveCragButton } from "@/components/logbook/SaveCragButton";
import type { CragImage, Route } from "@/types/crag";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function loadRoutesFromSupabase(slug: string): Promise<Route[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("crag_slug", slug)
      .order("display_order", { ascending: true });
    if (error || !data) return [];
    return data.map((row) => mapRouteRow(row));
  } catch {
    return [];
  }
}

export default async function CragDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const crag = getCragBySlug(slug);
  if (!crag) notFound();

  const [supabaseRoutes, weather] = await Promise.all([
    loadRoutesFromSupabase(slug),
    fetchForecast(crag.location.lat, crag.location.lng),
  ]);
  const routes = supabaseRoutes.length > 0 ? supabaseRoutes : crag.routes;
  const logbook = await loadLogbookForCrag(
    slug,
    routes.map((r) => r.id),
  );
  const sun = estimateSunOnCrag(
    crag.location.lat,
    crag.location.lng,
    crag.exposure,
  );

  const isBouldering = crag.climbingTypes.includes("buldring");
  const climbingTypeLabel = crag.climbingTypes
    .map((t) => labelForClimbingType(t))
    .join(" + ");
  const itemCount = routes.length > 0
    ? isBouldering
      ? `${routes.length} problemer`
      : `${routes.length} ruter`
    : crag.routeCount
      ? isBouldering
        ? `${crag.routeCount} problemer`
        : `${crag.routeCount} ruter`
      : null;
  const grade =
    !isBouldering && crag.gradeLow && crag.gradeHigh
      ? formatGradeRange(crag.gradeLow, crag.gradeHigh)
      : null;
  const metaParts = [climbingTypeLabel, itemCount, grade, crag.rockType].filter(
    Boolean,
  );
  const directionsUrl = googleMapsDirectionsUrl(crag.location, crag.name);

  const hasWeather = (weather?.daily.length ?? 0) > 0;
  const hasDryness = weather !== null;
  const hasComeHere =
    crag.parkingNote ||
    crag.approachNote ||
    crag.exposureNote ||
    crag.rockType ||
    crag.seasonNote;
  const hasPractical = crag.accessNote || crag.localClub;

  const galleryImages: CragImage[] =
    crag.images && crag.images.length > 0
      ? crag.images
      : crag.galleryImageIds.map((id) => ({ placeholderId: id }));

  return (
    <main className="flex flex-col flex-1">
      <DetailHeader />
      <div className="mx-auto w-full max-w-5xl px-4 pt-4 md:px-10 md:pt-6">
        <div className="overflow-hidden rounded-3xl">
          <Gallery images={galleryImages} cragName={crag.name} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-32 md:px-10 md:pt-10 md:grid md:grid-cols-[1fr_360px] md:gap-12 md:pb-16">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-serif text-[30px] leading-[1.05] tracking-tight text-ink md:text-[44px]">
                {crag.name}
              </h1>
              <p className="mt-1 text-[14px] text-ink-2 md:text-[15px]">
                {crag.area} · {formatDistance(crag.distanceMinutes)} fra deg
              </p>
            </div>
            <SaveCragButton
              cragSlug={slug}
              isAuthenticated={logbook.isAuthenticated}
              isSaved={logbook.savedCrag}
            />
          </div>
          {metaParts.length > 0 && (
            <p className="mt-1 text-[13px] text-ink-3 md:text-[14px]">
              {metaParts.join(" · ")}
            </p>
          )}

          {crag.description && (
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-2 md:mt-6 md:text-[16px]">
              {crag.description}
            </p>
          )}

          {routes.length > 0 && (
            <div className="mt-8 md:mt-12">
              <h2 className="mb-5 font-serif text-[24px] leading-tight tracking-tight text-ink md:mb-6 md:text-[30px]">
                Populære ruter
              </h2>
              <PopularRoutes routes={routes} />
            </div>
          )}

          {routes.length > 0 && (
            <div className="mt-12 md:mt-16">
              <h2 className="mb-5 font-serif text-[24px] leading-tight tracking-tight text-ink md:mb-6 md:text-[30px]">
                Alle ruter ({routes.length})
              </h2>
              <RouteList
                routes={routes}
                cragSlug={slug}
                logbook={logbook}
              />
            </div>
          )}

          {hasDryness && weather && (
            <div className="mt-12 md:hidden">
              <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-ink-3">
                Forhold
              </h3>
              <DrynessBlock weather={weather} />
            </div>
          )}

          {hasWeather && weather && (
            <div className="mt-8 md:hidden">
              <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-ink-3">
                Vær neste 3 dager
              </h3>
              <WeatherForecast days={weather.daily.slice(0, 3)} />
            </div>
          )}

          <div className="mt-10 md:mt-14">
            <h3 className="mb-4 text-[12px] font-semibold tracking-wide text-ink-3 md:text-[13px]">
              Hvor er feltet
            </h3>
            <CragLocationMapClient location={crag.location} name={crag.name} />
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-card py-3 text-[14px] font-semibold text-ink md:w-auto md:px-6"
            >
              Få veibeskrivelse <span aria-hidden>↗</span>
            </a>
          </div>

          {(hasComeHere || hasPractical) && (
            <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-2 md:gap-10">
              {hasComeHere && (
                <InfoBlock title="Komme dit">
                  {crag.parkingNote && (
                    <InfoLine label="Parkering" value={crag.parkingNote} />
                  )}
                  {crag.approachNote && (
                    <InfoLine label="Innsteg" value={crag.approachNote} />
                  )}
                  {crag.exposureNote && (
                    <InfoLine label="Eksposisjon" value={crag.exposureNote} />
                  )}
                  {crag.rockType && (
                    <InfoLine label="Bergart" value={crag.rockType} />
                  )}
                  {crag.seasonNote && (
                    <InfoLine label="Sesong" value={crag.seasonNote} />
                  )}
                </InfoBlock>
              )}
              {hasPractical && (
                <InfoBlock title="Praktisk">
                  {crag.accessNote && (
                    <InfoLine label="Tilgang" value={crag.accessNote} />
                  )}
                  <InfoLine label="Mobildekning" value="God" />
                  {crag.localClub && (
                    <InfoLine label="Lokal klubb" value={crag.localClub} />
                  )}
                </InfoBlock>
              )}
            </div>
          )}
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-8 space-y-5 rounded-2xl border border-line/60 bg-white p-6 shadow-sm">
            {weather && (
              <>
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span aria-hidden className="text-[28px] leading-none">
                        {weather.scoreEmoji}
                      </span>
                      <span className="font-serif text-[22px] tracking-tight text-ink">
                        {weather.scoreLabel}
                      </span>
                    </div>
                    {weather.daily[0] && (
                      <span className="text-[14px] font-semibold text-ink-2">
                        {weather.daily[0].tempMaxC}°
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] text-ink-3">
                    {weather.precipNext24hMm < 0.2
                      ? "Tørt neste døgn"
                      : `${weather.precipNext24hMm.toFixed(1)} mm forventet`}
                  </p>
                </div>

                {weather.daily.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 border-t border-line/60 pt-4">
                    {weather.daily.slice(0, 3).map((d) => (
                      <div
                        key={d.date}
                        className="flex flex-col items-center gap-1 text-center"
                      >
                        <span className="text-[11px] text-ink-3">
                          {d.dayLabel}
                        </span>
                        <span aria-hidden className="text-xl">
                          {d.emoji}
                        </span>
                        <span className="text-[13px] font-semibold text-ink">
                          {d.tempMaxC}°
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {sun && sun.sunOnCragHours > 0 && (
              <div className="border-t border-line/60 pt-4">
                <div className="text-[12px] font-semibold tracking-wide text-ink-3">
                  Sol på feltet
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span aria-hidden className="text-[20px] leading-none">
                    ☀️
                  </span>
                  <span className="text-[15px] font-semibold text-ink">
                    {sun.sunOnCragHours.toFixed(1).replace(".", ",")} t i dag
                  </span>
                </div>
                {sun.sunOnCragStartISO && sun.sunOnCragEndISO && (
                  <p className="mt-1 text-[13px] text-ink-3">
                    Ca. {formatHHMMOslo(sun.sunOnCragStartISO)} –{" "}
                    {formatHHMMOslo(sun.sunOnCragEndISO)}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-ink-3">
                  Soloppgang {formatHHMMOslo(sun.sunriseISO)} · solnedgang{" "}
                  {formatHHMMOslo(sun.sunsetISO)}
                </p>
              </div>
            )}

            {sun && sun.sunOnCragHours === 0 && crag.exposure.length > 0 && (
              <div className="border-t border-line/60 pt-4">
                <div className="text-[12px] font-semibold tracking-wide text-ink-3">
                  Sol på feltet
                </div>
                <div className="mt-1 text-[13px] text-ink-2">
                  Ingen direkte sol i dag (
                  {crag.exposure.join("-")}-vendt)
                </div>
              </div>
            )}

            <div className="border-t border-line/60 pt-4">
              <div className="text-[12px] font-semibold tracking-wide text-ink-3">
                Komme deg dit
              </div>
              <p className="mt-1 text-[13px] text-ink-2">
                {crag.approachMinutes
                  ? `${crag.approachMinutes} min innsteg fra parkering`
                  : "Vi sender deg videre til Google Maps."}
              </p>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-ink transition active:scale-[0.99]"
              >
                Få veibeskrivelse <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-line bg-bg px-6 pt-3 md:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[16px] font-semibold text-primary-ink"
        >
          Få veibeskrivelse <span aria-hidden>↗</span>
        </a>
      </div>
    </main>
  );
}

function labelForClimbingType(t: string): string {
  switch (t) {
    case "sport":
      return "Sport";
    case "trad":
      return "Trad";
    case "buldring":
      return "Buldring";
    case "multipitch":
      return "Multipitch";
    case "is":
      return "Is";
    case "alpin":
      return "Alpin";
    default:
      return t;
  }
}
