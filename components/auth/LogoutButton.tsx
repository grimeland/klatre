"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (pending) return;
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push("/");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={
        className ??
        "rounded-full border border-line bg-card px-4 py-2 text-[13px] font-medium text-ink-2 transition hover:border-ink/30 disabled:opacity-60"
      }
    >
      {pending ? "Logger ut…" : "Logg ut"}
    </button>
  );
}
