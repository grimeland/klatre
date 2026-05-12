import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { ProfileCard } from "./ProfileCard";
import { fetchForecast } from "@/lib/met/forecast";

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

  const [profileRes, ticksRes, projectsRes, savedRes] = await Promise.all([
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
      .from("route_projects")
      .select("started_at, routes(id, name, grade, crag_slug, crags(name))")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false }),
    supabase
      .from("saved_crags")
      .select("crag_slug, crags(slug, name, area, lat, lng)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const ticks = ticksRes.data ?? [];
  const projects = projectsRes.data ?? [];
  const saved = savedRes.data ?? [];

  // Pull weather for each saved crag in parallel
  const savedWithWeather = await Promise.all(
    saved.map(async (s) => {
      const crag = single(s.crags);
      if (!crag || crag.lat == null || crag.lng == null) {
        return { crag, weather: null };
      }
      const weather = await fetchForecast(crag.lat, crag.lng);
      return {
        crag,
        weather: weather
          ? { label: weather.scoreLabel, emoji: weather.scoreEmoji }
          : null,
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
      <div className="px-4 pb-24 pt-8 md:pl-8 md:pr-4 md:pt-12">
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
          title="Aktive prosjekter"
          count={projects.length}
          empty={projects.length === 0}
          emptyText="Ingen aktive prosjekter."
        >
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {projects.map((p) => {
              const route = single(p.routes);
              if (!route) return null;
              const crag = single(route.crags);
              return (
                <li key={route.id}>
                  <Link
                    href={`/felt/${route.crag_slug}`}
                    className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3"
                  >
                    <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 border-ink">
                      <span className="block h-2.5 w-2.5 rounded-full bg-ink" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-ink">
                        {route.name}
                      </p>
                      {crag?.name && (
                        <p className="text-[12px] text-ink-3">{crag.name}</p>
                      )}
                    </div>
                    <span className="font-mono flex-none rounded-lg bg-bg px-2.5 py-1.5 text-[12px] font-bold text-ink">
                      {route.grade}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          title="Lagrede felt"
          count={saved.length}
          empty={saved.length === 0}
          emptyText="Du har ikke lagret noen felt."
        >
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {savedWithWeather.map((s) => {
              const crag = s.crag;
              if (!crag) return null;
              return (
                <li key={crag.slug}>
                  <Link
                    href={`/felt/${crag.slug}`}
                    className="flex items-start justify-between gap-3 rounded-2xl bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-ink">
                        {crag.name}
                      </p>
                      <p className="text-[12px] text-ink-3">{crag.area}</p>
                    </div>
                    {s.weather && (
                      <span className="flex-none whitespace-nowrap rounded-full bg-bg px-2.5 py-1 text-[11px] font-medium text-ink-2">
                        <span aria-hidden className="mr-1">
                          {s.weather.emoji}
                        </span>
                        {s.weather.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
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
