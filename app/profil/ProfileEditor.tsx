"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/profile";
import { LogoutButton } from "@/components/auth/LogoutButton";

type Props = {
  email: string;
  initialDisplayName: string;
  initialUsername: string;
  initialBio: string;
};

export function ProfileEditor({
  email,
  initialDisplayName,
  initialUsername,
  initialBio,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    startTransition(async () => {
      setError(null);
      const result = await updateProfile({
        displayName,
        username: username || null,
        bio: bio || null,
      });
      if (result.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-ink-2">Navn</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={60}
            className="rounded-2xl border border-line bg-card px-5 py-3 text-[16px] text-ink outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-ink-2">
            Brukernavn (valgfritt)
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
            placeholder="kort_navn"
            maxLength={20}
            className="rounded-2xl border border-line bg-card px-5 py-3 text-[16px] text-ink outline-none focus:border-ink"
          />
          <span className="text-[12px] text-ink-3">
            Brukes for å finne deg når venner skal følge.
          </span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-ink-2">
            Om deg (valgfritt)
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            maxLength={200}
            placeholder="Trad-glad fra Bærum."
            className="resize-none rounded-2xl border border-line bg-card px-5 py-3 text-[15px] text-ink outline-none focus:border-ink"
          />
        </label>

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-ink disabled:opacity-60"
          >
            {pending ? "Lagrer…" : "Lagre"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setDisplayName(initialDisplayName);
              setUsername(initialUsername);
              setBio(initialBio);
              setError(null);
            }}
            disabled={pending}
            className="rounded-full border border-line bg-card px-5 py-2.5 text-[14px] font-medium text-ink-2"
          >
            Avbryt
          </button>
        </div>
        {error && <p className="text-[13px] text-rain">{error}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-serif text-[34px] leading-[1.05] tracking-tight text-ink md:text-[44px]">
          {initialDisplayName || "Klatrer"}
        </h1>
        <p className="mt-1 text-[14px] text-ink-3">
          {initialUsername ? `@${initialUsername} · ` : ""}
          {email}
        </p>
        {initialBio && (
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-ink-2">
            {initialBio}
          </p>
        )}
      </div>
      <div className="flex flex-none flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full border border-line bg-card px-4 py-2 text-[13px] font-medium text-ink"
        >
          Rediger
        </button>
        <LogoutButton />
      </div>
    </div>
  );
}
