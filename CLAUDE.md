@AGENTS.md

# Felt — klatre i Norge

Mobile-first webapp som samler klatrefelt i Norge med vær-historikk og prognose. Konsept: "Airbnb for klatrefelt". Første marked: Oslo-region (innenfor 3 timers kjøring).

## Design

**Sannhetskilde: `FELT_DESIGN.md` i dette repoet.** Les den før du tar noen designbeslutning — palett, typografi, tone, klatre-domene-konvensjoner og universelle regler er der.

`/Users/erlendgrimeland/Documents/GitHub/Aula-agents/UXagent.md` er en sekundær referanse for generelle estetikk-prinsipper (Apple, Airbnb, BB, B&Y). Ikke ta med Aula-spesifikt vokabular ("deltaker", "admin", "medvirkning", "kartaktivitet") inn i Felt.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript strict
- Tailwind v4 (theme i `app/globals.css`, ikke `tailwind.config.js`)
- Supabase (Postgres + PostGIS + Auth + Storage)
- Leaflet + react-leaflet for kart
- MET Locationforecast (prognose) + Frost API (historikk)
- Hosting: Vercel

## MVP-scope

- Kun Oslo-region (innenfor 3 t kjøring) i v1
- 8–10 felt seedet manuelt
- Kart-ruting outsourcet til Apple/Google Maps via deeplink
- Magic-link auth

## Datakilder og copyright

Egne klatreførere kan **ikke** skannes eller kopieres — beskyttet av åvl. som åndsverk og databasevern. Bruk dem som personlig referanse, ikke som datakilde i appen. Bygg på OpenStreetMap (`sport=climbing`), egne bilder og crowdsource fra brukere senere.

## Skisser

`sketches/index.html` er den klikkbare HTML-prototypen. Bruk som referanse for hovedflyt og struktur, men design fra prinsippene i `FELT_DESIGN.md` — ikke kopier skissen direkte.
