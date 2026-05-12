"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleSavedCrag } from "@/app/actions/logbook";

type Variant = "default" | "overlay";

type Props = {
  cragSlug: string;
  isAuthenticated: boolean;
  isSaved: boolean;
  variant?: Variant;
};

export function SaveCragButton({
  cragSlug,
  isAuthenticated,
  isSaved,
  variant = "default",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const overlay = variant === "overlay";
  const sizeClass = overlay ? "h-11 w-11" : "h-10 w-10";

  const idleClass = overlay
    ? "bg-white text-ink shadow-md ring-1 ring-black/5"
    : "border border-line bg-card text-ink-2 hover:border-ink/30";

  const savedClass = overlay
    ? "bg-white text-rose-500 shadow-md ring-1 ring-black/5"
    : "bg-primary text-primary-ink";

  if (!isAuthenticated) {
    return (
      <Link
        href={`/logg-inn?next=/felt/${cragSlug}`}
        aria-label="Logg inn for å lagre"
        className={`inline-flex flex-none items-center justify-center rounded-full transition ${sizeClass} ${idleClass}`}
      >
        <Heart size={overlay ? 20 : 18} strokeWidth={1.8} />
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
      className={`inline-flex flex-none items-center justify-center rounded-full transition active:scale-95 disabled:opacity-60 ${sizeClass} ${
        isSaved ? savedClass : idleClass
      }`}
    >
      <Heart
        size={overlay ? 20 : 18}
        strokeWidth={1.8}
        fill={isSaved ? "currentColor" : "none"}
      />
    </button>
  );
}
