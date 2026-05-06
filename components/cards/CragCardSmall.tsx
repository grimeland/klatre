import Link from "next/link";
import type { Crag } from "@/types/crag";
import { formatDistance } from "@/lib/utils/format";
import { DrynessBadge } from "@/components/ui/DrynessBadge";
import { HeartButton } from "@/components/ui/HeartButton";

export function CragCardSmall({ crag }: { crag: Crag }) {
  const isBouldering = crag.climbingTypes.includes("buldring");
  const itemLabel = isBouldering ? "problemer" : "ruter";
  const meta = [
    formatDistance(crag.distanceMinutes),
    crag.routeCount ? `${crag.routeCount} ${itemLabel}` : null,
    !isBouldering && crag.gradeLow && crag.gradeHigh
      ? `${crag.gradeLow}–${crag.gradeHigh}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/felt/${crag.slug}`}
      className="block w-[220px] flex-none overflow-hidden rounded-2xl bg-card transition-transform active:scale-[0.98] md:w-auto md:flex-auto"
    >
      <div
        className={`relative h-[150px] crag-img-${crag.imageId} md:h-[200px]`}
        aria-label={`Bilde av ${crag.name}`}
      >
        <div className="absolute left-2.5 top-2.5">
          <DrynessBadge dryness={crag.dryness} />
        </div>
        <div className="absolute right-2.5 top-2.5">
          <HeartButton />
        </div>
      </div>
      <div className="p-3.5">
        <div className="text-[15px] font-semibold leading-tight text-ink">
          {crag.name}
        </div>
        <div className="mt-0.5 text-[12px] text-ink-3">{meta}</div>
      </div>
    </Link>
  );
}
