"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CragImage } from "@/types/crag";

export function Gallery({
  images,
  cragName,
}: {
  images: CragImage[];
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

  const activeImage = images[active];
  const credit = activeImage?.photographer
    ? formatCredit(activeImage)
    : null;

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar flex h-[320px] overflow-x-auto md:h-[480px] [scroll-snap-type:x_mandatory] [&>div]:[scroll-snap-align:start]"
      >
        {images.map((img, i) => (
          <div
            key={i}
            className={`h-full w-full flex-none ${img.url ? "" : `crag-img-${img.placeholderId ?? 1}`}`}
            style={
              img.url
                ? {
                    backgroundImage: `url(${img.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
            aria-label={img.alt ?? `Bilde ${i + 1} av ${cragName}`}
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

      {credit && (
        <div className="absolute bottom-4 left-4 max-w-[60%] text-[11px] text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] md:bottom-5 md:left-6 md:text-[12px]">
          {credit}
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((_, i) => (
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

function formatCredit(img: CragImage): React.ReactNode {
  const parts: string[] = [];
  if (img.photographer) parts.push(`Foto: ${img.photographer}`);
  if (img.license) parts.push(img.license);
  const text = parts.join(" · ");
  if (img.sourceUrl) {
    return (
      <a
        href={img.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white"
      >
        {text}
      </a>
    );
  }
  return text;
}
