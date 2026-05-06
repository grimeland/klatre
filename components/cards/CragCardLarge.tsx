import Link from "next/link";
import type { Crag } from "@/types/crag";
import { formatDistance } from "@/lib/utils/format";
import { DrynessBadge } from "@/components/ui/DrynessBadge";
import { HeartButton } from "@/components/ui/HeartButton";

type Props = {
  crag: Crag;
  onSelect?: () => void;
};

export function CragCardLarge({ crag, onSelect }: Props) {
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

  const inner = (
    <>
      <div
        className={`relative aspect-[5/4] overflow-hidden rounded-2xl crag-img-${crag.imageId}`}
      >
        <div className="absolute left-3 top-3">
          <DrynessBadge dryness={crag.dryness} />
        </div>
        <div className="absolute right-3 top-3">
          <HeartButton />
        </div>
      </div>
      <div className="mt-3 px-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-[15px] font-semibold leading-tight text-ink md:text-[16px]">
            {crag.name}
          </div>
          <div className="flex-shrink-0 text-[13px] font-medium text-ink-2">
            {formatDistance(crag.distanceMinutes)}
          </div>
        </div>
        <div className="mt-1 text-[13px] text-ink-3">{meta || crag.area}</div>
      </div>
    </>
  );

  const className = "block w-full text-left transition active:opacity-80";

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className={className}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={`/felt/${crag.slug}`} className={className}>
      {inner}
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
