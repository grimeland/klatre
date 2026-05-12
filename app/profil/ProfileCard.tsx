"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { updateProfile } from "@/app/actions/profile";

type Props = {
  userId: string;
  email: string;
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  tickCount: number;
  projectCount: number;
  savedCount: number;
};

export function ProfileCard({
  userId,
  email,
  displayName,
  username,
  bio,
  avatarUrl,
  tickCount,
  projectCount,
  savedCount,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [user, setUser] = useState(username);
  const [bioText, setBioText] = useState(bio);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    startTransition(async () => {
      setError(null);
      const result = await updateProfile({
        displayName: name,
        username: user || null,
        bio: bioText || null,
      });
      if (result.ok) {
        setEditing(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="rounded-3xl bg-card p-5 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <AvatarUploader
            userId={userId}
            initialUrl={avatarUrl}
            displayName={displayName}
            email={email}
          />
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-ink-2">
                  Navn
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={60}
                  className="rounded-2xl border border-line bg-bg px-4 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-ink-2">
                  Brukernavn
                </span>
                <input
                  type="text"
                  value={user}
                  onChange={(e) =>
                    setUser(
                      e.target.value
                        .replace(/[^a-zA-Z0-9_]/g, "")
                        .toLowerCase(),
                    )
                  }
                  placeholder="kort_navn"
                  maxLength={20}
                  className="rounded-2xl border border-line bg-bg px-4 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-ink-2">
                  Om deg
                </span>
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="Trad-glad fra Bærum."
                  className="resize-none rounded-2xl border border-line bg-bg px-4 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
                />
              </label>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-ink disabled:opacity-60"
                >
                  {pending ? "Lagrer…" : "Lagre"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setName(displayName);
                    setUser(username);
                    setBioText(bio);
                    setError(null);
                  }}
                  disabled={pending}
                  className="rounded-full border border-line bg-bg px-5 py-2 text-[13px] font-medium text-ink-2"
                >
                  Avbryt
                </button>
              </div>
              {error && <p className="text-[13px] text-rain">{error}</p>}
            </form>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-serif text-[28px] leading-tight tracking-tight text-ink md:text-[36px]">
                    {displayName || "Klatrer"}
                  </h2>
                  <p className="mt-1 text-[13px] text-ink-3">
                    {username ? `@${username} · ` : ""}
                    {email}
                  </p>
                </div>
                <div className="flex flex-none flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-full border border-line bg-bg px-4 py-1.5 text-[13px] font-medium text-ink"
                  >
                    Rediger
                  </button>
                  <LogoutButton className="rounded-full border border-transparent px-4 py-1 text-[12px] font-medium text-ink-3 hover:text-ink" />
                </div>
              </div>

              {bio && (
                <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-2 md:text-[15px]">
                  {bio}
                </p>
              )}

              <div className="mt-5 grid max-w-md grid-cols-3 gap-3 border-t border-line/60 pt-5">
                <Stat label="Turer" value={tickCount} />
                <Stat label="Prosjekter" value={projectCount} />
                <Stat label="Lagrede felt" value={savedCount} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-serif text-[24px] leading-none text-ink md:text-[28px]">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-ink-3 md:text-[12px]">{label}</p>
    </div>
  );
}
