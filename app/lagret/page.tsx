import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DetailHeader } from "@/components/layout/DetailHeader";

export const dynamic = "force-dynamic";

function single<T>(rel: T | T[] | null | undefined): T | null {
  if (rel == null) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

export default async function LagretPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex flex-1 flex-col">
        <DetailHeader />
        <div className="px-4 pb-24 pt-8 md:pl-8 md:pr-4 md:pt-12">
          <h1 className="font-serif text-[34px] leading-[1.05] tracking-tight text-ink md:text-[44px]">
            Lagret
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-2 md:text-[16px]">
            Logg inn for å samle felt du vil besøke og ruter du jobber mot å
            sende.
          </p>
          <Link
            href="/logg-inn?next=/lagret"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-ink"
          >
            Logg inn
          </Link>
        </div>
      </main>
    );
  }

  const [savedRes, projectsRes] = await Promise.all([
    supabase
      .from("saved_crags")
      .select("crag_slug, crags(slug, name, area)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("route_projects")
      .select(
        "started_at, routes(id, name, grade, crag_slug, sector)",
      )
      .eq("user_id", user.id)
      .order("started_at", { ascending: false }),
  ]);

  const saved = savedRes.data ?? [];
  const projects = projectsRes.data ?? [];

  // Group projects by crag for cleaner display
  const projectsByCrag = new Map<
    string,
    { name: string; grade: string; sector: string | null; id: string }[]
  >();
  for (const p of projects) {
    const route = single(p.routes);
    if (!route) continue;
    const arr = projectsByCrag.get(route.crag_slug) ?? [];
    arr.push({
      id: route.id,
      name: route.name,
      grade: route.grade,
      sector: route.sector ?? null,
    });
    projectsByCrag.set(route.crag_slug, arr);
  }

  const empty = saved.length === 0 && projects.length === 0;

  return (
    <main className="flex flex-1 flex-col">
      <DetailHeader />
      <div className="px-4 pb-24 pt-8 md:pl-8 md:pr-4 md:pt-12">
        <h1 className="font-serif text-[34px] leading-[1.05] tracking-tight text-ink md:text-[44px]">
          Lagret
        </h1>

        {empty && (
          <p className="mt-6 rounded-2xl bg-card px-5 py-6 text-[14px] leading-relaxed text-ink-3">
            Du har ikke lagret noe ennå. Trykk hjertet på et felt for å legge
            det til, eller marker en rute som prosjekt fra rute-listen.
          </p>
        )}

        {saved.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-serif text-[22px] leading-tight tracking-tight text-ink md:text-[26px]">
              Felt
              <span className="ml-2 text-[16px] text-ink-3">{saved.length}</span>
            </h2>
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {saved.map((s) => {
                const crag = single(s.crags);
                if (!crag) return null;
                return (
                  <li key={crag.slug}>
                    <Link
                      href={`/felt/${crag.slug}`}
                      className="flex flex-col rounded-2xl bg-card px-4 py-3 transition hover:bg-card/80"
                    >
                      <span className="text-[15px] font-medium text-ink">
                        {crag.name}
                      </span>
                      <span className="mt-0.5 text-[12px] text-ink-3">
                        {crag.area}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {projects.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 font-serif text-[22px] leading-tight tracking-tight text-ink md:text-[26px]">
              Prosjekter
              <span className="ml-2 text-[16px] text-ink-3">
                {projects.length}
              </span>
            </h2>
            <div className="flex flex-col gap-4">
              {Array.from(projectsByCrag.entries()).map(([slug, routes]) => (
                <div key={slug} className="rounded-2xl bg-card p-4">
                  <Link
                    href={`/felt/${slug}`}
                    className="mb-2 inline-block text-[13px] font-medium text-ink-2 hover:text-ink"
                  >
                    {slug.replace(/-/g, " ")} →
                  </Link>
                  <ul className="flex flex-col gap-1.5">
                    {routes.map((r) => (
                      <li
                        key={r.id}
                        className="flex items-center gap-3"
                      >
                        <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-ink">
                          <span className="block h-1.5 w-1.5 rounded-full bg-ink" />
                        </span>
                        <span className="min-w-0 flex-1 text-[14px] text-ink">
                          {r.name}
                          {r.sector && (
                            <span className="ml-2 text-[12px] text-ink-3">
                              {r.sector}
                            </span>
                          )}
                        </span>
                        <span className="font-mono flex-none rounded-lg bg-bg px-2 py-1 text-[11px] font-bold text-ink">
                          {r.grade}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
