@AGENTS.md

# Felt — klatre i Norge

Design-grunnlag: les `/Users/erlendgrimeland/Documents/GitHub/Aula-agents/UXagent.md` før du tar designbeslutninger. Den er Felts design-AD selv om dokumentet er skrevet for Aula — prinsippene gjelder begge prosjektene.

## Konkrete regler som alltid gjelder

- **Aldri all caps.** Ikke `text-transform: uppercase`, ikke "KLASSIKER" som tag — skriv "Klassiker".
- **Aldri skillestreker som separator.** Ingen `border-b`/`border-t` mellom seksjoner. Bruk luft (gap, padding) i stedet. Lister kan ha ekstremt subtile lines mellom rader hvis nødvendig — men luft er førstevalget.
- **Norsk språk** i alt brukervendt innhold. Hverdagsspråk, ikke fagsjargong.
- **Tall i kontekst.** Ikke "0,0 mm regn". Skriv "Tørt i 4 dager".
- **Mobile-first** alltid. Test mentalt: får dette plass på en iPhone Mini i tunnelbanen?

## Visuell identitet

| | Verdi |
|---|---|
| Bakgrunn | `--color-bg` #F6F2EA (off-white, varm) |
| Kort | `--color-card` hvit |
| Primær handling | `--color-primary` #1F3D2B (dyp skog-grønn) |
| Tekst | `--color-ink` #1A1A1A → `ink-2` → `ink-3` |
| Linjefarge | `--color-line` #E8E2D5 (kun i input-rammer og lett struktur, ikke som divider) |
| Sol-akssent | `--color-sun` #D89A2E |
| Regn-akssent | `--color-rain` #6B8A9E |

Fonter (lastet i `app/layout.tsx`):
- **Serif (headinger):** EB Garamond — `font-serif` / `--font-eb-garamond`
- **Sans (UI):** Geist Sans — `font-sans` / `--font-geist-sans`
- **Mono (klatregrader):** Geist Mono — `font-mono` / `--font-geist-mono`

## Stack-sammendrag

- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind v4 (theme i `app/globals.css`, ikke `tailwind.config.js`)
- Supabase (Postgres + PostGIS + Auth + Storage)
- Leaflet + react-leaflet for kart
- MET Locationforecast (prognose) + Frost API (historikk)
- Hosting: Vercel

## Skisser

`sketches/index.html` er den originale klikkbare HTML-prototypen. Bruk den som designreferanse, men adapter til Aulas/Felt sine prinsipper (ingen all caps, ingen dividers — selv om skissen tidlig hadde noen).

## MVP-scope

- Kun Oslo-region (innenfor 3t kjøring) i v1
- 8–10 felt seedet manuelt
- Kart-ruting outsourcet til Apple/Google Maps via deeplink
- Magic link auth (e-post)

## Datakilder og copyright

Egne førere kan **ikke** skannes/kopieres — beskyttet av åvl. som åndsverk og databasevern. Bruk dem som referanse for hva du selv vet, ikke som datakilde. Bygg på OpenStreetMap (`sport=climbing`), egne bilder og crowdsource senere.
