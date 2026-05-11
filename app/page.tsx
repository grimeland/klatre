import { fixtureCrags } from "@/lib/fixtures/crags";
import { HomeView, type CragWeatherMap } from "@/components/home/HomeView";
import { fetchForecast } from "@/lib/met/forecast";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const weatherEntries = await Promise.all(
    fixtureCrags.map(async (c) => {
      const w = await fetchForecast(c.location.lat, c.location.lng);
      if (!w) return null;
      return [
        c.slug,
        {
          score: w.score,
          label: w.scoreLabel,
          emoji: w.scoreEmoji,
          precipNext24hMm: w.precipNext24hMm,
        },
      ] as const;
    }),
  );

  const weather: CragWeatherMap = Object.fromEntries(
    weatherEntries.filter((x): x is NonNullable<typeof x> => x !== null),
  );

  return <HomeView crags={fixtureCrags} weather={weather} />;
}
