export function SearchPill({
  placeholder = "Hvor vil du klatre?",
}: {
  placeholder?: string;
}) {
  return (
    <button
      type="button"
      className="mt-5 flex w-full items-center gap-3 rounded-full border border-line bg-card px-5 py-3.5 text-left shadow-sm transition active:scale-[0.99]"
    >
      <span aria-hidden className="text-base">
        ⌕
      </span>
      <span className="text-[15px] text-ink-2">{placeholder}</span>
    </button>
  );
}
