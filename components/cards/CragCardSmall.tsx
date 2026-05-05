import Link from "next/link";
import type { Crag } from "@/types/crag";
import { formatDistance, formatGradeRange } from "@/lib/utils/format";
import { DrynessBadge } from "@/components/ui/DrynessBadge";
import { HeartButton } from "@/components/ui/HeartButton";

export function CragCardSmall({ crag }: { crag: Crag }) {
  const isBouldering = crag.climbingTypes.includes("buldring");
  const grade = formatGradeRange(crag.gradeLow, crag.gradeHigh);
  const itemCount = isBouldering
    ? `${crag.routeCount} problemer`
    : `${crag.routeCount} ruter`;

  return (
    <Link
      href={`/felt/${crag.slug}`}
      className="block w-[220px] flex-none overflow-hidden rounded-2xl bg-card transition-transform active:scale-[0.98]"
    >
      <div
        className={`relative h-[150px] crag-img-${crag.imageId}`}
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
        <div className="mt-0.5 text-[12px] text-ink-3">
          {formatDistance(crag.distanceMinutes)} · {itemCount}
          {!isBouldering && ` · ${grade}`}
        </div>
      </div>
    </Link>
  );
}
