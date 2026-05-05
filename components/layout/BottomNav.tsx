import Link from "next/link";

type Item = { href: string; label: string; icon: string };

const items: Item[] = [
  { href: "/", label: "Utforsk", icon: "⌂" },
  { href: "/lagret", label: "Lagret", icon: "♡" },
  { href: "/profil", label: "Profil", icon: "○" },
];

export function BottomNav({ active = "/" }: { active?: string }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-around bg-bg pt-2.5"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.875rem)" }}
    >
      {items.map((item) => {
        const isActive = active === item.href;
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
