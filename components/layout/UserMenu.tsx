"use client";

import Link from "next/link";
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

  return (
    <Link
      href="/profil"
      aria-label={`Profil (${label})`}
      title={label}
      className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-ink md:flex"
    >
      {initials}
    </Link>
  );
}
