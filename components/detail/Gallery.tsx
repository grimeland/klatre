"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Gallery({
  imageIds,
  cragName,
}: {
  imageIds: (1 | 2 | 3 | 4 | 5 | 6)[];
  cragName: string;
}) {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActive(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar flex h-[320px] overflow-x-auto md:h-[480px] [scroll-snap-type:x_mandatory] [&>div]:[scroll-snap-align:start]"
      >
        {imageIds.map((id, i) => (
          <div
            key={i}
            className={`crag-img-${id} h-full w-full flex-none`}
            aria-label={`Bilde ${i + 1} av ${cragName}`}
          />
        ))}
      </div>

      <div className="absolute left-3 right-3 top-3 flex justify-between md:left-6 md:right-6 md:top-5">
        <Link
          href="/"
          aria-label="Tilbake"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur-sm"
        >
          <span aria-hidden>←</span>
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Del"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur-sm"
          >
            <span aria-hidden>↗</span>
          </button>
          <button
            type="button"
            aria-label="Lagre"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur-sm"
          >
            <span aria-hidden>♡</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {imageIds.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-5 bg-white" : "w-1.5 bg-white/55"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
