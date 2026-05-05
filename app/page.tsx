import { CragCardSmall } from "@/components/cards/CragCardSmall";
import { Section, HScroll } from "@/components/layout/Section";
import { SearchPill } from "@/components/layout/SearchPill";
import {
  cragsBouldering,
  cragsNearby,
  cragsThisWeekend,
} from "@/lib/fixtures/crags";

export default function HomePage() {
  return (
    <main className="flex flex-col flex-1">
      <header className="px-6 pt-8 pb-2">
        <h1 className="font-serif text-[34px] leading-[1.05] tracking-tight text-ink">
          Klatre i Norge
        </h1>
        <p className="mt-1 text-[14px] text-ink-3">Fra Oslo · Sør-Norge</p>
        <SearchPill />
      </header>

      <Section title="Nær deg" sub="Sortert etter avstand">
        <HScroll>
          {cragsNearby.map((crag) => (
            <CragCardSmall key={crag.id} crag={crag} />
          ))}
        </HScroll>
      </Section>

      <Section
        title="Bra vær i helgen"
        sub="Tørt i minst 3 dager · innenfor 3 timer"
      >
        <HScroll>
          {cragsThisWeekend.map((crag) => (
            <CragCardSmall key={crag.id} crag={crag} />
          ))}
        </HScroll>
      </Section>

      {cragsBouldering.length > 0 && (
        <Section title="Buldring i nærheten">
          <HScroll>
            {cragsBouldering.map((crag) => (
              <CragCardSmall key={crag.id} crag={crag} />
            ))}
          </HScroll>
        </Section>
      )}
    </main>
  );
}
