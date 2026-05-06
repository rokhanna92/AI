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

export interface LandParcel {
  id: string;
  katMunicipality: string;
  parcelNumber: string;
  area: number;
  ownership: string;
  crop: string;
}

export interface Livestock {
  id: string;
  name: string;
  qty: number;
  valuePerHead: number;
}

export interface Building {
  id: string;
  name: string;
  area: number;
  value: number;
}

export interface Machinery {
  id: string;
  name: string;
  qty: number;
  value: number;
}

export interface InvestmentItem {
  id: string;
  name: string;
  unit: string;
  qty: number;
  priceNet: number;
}

export interface Path1State {
  parcels: LandParcel[];
  livestock: Livestock[];
  buildings: Building[];
  machinery: Machinery[];
  landValue: number;
  buildingValue: number;
  livestockValue: number;
  equipmentValue: number;
  investmentItems: InvestmentItem[];
  ownFunds: number;
  revenueYears: [number, number, number, number, number];
}

export interface ProductRevenue {
  name: string;
  unitPrice: number;
  qty: [number, number, number, number, number];
}

export interface Path2State {
  opisPoslovneIdeje: string;
  analizaProdajnog: string;
  analizaNabavnog: string;
  products: [ProductRevenue, ProductRevenue, ProductRevenue];
  materialCosts: { seeds: number; fertilizer: number; chemicals: number };
  energyCosts: { fuel: number; electricity: number };
  nonMaterialCosts: { insurance: number; accounting: number; registration: number };
  workers: number;
  monthlyWage: number;
  totalInvestment: number;
}

export interface IrrigationItem {
  id: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
}

export interface Path3State {
  katMunicipality: string;
  hectares: number;
  existingPumps: string;
  existingTractors: string;
  existingTools: string;
  items: IrrigationItem[];
  revenueYears: [number, number, number, number, number];
  expenseYears: [number, number, number, number, number];
}

export interface StepDef {
  id: string;
  label: string;
  icon: string;
  tableRef?: string;
}
