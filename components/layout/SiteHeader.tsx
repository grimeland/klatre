"use client";

import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { UserMenu } from "./UserMenu";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmitQuery?: () => void;
  onOpenFilters?: () => void;
  filterBadge?: number;
};

export function SiteHeader({
  query,
  onQueryChange,
  onSubmitQuery,
  onOpenFilters,
  filterBadge = 0,
}: Props) {
  return (
    <header className="flex-shrink-0 border-b border-line/40 bg-bg/95 px-4 py-3 backdrop-blur md:py-4 md:pl-8 md:pr-4">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <Link
          href="/"
          aria-label="Felt — forside"
          className="flex-shrink-0"
        >
          <Image
            src="/images/Felt_logo_v3.svg"
            alt="Felt"
            width={223}
            height={77}
            priority
            className="h-6 w-auto md:h-7"
          />
        </Link>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitQuery?.();
          }}
          className="mx-auto flex w-full max-w-md items-center gap-2"
        >
          <label
            htmlFor="felt-search"
            className="flex flex-1 items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 shadow-sm focus-within:border-ink"
          >
            <span aria-hidden className="text-[15px] leading-none text-ink-2">
              🔍
            </span>
            <input
              id="felt-search"
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Søk i felt"
              className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
            />
          </label>

          <button
            type="button"
            onClick={onOpenFilters}
            aria-label="Filtre"
            className="relative flex flex-shrink-0 items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-[13px] font-medium text-ink-2 hover:border-ink md:px-4"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden md:inline">Filtre</span>
            {filterBadge > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[10px] font-bold text-white">
                {filterBadge}
              </span>
            )}
          </button>
        </form>

        <UserMenu />
      </div>
    </header>
  );
}
