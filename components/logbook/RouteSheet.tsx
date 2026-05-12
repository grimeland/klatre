"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "@/types/crag";
import type { RouteTick } from "@/lib/logbook/load";
import {
  addTick,
  deleteTick,
  toggleProject,
  type SendStyle,
} from "@/app/actions/logbook";

type Props = {
  open: boolean;
  onClose: () => void;
  route: Route;
  cragSlug: string;
  isAuthenticated: boolean;
  isProject: boolean;
  ticks: RouteTick[];
};

const STYLE_LABEL: Record<SendStyle, string> = {
  onsight: "Onsight",
  flash: "Flash",
  redpoint: "Redpoint",
  top_rope: "Topptau",
  tried: "Prøvd",
};

const STYLE_OPTIONS: SendStyle[] = [
  "onsight",
  "flash",
  "redpoint",
  "top_rope",
  "tried",
];

function today(): string {
  const now = new Date();
  const tz = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return tz.format(now);
}

function formatDate(iso: string): string {
  const fmt = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return fmt.format(new Date(`${iso}T12:00:00`));
}

export function RouteSheet({
  open,
  onClose,
  route,
  cragSlug,
  isAuthenticated,
  isProject,
  ticks,
}: Props) {
  const router = useRouter();
  const [climbedOn, setClimbedOn] = useState(today());
  const [sendStyle, setSendStyle] = useState<SendStyle>("redpoint");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const tickCount = ticks.length;
  const lastTick = ticks[0];

  function handleLogTick(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    startTransition(async () => {
      setError(null);
      const result = await addTick({
        routeId: route.id,
        climbedOn,
        sendStyle,
        attempts: null,
        comment: comment.trim() || null,
        cragSlug,
      });
      if (result.ok) {
        setComment("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleToggleProject() {
    if (pending) return;
    startTransition(async () => {
      setError(null);
      const result = await toggleProject({ routeId: route.id, cragSlug });
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleDeleteTick(tickId: string) {
    if (pending) return;
    startTransition(async () => {
      const result = await deleteTick({ tickId, cragSlug });
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center md:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Lukk"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-bg md:max-h-[85vh] md:rounded-3xl">
        <header className="flex items-start justify-between gap-3 border-b border-line/40 px-6 pb-4 pt-6">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-[24px] leading-tight tracking-tight text-ink">
              {route.name}
            </h2>
            <p className="mt-1 text-[13px] text-ink-3">
              {route.sector && `${route.sector} · `}
              {route.lengthM > 0 && `${route.lengthM} m · `}
              {route.faBy && `FA ${route.faBy}${route.faYear ? ` ${route.faYear}` : ""}`}
            </p>
          </div>
          <span className="font-mono flex-none rounded-lg bg-card px-3 py-2 text-[14px] font-bold text-ink">
            {route.grade}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="flex-none rounded-full p-1 text-ink-3 hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto px-6 pb-8 pt-5">
          {route.description && (
            <p className="mb-5 text-[14px] leading-relaxed text-ink-2">
              {route.description}
            </p>
          )}

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-line bg-card p-5">
              <p className="text-[14px] text-ink-2">
                Logg inn for å tikke ruta, lagre den som prosjekt og se
                kommentarer.
              </p>
              <Link
                href={`/logg-inn?next=/felt/${cragSlug}`}
                className="mt-3 inline-flex rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-ink"
              >
                Logg inn
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink">
                    {isProject ? "Aktivt prosjekt" : "Prosjekt"}
                  </p>
                  <p className="text-[12px] text-ink-3">
                    {isProject
                      ? "Du jobber mot å sende denne"
                      : "Marker som noe du jobber mot"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleProject}
                  disabled={pending}
                  className={`flex-none rounded-full px-4 py-2 text-[13px] font-semibold transition disabled:opacity-60 ${
                    isProject
                      ? "border border-line bg-bg text-ink-2"
                      : "bg-ink text-white"
                  }`}
                >
                  {isProject ? "Fjern" : "Marker"}
                </button>
              </div>

              <form onSubmit={handleLogTick} className="flex flex-col gap-4">
                <div>
                  <p className="mb-2 text-[14px] font-medium text-ink">
                    {tickCount > 0 ? "Logg ny tur" : "Logg første tur"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((s) => {
                    const active = sendStyle === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSendStyle(s)}
                        className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${
                          active
                            ? "border-ink bg-ink text-white"
                            : "border-line bg-card text-ink-2"
                        }`}
                      >
                        {STYLE_LABEL[s]}
                      </button>
                    );
                  })}
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-[12px] font-medium text-ink-2">
                    Dato
                  </span>
                  <input
                    type="date"
                    value={climbedOn}
                    onChange={(e) => setClimbedOn(e.target.value)}
                    max={today()}
                    className="rounded-2xl border border-line bg-card px-4 py-2.5 text-[14px] text-ink outline-none focus:border-ink"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[12px] font-medium text-ink-2">
                    Kommentar (valgfritt)
                  </span>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    placeholder="Glatt på siste taket, prøvde for langt høyre…"
                    className="resize-none rounded-2xl border border-line bg-card px-4 py-3 text-[14px] text-ink outline-none focus:border-ink"
                  />
                </label>

                <button
                  type="submit"
                  disabled={pending}
                  className="mt-1 rounded-full bg-primary px-5 py-3 text-[15px] font-semibold text-primary-ink transition-opacity disabled:opacity-60"
                >
                  {pending ? "Lagrer…" : "Logg tur"}
                </button>

                {error && (
                  <p className="text-[13px] text-rain">{error}</p>
                )}
              </form>

              {tickCount > 0 && (
                <div className="mt-7">
                  <p className="mb-3 text-[14px] font-medium text-ink">
                    Tidligere turer
                    <span className="ml-2 text-ink-3">{tickCount}</span>
                  </p>
                  <ul className="flex flex-col gap-2">
                    {ticks.map((t) => (
                      <li
                        key={t.id}
                        className="group flex items-start gap-3 rounded-2xl bg-card px-4 py-3"
                      >
                        <span className="font-mono mt-0.5 flex-none rounded bg-bg px-2 py-1 text-[11px] font-semibold text-ink-2">
                          {STYLE_LABEL[t.sendStyle]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-ink">
                            {formatDate(t.climbedOn)}
                          </p>
                          {t.comment && (
                            <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">
                              {t.comment}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTick(t.id)}
                          disabled={pending}
                          aria-label="Slett tur"
                          className="flex-none rounded-full p-1 text-ink-3 opacity-0 transition group-hover:opacity-100 hover:text-rain disabled:opacity-30"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M4 7h16M9 7V4h6v3M6 7v13a2 2 0 002 2h8a2 2 0 002-2V7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {lastTick && (
                    <p className="mt-3 text-[12px] text-ink-3">
                      Sist klatret {formatDate(lastTick.climbedOn)}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
