"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CragImage } from "@/types/crag";
import { SaveCragButton } from "@/components/logbook/SaveCragButton";

export function Gallery({
  images,
  cragName,
  cragSlug,
  isAuthenticated,
  isSaved,
}: {
  images: CragImage[];
  cragName: string;
  cragSlug: string;
  isAuthenticated: boolean;
  isSaved: boolean;
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

  const hasMultiple = images.length > 1;

  function scrollToIndex(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

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

      <div className="absolute right-3 top-3 z-20 md:right-5 md:top-5">
        <SaveCragButton
          cragSlug={cragSlug}
          isAuthenticated={isAuthenticated}
          isSaved={isSaved}
          variant="overlay"
        />
      </div>

      {hasMultiple && active > 0 && (
        <button
          type="button"
          onClick={() => scrollToIndex(active - 1)}
          aria-label="Forrige bilde"
          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md ring-1 ring-black/5 transition hover:scale-105 active:scale-95 md:left-5 md:h-11 md:w-11"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {hasMultiple && active < images.length - 1 && (
        <button
          type="button"
          onClick={() => scrollToIndex(active + 1)}
          aria-label="Neste bilde"
          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md ring-1 ring-black/5 transition hover:scale-105 active:scale-95 md:right-5 md:h-11 md:w-11"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {credit && (
        <div className="absolute bottom-4 left-4 max-w-[60%] text-[11px] text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] md:bottom-5 md:left-6 md:text-[12px]">
          {credit}
        </div>
      )}

      {hasMultiple && (
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
      )}
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
