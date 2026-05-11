"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import type { Crag } from "@/types/crag";
import {
  computeAvgGrade,
  formatDistance,
  formatGradeRange,
} from "@/lib/utils/format";

const WIDTH = 260;
const HEIGHT = 290;
const PIN_HALF_H = 16;
const PIN_HALF_W = 90;
const GAP = 14;
const EDGE_PADDING = 12;

type Pos = { left: number; top: number };

export function MapPreviewSheet({
  crag,
  onClose,
}: {
  crag: Crag;
  onClose: () => void;
}) {
  const map = useMap();
  const [pos, setPos] = useState<Pos | null>(null);

  useEffect(() => {
    function update() {
      const point = map.latLngToContainerPoint([
        crag.location.lat,
        crag.location.lng,
      ]);
      const size = map.getSize();
      const width = Math.min(WIDTH, size.x - EDGE_PADDING * 2);
      const height = HEIGHT;

      const centeredLeft = point.x - width / 2;
      const fitsCenteredX =
        centeredLeft >= EDGE_PADDING &&
        centeredLeft + width <= size.x - EDGE_PADDING;

      const fitsBelow =
        point.y + PIN_HALF_H + GAP + height <= size.y - EDGE_PADDING;
      const fitsAbove =
        point.y - PIN_HALF_H - GAP - height >= EDGE_PADDING;
      const fitsRight =
        point.x + PIN_HALF_W + GAP + width <= size.x - EDGE_PADDING;
      const fitsLeft =
        point.x - PIN_HALF_W - GAP - width >= EDGE_PADDING;

      let left: number;
      let top: number;

      if (fitsCenteredX && fitsBelow) {
        left = centeredLeft;
        top = point.y + PIN_HALF_H + GAP;
      } else if (fitsCenteredX && fitsAbove) {
        left = centeredLeft;
        top = point.y - PIN_HALF_H - GAP - height;
      } else if (fitsRight) {
        left = point.x + PIN_HALF_W + GAP;
        top = point.y - height / 2;
      } else if (fitsLeft) {
        left = point.x - PIN_HALF_W - GAP - width;
        top = point.y - height / 2;
      } else if (fitsBelow) {
        left = centeredLeft;
        top = point.y + PIN_HALF_H + GAP;
      } else if (fitsAbove) {
        left = centeredLeft;
        top = point.y - PIN_HALF_H - GAP - height;
      } else {
        left = centeredLeft;
        top = point.y + PIN_HALF_H + GAP;
      }

      if (left < EDGE_PADDING) left = EDGE_PADDING;
      if (left + width > size.x - EDGE_PADDING) {
        left = size.x - width - EDGE_PADDING;
      }
      if (top < EDGE_PADDING) top = EDGE_PADDING;
      if (top + height > size.y - EDGE_PADDING) {
        top = size.y - height - EDGE_PADDING;
      }

      setPos({ left, top });
    }
    update();
    map.on("move zoom resize", update);
    return () => {
      map.off("move zoom resize", update);
    };
  }, [crag.id, crag.location.lat, crag.location.lng, map]);

  if (!pos) return null;

  const width = Math.min(WIDTH, map.getSize().x - EDGE_PADDING * 2);

  return createPortal(
    <div
      className="pointer-events-auto absolute"
      style={{
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        width: `${width}px`,
        zIndex: 1000,
      }}
    >
      <PreviewCard crag={crag} onClose={onClose} />
    </div>,
    map.getContainer(),
  );
}

function PreviewCard({
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
  const gradeLabel = avgGrade ? `⌀ ${avgGrade}` : gradeRange;

  const heroImage = crag.images?.[0];
  const heroStyle = heroImage?.url
    ? {
        backgroundImage: `url(${heroImage.url})`,
        backgroundSize: "cover" as const,
        backgroundPosition: "center" as const,
      }
    : undefined;
  const heroClass = heroImage?.url ? "" : `crag-img-${crag.imageId}`;

  return (
    <Link
      href={`/felt/${crag.slug}`}
      className="block overflow-hidden rounded-2xl bg-card shadow-2xl"
    >
      <div className={`relative aspect-[5/4] ${heroClass}`} style={heroStyle}>
        <button
          type="button"
          aria-label="Lagre"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-12 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm"
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
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow-sm"
        >
          <span aria-hidden>✕</span>
        </button>
      </div>
      <div className="p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
            {crag.name}
          </h3>
          {gradeLabel && (
            <span className="flex-shrink-0 text-[12px] font-medium text-ink-2">
              {gradeLabel}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[12px] text-ink-3">
          {crag.area} · {formatDistance(crag.distanceMinutes)}
        </p>
        {crag.routeCount && (
          <p className="mt-1.5 text-[12px] text-ink-2">
            {crag.routeCount} {itemLabel}
          </p>
        )}
      </div>
    </Link>
  );
}
