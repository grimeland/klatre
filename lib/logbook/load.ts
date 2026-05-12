import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SendStyle } from "@/app/actions/logbook";

export type RouteTick = {
  id: string;
  routeId: string;
  climbedOn: string;
  sendStyle: SendStyle;
  attempts: number | null;
  comment: string | null;
};

export type LogbookForCrag = {
  isAuthenticated: boolean;
  savedCrag: boolean;
  tickedRouteIds: Set<string>;
  projectRouteIds: Set<string>;
  ticksByRoute: Map<string, RouteTick[]>;
};

export async function loadLogbookForCrag(
  cragSlug: string,
  routeIds: string[],
): Promise<LogbookForCrag> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty: LogbookForCrag = {
    isAuthenticated: !!user,
    savedCrag: false,
    tickedRouteIds: new Set(),
    projectRouteIds: new Set(),
    ticksByRoute: new Map(),
  };

  if (!user) return empty;

  const [ticksRes, projectsRes, savedRes] = await Promise.all([
    routeIds.length > 0
      ? supabase
          .from("route_ticks")
          .select("id, route_id, climbed_on, send_style, attempts, comment")
          .eq("user_id", user.id)
          .in("route_id", routeIds)
          .order("climbed_on", { ascending: false })
      : Promise.resolve({ data: [] as never[] }),
    routeIds.length > 0
      ? supabase
          .from("route_projects")
          .select("route_id")
          .eq("user_id", user.id)
          .in("route_id", routeIds)
      : Promise.resolve({ data: [] as never[] }),
    supabase
      .from("saved_crags")
      .select("crag_slug")
      .eq("user_id", user.id)
      .eq("crag_slug", cragSlug)
      .maybeSingle(),
  ]);

  const ticksByRoute = new Map<string, RouteTick[]>();
  const tickedRouteIds = new Set<string>();
  for (const t of ticksRes.data ?? []) {
    const tick: RouteTick = {
      id: t.id,
      routeId: t.route_id,
      climbedOn: t.climbed_on,
      sendStyle: t.send_style,
      attempts: t.attempts,
      comment: t.comment,
    };
    const arr = ticksByRoute.get(t.route_id) ?? [];
    arr.push(tick);
    ticksByRoute.set(t.route_id, arr);
    tickedRouteIds.add(t.route_id);
  }

  const projectRouteIds = new Set(
    (projectsRes.data ?? []).map((p) => p.route_id),
  );

  return {
    isAuthenticated: true,
    savedCrag: !!savedRes.data,
    tickedRouteIds,
    projectRouteIds,
    ticksByRoute,
  };
}
