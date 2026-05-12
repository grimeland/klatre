import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { ProfileCard } from "./ProfileCard";

export const dynamic = "force-dynamic";

const STYLE_LABEL: Record<string, string> = {
  onsight: "Onsight",
  flash: "Flash",
  redpoint: "Redpoint",
  top_rope: "Topptau",
  tried: "Prøvd",
};

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
        "id, climbed_on, send_style, attempts, comment, routes(id, name, grade, crag_slug)",
      )
      .eq("user_id", user.id)
      .order("climbed_on", { ascending: false })
      .limit(50),
    supabase
      .from("route_projects")
      .select("started_at, routes(id, name, grade, crag_slug)")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false }),
    supabase
      .from("saved_crags")
      .select("crag_slug, crags(slug, name, area)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const ticks = ticksRes.data ?? [];
  const projects = projectsRes.data ?? [];
  const saved = savedRes.data ?? [];

  return (
    <main className="flex flex-1 flex-col">
      <DetailHeader />
      <div className="px-4 pb-24 pt-8 md:pl-8 md:pr-4 md:pt-12">
        <h1 className="mb-6 font-serif text-[34px] leading-[1.05] tracking-tight text-ink md:text-[44px]">
          Profil
        </h1>

        <ProfileCard
          userId={user.id}
          email={user.email ?? ""}
          displayName={profile?.display_name ?? ""}
          username={profile?.username ?? ""}
          bio={profile?.bio ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
          tickCount={ticks.length}
          projectCount={projects.length}
          savedCount={saved.length}
        />

        <Section
          title="Siste turer"
          count={ticks.length}
          empty={ticks.length === 0}
          emptyText="Du har ikke logget noen turer ennå. Klikk på en rute på et felt for å logge."
        >
          <ul className="flex flex-col gap-2">
            {ticks.map((t) => {
              const route = single(t.routes);
              if (!route) return null;
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
                      {formatDate(t.climbed_on)}
                      {t.attempts && t.attempts > 1 && ` · ${t.attempts} forsøk`}
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
          emptyText="Ingen aktive prosjekter. Marker en rute som prosjekt for å samle dem her."
        >
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {projects.map((p) => {
              const route = single(p.routes);
              if (!route) return null;
              return (
                <li key={route.id}>
                  <Link
                    href={`/felt/${route.crag_slug}`}
                    className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3"
                  >
                    <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 border-ink">
                      <span className="block h-2.5 w-2.5 rounded-full bg-ink" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">
                      {route.name}
                    </span>
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
          emptyText="Du har ikke lagret noen felt. Trykk hjertet på et felt for å lagre."
        >
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {saved.map((s) => {
              const crag = single(s.crags);
              if (!crag) return null;
              return (
                <li key={crag.slug}>
                  <Link
                    href={`/felt/${crag.slug}`}
                    className="flex flex-col rounded-2xl bg-card px-4 py-3"
                  >
                    <span className="text-[14px] font-medium text-ink">
                      {crag.name}
                    </span>
                    <span className="text-[12px] text-ink-3">{crag.area}</span>
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

function Section({
  title,
  count,
  empty,
  emptyText,
  children,
}: {
  title: string;
  count: number;
  empty: boolean;
  emptyText: string;
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
        <p className="rounded-2xl bg-card px-5 py-6 text-[14px] leading-relaxed text-ink-3">
          {emptyText}
        </p>
      ) : (
        children
      )}
    </section>
  );
}
