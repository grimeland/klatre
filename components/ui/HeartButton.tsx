"use client";

import { useState } from "react";

export function HeartButton({ initial = false }: { initial?: boolean }) {
  const [saved, setSaved] = useState(initial);
  return (
    <button
      type="button"
      aria-label={saved ? "Fjern fra lagret" : "Lagre"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((s) => !s);
      }}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/25 text-white text-sm transition-transform active:scale-90"
    >
      <span aria-hidden>{saved ? "♥" : "♡"}</span>
    </button>
  );
}
