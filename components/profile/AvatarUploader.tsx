"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { setAvatarUrl } from "@/app/actions/avatar";

type Props = {
  userId: string;
  initialUrl: string | null;
  displayName: string;
  email: string;
};

function initialsFrom(name: string, email: string): string {
  const source = (name || email).trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AvatarUploader({
  userId,
  initialUrl,
  displayName,
  email,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const initials = initialsFrom(displayName, email);

  function pickFile() {
    if (pending) return;
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Bildet er for stort. Maks 3 MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Bruk JPG, PNG eller WebP.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const result = await setAvatarUrl(publicUrl);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setUrl(publicUrl);
      router.refresh();
    });
  }

  function handleRemove() {
    if (pending) return;
    startTransition(async () => {
      setError(null);
      const result = await setAvatarUrl(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUrl(null);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={pickFile}
        disabled={pending}
        aria-label="Bytt profilbilde"
        className="group relative h-32 w-32 flex-none overflow-hidden rounded-full bg-primary text-primary-ink transition disabled:opacity-60 md:h-36 md:w-36"
      >
        {url ? (
          <Image
            src={url}
            alt={displayName || "Profilbilde"}
            width={288}
            height={288}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-serif text-[40px] font-medium md:text-[48px]">
            {initials}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[12px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
          Bytt bilde
        </span>
      </button>

      {url && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="mt-2 text-[12px] text-ink-3 hover:text-rain disabled:opacity-60"
        >
          Fjern bilde
        </button>
      )}

      {error && (
        <p className="mt-2 text-center text-[12px] text-rain">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
