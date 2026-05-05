"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

const items: Item[] = [
  { href: "/", label: "Utforsk", icon: "⌂" },
  { href: "/lagret", label: "Lagret", icon: "♡" },
  { href: "/profil", label: "Profil", icon: "○" },
];

export function BottomNav() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith("/felt/");
  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-around bg-bg pt-2.5 md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.875rem)" }}
    >
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${
              isActive ? "text-ink" : "text-ink-3"
            }`}
          >
            <span aria-hidden className="text-lg leading-none">
              {item.icon}
            </span>
            <span className="text-[11px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
