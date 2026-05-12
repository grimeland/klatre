"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: {
  displayName: string;
  username: string | null;
  bio: string | null;
}): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Du må være logget inn." };

  const displayName = input.displayName.trim();
  if (!displayName) return { ok: false, error: "Navn kan ikke være tomt." };

  let username: string | null = null;
  if (input.username) {
    const cleaned = input.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(cleaned)) {
      return {
        ok: false,
        error:
          "Brukernavn må være 3–20 tegn, bare bokstaver, tall og understrek.",
      };
    }
    username = cleaned;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      username,
      bio: input.bio?.trim() || null,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Brukernavnet er allerede tatt." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/profil");
  return { ok: true };
}
