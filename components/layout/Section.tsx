import type { ReactNode } from "react";

export function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="pt-7 pb-2">
      <h2 className="px-6 font-serif text-[22px] leading-tight tracking-tight text-ink">
        {title}
      </h2>
      {sub ? (
        <p className="mt-0.5 px-6 text-[13px] text-ink-3">{sub}</p>
      ) : null}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

export function HScroll({ children }: { children: ReactNode }) {
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto px-6 pb-1 [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch] [&>*]:[scroll-snap-align:start]">
      {children}
    </div>
  );
}
