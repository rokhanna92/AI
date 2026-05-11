export type ThemeKey = "white" | "yellow" | "green";

export interface ThemeConfig {
  pageBg: string;
  pagePattern: string;
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cardInnerGlow: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  accent: string;
  accentDim: string;
  accentDimmer: string;
  accentBg: string;
  accentBorder: string;
  highlight: string;
  highlightDim: string;
  highlightBg: string;
  highlightBorder: string;
  stepActive: string;
  stepDone: string;
  stepInactive: string;
  stepActiveBg: string;
  stepDoneBg: string;
  inputText: string;
  inputBorder: string;
  inputFocusBorder: string;
  inputFocusShadow: string;
  inputHint: string;
  tableHeaderText: string;
  tableRowBorder: string;
  tableCellText: string;
  tableNumText: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  btnPrimaryBorder: string;
  btnPrimaryHoverBg: string;
  btnSecondaryText: string;
  btnSecondaryBorder: string;
  btnSecondaryHoverBg: string;
  path1Border: string;
  path1HoverBorder: string;
  path1HoverShadow: string;
  path1Glow: string;
  path1GlowLine: string;
  path2Border: string;
  path2HoverBorder: string;
  path2HoverShadow: string;
  path2Glow: string;
  path3Border: string;
  path3HoverBorder: string;
  path3HoverShadow: string;
  path3Glow: string;
  breadcrumbBg: string;
  breadcrumbBorder: string;
  breadcrumbNumBg: string;
  breadcrumbNumBorder: string;
  breadcrumbNumText: string;
  breadcrumbMuted: string;
  breadcrumbBackText: string;
  breadcrumbBackBorder: string;
  blob1: string;
  blob2: string;
  blob3: string;
  selectOptionBg: string;
  sectionHeaderBorder: string;
  sectionIconBg: string;
  sectionIconBorder: string;
  sectionIconColor: string;
  sectionTitleColor: string;
  sectionTableChipBg: string;
  sectionTableChipBorder: string;
  sectionTableChipText: string;
  liveBadgeBg: string;
  liveBadgeBorder: string;
  liveBadgeLabel: string;
  liveBadgeValue: string;
  liveBadgeHiBg: string;
  liveBadgeHiBorder: string;
  liveBadgeHiShadow: string;
  liveBadgeHiLabel: string;
  liveBadgeHiValue: string;
  liveBadgeHiGlow: string;
  wizardNavBorder: string;
  statPositiveBg: string;
  statNegativeBg: string;
  statMutedText: string;
  logoAccentText: string;
  logoVersionText: string;
  logoIconBg: string;
  logoIconBorder: string;
  headerAccentBar: string;
  headerBorder: string;
  headerStatusColor: string;
  footerText: string;
  heroLabel: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitle3: string;
  themeSwitcherBg: string;
  themeSwitcherBorder: string;
  themeSwitcherActiveBg: string;
  themeSwitcherActiveText: string;
  themeSwitcherInactiveText: string;
  addRowText: string;
  addRowBorder: string;
  addRowHoverText: string;
  addRowHoverBorder: string;
  addRowHoverBg: string;
  narrativeBg: string;
  narrativeBorder: string;
  narrativeText: string;
  financeLineText: string;
  financeLineBorder: string;
}

export type PathId = "home" | "path1" | "path2" | "path3";

export interface GlobalProfile {
  gazdinstvoName: string;
  nosilac: string;
  jmbgMb: string;
  bpg: string;
  adresa: string;
  opstina: string;
  telefon: string;
  email: string;
  racun: string;
  banka: string;
}

// Path 1 sub-types

export interface KulturaProizvodnja {
  id: string;
  naziv: string;
  povrsina_ha: number;
}

export interface OsnovnoSredstvo {
  id: string;
  naziv: string;
  kolicina: number;
  cenaSaPDV: number;
}

export interface ProizvodPrihod {
  id: string;
  naziv: string;
  jedinicaMere: string;
  prodajnaCena: number;
  kolicinePoGodini: [number, number, number, number, number];
}

export interface AmortizacijaStavka {
  id: string;
  naziv: string;
  nabavnaVrednost: number;
  stopaAmortizacije: number;
}

// Tabela 1.1 — Cover page info (appears on PDF page 1)
export interface Tabela11Info {
  naziv: string;       // Plan title shown on PDF cover
  investitor: string;  // Responsible person shown on PDF cover
  lokacija: string;    // City/town shown on PDF cover (no street)
}

// Tabela 2.1 — Basic entity data
export interface Tabela21Info {
  imeNaziv: string;
  sediste: string;          // Ulica i broj
  mesto: string;
  pib: string;
  maticniBroj: string;
  sifraDelatnosti: string;  // Šifra delatnosti u APR
  telefon: string;
  email: string;
}

// Tabela 2.2 — Agricultural holding registration
export interface Tabela22Info {
  adresaGazdinstva: string;
  bpg: string;
  datumRegistracije: string;
  brojZaposlenih: number;
}

// Tabela 2.3 — Land ownership structure (m²)
export interface Tabela23Info {
  vlasnistvo_m2: number;
  zakup_m2: number;
  ustupljeno_m2: number;
}

export interface Path1State {
  // Step 0 — Naslovna (PDF cover)
  tabela11: Tabela11Info;
  // Step 1 — Entity & farm data (Tab 2.1–2.3)
  tabela21: Tabela21Info;
  tabela22: Tabela22Info;
  tabela23: Tabela23Info;
  // Step 2 — Trenutna proizvodnja
  kulture: KulturaProizvodnja[];
  opisAktivnosti: string;
  // Step 3 — Investicioni podaci (Tab 4.3 + 4.4)
  namenaInvesticije: string;
  pocetakInvesticije: string;   // "MM/YYYY"
  zavrsetakInvesticije: string; // "MM/YYYY"
  ekonomskiVek: number;         // years
  osnSredstva: OsnovnoSredstvo[];
  sopstvenaProcenat: number;    // 0–100
  // Step 4 — Plan prihoda (Tab 8.1)
  proizvodi: ProizvodPrihod[];
  // Step 5 — Struktura troškova (Tab 8.2.1–8.2.6)
  trosak_sirovine: number;
  trosak_ambalaza: number;
  trosak_ostaliMat: number;
  trosak_struja: number;
  trosak_voda: number;
  trosak_ostalaEn: number;
  trosak_odrzavanje: number;
  trosak_ostaleUsl: number;
  amortizacija: AmortizacijaStavka[];
  radnaSnaga_broj: number;
  radnaSnaga_godisnjiTrosak: number;
  trosak_banka: number;
  trosak_osiguranje: number;
  trosak_ostaliNemat: number;
}

// Cost row for 8.2.1–8.2.3, 8.2.5–8.2.6: named item with 5-year values
export interface CostRowP2 {
  id: string;
  naziv: string;
  poGodinama: [number, number, number, number, number];
}

// Fixed asset row for table 4.3
export interface OsnovnoSredstvoP2 {
  id: string;
  naziv: string;
  kolicina: number;
  cenaSaPDV: number;
}

// Amortization row for table 8.2.4
export interface AmortizacijaRowP2 {
  id: string;
  naziv: string;
  nabavnaVrednost: number;
  stopaAmortizacije: number; // %
}

// Risk row for table 10.1
export interface RizikRow {
  id: string;
  vrsta: string;
  mera: string;
}

export interface Path2State {
  // Step 0 — Наслов + Резиме meta
  nazivPlana: string;
  investitor: string;    // Ime i prezime (cover + 2.1)
  lokacija: string;
  godina: string;
  namenaInvesticije: string;
  pocetakInvesticije: string;
  zavrsetakInvesticije: string;
  ekonomskiVek: string;
  trzisteProdaje: string;
  angRaSnage: string;    // 5.5 free text
  sopstvenoUcescePct: number; // % for financing split

  // Step 1 — Section 2: Газдинство
  adresaNosioca: string;
  mestoNosioca: string;
  jmbg: string;
  telefon: string;
  email: string;
  bpg: string;
  datumRegistracije: string;
  vlasnistvo_ha: number;
  zakup_ha: number;
  opisDelatnosti: string;
  // 2.5 Земљиште (ha)
  zem_oranice: number;
  zem_livade: number;
  zem_pasnjaci: number;
  zem_vocnjaci: number;
  zem_vinogradi: number;
  zem_sume: number;
  // 2.5 Објекти (m²)
  obj_kuca: number;
  obj_staja: number;
  obj_zivinjarnik: number;
  obj_silos: number;
  obj_ambar: number;
  obj_garaza: number;
  // 2.5 Механизација (kom)
  meh_traktor: number;
  meh_kombajn: number;
  meh_plug: number;
  meh_tanjiraca: number;
  meh_drljaca: number;
  meh_setoSpremac: number;
  meh_sejalica: number;
  meh_kultivator: number;
  meh_rasipacMin: number;
  meh_rasipacStaj: number;
  meh_prskAlica: number;
  meh_beracKukuruza: number;
  meh_prikolica: number;
  // 2.5 Сточни фонд (kom)
  stoc_krave: number;
  stoc_svinje: number;
  stoc_ovce: number;
  stoc_koze: number;
  stoc_zivina: number;
  stoc_konji: number;
  stoc_kunici: number;
  stoc_kosnice: number;

  // Step 2 — Sections 3, 5, 6, 7: Descriptions + effects
  opisProizvodnog: string;
  opisProsirenjaPrograma: string;
  opisTrzisteNabavke: string;
  opisTrzisteProadaje: string;
  opisRadneSnage: string;
  opisDistribucije: string;
  efektProsirenjeAsortimana: boolean;
  efektNoviProizvod: boolean;
  efektUnapredjenje: boolean;
  efektPovecZaposlenosti: boolean;
  efektPovecPrihoda: boolean;

  // Step 3 — Section 4: Инвестиција
  predmetCiljInvesticije: string;
  unetaOsnovnaI: number;     // Table 4.2: existing fixed assets
  unetaObratnaI: number;     // Table 4.2: existing working capital
  osnSredstvaP2: OsnovnoSredstvoP2[]; // Table 4.3 new fixed assets
  obrtnaInvesticija: number; // New working capital investment
  tudjIzvoriOpis: string;    // Table 4.4 credit description
  tudjIzvoriIznos: number;   // Table 4.4 credit amount

  // Step 4 — Section 8.1: Приходи
  proizvodi: ProizvodPrihod[];

  // Step 5 — Section 8.2: Трошкови (all with per-year values)
  direktanMaterijal: CostRowP2[];   // 8.2.1
  komunalni: CostRowP2[];            // 8.2.2
  usluge: CostRowP2[];               // 8.2.3
  amortizacija: AmortizacijaRowP2[]; // 8.2.4
  radnaSnaga: CostRowP2[];           // 8.2.5
  nematerijalni: CostRowP2[];        // 8.2.6

  // Step 6 — Section 10+11: Ризици + Закључак
  rizici: RizikRow[];
  zakljucak: string;
}

export interface ProizvodP3 {
  id: string;
  naziv: string;
  jm: string;
  poGodinama: [
    { cena: number; kolicina: number },
    { cena: number; kolicina: number },
    { cena: number; kolicina: number },
    { cena: number; kolicina: number },
    { cena: number; kolicina: number },
  ];
}

export interface OsnovnoSredstvoP3 {
  id: string;
  naziv: string;
  kolicina: number;
  cenaSaPDV: number;
}

export interface Path3State {
  // Cover + Rezime meta
  investitor: string;
  nazivPlana: string;
  lokacija: string;
  godina: string;
  namenaInvesticije: string;
  pocetakInvesticije: string;
  zavrsetakInvesticije: string;
  ekonomskiVek: string;
  trzisteProdaje: string;
  angRaSnage: string;
  sopstvenoUcescePct: number;
  // 1.1 Farm registration (11 rows)
  ulicaBroj: string;
  mesto: string;
  jmbgMb: string;
  telefon: string;
  email: string;
  bpg: string;
  datumRegistracije: string;
  primarnaDelatnost: string;
  sekundarnaDelatnost: string;
  brojUposlenih: string;
  // 1.2 Irrigation location
  katOpstina: string;
  katParcele: string;
  povrsina_ha: number;
  lokVlasnistvo_ha: number;
  lokZakup_ha: number;
  // 1.3 Land ownership
  vlasnistvo_ha: number;
  zakup_ha: number;
  // 1.4 Activity
  opisDelatnosti: string;
  // 1.5 Existing assets
  zem_oranice: number; zem_livade: number; zem_pasnjaci: number;
  zem_vocnjaci: number; zem_vinogradi: number; zem_sume: number;
  obj_kuca: number; obj_staja: number; obj_zivinjarnik: number;
  obj_silos: number; obj_ambar: number; obj_garaza: number;
  meh_traktor: number; meh_kombajn: number; meh_plug: number;
  meh_tanjiraca: number; meh_drljaca: number; meh_setoSpremac: number;
  meh_sejalica: number; meh_kultivator: number;
  meh_rasipacMin: number; meh_rasipacStaj: number; meh_prskAlica: number;
  meh_beracKukuruza: number; meh_prikolica: number;
  stoc_krave: number; stoc_svinje: number; stoc_ovce: number;
  stoc_koze: number; stoc_zivina: number; stoc_konji: number;
  stoc_kunici: number; stoc_kosnice: number;
  // Section 2
  trzisteProdajeTekst: string;
  trzisteSnabdevanjaTekst: string;
  // Section 3
  opisPoslovneIdeje: string;
  unetaOsnovnaI: number;
  unetaObratnaI: number;
  obrtnaInvesticija: number;
  osnSredstvaP3: OsnovnoSredstvoP3[];
  tudjIzvoriOpis: string;
  // Section 4.1 revenue (per-year price + quantity)
  proizvodi: ProizvodP3[];
  // Section 4.2 costs
  direktanMaterijal: CostRowP2[];
  energijaGorivo: CostRowP2[];
  amortizacijaP3: AmortizacijaRowP2[];
  radnaSnagaVanjska: CostRowP2[];
  // Section 6
  zakljucak: string;
}

export interface StepDef {
  id: string;
  label: string;
  icon: string;
  tableRef?: string;
}
