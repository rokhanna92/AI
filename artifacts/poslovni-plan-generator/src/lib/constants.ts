import type React from "react";
import type { GlobalProfile, Path1State, Path2State, Path3State, StepDef } from "../types";

export const FONT = {
  sans: "Verdana, 'Trebuchet MS', Geneva, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
} as const;

export const TYPO = {
  h1: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.05,
  } as React.CSSProperties,

  h2: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.008em",
    lineHeight: 1.15,
  } as React.CSSProperties,

  h3: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.005em",
    lineHeight: 1.2,
  } as React.CSSProperties,

  body: {
    fontFamily: FONT.sans,
    fontWeight: 400,
    letterSpacing: "0em",
    lineHeight: 1.6,
  } as React.CSSProperties,

  bodySm: {
    fontFamily: FONT.sans,
    fontWeight: 400,
    fontSize: "0.75rem",
    letterSpacing: "0em",
    lineHeight: 1.55,
  } as React.CSSProperties,

  ui: {
    fontFamily: FONT.sans,
    fontWeight: 600,
    letterSpacing: "0em",
    lineHeight: 1.4,
  } as React.CSSProperties,

  uiBold: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.005em",
    lineHeight: 1.4,
  } as React.CSSProperties,

  brandAccent: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.05,
  } as React.CSSProperties,

  label: {
    fontFamily: FONT.mono,
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  labelXs: {
    fontFamily: FONT.mono,
    fontWeight: 600,
    fontSize: "0.625rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  labelXxs: {
    fontFamily: FONT.mono,
    fontWeight: 600,
    fontSize: "0.5625rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  numeric: {
    fontFamily: FONT.mono,
    fontWeight: 700,
    letterSpacing: "0.05em",
    lineHeight: 1.3,
  } as React.CSSProperties,

  numericLg: {
    fontFamily: FONT.mono,
    fontWeight: 900,
    letterSpacing: "0.02em",
    lineHeight: 1.1,
  } as React.CSSProperties,

  tableHead: {
    fontFamily: FONT.mono,
    fontWeight: 700,
    fontSize: "0.625rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  chip: {
    fontFamily: FONT.mono,
    fontWeight: 700,
    fontSize: "0.5625rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  footer: {
    fontFamily: FONT.mono,
    fontWeight: 600,
    fontSize: "0.5625rem",
    letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    lineHeight: 1.6,
  } as React.CSSProperties,
} as const;


export const GLOBAL_INIT: GlobalProfile = {
  gazdinstvoName: "PG Petrović",
  nosilac: "Milovan Petrović",
  jmbgMb: "0501975710034",
  bpg: "500212345",
  adresa: "Braće Radić 7",
  opstina: "Sombor",
  telefon: "+381 64 123 4567",
  email: "petrovic@agro.rs",
  racun: "160-00000001234-56",
  banka: "Banca Intesa",
};

export const PATH1_INIT: Path1State = {
  tabela11: {
    naziv: "",
    investitor: "",
    lokacija: "",
  },
  tabela21: {
    imeNaziv: "",
    sediste: "",
    mesto: "",
    pib: "",
    maticniBroj: "",
    sifraDelatnosti: "",
    telefon: "",
    email: "",
  },
  tabela22: {
    adresaGazdinstva: "",
    bpg: "",
    datumRegistracije: "",
    brojZaposlenih: 0,
  },
  tabela23: { vlasnistvo_m2: 0, zakup_m2: 0, ustupljeno_m2: 0 },

  kulture: [],
  opisAktivnosti: "",

  namenaInvesticije: "",
  pocetakInvesticije: "",
  zavrsetakInvesticije: "",
  ekonomskiVek: 10,
  osnSredstva: [],
  sopstvenaProcenat: 40,

  proizvodi: [],

  trosak_sirovine: 0,
  trosak_ambalaza: 0,
  trosak_ostaliMat: 0,
  trosak_struja: 0,
  trosak_voda: 0,
  trosak_ostalaEn: 0,
  trosak_odrzavanje: 0,
  trosak_ostaleUsl: 0,
  amortizacija: [],
  radnaSnaga_broj: 0,
  radnaSnaga_godisnjiTrosak: 0,
  trosak_banka: 0,
  trosak_osiguranje: 0,
  trosak_ostaliNemat: 0,
};

export const PATH2_INIT: Path2State = {
  // Step 0
  nazivPlana: "", investitor: "", lokacija: "", godina: "2026",
  namenaInvesticije: "", pocetakInvesticije: "", zavrsetakInvesticije: "",
  ekonomskiVek: "10 godina", trzisteProdaje: "", angRaSnage: "",
  sopstvenoUcescePct: 40,
  // Step 1
  adresaNosioca: "", mestoNosioca: "", jmbg: "", telefon: "", email: "",
  bpg: "", datumRegistracije: "", vlasnistvo_ha: 0, zakup_ha: 0,
  opisDelatnosti: "",
  zem_oranice: 0, zem_livade: 0, zem_pasnjaci: 0, zem_vocnjaci: 0,
  zem_vinogradi: 0, zem_sume: 0,
  obj_kuca: 0, obj_staja: 0, obj_zivinjarnik: 0, obj_silos: 0,
  obj_ambar: 0, obj_garaza: 0,
  meh_traktor: 0, meh_kombajn: 0, meh_plug: 0, meh_tanjiraca: 0,
  meh_drljaca: 0, meh_setoSpremac: 0, meh_sejalica: 0, meh_kultivator: 0,
  meh_rasipacMin: 0, meh_rasipacStaj: 0, meh_prskAlica: 0,
  meh_beracKukuruza: 0, meh_prikolica: 0,
  stoc_krave: 0, stoc_svinje: 0, stoc_ovce: 0, stoc_koze: 0,
  stoc_zivina: 0, stoc_konji: 0, stoc_kunici: 0, stoc_kosnice: 0,
  // Step 2
  opisProizvodnog: "", opisProsirenjaPrograma: "",
  opisTrzisteNabavke: "", opisTrzisteProadaje: "",
  opisRadneSnage: "", opisDistribucije: "",
  efektProsirenjeAsortimana: false, efektNoviProizvod: false,
  efektUnapredjenje: false, efektPovecZaposlenosti: false,
  efektPovecPrihoda: false,
  // Step 3
  predmetCiljInvesticije: "",
  unetaOsnovnaI: 0, unetaObratnaI: 0,
  osnSredstvaP2: [], obrtnaInvesticija: 0,
  tudjIzvoriOpis: "", tudjIzvoriIznos: 0,
  // Step 4
  proizvodi: [],
  // Step 5
  direktanMaterijal: [], komunalni: [], usluge: [],
  amortizacija: [], radnaSnaga: [], nematerijalni: [],
  // Step 6
  rizici: [], zakljucak: "",
};

export const PATH3_INIT: Path3State = {
  investitor: "", nazivPlana: "", lokacija: "", godina: "2026",
  namenaInvesticije: "", pocetakInvesticije: "", zavrsetakInvesticije: "",
  ekonomskiVek: "10 godina", trzisteProdaje: "Domaće", angRaSnage: "",
  sopstvenoUcescePct: 40,
  ulicaBroj: "", mesto: "", jmbgMb: "", telefon: "", email: "",
  bpg: "", datumRegistracije: "",
  primarnaDelatnost: "", sekundarnaDelatnost: "", brojUposlenih: "",
  katOpstina: "", katParcele: "", povrsina_ha: 0, lokVlasnistvo_ha: 0, lokZakup_ha: 0,
  vlasnistvo_ha: 0, zakup_ha: 0,
  opisDelatnosti: "",
  zem_oranice: 0, zem_livade: 0, zem_pasnjaci: 0, zem_vocnjaci: 0,
  zem_vinogradi: 0, zem_sume: 0,
  obj_kuca: 0, obj_staja: 0, obj_zivinjarnik: 0, obj_silos: 0,
  obj_ambar: 0, obj_garaza: 0,
  meh_traktor: 0, meh_kombajn: 0, meh_plug: 0, meh_tanjiraca: 0,
  meh_drljaca: 0, meh_setoSpremac: 0, meh_sejalica: 0, meh_kultivator: 0,
  meh_rasipacMin: 0, meh_rasipacStaj: 0, meh_prskAlica: 0,
  meh_beracKukuruza: 0, meh_prikolica: 0,
  stoc_krave: 0, stoc_svinje: 0, stoc_ovce: 0, stoc_koze: 0,
  stoc_zivina: 0, stoc_konji: 0, stoc_kunici: 0, stoc_kosnice: 0,
  trzisteProdajeTekst: "", trzisteSnabdevanjaTekst: "",
  opisPoslovneIdeje: "",
  unetaOsnovnaI: 0, unetaObratnaI: 0, obrtnaInvesticija: 0,
  osnSredstvaP3: [], tudjIzvoriOpis: "",
  proizvodi: [],
  direktanMaterijal: [], energijaGorivo: [],
  amortizacijaP3: [], radnaSnagaVanjska: [],
  zakljucak: "",
};

export const PATH1_STEPS: StepDef[] = [
  { id: "cover",      label: "Naslovna",    icon: "📋", tableRef: "Tabela 1.1" },
  { id: "entity",     label: "Podaci",      icon: "🏢", tableRef: "Tab 2.1–2.3" },
  { id: "production", label: "Proizvodnja", icon: "🌾", tableRef: "Tekuće stanje" },
  { id: "investment", label: "Investicija", icon: "🏗", tableRef: "Tab 4.3–4.4" },
  { id: "revenue",    label: "Prihodi",     icon: "📈", tableRef: "Tabela 8.1" },
  { id: "costs",      label: "Troškovi",    icon: "📉", tableRef: "Tab 8.2.1–8.2.6" },
];

export const PATH2_STEPS: StepDef[] = [
  { id: "rezime",      label: "1. Rezime",     icon: "📋", tableRef: "Sekcija 1" },
  { id: "gazdinstvo",  label: "2. Gazdinstvo", icon: "🏠",  tableRef: "Sekcija 2" },
  { id: "opis",        label: "3. Opis",       icon: "📝", tableRef: "Sekcija 3" },
  { id: "investicija", label: "4. Investic.",  icon: "🏗",  tableRef: "Sekcija 4" },
  { id: "efekti",      label: "5-6-7",         icon: "👥", tableRef: "Sekc. 5–7" },
  { id: "finansije",   label: "8. Finansije",  icon: "📊", tableRef: "Sekcija 8" },
  { id: "zakljucak",   label: "10-11",         icon: "✅",  tableRef: "Sekc. 10–11" },
];

export const PATH3_STEPS: StepDef[] = [
  { id: "rezime",     label: "1. Rezime",      icon: "📋", tableRef: "Naslovna" },
  { id: "gazdinstvo", label: "2. Gazdinstvo",  icon: "🏠",  tableRef: "Tab 1.1–1.2" },
  { id: "posed",      label: "3. Posed",       icon: "🗺️",  tableRef: "Tab 1.3–1.5" },
  { id: "trziste",    label: "4. Tržište/Inv", icon: "💧", tableRef: "Sek 2–3" },
  { id: "prihodi",    label: "5. Prihodi",     icon: "📈", tableRef: "Tab 4.1" },
  { id: "troskovi",   label: "6. Troškovi",    icon: "📉", tableRef: "Tab 4.2" },
  { id: "zakljucak",  label: "7. Ocena",       icon: "✅",  tableRef: "Sek 5–6" },
];
