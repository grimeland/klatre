# Airbnb — grundig analyse av UX, designsystem og struktur

*Skrevet for Felt-prosjektet for å forstå hva vi henter, hva vi bevisst gjør annerledes, og hva vi adapterer til klatre-domenet.*

---

## 1. Forretningsstrategien som ligger under designet

Airbnbs design er ikke "vakkert fordi" — det er resultat av tre forretningsbehov som er internalisert i hvert eneste UI-valg:

1. **Tillit på tvers av to fremmede.** Hver flate har som hovedoppgave å bygge tillit fra besøkende → vert og motsatt. Anmeldelser, profil-bilder, "Superhost"-merker, "Guest favorite"-trofeer er alle infrastruktur for tillit.
2. **Beslutningsstøtte under usikkerhet.** Brukeren vet ikke hva hen leter etter før hen ser noe som matcher en udefinert lengsel. Designet må derfor inspirere før det filtrerer.
3. **Konvertering uten å føles transaksjonell.** Aldri "Buy now". Alltid "Reserve" eller "Continue". Hvert steg i bookingen er forsiktig avlastet for å holde brukeren i flyt.

Hva det betyr for Felt: vi har ikke samme tillits-problem (ingen vert, ingen pengetransaksjon), men vi har **beslutningsstøtte under usikkerhet**: hvilket felt passer for meg i dag? Det er Airbnbs sterkeste arv.

---

## 2. Forsiden — distraksjonsfri inngang til søk

Forsiden er den minst distraherende landingen jeg har sett fra et stort produkt. Den gjør tre ting og gir avkall på alt annet:

1. **Søkepille øverst** — det første og største elementet. På mobil er den fast i toppen og glir med scrollen. På desktop er den en del av topp-navigasjonen.
2. **Kategorier** (Houses / Hotels / Experiences / Services) — øverst som en horisontalt scrollbar rad med ikoner. Hver kategori bytter hele underliggende søk.
3. **Anbefalingsrader** — "Popular homes in Philadelphia", "Available next month in Miami", "Continue exploring stays". Hver rad er en gruppering av ~10 kort i horisontal scroll på mobil og 4–6 kolonner grid med pagination-piler på desktop.

**Bevisst fravalg:** ingen skreddersydd hero med store bilde-collager (slik Booking har), ingen blogg-innhold, ingen markedsføring av nye markeder. Kun produkt.

**Mikro-detalj som gjør forskjell:** "Continue exploring" som tittel — antyder at brukeren *allerede* var på vei og bare må videre. Mye sterkere enn "Recommended for you" eller "Featured stays".

Forsidens layout-grunnstruktur:

```
TOP NAV (desktop) / SEARCH BAR (mobile)
├─ Logo
├─ Search pill (fold-out på desktop)
└─ Profile avatar / Login

CATEGORY STRIP (h-scroll, sticky)

ROWS
├─ Section title (h2, 22px / 28px desktop)
├─ Card row (h-scroll mobile, 4-col grid desktop)
└─ Repeat...

FOOTER (desktop only)
```

---

## 3. Søke-modalen — den viktigste konverterings-flaten

Når en bruker tapper søkepilla, åpnes en full-screen modal med tre steg:

```
WHERE?     (lokasjon-søk + nylige + populære)
WHEN?      (kalender med to mode: Dates / Flexible)
WHO?       (gjester-stepper)
```

### Designvalg som driver konvertering

- **Bare ett spørsmål synlig av gangen.** "Where?" er åpent, "When?" og "Who?" er kollapset. Brukeren må fullføre ett før det neste utvider seg. Dette er Hick's Law i praksis.
- **"Flexible"-modus i datovelger.** I stedet for å tvinge konkrete datoer, kan brukeren si "1 weekend" eller "in May". Reduserer friksjon for de 60 % som ikke har bestemt seg ennå.
- **"Add guests"-stepper** har separate tellinger for Adults / Children / Infants / Pets. Pets er en bevisst valg — dyreeier-segmentet konverterer høyere når de ser at appen forstår dem.
- **Sticky bunn med "Clear all" + "Search"-knapp.** Knappen er disabled til minst lokasjon er fylt. Gir tilbakemelding om at appen er klar når du er klar.

### Mikrokopi i modalen

| Default | Hvorfor |
|---|---|
| "Where?" | Åpent spørsmål, ikke "Type destination" |
| "Anywhere" | Lar brukeren skipe lokasjon helt |
| "Add dates" | Hint, ikke pålagt |
| "Add guests" | Samme |
| "I'm flexible" | Frigjørende, ikke "Optional" |

---

## 4. Resultatsiden — grid + filter + kart

Resultatsiden har tre tydelig adskilte regioner som brukeren kan veksle mellom:

```
TOP            (search pill med oppsummert søk + filter-ikon)
FILTERS        (sticky chip-rad: Type / Price / Rooms / Sort by ...)
MAIN VIEW      (grid eller kart, toggle nederst)
TOGGLE         (fixed bottom: List ⇄ Map)
```

### Kortets info-hierarki

Hvert kort på resultatsiden har **fire datapunkter**, alltid i samme rekkefølge:

1. **Bilde** — 4:5 ratio, fyller største del av kortet (90 % visuell vekt)
2. **Tittel** — 1 linje, 16px, 600 weight ("Apartment in Center City")
3. **Pris** — 14px, 600, integrert i bildet som pill nederst venstre på kart-view, eller under tittelen i grid-view
4. **Rating + count** — "4.96 (298)" — bygger tillit gjennom volum

Ingen anmeldelses-tekst, ingen vert-bilde, ingen avstand. **Bare det som hjelper deg avgjøre om du skal klikke videre.**

**Subtile signaler:**
- "Guest favorite"-trofé som badge øverst venstre — ikke en sticker som ser ut som reklame, men en liten merkelapp i samme designspråk som resten
- ♡ øverst høyre — alltid synlig, alltid samme posisjon
- Bilder kan blas i direkte i kortet (carousel med dots) — sjeldne, men når brukeren gjør det er konvertering høyere

### Pagination-mønster

På mobil: uendelig scroll, ingen pagination. Brukeren scroller seg ned i datasettet.

På desktop: 4×5 grid (20 kort per side) med tradisjonell pagination i bunnen ("1 2 3 ... 15"). Klikker brukeren videre, scroller siden til topp av nye resultater og søkepilla blir værende fast øverst.

For *seksjoner på forsiden*, derimot, er det chevron-piler (◀ ▶) som blar gjennom rad uten sideskift. Det er to forskjellige interaksjonsmønstre med samme visuelle utseende.

### Filter-rad og chips

Sticky chip-rad rett under søkepillen:

```
[Cancellation flexibility ▾] [Type of place ▾] [Price ▾] [Rooms and beds ▾] [Filters]
```

Chip-rad-mønstre:
- Inaktive: hvit fyll, lys grå border
- Aktive (har en verdi satt): svart fyll, hvit tekst — så brukeren ser tydelig at filteret er aktivt
- "Filters" til høyre åpner full modal med alle filter
- Antall aktive filtre vises som badge ("Filters · 3")

---

## 5. Detaljsiden — booking-funnel som info-arkitektur

Detaljsiden er Airbnbs mest kompleks og mest gjennomtenkte flate. Det er her konvertering skjer, og hvert element jobber for det.

### Skjelett

```
HERO GALLERI         (1 stort + 4 små bilder grid på desktop)
TITTEL              (Listing-tittel, lokasjon, type)
SOSIAL PROOF        ("4.96 · 298 reviews · Superhost")
HOST-WIDGET         (Sticky høyre kolonne på desktop)
HIGHLIGHTS          (3 punkter med ikoner: "Self check-in", "Free parking", ...)
DESCRIPTION         (Først 2 avsnitt, "Show more" for resten)
SLEEPING AREA       (Carousel av soverom)
AMENITIES          (10 først, "Show all 47 amenities" for resten)
DATES               (Mini-kalender)
RULES               (Hvor det er ok / ikke)
LOCATION            (Lite kart + "X minutter til ...")
HOST-INFO           (Bilde, navn, "Hosting since X", verifisering)
THINGS TO KNOW     (Cancellation policy, safety, etc)
REVIEWS            (Først 6, "Show all 298 reviews")
```

### Det som gjør siden god

1. **Hero-galleriet er klikkbart** — hvert bilde åpner et fullskjerm-galleri-modus. På mobil er det horizontal scroll med dots; på desktop er det grid 1+4 med overlay-modus.

2. **Sticky booking-widget** på desktop — kostnaden er alltid synlig på høyre side. Brukeren kan endre datoer der uten å rulle. Mobile har samme funksjon som sticky bunn.

3. **Progressive disclosure overalt.** "Show more"-knapper for alt som er over en visuell terskel. Reduserer overveldelse.

4. **Sticky underliner-nav.** Når man scroller forbi hero, kommer det en sticky topp-nav med snarveier: Photos · Amenities · Reviews · Location. Klikk hopper til seksjonen.

5. **CTA-stigen.** Først ser man pris i hero. Så "Reserve"-knapp i sticky widget. Når man begynner å klikke, åpnes "Confirm and pay"-modal som er en egen kontrollert flyt.

### Det som er bevisst dempet

- Ingen oppringnings-knapp eller live-chat (de driver ikke booking)
- Ingen "Save 10 %"-banner (det ville bryte tone-of-voice)
- Ingen related listings i sidefelt (man skal ikke distraheres)

### Mikro-detalj å huske

På detaljsiden vises adressen **omtrentlig** ("Manhattan, New York") — den eksakte adressen åpenbares bare etter booking. Det er privatlivsbeskyttelse for vert, men også ikke-snakkende friksjon-reduktor.

---

## 6. Kart-viewet — spatial søk

Kart-viewet er en av Airbnbs mest distinkte komponenter. Designvalgene er nær perfekte:

### Pin-design

- **Pris-pill** i stedet for en generisk pin
- Bakgrunn: hvit fyll, lett skygge
- Tekst: pris i kvettelandets valuta ("$356")
- Aktiv pin: svart fyll, hvit tekst
- Klikket pin: kort beveger seg under, blir mørk, andre pins gjør seg subtilere

### Bottom sheet ved klikk

Når man tapper en pin, kommer det opp en bottom-sheet-kort:

- Bilde (16:9), full bredde
- "Guest favorite"-badge øverst venstre
- ✕ øverst høyre (lukker uten å miste kart-posisjonen)
- ♡ ved siden av ✕
- Tittel, beskrivelse, datoer, pris

Trykker man på kortet (ikke ✕), åpnes detaljsiden i full visning.

### "Search this area"-knapp

Når brukeren panorerer kartet, dukker det opp en flytende knapp øverst: **"Search this area"**. Brukeren kontrollerer eksplisitt når søket re-kjøres — ikke automatisk, ikke etter en debounce. Dette er bevisst: re-spørringer er kostbare og brukerens kontekst skifter.

### Kart-stil

Airbnb bruker en custom Mapbox-style som er bevisst lavkontrast:
- Grunnflate: nesten hvit
- Veier: lys grå
- Etiketter: dempet svart, små
- Vegetasjon: lys grønn
- Vann: lys blå

Hensikten: pinene skal stå fram. Kartet er bare bakteppe.

### Adaptasjon for Felt

Vi bytter pris-pill til **avstand+vær-pill**: "☀ 47 min". Lavkontrast Mapbox-style fungerer like bra for klatrefelt (hvor vi vil løfte pinene fram). "Search this area"-mønsteret er gull for klatrere som scroller fra Sør-Norge til Vestlandet på samme reise.

---

## 7. Filter-modalen — progressive disclosure i praksis

Filter-modalen er full-screen på mobil, sentrert modal på desktop. Strukturen er konsistent på tvers av kategorier:

```
HEADER          (Filters-tittel, ✕ til høyre)
RECOMMENDED     (3-4 ikon-kort: "Free cancellation", "Self check-in", "Washer")
TYPE OF PLACE   (Segmented: Any type / Room / Entire home)
PRICE RANGE     (Histogram + min/max sliders)
ROOMS AND BEDS  (Steppers: -1+, -1+, -1+)
AMENITIES       (Chip-grid)
FOOTER          (Clear all | Show 1,000+ places)
```

### Det elegante med "Recommended for you"

Den øverste seksjonen er bevisst de **tre mest brukte filtrene globalt**. På 80 % av søkene er det disse tre brukeren vil ha. Det betyr at de fleste brukere kan filtrere uten å scrolle ned.

For sjeldnere filtre må man scrolle. Men de to gruppene som driver flest filtre (cancellation policy, type of place) er over folden.

### Histogram for pris

Pris har et lite histogram som viser fordelingen av aktive listings i prisintervallet. Brukeren ser med ett blikk om de er i "billig", "mellomklasse" eller "luksus"-segmentet. Dette er Bayesian decision support — appen forteller deg hva som er normalt.

### "Show X places"-knappen

Bunnen av modalen oppdaterer seg live: "Show 24 places" → "Show 18 places" når brukeren legger på filter. Det skaper en feedback-loop som gjør at brukeren kan kalibrere filtreringsnivået i sanntid.

### Adaptasjon for Felt

Filter-modalen i skissen vår følger 90 % av denne mønstret allerede. Det vi mangler:
- **Live antall** ("Vis 24 felt") som oppdaterer seg ved hvert klikk
- **Histogram** for vanskelighet-grad-fordeling (kunne vært nyttig)
- **Recommended for you**-seksjonen er allerede i skissen

---

## 8. Wishlists og lagring

Airbnbs Wishlists er overraskende sosiale. Brukeren kan:
- Lagre flere lister parallelt ("Sommerferie 2026", "Kontorseminar")
- Dele en hel liste via lenke (ny modul i 2024)
- Se hvor mange andre som har lagret samme listing

For Felt v1 holder vi det enklere:
- Én flat liste "Lagret"
- Tap på ♡ legger til
- Tap igjen fjerner
- Listen er kronologisk sortert (siste lagret øverst)

Først når brukerne ber om kategorier ("Sommerprosjekter", "Helgetur") legger vi inn flere lister.

---

## 9. Designsystem — typografi, farger, spacing

### Typografi

Airbnb bruker en custom font kalt **Cereal**, designet av Dalton Maag. Den har 6 vekter (Light, Book, Medium, Bold, Extra Bold, Black). For Felt bruker vi Geist Sans og EB Garamond, som kombinerer elegant — men vi kan lære av Airbnbs **bruks-mønster**:

| Stil | Airbnb | Felt-ekvivalent |
|---|---|---|
| Display H1 (forsiden) | Cereal Bold 32–56 px | EB Garamond 400 / italic 34–56 px |
| Section H2 | Cereal Bold 22 px | EB Garamond 400 22–28 px |
| Card title | Cereal Medium 16 px | Geist Sans 600 15–17 px |
| Body | Cereal Book 14–16 px | Geist Sans 400 14–16 px |
| Meta/secondary | Cereal Book 12–13 px | Geist Sans 400 12–13 px (ink-3) |

**Lærdom:** Airbnb bruker færre størrelser enn vi tror. Stort sett 12, 14, 16, 22, 32. Felt bør holde seg til samme antall.

### Farger

Airbnbs primær er **#FF385C** (rouge / fuchsia). Det er bevisst en farge som ikke matcher konkurrentene (Booking-blå, Vrbo-brun). Sekundær er nesten utelukkende neutral grå.

For Felt har vi #1F3D2B (dyp skog-grønn). Det er bevisst valg som passer fjell-kontekst og skiller oss fra alle andre klatreapper (27crags-orange, theCrag-blue).

**Felles prinsipp:** primærfargen brukes svært sparsomt — bare for "mest viktige handling". Ingen "sekundære knapper" i primærfarge, ingen border-bottom i primærfarge. Når den dukker opp, betyr det noe.

### Spacing

Airbnb bruker et 4 px-grid:
- Inline gap: 4, 8, 12, 16, 24
- Block padding: 16, 24, 32, 48, 64
- Section gap (mellom hovedseksjoner): 64–96 px desktop, 32–48 px mobil

**Lærdom for Felt:** vi har gap-3 (12 px) mellom kort, gap-5 på desktop. Section-padding er pt-7 (28 px) mobil og pt-12 (48 px) desktop. Det matcher Airbnb-praksis fint.

---

## 10. Mikro-interaksjoner og motion

Airbnb har subtile, men presise animasjoner:

| Element | Animasjon |
|---|---|
| Tap ♡ | Skala 0.85 → 1.05 → 1, 220 ms ease-out |
| Knapp tap | Skala 0.97, opacity 0.9, 100 ms ease-in |
| Kart-pin selected | Skala 1.0 → 1.15, samtidig fyll-bytte fra hvit til svart |
| Bottom sheet åpning | Translate Y fra 100 % til 0 %, 300 ms ease-out |
| Kategori-tab bytte | Underliner glir over (FLIP-animasjon) |
| Card hover (desktop) | Skala 1.02 + skygge-økning |
| Search-pill ekspansjon (desktop) | Width-animasjon + bakgrunns-fade |

**Prinsippet:** ingen animasjon for animasjonens skyld. Hver bevegelse skal bekrefte en handling brukeren gjorde. Aldri auto-play, aldri attention-grabbing.

For Felt har vi allerede `active:scale-[0.98]` på kort og `active:scale-90` på ♡. Det er en bra start. Vi bør legge til:
- Hover-effekt på kort på desktop (subtile)
- Bottom sheet animasjon når detaljside åpnes

---

## 11. Sosiale signaler — hvordan tillit bygges

Airbnb bruker fire ulike sosiale signaler, alle subtilt og presist plassert:

1. **"Guest favorite"-trofé** — vinklet emoji-aktig ikon, kun for de øverste 5 % av listings. Vises både i kort og i detaljside.
2. **"Superhost"-merke** — gitt til verter med høy rating + lav cancellation + rask respons. Vises i host-widget.
3. **Anmeldelses-tall** — "298 reviews" gir mer tillit enn "4.96-stars" alene
4. **"Verified"-checkmark** på vert-profilen

For Felt har vi:
- "Lokal favoritt" — vår "Guest favorite"-ekvivalent. Trenger samme stilistiske presisjon.
- "Klassiker"-tag på populære ruter. Vår "Superhost"-ekvivalent.
- "240 har klatret" — vår anmeldelses-tall-ekvivalent. Volum framfor rating-stjerner.
- Klatre-konvensjons-stjerner ★★★ — IKKE det samme som anmeldelser. Det er kvalitet, ikke vurdering.

Viktig vi *ikke* gjør: 5-stjernes anmeldelses-stjerner. Klatre-stjerner er en helt annen konvensjon (3-stjerner-skala for ruters kvalitet). Hvis vi blander dem, mister vi klatre-troverdighet.

---

## 12. Mobile vs desktop — adaptasjons-strategi

Airbnb har én av bransjens beste responsive-implementeringer. Nøkkel-mønstre:

### Layout

| Region | Mobile (≤768) | Desktop (≥1024) |
|---|---|---|
| Header | Search bar (full bredde) | Top-nav med logo + search-pill + profile |
| Body | Single-column scroll | 1200 px maks-bredde, sentrert |
| Sections | H-scroll | 4–6 col grid med chevron-pagination |
| Detaljside | Single column med sticky bunn-CTA | 60 % main + 40 % sticky widget |
| Kart | Toggle med liste | Split-view: liste 50 %, kart 50 % |
| Bottom nav | Fixed nederst | Skjult |
| Filter | Full-screen modal | Sentrert modal (~600 px bred) |

### Brytpunkter

Airbnb bruker tilsynelatende disse (basert på inspeksjon):
- 0–743 px: mobile
- 744–1127 px: tablet
- 1128–1439 px: small desktop
- 1440+: large desktop

For Felt har vi Tailwinds default:
- 0–767: mobile
- 768–1023: md
- 1024–1279: lg
- 1280+: xl

Det er litt grovere men dekker bra.

### Adaptasjons-prinsipper

1. **Aldri en mobile-versjon som ser ut som en hjemløs desktop-versjon.** På mobil skal alt føles purpose-built.
2. **Aldri en desktop-versjon som ser ut som en oppblåst mobil.** Bruk plassen.
3. **Forskjellige interaksjons-mønstre.** På mobil er h-scroll naturlig (touch). På desktop er grid med pagination naturlig (mus).
4. **Beholdt info-arkitektur.** Selv om layoutet er forskjellig, er rekkefølgen av info konsistent.

---

## 13. Empty/loading/error states

Airbnb har bygget eksplisitt arbeid på "tomme tilstander" — det er en av deres styrker.

### Empty states

- "No exact matches" → "Here are some nearby" → fortsett scroll
- Wishlist tom → bilde av en koffert + "Save your favorite homes" → CTA "Start exploring"
- Søk uten treff → "Try removing one of your filters" → vis hvilke filtre som er aktive

### Loading states

- Skeleton-kort med pulserende grå plass-holdere
- Bilde-laster: blur-up fra LQIP (low-quality image placeholder)
- Liste-laster: 6 skeleton-kort, fade-in når data kommer

### Error states

- Aldri "Error 500" eller stack trace
- "Something didn't go right" + retry-knapp
- Spesifikke feilmeldinger ved feilaktig input ("Date is in the past")

For Felt: vi må ha disse fra dag 1. Spesielt for "ingen felt funnet" og "kunne ikke laste vær".

---

## 14. Performance og perceived speed

Airbnb gjør flere ting for å føles raskt:

1. **Skeleton over spinner** — alltid. Spinnere ser broken ut.
2. **Optimistiske oppdateringer** — ♡ blir fylt umiddelbart, lagring skjer i bakgrunnen
3. **Image prefetch** — bilder for resultater på neste side preloades på scroll
4. **Route prefetch** — Next.js Link med auto-prefetch (vi har dette)
5. **Lazy mount tunge komponenter** — kart bare lastes når kart-toggle aktiveres
6. **Code splitting per route** — automatisk i Next.js

**Lærdom for Felt:** vi har Next.js og Link-prefetch ut av boksen. Vi bør:
- Bytte placeholder-gradienter til faktisk LQIP når bilder kommer på plass
- Bare laste Leaflet når kart-fanen åpnes (dynamic import)
- Optimistisk ♡-tilbakemelding (allerede gjort i HeartButton-komponenten)

---

## 15. Innhold og copy — tone-of-voice

Airbnb skriver som et menneske:

| De skriver | Ikke |
|---|---|
| "You won't be charged yet" | "Payment pending" |
| "Add dates" | "Required field" |
| "Show all 298 reviews" | "View more" |
| "Hosted by Allison" | "Provider: Allison" |
| "Things to know" | "Information" |
| "I'm flexible" | "Skip" |

**Tre prinsipper jeg destillerer:**

1. **Bruk verb framfor substantiver.** "Show all reviews" ikke "Reviews list"
2. **Bruk antall i stedet for vagt språk.** "298 reviews" ikke "Many reviews"
3. **Bruk førstepersons-retorikk når brukeren tar et valg.** "I'm flexible" ikke "User is flexible"

For Felt har vi allerede begynt:
- "Tørt i 4 dager" (verb-aktig + tall)
- "240 har klatret" (tall)
- "Hvor vil du klatre?" (åpent spørsmål, førsteperson-implisitt)

Vi kan styrke videre:
- "Vis alle 38 ruter" (har)
- "Sist regn: tirsdag" (konkret tall, ikke "nylig")
- "47 min unna" på kart-pinner (verb-aktig avstand)

---

## 16. Sammenligningstabell — Airbnb vs Felt-strategi

| Område | Airbnb | Felt | Begrunnelse for forskjell |
|---|---|---|---|
| Primærfarge | #FF385C rouge | #1F3D2B skog-grønn | Felt-kontekst, ikke konkurrent-kollisjon |
| Hovedmetrikk på kart-pin | Pris ($) | Avstand + vær | Klatreren ser etter "kan jeg dra dit?", ikke "har jeg råd?" |
| Sticky CTA på detaljside | "Reserve" | "Åpne i Kart ↗" | Vi outsourcer ruting til native maps |
| Tilliten kommer fra | Anmeldelser, Superhost | Tørrhetshistorikk, Klassiker-tag | Vi har ingen vert å bygge tillit til |
| Anmeldelses-skala | 5 stjerner | 3-stjerners klatre-konvensjon | Domene-konvensjon trumfer Airbnb-mønster |
| Søke-modal | Where / When / Who | Hvor / Når / Type klatring | Vi har ikke "Who" — alltid singel klatrer |
| Filter "Recommended for you" | Free cancellation, Self check-in, Washer | Tørt nå, Lett innsteg, Familievennlig | Domene-spesifikk topp-3 |
| Booking-funnel | Multi-step med innebygd betaling | Ingen — vi linker til ekstern kart | Forskjellig forretnings-modell |
| Datavolum per kort | 4 datapunkter | 4 datapunkter | Lik prinsipp: ikke overlast |
| Pagination desktop | 4×5 grid med tall-pagination | 3–5 col med chevron i hver rad (forsiden) / pagination (utforsk) | Aksial samme prinsipp |

---

## 17. Hva vi *ikke* henter

Vi skal ikke etterligne alt. Ting Airbnb gjør som vi *ikke* skal kopiere:

- **Roterende hero-kategorier** ("Treehouses", "Castles", "OMG!") — det er Airbnb-merkevare-uttrykk, ikke generisk pattern
- **Booking-funnel med pengetransaksjon** — vi har ikke det
- **Vert-profiler med biografi og chat** — vi har ikke verter
- **Pris-histogram i filter** — feltene har ikke pris
- **Multi-list wishlists** — overengineering for v1
- **AI-søk-feltet ("Search by what you imagine")** — for tidlig
- **Innebygde "Experiences" og "Services"** — ikke vårt forretningsområde

Hver gang vi adapterer noe fra Airbnb, må vi spørre: *"Adresserer dette en faktisk klatrer-behov, eller etterligner vi bare?"*

---

## 18. Kvalitet-detaljer som gjør forskjell

Disse er ikke store features, men er det som gjør Airbnb til Airbnb:

1. **Dato-pills i søke-pille viser alltid avbrutte format** ("Sep 5–7" ikke "Sep 5 – Sep 7")
2. **♡-knapp har alltid hvit fyll med skygge** når over et bilde, men border-only-styling når på hvit bakgrunn
3. **Bilde-galleri-modal har URL** som endres med ?photo=N — delbart, ikke ephemeral
4. **Modaler kan avvises med Escape** og klikk utenfor — alltid
5. **Skip-link "Skip to content"** øverst for tastatur-brukere — usynlig til focus
6. **Grade-data formateres alltid likt** ($1,234 / 12,34 € / 99,000 ¥) basert på lokale konvensjoner
7. **Bilder lazy-loades med riktig `loading` attribute**, men hero-bildet er `priority`-ladet
8. **Hver knapp har en `aria-label`** som er meningsfull, ikke bare repetisjon av text-content

For Felt: vi bør ha disse som standard fra start, ikke etterspille senere.

---

## 19. Sluttvurdering — hva Felt skal hente

Når vi destillerer alt: **Airbnb er ikke vakker fordi de har bedre design enn andre. De er vakker fordi hvert eneste designvalg er forankret i ett konkret bruker-behov og brukes med presisjon.**

Vi adapterer:

1. **Søke-modal med tre tydelige spørsmål** (Hvor / Når / Type)
2. **Kart-pin med datapunktet som faktisk betyr noe** (avstand + vær for oss, pris for dem)
3. **Bottom sheet ved pin-tap** med ✕ for å lukke uten å miste kart-posisjonen
4. **Sticky CTA på detaljside** (vi har: "Åpne i Kart ↗")
5. **"Recommended for you"-seksjon i filter** med top-3 mest brukte filtre
6. **Live antall i "Show X places"-knappen**
7. **Bilde-galleri med URL-state** (delbart)
8. **3 nivåer av tekst-hierarki** (ink, ink-2, ink-3) framfor mange font-vekter
9. **4 datapunkter per kort, ikke 7**
10. **Sosiale signaler som tall ("240 har klatret"), ikke abstrakte score**
11. **Mobil og desktop som separate adaptasjoner, ikke en oppblåst mobil**
12. **Mikro-interaksjoner som bekrefter handling, aldri som dekorasjon**

Vi unngår:

1. Å lage "klatrescore"-aggregater som skjuler beslutningen
2. Å bruke 5-stjerners anmeldelses-stjerner (klatre-konvensjon = 3 stjerner for kvalitet)
3. Å bruke pris-histogram for vanskelighet (grade-fordeling kan bli misvisende)
4. Å bygge for mange wishlists før behovet er der
5. Å laste tunge biblioteker (kart) før brukeren ber om dem

---

*Slutt på analysen. Konkrete implikasjoner for Felt finnes i `felt-takeaways.md`.*
