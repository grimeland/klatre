"use client";

import Link from "next/link";
import type { Crag } from "@/types/crag";
import { formatDistance } from "@/lib/utils/format";
import { DrynessBadge } from "@/components/ui/DrynessBadge";

export function ExploreBottomSheet({
  crag,
  onClose,
}: {
  crag: Crag;
  onClose: () => void;
}) {
  const isBouldering = crag.climbingTypes.includes("buldring");
  const itemLabel = isBouldering ? "problemer" : "ruter";
  const meta = [
    crag.routeCount ? `${crag.routeCount} ${itemLabel}` : null,
    !isBouldering && crag.gradeLow && crag.gradeHigh
      ? `${crag.gradeLow}–${crag.gradeHigh}`
      : null,
    crag.area,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] px-3 pb-24 md:inset-x-auto md:left-6 md:bottom-6 md:w-[420px] md:px-0 md:pb-0">
      <Link
        href={`/felt/${crag.slug}`}
        className="pointer-events-auto block overflow-hidden rounded-2xl bg-card shadow-xl transition active:scale-[0.99]"
      >
        <div className={`relative h-[160px] crag-img-${crag.imageId}`}>
          <div className="absolute left-3 top-3">
            <DrynessBadge dryness={crag.dryness} />
          </div>
          <button
            type="button"
            aria-label="Lukk"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-[16px] font-semibold text-ink">
              {crag.name}
            </div>
            <div className="text-[13px] font-medium text-ink-2">
              {formatDistance(crag.distanceMinutes)}
            </div>
          </div>
          <div className="mt-1 text-[12px] text-ink-3">{meta}</div>
        </div>
      </Link>
    </div>
  );
}
