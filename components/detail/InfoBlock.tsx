import type { ReactNode } from "react";

export function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-[12px] font-semibold tracking-wide text-ink-3 md:text-[13px]">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function InfoLine({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-3 py-1 text-[14px] text-ink-2 md:text-[15px]">
      <span className="w-24 flex-none text-ink-3">{label}</span>
      <span>{value}</span>
    </div>
  );
}
