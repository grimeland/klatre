"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestEmailOtp, verifyEmailOtp } from "./actions";

type Step =
  | { kind: "email" }
  | { kind: "code"; email: string };

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const urlError = params.get("error");
  const router = useRouter();

  const [step, setStep] = useState<Step>({ kind: "email" });
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(urlError);
  const [pending, startTransition] = useTransition();

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    startTransition(async () => {
      setError(null);
      const result = await requestEmailOtp(email, inviteCode);
      if (result.ok) {
        setStep({ kind: "code", email: email.trim().toLowerCase() });
      } else {
        setError(result.error);
      }
    });
  }

  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (pending || step.kind !== "code") return;
    startTransition(async () => {
      setError(null);
      const result = await verifyEmailOtp(step.email, otpCode);
      if (result.ok) {
        router.refresh();
        router.push(next);
      } else {
        setError(result.error);
      }
    });
  }

  if (step.kind === "code") {
    return (
      <form onSubmit={handleVerifyCode} className="mt-8 flex flex-col gap-3">
        <div className="rounded-3xl border border-line bg-card p-5">
          <p className="font-serif text-[20px] text-ink">Sjekk e-posten</p>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-2">
            Vi sendte en 6-sifret kode til{" "}
            <span className="text-ink">{step.email}</span>. Skriv den inn under.
          </p>
        </div>

        <label
          htmlFor="otp"
          className="mt-3 text-[13px] font-medium text-ink-2"
        >
          Kode fra e-post
        </label>
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          required
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="rounded-2xl border border-line bg-card px-5 py-4 font-mono text-[22px] tracking-[10px] text-ink outline-none focus:border-ink"
        />

        <button
          type="submit"
          disabled={pending || otpCode.length !== 6}
          className="mt-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-ink transition-opacity disabled:opacity-60"
        >
          {pending ? "Logger inn…" : "Logg inn"}
        </button>

        {error && <p className="text-[14px] text-rain">{error}</p>}

        <button
          type="button"
          onClick={() => {
            setStep({ kind: "email" });
            setOtpCode("");
            setError(null);
          }}
          className="mt-3 self-center text-[14px] text-ink-2 underline underline-offset-4 hover:text-ink"
        >
          Bruk en annen e-post
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="mt-8 flex flex-col gap-3">
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
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="Spør Erlend"
        className="rounded-2xl border border-line bg-card px-5 py-3.5 text-[16px] text-ink outline-none focus:border-ink"
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-ink transition-opacity disabled:opacity-60"
      >
        {pending ? "Sender kode…" : "Send meg en kode"}
      </button>

      {error && <p className="text-[14px] text-rain">{error}</p>}

      <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
        Du får en 6-sifret kode på e-post. Skriv den inn på neste skjerm. Når
        du er innlogget forblir du innlogget på denne enheten.
      </p>
    </form>
  );
}
