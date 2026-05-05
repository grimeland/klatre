import { CragCardSmall } from "@/components/cards/CragCardSmall";
import { Section, CragRow } from "@/components/layout/Section";
import { SearchPill } from "@/components/layout/SearchPill";
import {
  cragsBouldering,
  cragsNearby,
  cragsThisWeekend,
} from "@/lib/fixtures/crags";

export default function HomePage() {
  return (
    <main className="flex flex-col flex-1">
      <header className="px-6 pt-8 pb-2 md:pt-16 md:pb-4">
        <div className="md:max-w-2xl">
          <h1 className="font-serif text-[34px] leading-[1.05] tracking-tight text-ink md:text-[56px]">
            Klatre i Norge
          </h1>
          <p className="mt-1 text-[14px] text-ink-3 md:mt-3 md:text-[16px]">
            Fra Oslo · Sør-Norge
          </p>
          <SearchPill />
        </div>
      </header>

      <Section title="Nær deg" sub="Sortert etter avstand">
        <CragRow>
          {cragsNearby.map((crag) => (
            <CragCardSmall key={crag.id} crag={crag} />
          ))}
        </CragRow>
      </Section>

      <Section
        title="Bra vær i helgen"
        sub="Tørt i minst 3 dager · innenfor 3 timer"
      >
        <CragRow>
          {cragsThisWeekend.map((crag) => (
            <CragCardSmall key={crag.id} crag={crag} />
          ))}
        </CragRow>
      </Section>

      {cragsBouldering.length > 0 && (
        <Section title="Buldring i nærheten">
          <CragRow>
            {cragsBouldering.map((crag) => (
              <CragCardSmall key={crag.id} crag={crag} />
            ))}
          </CragRow>
        </Section>
      )}
    </main>
  );
}
