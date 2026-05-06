"use client";

import dynamic from "next/dynamic";
import type { LatLng } from "@/types/crag";

const CragLocationMap = dynamic(
  () =>
    import("./CragLocationMap").then((m) => m.CragLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[260px] place-items-center rounded-2xl bg-[#e9e3d5] text-ink-3 md:h-[320px]">
        Laster kart …
      </div>
    ),
  },
);

export function CragLocationMapClient({
  location,
  name,
}: {
  location: LatLng;
  name: string;
}) {
  return <CragLocationMap location={location} name={name} />;
}
