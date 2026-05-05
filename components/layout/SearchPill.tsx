import Link from "next/link";

export function SearchPill({
  placeholder = "Hvor vil du klatre?",
  href = "/utforsk",
}: {
  placeholder?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="mt-5 flex w-full items-center gap-3 rounded-full border border-line bg-card px-5 py-3.5 text-left shadow-sm transition active:scale-[0.99] md:mt-8 md:max-w-xl md:py-4 md:text-base"
    >
      <span aria-hidden className="text-base">
        ⌕
      </span>
      <span className="text-[15px] text-ink-2">{placeholder}</span>
    </Link>
  );
}
