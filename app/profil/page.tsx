import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { ProfileCard } from "./ProfileCard";
import { CragCardLarge } from "@/components/cards/CragCardLarge";
import { fetchForecast } from "@/lib/met/forecast";
import { fixtureCrags } from "@/lib/fixtures/crags";

export const dynamic = "force-dynamic";

const STYLE_LABEL: Record<string, string> = {
  onsight: "Onsight",
  flash: "Flash",
  redpoint: "Redpoint",
  top_rope: "Topptau",
  tried: "Prøvd",
};

const SENT_STYLES = new Set(["onsight", "flash", "redpoint"]);

function single<T>(rel: T | T[] | null | undefined): T | null {
  if (rel == null) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export default async function ProfilPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/logg-inn?next=/profil");

  const [profileRes, ticksRes, savedRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, username, bio, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("route_ticks")
      .select(
        "id, climbed_on, send_style, comment, routes(id, name, grade, grade_numeric, crag_slug, crags(name))",
      )
      .eq("user_id", user.id)
      .order("climbed_on", { ascending: false })
      .limit(50),
    supabase
      .from("saved_crags")
      .select("crag_slug")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const ticks = ticksRes.data ?? [];
  const saved = savedRes.data ?? [];

  // Pair each saved slug with the full fixture Crag so we can render
  // the same large card the home page uses. Skip any slug that no
  // longer matches a fixture (data drift between DB and fixtures).
  const savedCrags = saved
    .map((s) => fixtureCrags.find((c) => c.slug === s.crag_slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const savedWithWeather = await Promise.all(
    savedCrags.map(async (crag) => {
      const w = await fetchForecast(crag.location.lat, crag.location.lng);
      return {
        crag,
        weather: w
          ? { emoji: w.scoreEmoji, label: w.scoreLabel, score: w.score }
          : undefined,
      };
    }),
  );

  // Stats: total, hardest sent grade, most-frequent grade
  let hardest: { grade: string; numeric: number } | null = null;
  const gradeCount = new Map<string, number>();
  for (const t of ticks) {
    const route = single(t.routes);
    if (!route) continue;
    if (SENT_STYLES.has(t.send_style)) {
      if (!hardest || route.grade_numeric > hardest.numeric) {
        hardest = { grade: route.grade, numeric: route.grade_numeric };
      }
      gradeCount.set(route.grade, (gradeCount.get(route.grade) ?? 0) + 1);
    }
  }
  const mostCommon = [...gradeCount.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];

  const sentCount = ticks.filter((t) => SENT_STYLES.has(t.send_style)).length;

  return (
    <main className="flex flex-1 flex-col">
      <DetailHeader />
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 md:px-10 md:pt-12">
        <div className="pt-6 md:pt-12">
          <ProfileCard
            userId={user.id}
            email={user.email ?? ""}
            displayName={profile?.display_name ?? ""}
            username={profile?.username ?? ""}
            bio={profile?.bio ?? ""}
            avatarUrl={profile?.avatar_url ?? null}
          />
        </div>

        {ticks.length > 0 && (
          <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
            <Stat label="Turer" value={String(ticks.length)} />
            <Stat
              label="Hardeste send"
              value={hardest?.grade ?? "—"}
            />
            <Stat
              label="Oftest"
              value={mostCommon ? mostCommon[0] : "—"}
              hint={mostCommon ? `${mostCommon[1]} ganger` : undefined}
            />
          </div>
        )}

        <Section
          title="Siste turer"
          count={ticks.length}
          empty={ticks.length === 0}
          emptyText="Du har ikke logget noen turer ennå."
          emptyAction={{ label: "Se felt nær deg →", href: "/" }}
        >
          <ul className="flex flex-col gap-2">
            {ticks.map((t) => {
              const route = single(t.routes);
              if (!route) return null;
              const crag = single(route.crags);
              return (
                <li
                  key={t.id}
                  className="flex items-start gap-3 rounded-2xl bg-card px-4 py-3"
                >
                  <span className="font-mono mt-0.5 flex-none rounded bg-bg px-2 py-1 text-[11px] font-semibold text-ink-2">
                    {STYLE_LABEL[t.send_style] ?? t.send_style}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/felt/${route.crag_slug}`}
                      className="block truncate text-[14px] font-medium text-ink"
                    >
                      {route.name}
                      <span className="ml-2 font-mono text-[12px] text-ink-3">
                        {route.grade}
                      </span>
                    </Link>
                    <p className="mt-0.5 text-[12px] text-ink-3">
                      {crag?.name ?? "Ukjent felt"} · {formatDate(t.climbed_on)}
                    </p>
                    {t.comment && (
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">
                        {t.comment}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          title="Lagrede felt"
          count={savedWithWeather.length}
          empty={savedWithWeather.length === 0}
          emptyText="Du har ikke lagret noen felt."
          emptyAction={{ label: "Bla i felt →", href: "/" }}
        >
          <div className="grid grid-cols-1 gap-x-4 gap-y-7 md:grid-cols-2 md:gap-x-5 md:gap-y-9 lg:grid-cols-3">
            {savedWithWeather.map(({ crag, weather }) => (
              <CragCardLarge
                key={crag.slug}
                crag={crag}
                weather={weather}
              />
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-card px-4 py-4 text-center">
      <p className="font-serif text-[28px] leading-none text-ink">{value}</p>
      <p className="mt-1.5 text-[11px] text-ink-3">{label}</p>
      {hint && <p className="text-[10px] text-ink-3">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  count,
  empty,
  emptyText,
  emptyAction,
  children,
}: {
  title: string;
  count: number;
  empty: boolean;
  emptyText: string;
  emptyAction?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-serif text-[22px] leading-tight tracking-tight text-ink md:text-[26px]">
        {title}
        {!empty && (
          <span className="ml-2 text-[16px] text-ink-3 md:text-[18px]">
            {count}
          </span>
        )}
      </h2>
      {empty ? (
        <div className="rounded-2xl bg-card px-5 py-6">
          <p className="text-[14px] leading-relaxed text-ink-3">{emptyText}</p>
          {emptyAction && (
            <Link
              href={emptyAction.href}
              className="mt-3 inline-block text-[14px] font-semibold text-ink underline-offset-4 hover:underline"
            >
              {emptyAction.label}
            </Link>
          )}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
