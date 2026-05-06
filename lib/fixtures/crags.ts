import type { Crag, LatLng, Route } from "@/types/crag";
import { estimateDriveMinutesFromOslo } from "@/lib/utils/distance";

const damtjernRoutes: Route[] = [
  { id: "d-1", name: "Førstemann ned", grade: "5", gradeNumeric: 10, lengthM: 22, stars: 2, type: "sport", ascents: 320, isClassic: false },
  { id: "d-2", name: "Solstreif", grade: "5+", gradeNumeric: 12, lengthM: 25, stars: 2, type: "sport", ascents: 180, isClassic: false },
  { id: "d-3", name: "Sjøveien", grade: "6a", gradeNumeric: 14, lengthM: 28, stars: 3, type: "sport", ascents: 240, isClassic: true },
  { id: "d-4", name: "Krokfingern", grade: "6a+", gradeNumeric: 15, lengthM: 24, stars: 1, type: "sport", ascents: 92, isClassic: false },
  { id: "d-5", name: "Edderkoppen", grade: "6c", gradeNumeric: 17, lengthM: 32, stars: 2, type: "sport", ascents: 87, isClassic: false },
  { id: "d-6", name: "Kantete stillhet", grade: "7a", gradeNumeric: 18, lengthM: 30, stars: 3, type: "sport", ascents: 95, isClassic: true },
  { id: "d-7", name: "Nedstigningen", grade: "7b", gradeNumeric: 20, lengthM: 28, stars: 2, type: "sport", ascents: 41, isClassic: false },
  { id: "d-8", name: "Skyggespillet", grade: "8a", gradeNumeric: 22, lengthM: 28, stars: 3, type: "sport", ascents: 12, isClassic: false },
];

const generic3Day = [
  { dayLabel: "I morgen", icon: "☀", tempC: 18, label: "Tørt" },
  { dayLabel: "Tirsdag", icon: "☀", tempC: 16, label: "Tørt" },
  { dayLabel: "Onsdag", icon: "🌧", tempC: 12, label: "Vått" },
];

const dryTimeline = [
  { dayLabel: "Tir", icon: "🌧" },
  { dayLabel: "Ons", icon: "☀" },
  { dayLabel: "Tor", icon: "☀" },
  { dayLabel: "Fre", icon: "☀" },
  { dayLabel: "Lør", icon: "☀" },
  { dayLabel: "Søn", icon: "☀" },
  { dayLabel: "I dag", icon: "☀" },
];

const drySevenDays = [
  { dayLabel: "Tir", icon: "☀" },
  { dayLabel: "Ons", icon: "☀" },
  { dayLabel: "Tor", icon: "☀" },
  { dayLabel: "Fre", icon: "☀" },
  { dayLabel: "Lør", icon: "☀" },
  { dayLabel: "Søn", icon: "☀" },
  { dayLabel: "I dag", icon: "☀" },
];

const wetTimeline = [
  { dayLabel: "Tir", icon: "☀" },
  { dayLabel: "Ons", icon: "☀" },
  { dayLabel: "Tor", icon: "☀" },
  { dayLabel: "Fre", icon: "☀" },
  { dayLabel: "Lør", icon: "☀" },
  { dayLabel: "Søn", icon: "🌧" },
  { dayLabel: "I dag", icon: "🌤" },
];

type SeedCrag = {
  id: string;
  slug: string;
  name: string;
  area: string;
  location: LatLng;
  climbingTypes: Crag["climbingTypes"];
  rockType?: Crag["rockType"];
  description?: string;
  routeCount?: number;
  gradeLow?: string;
  gradeHigh?: string;
  approachMinutes?: number;
  parkingNote?: string;
  approachNote?: string;
  exposureNote?: string;
  seasonNote?: string;
  accessNote?: string;
  localClub?: string;
  exposure?: Crag["exposure"];
  dryness?: Crag["dryness"];
  weatherNext3Days?: Crag["weatherNext3Days"];
  drynessTimeline?: Crag["drynessTimeline"];
  routes?: Route[];
  imageId?: Crag["imageId"];
  galleryImageIds?: Crag["galleryImageIds"];
};

const seeds: SeedCrag[] = [
  // Oslo og nære felt — primær brukergruppe
  {
    id: "kolsas",
    slug: "kolsas",
    name: "Kolsås",
    area: "Bærum",
    location: { lat: 59.9168, lng: 10.5375 },
    climbingTypes: ["sport", "trad"],
    rockType: "Gneis",
    description:
      "Oslo og omegns mest tradisjonsrike klippe og Norges eldste klatrefelt. Består av craggene Øvre Sydstup, Østveggen, Nedre Sydstup og Den Skjulte Veggen.",
    routeCount: 120,
    gradeLow: "3",
    gradeHigh: "7c",
    exposure: ["S", "V"],
    approachMinutes: 10,
    parkingNote: "Kolsåstoppen P-plass, plass til 25 biler",
    approachNote: "10 min, lett sti opp fra parkeringen",
    exposureNote: "Sør- og vestvendt, sol fra kl. 10",
    seasonNote: "April – november",
    accessNote: "Fri ferdsel, ingen avgift",
    localClub: "Bærum Klatreklubb",
    dryness: { kind: "dry", days: 4 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
    galleryImageIds: [1, 3, 5, 2, 4, 6],
    imageId: 1,
  },
  {
    id: "sondre-kolsas",
    slug: "sondre-kolsas",
    name: "Søndre Kolsås",
    area: "Bærum",
    location: { lat: 59.9099, lng: 10.5301 },
    climbingTypes: ["sport", "trad"],
    description:
      "Søndre del av Kolsås-massivet, med utsiktspunkt og flere klatreflater i samme område.",
    exposure: ["S"],
    dryness: { kind: "dry", days: 4 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "hauktjern",
    slug: "hauktjern",
    name: "Hauktjern klatrefelt",
    area: "Oslo (Østmarka)",
    location: { lat: 59.8631, lng: 10.7833 },
    climbingTypes: ["sport"],
    rockType: "Gneis",
    description:
      "I Oslos østmark ligger et av Norges mest idylliske områder for klatring. Hauktjern har noe å tilby både svette badere og ivrige redpointere.",
    routeCount: 25,
    gradeLow: "5",
    gradeHigh: "7a",
    exposure: ["V"],
    approachMinutes: 5,
    parkingNote: "Hauktjern P, plass til 12 biler",
    approachNote: "5 min, sti fra parkeringen",
    exposureNote: "Vestvendt, sol etter lunsj",
    seasonNote: "Mai – oktober",
    accessNote: "Fri ferdsel, ingen avgift",
    localClub: "Oslo Klatreklubb",
    dryness: { kind: "dry", days: 2 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "damtjern",
    slug: "damtjern",
    name: "Damtjern klatrefelt",
    area: "Hadeland",
    location: { lat: 60.2543, lng: 10.5821 },
    climbingTypes: ["sport"],
    rockType: "Gneis",
    description:
      "Et av Østlandets mest klassiske klatrefelt. Med over 70 ruter byr klippen på et rikt utvalg av muligheter. Klippen ble utviklet av Osloklatrere fra midten av 80-tallet.",
    routeCount: 70,
    gradeLow: "4",
    gradeHigh: "8a",
    exposure: ["S"],
    approachMinutes: 15,
    parkingNote: "Damtjernvegen, plass til 8 biler",
    approachNote: "15 min, lett sti",
    exposureNote: "Sør-vendt, sol fra kl. 11",
    seasonNote: "Mai – oktober",
    accessNote: "Fri ferdsel, ingen avgift",
    localClub: "Hadeland Klatreklubb",
    dryness: { kind: "dry", days: 4 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
    routes: damtjernRoutes,
    galleryImageIds: [3, 1, 5, 2, 4, 6],
    imageId: 3,
  },
  {
    id: "skadalen",
    slug: "skadalen",
    name: "Skådalen klatrefelt",
    area: "Oslo",
    location: { lat: 59.9636, lng: 10.6582 },
    climbingTypes: ["sport"],
    description:
      "Mellom Bogstadvannet og Maridalsvannet med innkjøring fra Frognerseteren. Skådalen er en av Oslos eldste klatrefelt med 12 klatreruter, hvorav elleve er boltede ruter.",
    routeCount: 12,
    gradeLow: "4",
    gradeHigh: "7a",
    dryness: { kind: "dry", days: 2 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "hellerud",
    slug: "hellerud",
    name: "Hellerud klatrefelt",
    area: "Oslo (Østmarka)",
    location: { lat: 59.9099, lng: 10.8231 },
    climbingTypes: ["sport", "trad"],
    description:
      "På kanten av Østmarka, mellom Tveita og Oppsal, finner du tradisjonell klatring på sva, vertikal og noe overhengende vegg. Det er totalt 36 ruter du kan klatre her.",
    routeCount: 36,
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "skullerud",
    slug: "skullerud",
    name: "Skullerud klatrefelt",
    area: "Oslo",
    location: { lat: 59.876, lng: 10.847 },
    climbingTypes: ["sport"],
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "isdammen",
    slug: "isdammen",
    name: "Isdammen klatrefelt",
    area: "Oslo (Sognsvann)",
    location: { lat: 59.9784, lng: 10.7212 },
    climbingTypes: ["sport"],
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "grefsenkollen",
    slug: "grefsenkollen",
    name: "Grefsenkollen",
    area: "Oslo",
    location: { lat: 59.9568, lng: 10.7948 },
    climbingTypes: ["sport"],
    description:
      "På grunn av mye løs stein er det påbudt med hjelm. Fra Grefsenkollen er det en fantastisk utsikt utover både byen og Oslofjorden.",
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "vardasen",
    slug: "vardasen",
    name: "Vardåsen",
    area: "Asker",
    location: { lat: 59.8459, lng: 10.4607 },
    climbingTypes: ["sport", "trad"],
    rockType: "Granitt",
    description:
      "De renskurte svaene ved Dikemark i Asker er svært populære, og gir slake og ganske lange ruter på fin granitt. Feltet har lange tradisjoner.",
    exposure: ["S"],
    dryness: { kind: "dry", days: 4 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "sorkedalen",
    slug: "sorkedalen",
    name: "Sørkedalen",
    area: "Oslo",
    location: { lat: 59.9745, lng: 10.6263 },
    climbingTypes: ["buldring"],
    rockType: "Gneis",
    routeCount: 90,
    exposure: ["S", "V"],
    approachMinutes: 8,
    parkingNote: "Sørkedalen P, plass til 15 biler",
    approachNote: "8 min fra parkering",
    exposureNote: "Varierte blokker — sol og skygge",
    seasonNote: "April – oktober",
    accessNote: "Fri ferdsel",
    localClub: "Oslo Klatreklubb",
    dryness: { kind: "dry", days: 4 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },

  // Drammen / Lier / Røyken — innenfor 1 t fra Oslo
  {
    id: "gullaug",
    slug: "gullaug",
    name: "Gullaug",
    area: "Lier",
    location: { lat: 59.7431, lng: 10.3009 },
    climbingTypes: ["sport"],
    description:
      "Gullaug ligger rett ovenfor E134 og Drammensfjorden i Lier, og var en populær klippe på 2000-tallet med fine og velsikrede ruter på grad 6–7. Disse ligger i den etablerte venstre del av klippen, hvor det er 30 ruter.",
    routeCount: 30,
    gradeLow: "6",
    gradeHigh: "7",
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "ytre-lahell",
    slug: "ytre-lahell",
    name: "Ytre Lahell",
    area: "Lier",
    location: { lat: 59.7174, lng: 10.3171 },
    climbingTypes: ["sport"],
    description:
      "Ligger fint med sjøen, men har naboutfordringer. Det fineste med Ytre Lahell er beliggenheten ved sjøen som gir fine omgivelser kombinert med endel fine ruter opp til grad 7 og litt over.",
    gradeLow: "5",
    gradeHigh: "7+",
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "hyggen",
    slug: "hyggen",
    name: "Hyggen hovedfelt",
    area: "Røyken",
    location: { lat: 59.7257, lng: 10.3674 },
    climbingTypes: ["sport"],
    description:
      "Fra Hyggen sentrum er det kort vei til en håndfull klipper med nesten 350 ruter. Dette er den nest største konsentrasjonen av ruter fra én parkering eller busstopp i Norge.",
    routeCount: 350,
    dryness: { kind: "dry", days: 4 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "hammern",
    slug: "hammern",
    name: "Hammern klatrefelt",
    area: "Lørenfallet (Sørum)",
    location: { lat: 59.992, lng: 11.144 },
    climbingTypes: ["sport"],
    description:
      "Omtrent en halvtimes kjøretur fra Oslo og rett sør for Lørenfallet sentrum, finner du Hammern. Klatrefeltet byr på 40 ruter, og feltet har utsikt over Norges lengste elv, Glomma. De fleste rutene klatres med bolt.",
    routeCount: 40,
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "hamre",
    slug: "hamre",
    name: "Hamre",
    area: "Kongsberg",
    location: { lat: 59.6919, lng: 9.9021 },
    climbingTypes: ["sport"],
    description:
      "Klippen ble utviklet i 2002 og 2003 i en rivende fart, og byr i dag på et rikt utvalg av i hovedsak boltede ruter på bratt sva. Klippen sliter endel hud, spesielt når det er varmt.",
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },

  // Telemark / Sørlandet
  {
    id: "haegefjell",
    slug: "haegefjell",
    name: "Hægefjell",
    area: "Nissedal, Telemark",
    location: { lat: 58.9842, lng: 8.5167 },
    climbingTypes: ["multipitch", "trad"],
    rockType: "Granitt",
    description:
      "Nissedal og Hægefjell har granitt i verdensklasse, og byr på mye fin klatring på flere taulengder og buldreområder.",
    routeCount: 60,
    gradeLow: "5",
    gradeHigh: "8b+",
    exposure: ["S"],
    approachMinutes: 25,
    parkingNote: "Hægefjell P, plass til 10 biler",
    approachNote: "25 min, slak sti",
    exposureNote: "Sør-vendt, hele dagens sol",
    seasonNote: "Mai – september",
    accessNote: "Fri ferdsel",
    localClub: "Telemark Klatreklubb",
    dryness: { kind: "dry-cap" },
    drynessTimeline: drySevenDays,
    weatherNext3Days: generic3Day,
    galleryImageIds: [6, 2, 4, 1],
    imageId: 6,
  },
  {
    id: "reskjem",
    slug: "reskjem",
    name: "Reskjem",
    area: "Telemark",
    location: { lat: 59.5497, lng: 9.1018 },
    climbingTypes: ["sport"],
    description:
      "Klippen vender mot sør og er for det meste overhengende. Den har blitt et populært valg etter utviklingen på grunn av kvalitetsklatring og en kort ankomstvei. De overhengende rutene kan klatres i lett regn.",
    exposure: ["S"],
    dryness: { kind: "dry-cap" },
    drynessTimeline: drySevenDays,
    weatherNext3Days: generic3Day,
  },
  {
    id: "gygrestolen",
    slug: "gygrestolen",
    name: "Gygrestolen",
    area: "Bø, Telemark",
    location: { lat: 59.4083, lng: 9.0431 },
    climbingTypes: ["multipitch", "trad"],
    description:
      "Et kjent fjell for de som bor i området rundt Bø i Telemark. De to pillarene av fjellblokker, Gamla og Gubben, reiser seg som naturlige fingre.",
    dryness: { kind: "dry", days: 5 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "sjoveggen",
    slug: "sjoveggen",
    name: "Sjøveggen",
    area: "Hankø, Fredrikstad",
    location: { lat: 59.179, lng: 10.821 },
    climbingTypes: ["sport"],
    description:
      "Lavlandsklippe ute på idylliske Hankø på østsiden av Oslofjorden, ikke langt fra Fredrikstad. Ruter i de fleste vanskelighetsgrader, sportsklatring.",
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "sandefjord-2023",
    slug: "sandefjord-2023",
    name: "Lokalt felt (etb. 2023)",
    area: "Vestfold",
    location: { lat: 59.1898, lng: 10.8124 },
    climbingTypes: ["sport"],
    description: "Lokalt felt etablert i 2023.",
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },

  // Vestlandet
  {
    id: "uskedalen",
    slug: "uskedalen",
    name: "Uskedalen",
    area: "Kvinnherad, Vestland",
    location: { lat: 59.964, lng: 5.857 },
    climbingTypes: ["multipitch", "trad", "sport"],
    rockType: "Granitt",
    description:
      "Uskedalen — midtsommernatts drøm. Granitt-paradis med både flerdamers traditional climbing og kortere sportsruter.",
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },
  {
    id: "drangsneset",
    slug: "drangsneset",
    name: "Drangsneset",
    area: "Bjørnafjorden (Os)",
    location: { lat: 60.187, lng: 5.476 },
    climbingTypes: ["sport"],
    rockType: "Granitt",
    description:
      "Klatrefeltet ligger på Drange i Os kommune. Veggen ligger fint til i åpen skog, med sol fra rundt kl. 13. Fjellet er fast og til dels kompakt granitt, med varierte vinkler.",
    exposure: ["V"],
    dryness: { kind: "dry", days: 3 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },

  // Sverige (Bohuslän)
  {
    id: "valserod",
    slug: "valserod",
    name: "Välseröd",
    area: "Bohuslän, Sverige",
    location: { lat: 58.857, lng: 11.345 },
    climbingTypes: ["sport"],
    rockType: "Granitt",
    dryness: { kind: "dry", days: 4 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },

  // Trøndelag
  {
    id: "ishoel",
    slug: "ishoel",
    name: "Ishoel",
    area: "Oppdal",
    location: { lat: 62.594, lng: 9.692 },
    climbingTypes: ["sport"],
    description:
      "Ishoel er klippeklatrefeltet som ble utviklet først i Oppdal, og er også det som blir mest brukt. Området er lett tilgjengelig og tørker raskt opp. Sesongen starter som regel i påska.",
    seasonNote: "Påsken – sen høst",
    dryness: { kind: "dry", days: 4 },
    drynessTimeline: dryTimeline,
    weatherNext3Days: generic3Day,
  },

  // Nordland — fjelltopper / multipitch
  {
    id: "stetind",
    slug: "stetind",
    name: "Stetinden",
    area: "Tysfjord, Nordland",
    location: { lat: 68.1648, lng: 16.5781 },
    climbingTypes: ["alpin", "multipitch"],
    rockType: "Granitt",
    description:
      "Norges nasjonalfjell, lokalisert i Tysfjord i Nordland. Stetind er 1391 meter over havet. Kjente klatreruter er Sydpilaren og normalveien med de ti forbitrede fingertak.",
    dryness: { kind: "unknown" },
    drynessTimeline: [],
    weatherNext3Days: [],
  },
  {
    id: "svolvargeita",
    slug: "svolvaergeita",
    name: "Svolværgeita",
    area: "Svolvær, Lofoten",
    location: { lat: 68.2334, lng: 14.5707 },
    climbingTypes: ["multipitch", "trad"],
    rockType: "Granitt",
    description:
      "Klassisk fjelltopp med to horn — ikoner over Svolvær. Hopp mellom hornene er en tradisjon for de modige.",
    dryness: { kind: "unknown" },
    drynessTimeline: [],
    weatherNext3Days: [],
  },
  {
    id: "hamaroyskaftet",
    slug: "hamaroyskaftet",
    name: "Hamarøyskaftet",
    area: "Hamarøy, Nordland",
    location: { lat: 68.075, lng: 15.582 },
    climbingTypes: ["alpin", "multipitch"],
    rockType: "Granitt",
    dryness: { kind: "unknown" },
    drynessTimeline: [],
    weatherNext3Days: [],
  },

  // Møre og Romsdal — fjelltopper
  {
    id: "romsdalshornet",
    slug: "romsdalshornet",
    name: "Romsdalshornet",
    area: "Romsdalen",
    location: { lat: 62.4536, lng: 7.7708 },
    climbingTypes: ["alpin", "multipitch"],
    description:
      "Klassisk topp i Romsdalen, kjent for flere taulengder og luftige eksponering.",
    dryness: { kind: "unknown" },
    drynessTimeline: [],
    weatherNext3Days: [],
  },
  {
    id: "innerdalstarnet",
    slug: "innerdalstarnet",
    name: "Innerdalstårnet",
    area: "Sunndal",
    location: { lat: 62.7339, lng: 8.7458 },
    climbingTypes: ["alpin", "multipitch"],
    dryness: { kind: "unknown" },
    drynessTimeline: [],
    weatherNext3Days: [],
  },
];

export const fixtureCrags: Crag[] = seeds.map((s, idx) => {
  const imageId = (s.imageId ?? (((idx % 6) + 1) as Crag["imageId"]));
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    area: s.area,
    distanceMinutes: estimateDriveMinutesFromOslo(s.location),
    routeCount: s.routeCount,
    gradeLow: s.gradeLow,
    gradeHigh: s.gradeHigh,
    climbingTypes: s.climbingTypes,
    rockType: s.rockType,
    exposure: s.exposure ?? [],
    approachMinutes: s.approachMinutes,
    parkingNote: s.parkingNote,
    approachNote: s.approachNote,
    exposureNote: s.exposureNote,
    seasonNote: s.seasonNote,
    accessNote: s.accessNote,
    localClub: s.localClub,
    description: s.description,
    dryness: s.dryness ?? { kind: "unknown" },
    weatherNext3Days: s.weatherNext3Days ?? [],
    drynessTimeline: s.drynessTimeline ?? [],
    routes: s.routes ?? [],
    location: s.location,
    imageId,
    galleryImageIds:
      s.galleryImageIds ??
      ([imageId, ((imageId % 6) + 1) as Crag["imageId"]] as Crag["galleryImageIds"]),
  };
});

export const cragsNearby = fixtureCrags
  .filter((c) => c.distanceMinutes <= 90)
  .sort((a, b) => a.distanceMinutes - b.distanceMinutes);

export const cragsThisWeekend = fixtureCrags
  .filter(
    (c) =>
      c.dryness.kind === "dry-cap" ||
      (c.dryness.kind === "dry" && c.dryness.days >= 3),
  )
  .sort((a, b) => a.distanceMinutes - b.distanceMinutes);

export const cragsBouldering = fixtureCrags.filter((c) =>
  c.climbingTypes.includes("buldring"),
);

export function getCragBySlug(slug: string): Crag | undefined {
  return fixtureCrags.find((c) => c.slug === slug);
}
