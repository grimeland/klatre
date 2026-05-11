"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type Profile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export type CurrentUser = {
  user: User;
  profile: Profile | null;
};

type State =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "signed-in"; user: User; profile: Profile | null };

export function useCurrentUser(): State {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    async function loadProfile(user: User) {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setState({ kind: "signed-in", user, profile: data });
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session?.user) {
        loadProfile(data.session.user);
      } else {
        setState({ kind: "anonymous" });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        loadProfile(session.user);
      } else {
        setState({ kind: "anonymous" });
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
