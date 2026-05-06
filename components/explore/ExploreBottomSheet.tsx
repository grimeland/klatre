"use client";

import Link from "next/link";
import type { Crag } from "@/types/crag";
import {
  computeAvgGrade,
  formatDistance,
  formatGradeRange,
} from "@/lib/utils/format";

export function ExploreBottomSheet({
  crag,
  onClose,
}: {
  crag: Crag;
  onClose: () => void;
}) {
  const isBouldering = crag.climbingTypes.includes("buldring");
  const itemLabel = isBouldering ? "problemer" : "ruter";
  const avgGrade = computeAvgGrade(crag.routes);
  const gradeRange =
    !isBouldering && crag.gradeLow && crag.gradeHigh
      ? formatGradeRange(crag.gradeLow, crag.gradeHigh)
      : null;

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 md:inset-x-auto md:bottom-6 md:left-6 md:w-[340px]"
      style={{ zIndex: 1000 }}
    >
      <Link
        href={`/felt/${crag.slug}`}
        className="pointer-events-auto block overflow-hidden rounded-2xl bg-card shadow-xl transition active:scale-[0.99]"
      >
        <div className={`relative h-[200px] crag-img-${crag.imageId}`}>
          <button
            type="button"
            aria-label="Lagre"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute right-12 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm"
          >
            <span aria-hidden>♡</span>
          </button>
          <button
            type="button"
            aria-label="Lukk"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow-sm"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[16px] font-semibold leading-tight text-ink">
              {crag.name}
            </h3>
            <span className="text-[13px] font-medium text-ink-2">
              {formatDistance(crag.distanceMinutes)}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-ink-3">{crag.area}</p>
          <p className="mt-2 text-[13px] text-ink-2">
            {crag.routeCount
              ? `${crag.routeCount} ${itemLabel}`
              : "Ingen ruter registrert"}
            {avgGrade
              ? ` · snittgrad ${avgGrade}`
              : gradeRange
                ? ` · ${gradeRange}`
                : ""}
          </p>
        </div>
      </Link>
    </div>
  );
}
