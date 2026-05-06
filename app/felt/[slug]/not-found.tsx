import Link from "next/link";

export default function CragNotFound() {
  return (
    <main className="flex flex-1 flex-col items-start px-6 pt-20 md:px-10 md:pt-32">
      <p className="text-[12px] font-semibold tracking-wide text-ink-3">
        Felt finnes ikke
      </p>
      <h1 className="mt-2 max-w-md font-serif text-[34px] leading-[1.05] tracking-tight text-ink md:text-[48px]">
        Vi fant ikke dette feltet
      </h1>
      <p className="mt-3 max-w-md text-[15px] text-ink-2">
        Lenken kan være gammel eller feil — feltet finnes ikke i Felt ennå. Sjekk om navnet er riktig, eller utforsk andre felt i nærheten.
      </p>
      <Link
        href="/utforsk"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-ink"
      >
        Se alle felt
      </Link>
    </main>
  );
}
