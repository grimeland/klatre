import type { Dryness } from "@/types/crag";
import { formatDryness } from "@/lib/utils/format";

export function DrynessBadge({ dryness }: { dryness: Dryness }) {
  const formatted = formatDryness(dryness);
  if (!formatted) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink">
      <span aria-hidden>{formatted.icon}</span>
      <span>{formatted.text}</span>
    </span>
  );
}
