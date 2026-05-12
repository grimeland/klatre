type Bucket = { label: string; count: number };

export function GradeChart({ buckets }: { buckets: Bucket[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="rounded-2xl bg-card p-5">
      <p className="mb-4 text-[13px] font-medium text-ink-2">
        Ruter per grad
      </p>
      <div className="flex items-end gap-3 md:gap-5">
        {buckets.map((b) => {
          const heightPct = (b.count / max) * 100;
          return (
            <div
              key={b.label}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="font-mono text-[11px] text-ink-2">
                {b.count > 0 ? b.count : ""}
              </span>
              <div className="flex h-24 w-full items-end md:h-28">
                <div
                  className="w-full rounded-t-md bg-primary/85"
                  style={{
                    height: `${Math.max(heightPct, b.count > 0 ? 4 : 0)}%`,
                  }}
                />
              </div>
              <span className="font-mono text-[12px] font-semibold text-ink">
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
