import { notFound } from "next/navigation";
import { fixtureCrags, getCragBySlug } from "@/lib/fixtures/crags";
import { formatDistance, formatGradeRange } from "@/lib/utils/format";
import { Gallery } from "@/components/detail/Gallery";
import { DrynessBlock } from "@/components/detail/DrynessBlock";
import { WeatherForecast } from "@/components/detail/WeatherForecast";
import { PopularRoutes } from "@/components/detail/PopularRoutes";
import { RouteList } from "@/components/detail/RouteList";
import { InfoBlock, InfoLine } from "@/components/detail/InfoBlock";

export async function generateStaticParams() {
  return fixtureCrags.map((c) => ({ slug: c.slug }));
}

type Params = Promise<{ slug: string }>;

export default async function CragDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const crag = getCragBySlug(slug);
  if (!crag) notFound();

  const grade = formatGradeRange(crag.gradeLow, crag.gradeHigh);
  const climbingTypeLabel = crag.climbingTypes
    .map((t) => labelForClimbingType(t))
    .join(" + ");
  const itemCount = crag.climbingTypes.includes("buldring")
    ? `${crag.routeCount} problemer`
    : `${crag.routeCount} ruter`;

  return (
    <main className="flex flex-col flex-1">
      <Gallery imageIds={crag.galleryImageIds} cragName={crag.name} />

      <div className="px-6 pt-6 pb-32 md:px-10 md:pt-10 md:grid md:grid-cols-[1fr_360px] md:gap-12 md:pb-16">
        <div>
          <h1 className="font-serif text-[30px] leading-[1.05] tracking-tight text-ink md:text-[44px]">
            {crag.name}
          </h1>
          <p className="mt-1 text-[14px] text-ink-2 md:text-[15px]">
            {crag.area} · {formatDistance(crag.distanceMinutes)} fra deg
          </p>
          <p className="mt-1 text-[13px] text-ink-3 md:text-[14px]">
            {climbingTypeLabel} · {itemCount} · {grade} · {crag.rockType}
          </p>

          <div className="mt-6 md:mt-8">
            <DrynessBlock crag={crag} />
          </div>

          <div className="mt-8 md:mt-10">
            <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-ink-3 md:text-[13px]">
              Vær neste 3 dager
            </h3>
            <WeatherForecast crag={crag} />
          </div>

          {crag.routes.length > 0 && (
            <div className="mt-10 md:mt-14">
              <h3 className="mb-4 px-1 text-[12px] font-semibold tracking-wide text-ink-3 md:text-[13px]">
                Populære ruter
              </h3>
              <PopularRoutes routes={crag.routes} />
            </div>
          )}

          {crag.routes.length > 0 && (
            <div className="mt-10 md:mt-14">
              <h3 className="mb-4 text-[12px] font-semibold tracking-wide text-ink-3 md:text-[13px]">
                Alle ruter ({crag.routes.length})
              </h3>
              <RouteList routes={crag.routes} />
            </div>
          )}

          <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-2 md:gap-10">
            <InfoBlock title="Komme dit">
              <InfoLine label="Parkering" value={crag.parkingNote} />
              <InfoLine label="Innsteg" value={crag.approachNote} />
              <InfoLine label="Eksposisjon" value={crag.exposureNote} />
              <InfoLine label="Bergart" value={crag.rockType} />
              <InfoLine label="Sesong" value={crag.seasonNote} />
            </InfoBlock>
            <InfoBlock title="Praktisk">
              <InfoLine label="Tilgang" value={crag.accessNote} />
              <InfoLine label="Mobildekning" value="God" />
              <InfoLine label="Lokal klubb" value={crag.localClub} />
            </InfoBlock>
          </div>
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-8 rounded-2xl bg-card p-6">
            <div className="text-[12px] font-semibold tracking-wide text-ink-3">
              Komme deg dit
            </div>
            <p className="mt-2 text-[14px] text-ink-2">
              Vi sender deg videre til kart-appen din for kjørerute fra din
              posisjon.
            </p>
            <a
              href={mapsLink(crag.location.lat, crag.location.lng, crag.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-ink transition active:scale-[0.99]"
            >
              Åpne i Kart <span aria-hidden>↗</span>
            </a>
          </div>
        </aside>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-line bg-bg px-6 pt-3 md:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        <a
          href={mapsLink(crag.location.lat, crag.location.lng, crag.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[16px] font-semibold text-primary-ink"
        >
          Åpne i Kart <span aria-hidden>↗</span>
        </a>
      </div>
    </main>
  );
}

function mapsLink(lat: number, lng: number, name: string) {
  const q = encodeURIComponent(`${name} (${lat},${lng})`);
  return `https://maps.apple.com/?q=${q}&ll=${lat},${lng}`;
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
