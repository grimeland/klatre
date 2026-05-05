export default function HomePage() {
  return (
    <main className="flex flex-col flex-1">
      <div className="px-6 pt-6 pb-2">
        <h1 className="font-serif text-[34px] leading-[1.05] tracking-tight">
          Klatre i Norge
        </h1>
        <p className="text-ink-3 text-sm mt-1">Fra Oslo · Sør-Norge</p>

        <button
          type="button"
          className="mt-5 flex w-full items-center gap-3 rounded-full border border-line bg-card px-5 py-3.5 text-left shadow-sm"
        >
          <span aria-hidden>⌕</span>
          <span className="text-ink-2 text-[15px]">Hvor vil du klatre?</span>
        </button>
      </div>

      <Section title="Nær deg" sub="Sortert etter avstand">
        <Placeholder />
      </Section>

      <Section title="Bra vær i helgen" sub="Lørdag–søndag · innenfor 3 timer">
        <Placeholder />
      </Section>

      <div className="h-24" />
    </main>
  );
}

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-7 pb-2">
      <h2 className="font-serif text-[22px] tracking-tight px-6">{title}</h2>
      {sub ? <p className="text-ink-3 text-[13px] px-6 mt-0.5">{sub}</p> : null}
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function Placeholder() {
  return (
    <div className="flex gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex-none w-[220px] rounded-2xl bg-card overflow-hidden"
        >
          <div className="h-[150px] bg-gradient-to-b from-zinc-300 to-zinc-500" />
          <div className="p-3.5">
            <div className="h-3 w-24 rounded bg-line" />
            <div className="h-2 w-32 rounded bg-line mt-2 opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
}
