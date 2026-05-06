"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  const pathname = usePathname();
  const hidden =
    pathname?.startsWith("/felt/") || pathname?.startsWith("/utforsk");
  if (hidden) return null;

  return (
    <header className="hidden md:block">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-10 pt-7 pb-2">
        <Link
          href="/"
          aria-label="Felt — forside"
          className="font-serif text-[28px] leading-none text-ink"
        >
          Felt
        </Link>

        <Link
          href="/utforsk"
          className="flex max-w-md flex-1 items-center gap-3 rounded-full border border-line bg-card px-5 py-2.5 shadow-sm transition active:scale-[0.99]"
        >
          <span aria-hidden className="text-base">
            ⌕
          </span>
          <span className="text-[14px] text-ink-2">Hvor vil du klatre?</span>
        </Link>

        <nav className="flex items-center gap-6 text-[14px]">
          <Link
            href="/lagret"
            className={
              pathname === "/lagret"
                ? "font-medium text-ink"
                : "text-ink-2 hover:text-ink"
            }
          >
            Lagret
          </Link>
          <Link
            href="/profil"
            className="rounded-full border border-line bg-card px-4 py-2 font-medium text-ink"
          >
            Logg inn
          </Link>
        </nav>
      </div>
    </header>
  );
}
