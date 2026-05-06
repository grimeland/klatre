import Link from "next/link";

export function SearchPill({
  placeholder = "Hvor vil du klatre?",
  href = "/utforsk",
}: {
  placeholder?: string;
  href?: string;
}) {
  return (
    <div className="mt-5 md:mt-8">
      <Link
        href={href}
        className="flex w-full items-center gap-3 rounded-full border border-line bg-card px-5 py-3.5 text-left shadow-sm transition active:scale-[0.99] md:max-w-xl md:py-4 md:text-base"
      >
        <span aria-hidden className="text-base">
          ⌕
        </span>
        <span className="text-[15px] text-ink-2">{placeholder}</span>
      </Link>
      <Link
        href="/utforsk?view=map"
        className="mt-3 inline-flex items-center gap-2 text-[14px] font-medium text-ink-2 transition hover:text-ink"
      >
        <span aria-hidden>🗺</span>
        <span className="underline-offset-4 hover:underline">
          Vis alle felt i kart
        </span>
      </Link>
    </div>
  );
}
