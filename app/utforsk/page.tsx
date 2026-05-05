import { fixtureCrags } from "@/lib/fixtures/crags";
import { ExploreView } from "@/components/explore/ExploreView";

export default function UtforskPage() {
  const crags = [...fixtureCrags].sort(
    (a, b) => a.distanceMinutes - b.distanceMinutes,
  );
  return (
    <main className="flex h-[calc(100vh-72px)] flex-col md:h-[calc(100vh-40px)]">
      <ExploreView crags={crags} />
    </main>
  );
}
