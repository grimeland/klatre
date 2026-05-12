"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type SendStyle = Database["public"]["Enums"]["send_style"];

type Result = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}

export async function addTick(input: {
  routeId: string;
  climbedOn: string; // YYYY-MM-DD
  sendStyle: SendStyle;
  attempts?: number | null;
  comment?: string | null;
  cragSlug: string;
}): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Du må være logget inn." };

  const { error } = await ctx.supabase.from("route_ticks").insert({
    user_id: ctx.user.id,
    route_id: input.routeId,
    climbed_on: input.climbedOn,
    send_style: input.sendStyle,
    attempts: input.attempts ?? null,
    comment: input.comment?.trim() || null,
  });

  if (error) return { ok: false, error: error.message };

  // When you tick a route you typically stop projecting it.
  await ctx.supabase
    .from("route_projects")
    .delete()
    .eq("user_id", ctx.user.id)
    .eq("route_id", input.routeId);

  revalidatePath(`/felt/${input.cragSlug}`);
  revalidatePath("/profil");
  revalidatePath("/lagret");
  return { ok: true };
}

export async function deleteTick(input: {
  tickId: string;
  cragSlug: string;
}): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Du må være logget inn." };

  const { error } = await ctx.supabase
    .from("route_ticks")
    .delete()
    .eq("id", input.tickId)
    .eq("user_id", ctx.user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/felt/${input.cragSlug}`);
  revalidatePath("/profil");
  return { ok: true };
}

export async function toggleProject(input: {
  routeId: string;
  cragSlug: string;
}): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Du må være logget inn." };

  const { data: existing } = await ctx.supabase
    .from("route_projects")
    .select("route_id")
    .eq("user_id", ctx.user.id)
    .eq("route_id", input.routeId)
    .maybeSingle();

  if (existing) {
    const { error } = await ctx.supabase
      .from("route_projects")
      .delete()
      .eq("user_id", ctx.user.id)
      .eq("route_id", input.routeId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await ctx.supabase
      .from("route_projects")
      .insert({ user_id: ctx.user.id, route_id: input.routeId });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/felt/${input.cragSlug}`);
  revalidatePath("/lagret");
  return { ok: true };
}

export async function toggleSavedCrag(cragSlug: string): Promise<Result> {
  const ctx = await requireUser();
  if (!ctx) return { ok: false, error: "Du må være logget inn." };

  const { data: existing } = await ctx.supabase
    .from("saved_crags")
    .select("crag_slug")
    .eq("user_id", ctx.user.id)
    .eq("crag_slug", cragSlug)
    .maybeSingle();

  if (existing) {
    const { error } = await ctx.supabase
      .from("saved_crags")
      .delete()
      .eq("user_id", ctx.user.id)
      .eq("crag_slug", cragSlug);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await ctx.supabase
      .from("saved_crags")
      .insert({ user_id: ctx.user.id, crag_slug: cragSlug });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/felt/${cragSlug}`);
  revalidatePath("/lagret");
  return { ok: true };
}
