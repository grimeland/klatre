# Felt — konkrete take-aways fra Airbnb-analysen

Hver innsikt knyttet til en konkret beslutning eller komponent vi bygger.

## Top-prioriteringer fra analysen

| # | Innsikt | Felt-handling | Status |
|---|---|---|---|
| 1 | Kort har 4 datapunkter, ikke 7 | CragCardSmall: bilde, navn, "47 min · 38 ruter · 4–8a", tørrhetsbadge | ✅ Bygget |
| 2 | Pin på kart viser datapunktet som faktisk betyr noe | "☀ 47 min" framfor generisk pin | ✅ Skissert, bygges nå |
| 3 | Bottom sheet ved pin-tap med ✕ | Sheet glir opp med kort, ✕ lukker uten å miste kart-posisjon | 🔨 Bygges nå |
| 4 | Sticky CTA på detaljside | "Åpne i Kart ↗" i bunn | 🔨 Bygges nå |
| 5 | Søke-modal med 3 spørsmål (Hvor / Når / Type) | Egen modal, ett spørsmål åpent av gangen | ⏳ Senere |
| 6 | "Recommended for you" som top-3 filtre i filter-modal | Tørt nå, Lett innsteg, Familievennlig | ✅ Skissert |
| 7 | Live antall på "Show X" filter-knapp | "Vis 24 felt" oppdaterer seg ved hvert klikk | ⏳ Senere |
| 8 | 3 nivåer av tekst-hierarki, ikke mange font-vekter | ink, ink-2, ink-3 — gjennomført | ✅ I bruk |
| 9 | Sosiale signaler som tall ("240 har klatret") | Ikke 5-stjerners — bruk klatre-konvensjon (3-stjerner) | ✅ I bruk |
| 10 | Mobil og desktop som separate adaptasjoner | H-scroll mobil → grid desktop, BottomNav skjult desktop | ✅ Bygget |
| 11 | Skeleton over spinner ved lasting | Pulserende grå plassholdere | ⏳ Når data er ekte |
| 12 | Kart-stil dempet, pinene står fram | CartoDB Voyager (samme som Aula) | 🔨 Bygges nå |
| 13 | "Search this area"-knapp ved kart-pan | Bruker bestemmer når søket re-kjøres | ⏳ Senere |

## Bevisste fravalg

| Airbnb-mønster | Hvorfor vi *ikke* tar det |
|---|---|
| 5-stjerners anmeldelses-stjerner | Klatre-konvensjon er 3 stjerner for kvalitet — domene-konvensjon trumfer |
| Pris-histogram i filter | Felt har ikke pris |
| AI-søk ("Search by what you imagine") | For tidlig, for vagt for klatrere |
| Multi-list wishlists | Overengineering for v1 — én flat liste holder |
| Booking-funnel med betaling | Vi har ikke det forretningsområdet |
| Vert-profil med chat | Vi har ikke verter |

## Klatre-spesifikke valg som *bevisst skiller seg* fra Airbnb

1. **Tørrhetsspråk i stedet for klatrescore.** "Tørt i 4 dager" ærligere enn et aggregat.
2. **Bergart synliggjort.** Sandstein vs gneis matters etisk — Airbnb har ikke ekvivalent.
3. **3-stjerners klatre-konvensjon** — ikke samme som Airbnbs anmeldelses-stjerner.
4. **"Klassiker"-tag** for ruter, ikke for felt. Vi vurderer kvalitet på rute-nivå, Airbnb på listing-nivå.
5. **Norsk språk gjennomgående**, ikke engelsk-først som Airbnb.
6. **Sticky CTA som linker til ekstern kart** — vi outsourcer ruting, sparer 3–6 mnd utvikling.

## Implementering denne økten

Mens Erlend er borte, bygger jeg ut:
- `/felt/[slug]` — detaljside med galleri, tørrhet-block, ruteliste, sticky CTA
- `/utforsk` — liste + kart-toggle som matcher skissen
- `<CragMap>` — Leaflet med CartoDB Voyager + custom pins (avstand + vær-symbol)
- `/lagret` + `/profil` — placeholder-sider så bottom-nav-lenker ikke breaker
