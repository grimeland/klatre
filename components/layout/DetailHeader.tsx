"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "./SiteHeader";

export function DetailHeader() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <SiteHeader
      query={query}
      onQueryChange={setQuery}
      onSubmitQuery={() => {
        const trimmed = query.trim();
        const dest = trimmed
          ? `/?q=${encodeURIComponent(trimmed)}`
          : "/";
        router.push(dest);
      }}
      onOpenFilters={() => router.push("/?openFilters=1")}
    />
  );
}
