"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useCurrentUser } from "@/lib/auth/useCurrentUser";

function initialsFrom(name: string | null | undefined, email: string): string {
  const source = (name ?? email).trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const state = useCurrentUser();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (state.kind === "loading") {
    return (
      <div className="hidden h-9 w-9 flex-shrink-0 rounded-full bg-line md:block" />
    );
  }

  if (state.kind === "anonymous") {
    return (
      <Link
        href="/logg-inn"
        className="hidden flex-shrink-0 rounded-full border border-line bg-card px-4 py-2 text-[13px] font-medium text-ink md:inline-flex"
      >
        Logg inn
      </Link>
    );
  }

  const { user, profile } = state;
  const label = profile?.display_name || user.email || "Profil";
  const initials = initialsFrom(profile?.display_name, user.email ?? "");

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    router.push("/");
  }

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-ink"
        title={label}
      >
        {initials}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-card shadow-lg"
        >
          <div className="px-4 pb-3 pt-4">
            <p className="truncate text-[14px] font-medium text-ink">
              {label}
            </p>
            {profile?.username && (
              <p className="truncate text-[12px] text-ink-3">
                @{profile.username}
              </p>
            )}
          </div>
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-[14px] text-ink hover:bg-line/30"
          >
            Profil
          </Link>
          <Link
            href="/lagret"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-[14px] text-ink hover:bg-line/30"
          >
            Lagret
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2.5 text-left text-[14px] text-ink-2 hover:bg-line/30"
          >
            Logg ut
          </button>
        </div>
      )}
    </div>
  );
}
