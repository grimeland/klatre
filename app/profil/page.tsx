import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { ProfileCard } from "./ProfileCard";
import { RoutesList, type RouteEntry } from "./RoutesList";
import { GradeChart } from "./GradeChart";
import { CragCardLarge } from "@/components/cards/CragCardLarge";
import { fetchForecast } from "@/lib/met/forecast";
import { fixtureCrags } from "@/lib/fixtures/crags";
import type { Route, RouteStars } from "@/types/crag";
import type { RouteTick } from "@/lib/logbook/load";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type SendStyle = Database["public"]["Enums"]["send_style"];

const SENT_STYLES = new Set<SendStyle>(["onsight", "flash", "redpoint"]);
// Rank used to pick the "best" send for a route when grouping ticks.
const STYLE_RANK: Record<SendStyle, number> = {
  onsight: 5,
  flash: 4,
  redpoint: 3,
  top_rope: 2,
  tried: 1,
};

function single<T>(rel: T | T[] | null | undefined): T | null {
  if (rel == null) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

function mainGrade(grade: string): string {
  const match = grade.match(/^(\d+)/);
  return match ? match[1] : grade;
}

function toRouteStars(stars: number): RouteStars {
  if (stars <= 0) return 0;
  if (stars >= 3) return 3;
  return stars as RouteStars;
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
        "id, climbed_on, send_style, attempts, comment, routes(id, name, grade, grade_numeric, length_m, stars, type, ascents, is_classic, sector, fa_year, fa_by, description, crag_slug, crags(name))",
      )
      .eq("user_id", user.id)
      .order("climbed_on", { ascending: false })
      .limit(200),
    supabase
      .from("saved_crags")
      .select("crag_slug")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const rawTicks = ticksRes.data ?? [];
  const saved = savedRes.data ?? [];

  // Saved crags hydrated from fixtures + live weather
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

  // Group ticks by route — one row per unique route, with all your
  // ticks of it available when the row is opened.
  const entryMap = new Map<string, RouteEntry>();
  for (const t of rawTicks) {
    const r = single(t.routes);
    if (!r) continue;
    const crag = single(r.crags);
    const route: Route = {
      id: r.id,
      name: r.name,
      grade: r.grade,
      gradeNumeric: r.grade_numeric,
      lengthM: r.length_m ?? 0,
      stars: toRouteStars(r.stars),
      type: r.type,
      ascents: r.ascents,
      isClassic: r.is_classic,
      sector: r.sector ?? undefined,
      faYear: r.fa_year ?? undefined,
      faBy: r.fa_by ?? undefined,
      description: r.description ?? undefined,
    };
    const tick: RouteTick = {
      id: t.id,
      routeId: r.id,
      climbedOn: t.climbed_on,
      sendStyle: t.send_style,
      attempts: t.attempts,
      comment: t.comment,
    };
    const existing = entryMap.get(r.id);
    if (existing) {
      existing.ticks.push(tick);
      if (STYLE_RANK[tick.sendStyle] > STYLE_RANK[existing.bestStyle]) {
        existing.bestStyle = tick.sendStyle;
      }
      if (tick.climbedOn > existing.lastClimbedOn) {
        existing.lastClimbedOn = tick.climbedOn;
        existing.lastComment = tick.comment;
      }
    } else {
      entryMap.set(r.id, {
        route,
        cragSlug: r.crag_slug,
        cragName: crag?.name ?? "",
        ticks: [tick],
        bestStyle: tick.sendStyle,
        lastClimbedOn: tick.climbedOn,
        lastComment: tick.comment,
      });
    }
  }
  const entries = [...entryMap.values()].sort((a, b) =>
    b.lastClimbedOn.localeCompare(a.lastClimbedOn),
  );

  // Stats
  let hardest: { grade: string; numeric: number } | null = null;
  const mainGradeCount = new Map<string, number>();
  for (const e of entries) {
    if (SENT_STYLES.has(e.bestStyle)) {
      if (!hardest || e.route.gradeNumeric > hardest.numeric) {
        hardest = { grade: e.route.grade, numeric: e.route.gradeNumeric };
      }
    }
    const bucket = mainGrade(e.route.grade);
    mainGradeCount.set(bucket, (mainGradeCount.get(bucket) ?? 0) + 1);
  }
  const gradeBuckets = ["4", "5", "6", "7", "8", "9"]
    .map((g) => ({ label: g, count: mainGradeCount.get(g) ?? 0 }))
    .filter((b, idx, all) => {
      // Trim leading/trailing zero buckets so the chart focuses on the
      // grades you actually climb.
      const lastNonZero = all
        .map((x, i) => (x.count > 0 ? i : -1))
        .reduce((max, i) => (i > max ? i : max), -1);
      const firstNonZero = all.findIndex((x) => x.count > 0);
      if (firstNonZero === -1) return false;
      return idx >= firstNonZero && idx <= lastNonZero;
    });

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

        {entries.length > 0 && (
          <div className="mt-10 grid gap-3 md:grid-cols-[1fr_1fr_2fr]">
            <Stat label="Ruter" value={String(entries.length)} />
            <Stat
              label="Hardeste send"
              value={hardest?.grade ?? "—"}
            />
            <div className="md:row-span-2 md:col-start-3 md:row-start-1">
              {gradeBuckets.length > 0 && (
                <GradeChart buckets={gradeBuckets} />
              )}
            </div>
            <Stat
              label="Turer totalt"
              value={String(rawTicks.length)}
              hint={
                rawTicks.length !== entries.length
                  ? `på ${entries.length} ruter`
                  : undefined
              }
            />
            <Stat
              label="Sendt"
              value={String(
                entries.filter((e) => SENT_STYLES.has(e.bestStyle)).length,
              )}
            />
          </div>
        )}

        <Section
          title="Dine ruter"
          count={entries.length}
          empty={entries.length === 0}
          emptyText="Du har ikke logget noen ruter ennå."
          emptyAction={{ label: "Se felt nær deg →", href: "/" }}
        >
          <RoutesList entries={entries} />
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
              <CragCardLarge key={crag.slug} crag={crag} weather={weather} />
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
    <div className="rounded-2xl bg-card px-4 py-4">
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
