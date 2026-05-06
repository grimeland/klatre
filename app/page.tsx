import { fixtureCrags } from "@/lib/fixtures/crags";
import { HomeView } from "@/components/home/HomeView";

export default function HomePage() {
  return <HomeView crags={fixtureCrags} />;
}
