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

export const JD = {
  green: "#367C2B", greenDark: "#244F1C", greenLight: "#4A9E3A",
  greenPale: "#EBF5E8", greenMid: "#D4EBD0",
  yellow: "#FFDE00", yellowDark: "#E5C800", yellowPale: "#FFFBCC",
  black: "#1A1A1A", gray900: "#1F2937", gray700: "#374151",
  gray500: "#6B7280", gray300: "#D1D5DB", gray100: "#F3F4F6",
  white: "#FFFFFF", red: "#DC2626", redPale: "#FEF2F2",
};

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
  parcels: [
    { id: "l1", katMunicipality: "Sombor", parcelNumber: "3421/1", area: 8.5, ownership: "Sopstveno", crop: "Kukuruz" },
    { id: "l2", katMunicipality: "Sombor", parcelNumber: "3421/2", area: 4.2, ownership: "Sopstveno", crop: "Soja" },
  ],
  livestock: [
    { id: "lv1", name: "Goveda (tov)", qty: 20, valuePerHead: 150000 },
    { id: "lv2", name: "Svinje", qty: 50, valuePerHead: 35000 },
  ],
  buildings: [
    { id: "b1", name: "Staja za goveda", area: 400, value: 3200000 },
    { id: "b2", name: "Magacin za žitarice", area: 200, value: 1500000 },
  ],
  machinery: [
    { id: "m1", name: "Traktor IMT 577", qty: 1, value: 1800000 },
    { id: "m2", name: "Kombajn CLAAS", qty: 1, value: 4500000 },
  ],
  landValue: 5200000,
  buildingValue: 4700000,
  livestockValue: 4750000,
  equipmentValue: 6300000,
  investmentItems: [
    { id: "i1", name: "Sistem navodnjavanja (pump stanica)", unit: "kom", qty: 1, priceNet: 850000 },
    { id: "i2", name: "PE cevi za navodnjavanje dn110", unit: "m", qty: 600, priceNet: 1200 },
    { id: "i3", name: "Kap-kap laterale sa kapaljkama", unit: "m", qty: 8500, priceNet: 85 },
    { id: "i4", name: "Elektro-ventili i kontroler", unit: "kom", qty: 4, priceNet: 45000 },
  ],
  ownFunds: 800000,
  revenueYears: [1800000, 2100000, 2400000, 2700000, 3000000],
};

export const PATH2_INIT: Path2State = {
  opisPoslovneIdeje: "Kupovina opreme i proširenje kapaciteta",
  analizaProdajnog: "Lokalno tržište i izvoz",
  analizaNabavnog: "Domaći dobavljači repromaterijala",
  products: [
    { name: "Pšenica (klasa A)", unitPrice: 32, qty: [320000, 350000, 380000, 400000, 420000] },
    { name: "Suncokret", unitPrice: 95, qty: [80000, 90000, 100000, 110000, 120000] },
    { name: "Kukuruz (krmni)", unitPrice: 28, qty: [200000, 220000, 240000, 260000, 280000] },
  ],
  materialCosts: { seeds: 280000, fertilizer: 420000, chemicals: 150000 },
  energyCosts: { fuel: 180000, electricity: 45000 },
  nonMaterialCosts: { insurance: 85000, accounting: 60000, registration: 12000 },
  workers: 3,
  monthlyWage: 85000,
  totalInvestment: 2800000,
};

export const PATH3_INIT: Path3State = {
  katMunicipality: "Sombor",
  hectares: 12.4,
  existingPumps: "1× električna pumpa 5.5 kW",
  existingTractors: "1× IMT 577 DV",
  existingTools: "Atomizer, prikolica 5t",
  items: [
    { id: "ir1", name: "Pumpa stanica frekventna", unit: "kom", qty: 1, price: 620000 },
    { id: "ir2", name: "Kap-kap laterale (Netafim)", unit: "m", qty: 12400, price: 92 },
    { id: "ir3", name: "Filteri disk (120 mesh)", unit: "kom", qty: 3, price: 28000 },
    { id: "ir4", name: "Montaža i puštanje u rad", unit: "paušal", qty: 1, price: 185000 },
  ],
  revenueYears: [1600000, 1900000, 2200000, 2500000, 2800000],
  expenseYears: [920000, 950000, 980000, 1010000, 1040000],
};

export const PATH1_STEPS: StepDef[] = [
  { id: "res", label: "Resursi", icon: "🚜", tableRef: "Tab 1.1–1.4" },
  { id: "val", label: "Vrednost", icon: "💰", tableRef: "Tab 1.5" },
  { id: "inv", label: "Investicija", icon: "🏗", tableRef: "Tab 3.2" },
  { id: "fin", label: "Finansije", icon: "📊", tableRef: "Tab 3.3–5.1" },
];

export const PATH2_STEPS: StepDef[] = [
  { id: "idea", label: "Ideja", icon: "💡", tableRef: "Sekcija 3" },
  { id: "rev", label: "Prihodi", icon: "📈", tableRef: "Tabela 8.1" },
  { id: "exp", label: "Rashodi", icon: "📉", tableRef: "Tabela 8.2" },
  { id: "eval", label: "Ocena", icon: "⚖️", tableRef: "Tabela 9" },
];

export const PATH3_STEPS: StepDef[] = [
  { id: "loc", label: "Lokacija", icon: "📍", tableRef: "Tabela 1.2" },
  { id: "tech", label: "Tehnika", icon: "💧", tableRef: "Tabela 3.3" },
  { id: "eff", label: "Efikasnost", icon: "📊", tableRef: "Tabela 5.3" },
];
