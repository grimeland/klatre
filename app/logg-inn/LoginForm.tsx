"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { requestMagicLink } from "./actions";

type Status =
  | { kind: "idle" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    startTransition(async () => {
      const result = await requestMagicLink(email, code, next);
      if (result.ok) {
        setStatus({ kind: "sent", email: email.trim() });
      } else {
        setStatus({ kind: "error", message: result.error });
      }
    });
  }

  if (status.kind === "sent") {
    return (
      <div className="mt-8 rounded-3xl border border-line bg-card p-6">
        <p className="font-serif text-[22px] text-ink">Sjekk e-posten</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
          Vi sendte en lenke til{" "}
          <span className="text-ink">{status.email}</span>. Klikk på den for å
          logge inn. Du kan lukke denne fanen.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-4 text-[14px] text-ink-2 underline underline-offset-4 hover:text-ink"
        >
          Bruk en annen e-post
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
      <label htmlFor="email" className="text-[13px] font-medium text-ink-2">
        E-post
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="din@epost.no"
        className="rounded-2xl border border-line bg-card px-5 py-3.5 text-[16px] text-ink outline-none focus:border-ink"
      />

      <label
        htmlFor="invite-code"
        className="mt-2 text-[13px] font-medium text-ink-2"
      >
        Invite-kode
      </label>
      <input
        id="invite-code"
        type="text"
        required
        autoComplete="off"
        autoCapitalize="off"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Spør Erlend"
        className="rounded-2xl border border-line bg-card px-5 py-3.5 text-[16px] text-ink outline-none focus:border-ink"
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-ink transition-opacity disabled:opacity-60"
      >
        {pending ? "Sender lenke…" : "Send meg en lenke"}
      </button>
      {status.kind === "error" && (
        <p className="text-[14px] text-rain">{status.message}</p>
      )}
      <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
        Felt er foreløpig invite-only. Når du er innlogget forblir du innlogget
        på denne enheten.
      </p>
    </form>
  );
}
