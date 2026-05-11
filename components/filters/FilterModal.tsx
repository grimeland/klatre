"use client";

import { useEffect } from "react";
import type { ClimbingType, Exposure, RockType } from "@/types/crag";
import {
  DEFAULT_FILTERS,
  type Conditions,
  type Feature,
  type FilterState,
  isFilterActive,
} from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (next: FilterState) => void;
  visibleCount: number;
};

const RECOMMENDED: {
  id: string;
  label: string;
  emoji: string;
  apply: (f: FilterState) => FilterState;
  isOn: (f: FilterState) => boolean;
}[] = [
  {
    id: "dry-now",
    label: "Tørt nå",
    emoji: "☀",
    apply: (f) => ({
      ...f,
      conditions: f.conditions === "dry-now" ? "any" : "dry-now",
    }),
    isOn: (f) => f.conditions === "dry-now",
  },
  {
    id: "easy-approach",
    label: "Lett innsteg",
    emoji: "🥾",
    apply: (f) => toggleFeature(f, "easy-approach"),
    isOn: (f) => f.features.has("easy-approach"),
  },
  {
    id: "family",
    label: "Familievennlig",
    emoji: "👨‍👩‍👧",
    apply: (f) => toggleFeature(f, "family-friendly"),
    isOn: (f) => f.features.has("family-friendly"),
  },
  {
    id: "south",
    label: "Sør-vendt",
    emoji: "🌅",
    apply: (f) => toggleExposure(f, "S"),
    isOn: (f) => f.exposure.has("S"),
  },
];

const CLIMBING_TYPES: { id: ClimbingType; label: string }[] = [
  { id: "sport", label: "Sport" },
  { id: "trad", label: "Trad" },
  { id: "buldring", label: "Buldring" },
  { id: "multipitch", label: "Multipitch" },
  { id: "is", label: "Is" },
  { id: "alpin", label: "Alpin" },
];

const CONDITIONS: { id: Conditions; label: string }[] = [
  { id: "dry-now", label: "Tørt nå" },
  { id: "dry-3", label: "Tørt i 3+ dager" },
  { id: "dry-week", label: "Tørt i minst en uke" },
];

const EXPOSURES: { id: Exposure; label: string }[] = [
  { id: "S", label: "Sør" },
  { id: "V", label: "Vest" },
  { id: "Ø", label: "Øst" },
  { id: "N", label: "Nord" },
];

const ROCK_TYPES: { id: RockType; label: string }[] = [
  { id: "Granitt", label: "Granitt" },
  { id: "Gneis", label: "Gneis" },
  { id: "Sandstein", label: "Sandstein" },
  { id: "Kalkstein", label: "Kalkstein" },
  { id: "Konglomerat", label: "Konglomerat" },
];

const FEATURES: { id: Feature; label: string }[] = [
  { id: "easy-approach", label: "Innsteg under 15 min" },
  { id: "family-friendly", label: "Familievennlig" },
  { id: "parking-at-crag", label: "Parkering ved feltet" },
  { id: "bolt", label: "Boltede ruter" },
  { id: "mobile-coverage", label: "Mobildekning" },
];

const DRIVE_PRESETS = [
  { v: 60, label: "1 time" },
  { v: 120, label: "2 timer" },
  { v: 240, label: "4 timer" },
  { v: 480, label: "Alle" },
];

export function FilterModal({
  open,
  onClose,
  filters,
  onChange,
  visibleCount,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function toggleClimbing(t: ClimbingType) {
    onChange({
      ...filters,
      climbingTypes: toggleSet(filters.climbingTypes, t),
    });
  }

  function setConditions(c: Conditions) {
    onChange({
      ...filters,
      conditions: filters.conditions === c ? "any" : c,
    });
  }

  function toggleExp(e: Exposure) {
    onChange({ ...filters, exposure: toggleSet(filters.exposure, e) });
  }

  function toggleRock(r: RockType) {
    onChange({ ...filters, rockType: toggleSet(filters.rockType, r) });
  }

  function toggleFeat(f: Feature) {
    onChange({ ...filters, features: toggleSet(filters.features, f) });
  }

  function setDrive(v: number) {
    onChange({ ...filters, maxDriveMinutes: v });
  }

  function clearAll() {
    onChange({ ...DEFAULT_FILTERS });
  }

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-black/40 md:items-center"
      style={{ zIndex: 2000 }}
      onClick={onClose}
    >
      <div
        className="flex h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:h-[88vh] md:max-h-[760px] md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative flex flex-shrink-0 items-center justify-center px-5 pb-3 pt-5">
          <h2 className="text-[16px] font-semibold text-ink">Filtre</h2>
          <button
            type="button"
            aria-label="Lukk"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-zinc-100"
          >
            <span aria-hidden className="text-[18px] leading-none">✕</span>
          </button>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-6">
          <Section title="Anbefalt for deg">
            <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
              {RECOMMENDED.map((r) => {
                const on = r.isOn(filters);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onChange(r.apply(filters))}
                    className={`flex flex-shrink-0 w-[120px] flex-col items-center gap-2 rounded-2xl border bg-card px-3 py-4 text-center transition ${
                      on
                        ? "border-ink border-2 -m-px"
                        : "border-line"
                    }`}
                  >
                    <span aria-hidden className="text-[26px] leading-none">{r.emoji}</span>
                    <span className="text-[12px] leading-tight text-ink">
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Type klatring">
            <ChipGrid>
              {CLIMBING_TYPES.map((t) => (
                <Chip
                  key={t.id}
                  label={t.label}
                  on={filters.climbingTypes.has(t.id)}
                  onClick={() => toggleClimbing(t.id)}
                />
              ))}
            </ChipGrid>
          </Section>

          <Section title="Maks reisetid">
            <ChipGrid>
              {DRIVE_PRESETS.map((p) => (
                <Chip
                  key={p.v}
                  label={p.label}
                  on={filters.maxDriveMinutes === p.v}
                  onClick={() => setDrive(p.v)}
                />
              ))}
            </ChipGrid>
          </Section>

          <Section title="Forhold">
            <ChipGrid>
              {CONDITIONS.map((c) => (
                <Chip
                  key={c.id}
                  label={c.label}
                  on={filters.conditions === c.id}
                  onClick={() => setConditions(c.id)}
                />
              ))}
            </ChipGrid>
          </Section>

          <Section title="Eksposisjon">
            <ChipGrid>
              {EXPOSURES.map((e) => (
                <Chip
                  key={e.id}
                  label={e.label}
                  on={filters.exposure.has(e.id)}
                  onClick={() => toggleExp(e.id)}
                />
              ))}
            </ChipGrid>
          </Section>

          <Section title="Bergart">
            <ChipGrid>
              {ROCK_TYPES.map((r) => (
                <Chip
                  key={r.id}
                  label={r.label}
                  on={filters.rockType.has(r.id)}
                  onClick={() => toggleRock(r.id)}
                />
              ))}
            </ChipGrid>
          </Section>

          <Section title="Mer">
            <ChipGrid>
              {FEATURES.map((f) => (
                <Chip
                  key={f.id}
                  label={f.label}
                  on={filters.features.has(f.id)}
                  onClick={() => toggleFeat(f.id)}
                />
              ))}
            </ChipGrid>
          </Section>
        </div>

        <footer className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-line/40 px-5 py-4">
          <button
            type="button"
            onClick={clearAll}
            className="text-[14px] font-semibold text-ink underline-offset-4 hover:underline disabled:cursor-default disabled:text-ink-3 disabled:no-underline"
            disabled={!isFilterActive(filters)}
          >
            Tøm alle
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-white"
          >
            Vis {visibleCount} {visibleCount === 1 ? "felt" : "felt"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-5 first:pt-2">
      <h3 className="mb-3 text-[15px] font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}

function ChipGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function Chip({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${
        on
          ? "border-ink bg-ink text-white"
          : "border-line bg-card text-ink-2 hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}

function toggleSet<T>(s: Set<T>, v: T): Set<T> {
  const n = new Set(s);
  if (n.has(v)) n.delete(v);
  else n.add(v);
  return n;
}

function toggleFeature(f: FilterState, feat: Feature): FilterState {
  return { ...f, features: toggleSet(f.features, feat) };
}

function toggleExposure(f: FilterState, e: Exposure): FilterState {
  return { ...f, exposure: toggleSet(f.exposure, e) };
}
