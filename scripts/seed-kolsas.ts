/**
 * Seeds Kolsås routes — full guidebook data, ~122 routes across 3 sectors.
 * Idempotent: deletes existing Kolsås routes and re-inserts.
 *
 * Data extracted from Klatreføreren (Bærum klatreklubb), pages 158–175.
 *
 * Run with: npm run seed:kolsas
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

type RouteType = Database["public"]["Enums"]["route_type"];

type SeedRoute = {
  name: string;
  grade: string;
  lengthM: number;
  stars?: 1 | 2 | 3;
  type?: RouteType;
  faYear?: number;
  faBy?: string;
  description?: string;
  isClassic?: boolean;
};

type SeedSector = {
  sector: string;
  routes: SeedRoute[];
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

const supabase = createClient<Database>(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const NORWEGIAN_GRADE_NUMERIC: Record<string, number> = {
  "1": 2, "1+": 3,
  "2": 4, "2+": 5,
  "3": 6, "3+": 7,
  "4": 8, "4+": 9,
  "5-": 10, "5": 11, "5+": 12,
  "6-": 13, "6": 14, "6+": 15,
  "7-": 16, "7": 17, "7+": 18,
  "8-": 19, "8": 20, "8+": 21,
  "9-": 22, "9": 23, "9+": 24,
};

function gradeToNumeric(grade: string): number {
  if (grade.includes("/")) {
    const parts = grade.split("/");
    const nums = parts.map((g) => NORWEGIAN_GRADE_NUMERIC[g] ?? 0);
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  }
  return NORWEGIAN_GRADE_NUMERIC[grade] ?? 0;
}

const sectors: SeedSector[] = [
  {
    sector: "Øvre Sydstup",
    routes: [
      { name: "På gråten", grade: "8/8+", lengthM: 15, stars: 2, faYear: 1985, faBy: "Per Rustad (rebolted 2002)", description: "Teknisk og tung diederstemning for hard veggklatring." },
      { name: "Risken fins", grade: "8-", lengthM: 15, stars: 1, faYear: 1985, faBy: "Kalle Jonasson", description: "Går 5 m til høyre for På gråten. Rebolted i 2002." },
      { name: "Knoll", grade: "7-", lengthM: 15, faYear: 1985, faBy: "Morten Søgård", description: "Kort, fingertungt riss etterfulgt av teknisk sva." },
      { name: "Tott", grade: "7", lengthM: 15, faYear: 1985, faBy: "Morten Søgård", description: "Teknisk og tungt dieder og riss. Samme topptaus som Knoll." },
      { name: "Schjelderups hjørne", grade: "3", lengthM: 25, faYear: 1920, faBy: "Ferdinand Schjelderup", description: "Opp renne til sva. Ut til venstre til hjørne og opp på eggen. Travers til venstre til hjørne, opp eggen og topp ut." },
      { name: "Schjelderups kamin", grade: "5-", lengthM: 20, stars: 1, description: "Opp renne til sva. Oppi kaminen og rett opp til topps." },
      { name: "Diagonalen", grade: "2", lengthM: 25, stars: 1, description: "Lett, men i toppen litt utsatt klatring opp skrånende hylle mot venstre." },
      { name: "Elektrodynamikk", grade: "8-", lengthM: 20, faYear: 1988, faBy: "Tor Rustad", description: "Opp kanten på venstre vegg i diederet i Diagonalen direkte. Intens og sjelden klatret rute." },
      { name: "Diagonalen direkte", grade: "5+", lengthM: 20, stars: 2, description: "Opp tydelig innsteg i diederet midt på Diagonalen. Til topp hylle. Herfra også rett opp (6-). 2 limbolter i toppen." },
      { name: "Revkrok", grade: "7+", lengthM: 25, stars: 2, faYear: 1980, faBy: "Ulf Geir Hansen", description: "Opp dieder til høyre for Diagonalen direkte og til venstre for Zappfes trapp." },
      { name: "Håndbak", grade: "7+", lengthM: 25, faYear: 1989, faBy: "Hjørand Justrud", description: "Opp første trinn av diederet på Revkrok, så til høyre og videre til topps." },
      { name: "Zappfes trapp", grade: "5+", lengthM: 40, stars: 2, faBy: "Arne Næss", description: "Tidlig på Diagonalen over sva til nisje. Oppi nisja og videre opp på neste trinn. Mot venstre, opp trappen og til topps." },
      { name: "Manpower", grade: "8-", lengthM: 10, faYear: 1984, faBy: "Marius Morstad", description: "Starter på hylla som utgjør andre trinn på Zappfes trapp. Balansekrevende og hard layback opp en kort vegg over hylla." },
      { name: "Peistaket", grade: "7", lengthM: 25, stars: 3, faYear: 1955, faBy: "Arne Næss (FA), Ulf Geir Hansen 1979 (1. friklatring)", description: "Opp kort, glatt og svakt overhengende dieder til hylle. Herfra rett opp eller til høyre. Fastbolt og munkler.", isClassic: true },
      { name: "Ræder spesial", grade: "6-", lengthM: 25, stars: 3, faYear: 1939, faBy: "Bjørn Ræder 1938/39", description: "Opp til trinn mot venstre til hylle under dieder. Opp på smal hylle og ut på eggen. Rett opp til topps. Seriøs.", isClassic: true },
      { name: "Dødt løp", grade: "6+", lengthM: 25, stars: 1, faYear: 1980, faBy: "Rune Throp Meyer og Dag Kolsrud", description: "Som Ræder spesial til riss. Herfra over sva mot høyre til bratt vegg. Seriøs rute, vanskelig å sikre." },
      { name: "På kanten", grade: "7", lengthM: 25, stars: 1, faYear: 1978, faBy: "Bjørn Myrer Lund", description: "Følg Tørrgranna 5 m svaer til under utsteget. Fra svaet til venstre ut på kanten som følges til topps. Utsatt klatring." },
      { name: "Epilepsi", grade: "7", lengthM: 25, stars: 1, faYear: 1980, faBy: "Dag Kolsrud", description: "Følg Tørrgranna til sva under utsteget. Fra svaet opp kort, bratt og tynt fingerriss i veggen til venstre." },
      { name: "Tørrgrana", grade: "5", lengthM: 30, stars: 2, description: "Opp på skråhylle. Opp dieder til venstre og videre opp sva til diederbunn. Ut på veggen til høyre og opp til topps. 2 limbolter i toppen." },
      { name: "Skrekk-kaminen", grade: "5", lengthM: 20, stars: 1, faYear: 1942, faBy: "Einar Hoff Hansen", description: "Opp svakt mot venstre langs skive/dieder. Videre skrått mot venstre mot hylle og opp til topps. Fin og godt sikret rute." },
      { name: "Bratteggen", grade: "3+", lengthM: 30, faYear: 1904, faBy: "Kristian Tandberg, Ingebrog Tandberg, Henning Tønsberg (16. okt 1904)", description: "Opp eggen mellom Skrekk-kaminen og Eilert Sundts gate. Så opp mot venstre via renne eller blokk til hylle på toppen av Eilert Sundts gate." },
      { name: "Eilert Sundts gate", grade: "5", lengthM: 30, stars: 2, faYear: 1920, faBy: "Alf B. Bryn ca 1920", description: "Enten travers fra høyre langs skive (3+) eller rett opp dieder til kamin (5-). Oppi kaminen og inn på hylle." },
      { name: "Rusk i øyet", grade: "5+", lengthM: 30, faYear: 1975, faBy: "Petter Gaarder", description: "Opp tydelig drag mellom Eilert Sundts gate og Stuevegen. Litt løst og utsatt. 2 limbolter i toppen." },
      { name: "Stuevegen", grade: "5+", lengthM: 30, stars: 1, faYear: 1935, faBy: "Arne Næss (med 2 sikringsbolter)", description: "Opp mot høyre til blokk. Fra blokk opp langs riss til lille hylle. Herfra skrått opp mot venstre. Seriøs." },
      { name: "Skøyer'n direkte", grade: "6", lengthM: 30, stars: 2, faYear: 1973, faBy: "Hans Petter Fernandez", description: "Innsteg som Skøyer'n. Rett opp diederformasjon til hylle som Stuevegen. Rett opp dieder/rissformasjon til hylle. Utsatt og seriøs, miniklier nødvendig." },
      { name: "Skøyer'n", grade: "5+", lengthM: 30, stars: 2, faYear: 1959, faBy: "Bjørn Halvorsen og Werner Dyrli", description: "Opp vegg mot høyre til stor blokk, til høyre og opp riss. Videre langs riss- og kantformasjon mot venstre til hylle." },
      { name: "Titter'n på hjørnet", grade: "6", lengthM: 30, stars: 3, faYear: 1976, faBy: "Arne Næss", description: "Innsteg fra store blokker. Opp til venstre til ustallende, markant liten blokk. Videre opp til hyller til dieder. Rett opp riss. Klassiker.", isClassic: true },
      { name: "Mannen med ljåen", grade: "8-", lengthM: 30, faYear: 1988, faBy: "Bjørn Myrer Lund", description: "Innsteg som Fandens hekletøy, til venstre forbi risset i Fandens hekletøy til små tynne riss. Utsatt og tynt sikret." },
      { name: "Fandens hekletøy", grade: "6+", lengthM: 30, stars: 3, faYear: 1956, faBy: "Arne Næss (FA), Ulf Geir Hansen og Hans Eivind Krabset 1969 (1. friklatring)", description: "Innsteg stor diederformasjon. Opp hjørnet. Rett opp dieder til 6 m. Så til venstre til riss. Rett opp forbi lite takoverheng. Klassiker.", isClassic: true },
      { name: "Borchgrevinks crack", grade: "5", lengthM: 30, stars: 2, faYear: 1956, faBy: "Arne Næss", description: "Innsteg som Fandens hekletøy. Følg diederet til stor hylle og deretter riss til det tar slutt. Bra sikret." },
      { name: "Birkelands renne", grade: "3", lengthM: 30, description: "Opp renne og riss til toppen av pilaren. Opp på små trinn til høyre på sva. Opp svaet mot venstre, bak blokk og videre langs renne til topps." },
      { name: "Gunneng", grade: "4+", lengthM: 30, stars: 1, faYear: 1925, faBy: "Asbjørn Gunneng", description: "Som Hollywood til skive midt på svaet. Herfra riss mot venstre til renne og til topps." },
      { name: "Beverly Hills", grade: "7", lengthM: 30, stars: 1, faYear: 1977, faBy: "Bjørn Myrer Lund", description: "Følg lag 2 av Birkelands renne eller Gunneng. Fortsett opp tynt YS-formet riss i venstre kant av toppen på Storsvaet. Delikat og teknisk klatring." },
      { name: "Sunset Boulevard", grade: "7", lengthM: 30, description: "Følg Hollywood eller Gunneng til litt over halvveis. Opp markant tynt riss til venstre for toppen av Hollywood. Tynt sikret." },
      { name: "Bloodway", grade: "6", lengthM: 30, stars: 1, faYear: 1976, faBy: "Bjørn Myrer Lund", description: "Bratt vegg med markant riss i venstre side av Storsvaet." },
      { name: "Hollywood", grade: "4", lengthM: 30, stars: 3, type: "sport", description: "Oslos fineste? Opp liten renne, hyller og riss til skive midt på Storsvaet. Videre flott riss mot høyre til topps. Veisikret. Topp limbolter.", isClassic: true },
      { name: "Bollywood", grade: "5", lengthM: 25, stars: 2, type: "sport", faYear: 2011, faBy: "Odd Eliassen og Arne Larsen", description: "Et fint, noe vanskeligere alternativ til Hollywood. Starter 5 meter til høyre for Hollywood. Helt selvstendig linje. Veisikret klatring." },
      { name: "Juristen", grade: "3+", lengthM: 15, description: "Fra venstre kant av Gårdsplassen opp venstrelenende riss til høyre for Hollywood." },
      { name: "Navriløs", grade: "3+", lengthM: 10, description: "Opp blokkene fra Gårdsplassen til topps." },
      { name: "Kjøkkentrappa", grade: "5", lengthM: 6, description: "Riss opp til Gårdsplassen." },
      { name: "Fandens i nøtta", grade: "6+", lengthM: 6, description: "Opp riss helt til høyre på veggen ut til Gårdsplassen." },
      { name: "Lohengrim", grade: "6+", lengthM: 30, description: "Einar Hoff Hansens glansnummer. Opp risset mellom plata og veggen.", faBy: "Einar Hoff Hansen" },
    ],
  },
  {
    sector: "Østveggen",
    routes: [
      { name: "Kierulfs skrue", grade: "4", lengthM: 20, stars: 1, faYear: 1941, faBy: "Erling Kierulf og Lars Onsager", description: "2 taulengder. Konglomerathylle og opp til tydelig kamin til venstre." },
      { name: "Onkel Skrue", grade: "4", lengthM: 35, stars: 1, faYear: 1965, faBy: "Ralph Høibakk og Anders Opdal", description: "2 taulengder. Litt takoverheng og opp riss. Følg risset (4+), standplass på hylla. Rundt hjørne til venstre og opp dieder. Direktevariant (5)." },
      { name: "Mamdomsprøven", grade: "7", lengthM: 30, faYear: 1977, faBy: "Bjørn Myrer Lund", description: "2 taulengder. Konglomerathylle og rett opp gjennom overheng på eggen. Dårlig sikret." },
      { name: "Ingums krok", grade: "6", lengthM: 30, stars: 1, faYear: 1978, faBy: "Jan Ingum", description: "Innsteg noen meter til høyre for Mamdomsprøven. Opp mot tydelig lite dieder med takoverheng til høyre for eggen." },
      { name: "Christoffers bomtur", grade: "4", lengthM: 35, faYear: 1992, faBy: "Christoffer Eriksen og Einar Wilhelmsen", description: "2 taulengder. Opp renne/dieder til venstre for Onsager til standplass ved blokk (3). Videre opp dieder til topps." },
      { name: "Onsager", grade: "3+", lengthM: 50, stars: 1, faYear: 1941, faBy: "Lars Onsager og Erling Kierulf", description: "2-3 taulengder. Opp tydelig dieder til hylle. Travers, videre rundt hjørne, opp renne, rett opp til standplass." },
      { name: "Fixe", grade: "4+", lengthM: 30, stars: 1, type: "sport", faYear: 2002, faBy: "Jan Petter Brenfelt", description: "1+2 taulengder. Følger boltelinje som skjærer gjennom Onsager. Veisikret." },
      { name: "Vendepunktet", grade: "6", lengthM: 40, stars: 1, faYear: 1978, faBy: "Dag Kolsrud og Rune Throp Meyer", description: "3 taulengder. Som Onsager til konglomerathylle. Opp gjennom lite overheng til hylle. Travers til venstre rett opp pilar." },
      { name: "Onsager direkte", grade: "5+", lengthM: 40, stars: 1, faBy: "Bjørn Halvorsen og Anders Opdal", description: "2 taulengder. Konglomerathylle opp blokketegg, riss og overheng og opp diederformasjon. Følger deretter Onsager til topps." },
      { name: "Super-Onsager", grade: "6", lengthM: 40, stars: 1, faYear: 1976, faBy: "Ulf Geir Hansen og Olav Nilssen", description: "2 taulengder. Fra dieder topp Onsager direkte på sva til høyre eller eggen mot venstre. Følger deretter Onsager til topps." },
      { name: "18. mai", grade: "6+", lengthM: 40, stars: 1, faYear: 1976, faBy: "Bjørn Halvorsen og Anders Opdal (FA, 5+/A2). 1. friklatring: Ulf Geir Hansen og Bjørn Hundre Olsen 1976", description: "2 taulengder. Opp 15 m diederformasjon. Ut til venstre på lite sva ved diederets slutt. Opp ny variant direkte til høyre for hytta." },
      { name: "Safari", grade: "7+", lengthM: 30, stars: 1, faYear: 2006, faBy: "Dag Kolsrud", description: "Mellom 18. mai og Dickie. Bratt drag opp til venstre overheng, opp svavegg og diederformasjon. 60-meter taug nødvendig." },
      { name: "Dickie", grade: "4+", lengthM: 50, faYear: 1964, faBy: "Bjørn Halvorsen og Jon Joël", description: "2 taulengder. Opp dieder med overheng, så til venstre rundt egg ut på sva, til topps. Vanskelig sikret." },
      { name: "Uro", grade: "7", lengthM: 25, faYear: 1964, description: "2 taulengder. Opp lavt dieder med tak. Travers og dieder. Vanskelig variant." },
      { name: "Kjempepinakkelen", grade: "6", lengthM: 40, faYear: 1939, faBy: "Bass Walther og Conrad Croepelien 1938/39", description: "2 taulengder. Opp på kjempepinakkelens forside. Opp svakt mot venstre kant av kjempepinakkelens forside, videre opp til snufeste over toppen. Eget snufeste." },
      { name: "Slutsprut", grade: "7", lengthM: 20, faYear: 2008, faBy: "Dag Kolsrud", description: "Vedvarende klatring opp pilar mellom Andersrisset og Jonathan til snufeste." },
      { name: "Faltos", grade: "7", lengthM: 20, faYear: 2008, faBy: "Bjørn Myrer Lund", description: "Eget snufeste, ikke helt fast fjell." },
      { name: "Kneby", grade: "7+", lengthM: 40, faYear: 1968, faBy: "Anders Opdal og Bjørn Halvorsen (6/A3); originalt: Kjempetaket, venstre variant", description: "2 taulengder. Innsteg som Bugges vrede. Videre opp riss/dieder med takoverheng til topps." },
      { name: "Oppned", grade: "8", lengthM: 40, faYear: 1985, faBy: "Harald Eriksen, Ivar Walaas og Hans-Eivind Krabset 1968 (6/A2; originalt: Kjempetaket). 1. friklatring: Marius Morstad 1985", description: "2 taulengder. Opp risskanten over takoverheng til topps." },
      { name: "Bugges vrede", grade: "6", lengthM: 40, faYear: 1965, faBy: "Per Tegland, Johan Helle, Harald Eriksen og Hans-Eivind Krabset", description: "2 taulengder. Opp pilaten på utsiden, og videre til topps." },
      { name: "Oldi-boldi", grade: "6", lengthM: 40, faYear: 1978, faBy: "Ulf Geir Hansen og Jon Ingum", description: "2 taulengder. Innsteg på pilar med kjempetakene. Opp noen meter, så til venstre, hjørne og opp og opp til topps." },
      { name: "Med glede", grade: "7", lengthM: 30, faYear: 1978, faBy: "Dag Kolsrud og Jon Ingum", description: "Opp pilen til høyre på snufeste. Snufeste er lokalisert i grop. Videre gjennom toppen til topps." },
      { name: "Andersrisset", grade: "4+", lengthM: 40, stars: 1, faYear: 1962, faBy: "Anders Opdal og Odd Eliassen", description: "1-2 taulengder. Opp riss. Standplass på hylle. Rett opp dieder/rissformasjon til hylle. Følger dieder som følges til topps." },
      { name: "Kasper", grade: "7", lengthM: 20, stars: 1, faYear: 2006, faBy: "Dag Kolsrud", description: "Kanten mellom Andersrisset og Jonathan til snufeste." },
      { name: "Kasper med forlengelse", grade: "7", lengthM: 40, faYear: 2006, faBy: "Dag Kolsrud", description: "Fortsett videre fra snufestet på Kasper opp pilen." },
      { name: "Jonathan", grade: "4+", lengthM: 40, faYear: 1965, faBy: "Bjørn Halvorsen, Odd Eliassen og Ole Daniel Enersen", description: "2 taulengder. Stigende travers fra høyre eller venstre til lett ute på eggen. Opp riss til topp hylle, rett opp." },
      { name: "Jesper", grade: "7", lengthM: 20, faYear: 2006, faBy: "Dag Kolsrud", description: "Pilarvegg til høyre for Jonathan, opp til snufeste." },
      { name: "Jesper med forlengelse", grade: "7", lengthM: 40, faYear: 2006, faBy: "Dag Kolsrud", description: "Fortsett forbi snufestet og opp den naturlig sikrede toppdelen, en av Jonathan." },
      { name: "Melomrisset", grade: "5+", lengthM: 50, faYear: 1973, faBy: "Hans Petter Fernandez", description: "Opp dieder, til høyre på liten hylle og rundt på venstre side av blokk og opp veggen og kort til topps." },
      { name: "LeLala", grade: "6", lengthM: 50, faYear: 1978, faBy: "Jon Ingum", description: "2 taulengder. Opp tydelig dieder. Innsteg, hjørne, opp eller venstre dieder til topps." },
      { name: "Banarisset", grade: "5+", lengthM: 50, faYear: 1965, faBy: "Ralph Høibakk og Anders Opdal", description: "2 taulengder. Opp til høyre og opp riss til hylle." },
      { name: "Eseljofan", grade: "4", lengthM: 50, faYear: 1969, faBy: "Bjørn Halvorsen og Jan Mila", description: "2 taulengder. Opp tydelig dieder bunnt på blokken med innehjørne. Rett opp." },
      { name: "Via Imomminata", grade: "6", lengthM: 60, stars: 1, faYear: 1965, faBy: "Odd Eliassen, Ole Daniel Enersen og Jon Voll", description: "2 taulengder. Innsteg som Banarisset. Videre opp til ut på eggen. Lett opp." },
      { name: "Lyskaster'n", grade: "7", lengthM: 60, stars: 1, faYear: 1977, faBy: "Ulf Geir Hansen og Bjørn Myrer Lund", description: "2 taulengder. Lange taulengder. Vrient sikret." },
      { name: "Keobs", grade: "7", lengthM: 50, faYear: 1988, faBy: "Ulf Geir Hansen", description: "2 taulengder. Førsteklatring som Citadell." },
      { name: "Citadell", grade: "5+", lengthM: 80, faYear: 1939, faBy: "Bass Walther og Conrad Croepelien 1938/39", description: "3 taulengder. Opp markant riss til høyne, til høyre på sva til hylle. Travers, lett opp grøtte. Klassikker.", isClassic: true },
      { name: "Ørneredet", grade: "6", lengthM: 60, faYear: 1976, faBy: "Ulf Geir Hansen", description: "Følg dieder, opp pilar mot venstre, gjennom siste taulengde av Citadell." },
      { name: "Ørneredet 2", grade: "5+", lengthM: 60, description: "Friklatring: Ulf Geir Hansen og Jon Brudeland 1980-tall. Som Citadell til standplass på Rotehylla." },
      { name: "Lett-harry", grade: "6", lengthM: 80, faYear: 1961, faBy: "Ralph Høibakk, Anders Opdal og Per Vigersrod", description: "2 taulengder. Standplass på Rotehylla. Forsett opp dieder til snufeste." },
      { name: "Superhuede", grade: "5", lengthM: 70, faYear: 1968, faBy: "Odd Eliassen og Ole Daniel Enersen", description: "2 taulengder. Som Lett-harry til topp på første lengde. Følg risset til standplass." },
      { name: "Myrer Lunds paradis", grade: "8", lengthM: 60, faYear: 1988, faBy: "Bjørn Myrer Lund", description: "Opp lite vegg/sprekk i topp dele av veggen. Fri fastbolt, miniklier. En flott, men sjelden klatret topptau." },
      { name: "Veien til Mekka", grade: "6+", lengthM: 55, stars: 1, faYear: 1975, faBy: "Ulf Geir Hansen og Olav Nilsen", description: "2 taulengder. Som Veien til Mekka forbi overheng (3+/A1) til Rotehylla. Videre opp tydelig riss/formasjon mot venstre." },
      { name: "Trygg trafikk", grade: "7", lengthM: 60, faYear: 2008, faBy: "Dag Kolsrud", description: "Opp tydelig egg på imboltet i sin tid. Følg håndtaversering på (kamikler), videre svakt mot venstre. Etter den 1. taulengden, gjennom mellomforeningen." },
      { name: "Lykkepillen", grade: "8", lengthM: 25, stars: 1, faYear: 2008, faBy: "Dag Kolsrud og Bjørn Myrer Lund", description: "Opp imboltet vegg gjennom liten overheng på Trygg trafikk på 8 meter. Lang vedvarende. Krever klatring med god rytme." },
      { name: "Psykiske lindringer", grade: "7", lengthM: 25, stars: 1, description: "Eta strå rebolket høyrepiler (4+/4) av Skygesvaet. Opp gjennom dieder/dieder, opp dieder, opp og opp." },
      { name: "Bipolar", grade: "7+", lengthM: 30, faYear: 2008, faBy: "Dag Kolsrud og Bjørn Myrer Lund", description: "Krevende klatring med flere kjempetake. Opp første taulengde av Bipolar gjennom mellomforeningen direkt." },
      { name: "Nervøst sammenbrudd", grade: "6+", lengthM: 15, stars: 1, faYear: 1977, faBy: "Bjørn Myrer Lund", description: "Fra svahylla under Citadell-traverset, til ven i taulengden, og opp gjennom overheng over riss." },
      { name: "Ingenting", grade: "8", lengthM: 15, faYear: 1985, faBy: "Leif Inge Magnussen, Tor Rustad og Leif Henriksen", description: "Sva til finger-traverser sin Citadell vendsetraktren av kjempemarn. Opp dieder fra Cituadell-svaet." },
      { name: "El Cavallero", grade: "5+", lengthM: 60, stars: 1, faYear: 1965, faBy: "Ralph Høibakk, Anders Opdal og Hans-Eivind Krabset", description: "3 taulengder. Fra spiss skive opp på eggen og inn på Kjempetaket. Opp pyrgrund opp pilarens taulengder ut og opp pilen." },
      { name: "Rettopp", grade: "7", lengthM: 50, stars: 1, faYear: 2008, faBy: "Dag Kolsrud", description: "2 taulengder. Opp tydelig dieder rett opp gjennom overhengende dieder til hylle, opp diederet og videre rett opp." },
      { name: "Venstre rom", grade: "7", lengthM: 60, description: "2 taulengder. Som Garn og gå ved av Rettopp. Følg dette opp til veggen og dieder rett opp og bipolar over takoverhenget. Las og dårlig sikret." },
      { name: "Gamp og gå", grade: "6+", lengthM: 50, faYear: 1975, faBy: "Ulf Geir Hansen", description: "1+2 taulengder. Opp riset og opp i diederkamin under overheng (6-/A1). Opp riset og opp i diederkamin under overheng. Hård. Sterke kamikler nødvendig." },
      { name: "Bråstopp", grade: "6", lengthM: 20, description: "Opp svaet til Bråstopp. Følger første taulengde av Bråstopp på sva." },
      { name: "Pippis pilar", grade: "7", lengthM: 15, faYear: 2002, faBy: "Per Bugge-Næss", description: "5 borebolter. Som Majonesen 4-5 m med mulighet for naturlig sikring i noe lest fjell." },
      { name: "Majonesen", grade: "5", lengthM: 40, faYear: 1965, faBy: "Bjørn Halvorsen, Thordmar Eggen og Odd Eliassen", description: "2 taulengder. Opp på sva til pilar mellom Majonesen og Kaviaren. 2 taulengder. Følges til standplass til pilarbode." },
      { name: "Remuladen", grade: "5", lengthM: 40, faYear: 1968, faBy: "Bjørn Halvorsen og Ola Hanche-Olsen", description: "2 taulengder. Opp blokken på utsiden av Eggen og opp riss formasjoner mot Kaviaren. Sa travers til venstre på (3-4)." },
      { name: "Kaviaren", grade: "3", lengthM: 40, faYear: 1967, faBy: "Bjørn Halvorsen og Odd Eliassen", description: "2 taulengder. Opp lange ryggstige opp risformasjoner mot venstre. Til høyre til sva. Til høyre over pilen og opp." },
    ],
  },
  {
    sector: "Kjempesvapartiet",
    routes: [
      { name: "Solsiden", grade: "5+", lengthM: 15, faYear: 1982, faBy: "Dag Kolsrud", description: "Mikrute siden 2006, da 2 borebolter ble plassert. Fra venstre kant av hylle under Kjempesvaet. Opp markant dieder med layback-riss på venstre side av Kjempesvaet." },
      { name: "Kjempesvaet", grade: "4", lengthM: 20, description: "Fra startesvaet midt i veggen til høyre opp på trappeformasjon til tynt riss. Rett opp til hylle. Hvorpå noen meter høyre på sva til skive. Til venstre opp på dieder og opp på neste blokk og lett til topps." },
      { name: "Sandwich", grade: "6+", lengthM: 15, faYear: 1985, faBy: "Dag Kolsrud", description: "Mellomvariant. Fra svaet kant av blokk til pilar mellom Kjempesvaet, til venstre eller bak til topps." },
      { name: "Non Stop", grade: "8", lengthM: 15, faYear: 1983, faBy: "Tor Rustad", description: "Fra Rotehylla rett opp midt på sandwich. Tynn og teknisk klatring." },
      { name: "Bolterisset", grade: "6", lengthM: 15, faYear: 1969, faBy: "Arne Næss og Henning Tønsberg 1935/36 (A2). 1. friklatring: Ulf Geir Hansen og Hans Eivind Krabset 1969", description: "Vedvarende klatring opp dobbeltpinakkelens forside. Tre staulenger." },
      { name: "Perler på snor", grade: "7+", lengthM: 15, faYear: 1986, faBy: "Dag Kolsrud", description: "Fra venstre kant av hyllen under Hoff Hansen og Perler på snor." },
      { name: "Hoff Hansen", grade: "8", lengthM: 15, faYear: 1987, faBy: "Marius Morstad", description: "Direktevariant av Perler på snor, forbi en ringbolt. Tynn og teknisk klatring." },
      { name: "Villskudd", grade: "7+", lengthM: 15, stars: 2, faYear: 1980, faBy: "Finn Daehli", description: "Vendepunkt til venstre til hjørne og opp på eggen. Rett opp på eggen, opp egen og topp ut. Sparsomt sikret. Norges første 7+." },
      { name: "Dra til Moss", grade: "7", lengthM: 15, stars: 1, faYear: 2002, faBy: "Øyvind Moss", description: "2 taulengder. Følger boltelinje som skjærer gjennom Onsager. Veisikret." },
      { name: "Tresteg", grade: "6", lengthM: 15, stars: 1, faYear: 1976, faBy: "Ralph Høibakk og Arne Næss 1961. 1. friklatring: Ulf Geir Hansen og Bjørn Myrer Lund 1976", description: "Følg Hollywood og/eller Gunneng til litt over halvveis. Opp markant tynt riss til venstre for toppen av Hollywood." },
      { name: "Skyggesvaet", grade: "4+", lengthM: 50, stars: 1, description: "Oslos fineste? Opp liten renne, hyller og riss til skive midt på Skyggesvaet. Videre flott riss mot høyre til topps. Veisikret. Stoppe limbolter i toppen." },
      { name: "Finn", grade: "7", lengthM: 20, faYear: 2010, faBy: "Dag Kolsrud", description: "Første kjente bestigning: Odd Eliassen og Arne Larsen 2011. Et fint, noe vanskeligere alternativ til Skyggesvaet." },
      { name: "Skyggesvaet variant A", grade: "5", lengthM: 20, faYear: 1971, faBy: "Ulf Geir Hansen", description: "Start på baksiden av dobbeltpinakkelen, til høyre kant av rotehyllene gjennom toppdelen, gjennom mellomforeningen. Lettere opp til hylla mot venstre. Klassikker." },
      { name: "Skyggesvaet variant B", grade: "5+", lengthM: 20, faYear: 1972, faBy: "Ulf Geir Hansen og Hans Petter Fernandez", description: "Start til høyre for variant A. Opp lett rotete og løst parti til begynnelsen av Skyggesvaet og gjennom takoverhenget og opp i skiven av Skyggesvaet." },
      { name: "Gro Harlem Brundtlands riss", grade: "5", lengthM: 20, faYear: 1977, faBy: "Jon Ingum", description: "Opp grunne kamin på venstre side av Skyggepilarens nedre del." },
      { name: "Skyggegjelet", grade: "4", lengthM: 50, faBy: "Trolig Einar Hoff Hansen 1942", description: "3 taulengder. Inn i hjørne, opp til stand. Opp 30 m mot vestre dieder og opp riss til standplass på hylla." },
      { name: "Skyggepilaren", grade: "5", lengthM: 40, stars: 2, faYear: 1978, faBy: "Dag Kolsrud", description: "2 taulengder. Opp lave hyller og rissformasjon til venstre. Opp Skyggepilaren. Klassikker.", isClassic: true },
      { name: "Sidesporet", grade: "5", lengthM: 40, faYear: 1978, faBy: "Dag Kolsrud", description: "2 taulengder. Fra standplass på Skyggepilaren rett opp dieder formasjonen til topps." },
      { name: "Silkefronten", grade: "5+", lengthM: 40, faYear: 1978, faBy: "Jon Ingum", description: "2 taulengder. Fra standplass på Skyggepilaren til høyre på sva og dieder. Inn på Skyggepilaren." },
      { name: "Watergate", grade: "6", lengthM: 40, faYear: 1978, faBy: "Marius Morstad", description: "Opp løs vegg under Skyggegjelet. Forbi flere fastbolter til overheng og gjennom dette på Skyggegjelet og opp dette. Løst og dårlig sikret." },
      { name: "Ursus", grade: "6+", lengthM: 50, faYear: 1975, faBy: "Bjørn Halvorsen og Hans-Eivind Krabset 1966 (6+/A). 1. friklatring: Ulf Geir Hansen og Marius Morstad 1975", description: "2 taulengder. Opp vegg under Skyggegjelet. Forbi flere fastbolter til ovenheng og dette på Skyggegjelet og fjernes. Litt løst og dårlig sikret." },
      { name: "Elvegris", grade: "5+", lengthM: 50, faYear: 1979, faBy: "Marius Morstad", description: "2 taulengder. Opp på venstre side av pilaren mellom Ursus og Aku-aku. Diagonal travers rundt hjørnet til høyre til riss. Opp riset til topps." },
      { name: "Aku Aku", grade: "5", lengthM: 40, faYear: 1968, faBy: "Bjørn Halvorsen og Anders Opdal", description: "Innsteg ved stor diederformasjon ved tre. Opp sikksakk-dieder til bunn av bratt vegg med layback-riss. Opp risset. Videre opp dieder til topps." },
    ],
  },
];

async function seedKolsas() {
  console.log("Updating Kolsås crag data…");
  const { error: cragError } = await supabase
    .from("crags")
    .update({
      location: `SRID=4326;POINT(10.52054 59.91223)`,
      route_count: 122,
      grade_low: "2",
      grade_high: "8+",
      approach_minutes: 30,
      parking_note: "Parkering ved Kolsåshytta. GPS 59.91223, 10.52054.",
      approach_note: "30 min sti opp til Øvre Sydstup og Østveggen.",
      exposure_note: "Sør- og vestvendt. Sol 8–21 om sommeren.",
      season_note: "April – november",
      access_note: "Fri ferdsel, ingen avgift",
      local_club: "Kolsås IF Klatregruppe (KIF)",
      description:
        "Oslo og omegns mest tradisjonsrike klippe og Norges eldste klatrefelt, med klatring tilbake til 1904. Tre hoveddeler: Øvre Sydstup (42 ruter, sport-rebolted og trad), Østveggen (lange flerlengders trad opp basaltveggen, 50+ ruter) og Kjempesvapartiet (kortere ruter på sva, 30 ruter).",
    })
    .eq("slug", "kolsas");
  if (cragError) throw new Error(`crag update: ${cragError.message}`);

  console.log("Deleting existing Kolsås routes…");
  const { error: deleteError } = await supabase
    .from("routes")
    .delete()
    .eq("crag_slug", "kolsas");
  if (deleteError) throw new Error(`delete routes: ${deleteError.message}`);

  let totalInserted = 0;
  for (const { sector, routes } of sectors) {
    const rows = routes.map((r, idx) => ({
      crag_slug: "kolsas",
      sector,
      name: r.name,
      grade: r.grade,
      grade_numeric: gradeToNumeric(r.grade),
      length_m: r.lengthM,
      stars: r.stars ?? 0,
      type: r.type ?? ("trad" as RouteType),
      ascents: 0,
      is_classic: r.isClassic ?? (r.stars === 3),
      display_order: idx,
      fa_year: r.faYear ?? null,
      fa_by: r.faBy ?? null,
      description: r.description ?? null,
    }));
    const { error: insertError } = await supabase.from("routes").insert(rows);
    if (insertError) throw new Error(`insert ${sector}: ${insertError.message}`);
    console.log(`  ✓ ${sector}: ${rows.length} ruter`);
    totalInserted += rows.length;
  }
  console.log(`\nDone. ${totalInserted} ruter på Kolsås.`);
}

seedKolsas().catch((err) => {
  console.error(err);
  process.exit(1);
});
