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
    <section className="pt-7 pb-2 md:pt-12">
      <h2 className="px-6 font-serif text-[22px] leading-tight tracking-tight text-ink md:text-[28px]">
        {title}
      </h2>
      {sub ? (
        <p className="mt-0.5 px-6 text-[13px] text-ink-3 md:text-[14px]">
          {sub}
        </p>
      ) : null}
      <div className="mt-3.5 md:mt-5">{children}</div>
    </section>
  );
}

export function CragRow({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        no-scrollbar flex gap-3 overflow-x-auto px-6 pb-1
        [-webkit-overflow-scrolling:touch] [scroll-snap-type:x_mandatory]
        [&>*]:[scroll-snap-align:start]
        md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:[scroll-snap-type:none]
        lg:grid-cols-4
        xl:grid-cols-5
      "
    >
      {children}
    </div>
  );
}
