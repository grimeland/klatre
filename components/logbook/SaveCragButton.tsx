"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSavedCrag } from "@/app/actions/logbook";

export function SaveCragButton({
  cragSlug,
  isAuthenticated,
  isSaved,
}: {
  cragSlug: string;
  isAuthenticated: boolean;
  isSaved: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Link
        href={`/logg-inn?next=/felt/${cragSlug}`}
        aria-label="Logg inn for å lagre"
        className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border border-line bg-card text-ink-2 transition hover:border-ink/30"
      >
        <HeartIcon filled={false} />
      </Link>
    );
  }

  function handleClick() {
    if (pending) return;
    startTransition(async () => {
      const result = await toggleSavedCrag(cragSlug);
      if (result.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Fjern fra lagret" : "Lagre felt"}
      className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-full transition disabled:opacity-60 ${
        isSaved
          ? "bg-primary text-primary-ink"
          : "border border-line bg-card text-ink-2 hover:border-ink/30"
      }`}
    >
      <HeartIcon filled={isSaved} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
