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
};

export function ProfileCard({
  userId,
  email,
  displayName,
  username,
  bio,
  avatarUrl,
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

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-md flex-col gap-3"
      >
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-ink-2">Navn</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            className="rounded-2xl border border-line bg-card px-4 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-ink-2">Brukernavn</span>
          <input
            type="text"
            value={user}
            onChange={(e) =>
              setUser(
                e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase(),
              )
            }
            placeholder="kort_navn"
            maxLength={20}
            className="rounded-2xl border border-line bg-card px-4 py-2.5 text-[15px] text-ink outline-none focus:border-ink"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-ink-2">Om deg</span>
          <textarea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Trad-glad fra Bærum."
            className="resize-none rounded-2xl border border-line bg-card px-4 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
          />
        </label>
        <div className="mt-2 flex gap-2">
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
            className="rounded-full border border-line bg-card px-5 py-2 text-[13px] font-medium text-ink-2"
          >
            Avbryt
          </button>
        </div>
        {error && <p className="text-[13px] text-rain">{error}</p>}
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <AvatarUploader
        userId={userId}
        initialUrl={avatarUrl}
        displayName={displayName}
        email={email}
      />

      <h2 className="mt-6 font-serif text-[36px] leading-[1.05] tracking-tight text-ink md:text-[44px]">
        {displayName || "Klatrer"}
      </h2>

      <p className="mt-2 text-[14px] text-ink-3">
        {username ? `@${username}` : email}
      </p>

      {bio && (
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2">
          {bio}
        </p>
      )}

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-6 rounded-full border border-line bg-card px-6 py-2.5 text-[14px] font-medium text-ink"
      >
        Rediger profil
      </button>

      <LogoutButton className="mt-3 rounded-full px-4 py-1 text-[13px] text-ink-3 hover:text-ink" />
    </div>
  );
}
