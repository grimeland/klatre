import Link from "next/link";
import type { Crag } from "@/types/crag";
import { formatDistance } from "@/lib/utils/format";
import { DrynessBadge } from "@/components/ui/DrynessBadge";
import { HeartButton } from "@/components/ui/HeartButton";

export function CragCardLarge({ crag }: { crag: Crag }) {
  const isBouldering = crag.climbingTypes.includes("buldring");
  const itemLabel = isBouldering ? "problemer" : "ruter";
  const climbingLabel = crag.climbingTypes
    .map((t) => labelForType(t))
    .join(" + ");
  const meta = [
    crag.routeCount ? `${crag.routeCount} ${itemLabel}` : null,
    !isBouldering && crag.gradeLow && crag.gradeHigh
      ? `${crag.gradeLow}–${crag.gradeHigh}`
      : null,
    climbingLabel,
    crag.exposure.length > 0 ? `${exposureLabel(crag.exposure)}-vendt` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/felt/${crag.slug}`}
      className="block overflow-hidden rounded-2xl bg-card transition active:scale-[0.99]"
    >
      <div className={`relative h-[220px] crag-img-${crag.imageId} md:h-[260px]`}>
        <div className="absolute left-3 top-3">
          <DrynessBadge dryness={crag.dryness} />
        </div>
        <div className="absolute right-3 top-3">
          <HeartButton />
        </div>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-[17px] font-semibold text-ink">{crag.name}</div>
          <div className="text-[13px] font-medium text-ink-2">
            {formatDistance(crag.distanceMinutes)}
          </div>
        </div>
        <div className="mt-1 text-[13px] text-ink-3">{meta || crag.area}</div>
      </div>
    </Link>
  );
}

function labelForType(t: Crag["climbingTypes"][number]): string {
  if (t === "sport") return "Sport";
  if (t === "trad") return "Trad";
  if (t === "buldring") return "Buldring";
  if (t === "multipitch") return "Multipitch";
  if (t === "is") return "Is";
  return "Alpin";
}

function exposureLabel(e: Crag["exposure"]): string {
  const map: Record<string, string> = { S: "sør", V: "vest", Ø: "øst", N: "nord" };
  return e.map((x) => map[x] ?? x).join("-/");
}
