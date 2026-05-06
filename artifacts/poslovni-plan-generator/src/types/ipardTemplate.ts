// IPARD Business Plan — Full Type Definitions (Serbian IPARD regulatory structure)

// ── Section 2: Basic Identification Data ─────────────────────────────────────

export interface IpardOsnovniPodaci {
  nazivPreduzeca: string;
  pib: string;
  maticniBroj: string;
  sifraDelatnosti: string; // ŠDA
  telefon: string;
  email?: string;
}

export interface IpardRegistracija {
  bpg: string; // Broj poljoprivrednog gazdinstva
  datumRegistracije: string; // ISO date string
  brojZaposlenih: number;
  gazdinstvo?: string;
}

export interface IpardZemljisniFond {
  vrstaKoriscenja: string;
  povrsina_m2: number;
  nacin: "Sopstveno" | "Zakup" | "Koncesija";
}

export interface IpardKultura {
  naziv: string;
  povrsina_ha: number;
}

// ── Section 3: Description of Business Idea ──────────────────────────────────

export interface IpardOpisProjekta {
  naslovProjekta: string;
  opisPoslovneIdeje: string;
  ciljeviProjekta: string;
  analizaTrzista: string;
  prednostiProjekta: string;
}

// ── Section 4: Investment Specification ──────────────────────────────────────

export interface IpardStavkaInvesticije {
  redniBroj: number;
  naziv: string;
  jedMere: string;
  kolicina: number;
  cenaBezPDV: number; // RSD
  ukupno: number; // RSD, derived: kolicina * cenaBezPDV
}

export interface IpardStrukturaFinansiranja {
  sopstveniIznos: number; // RSD
  spoljasnjiIznos: number; // RSD
  sopstveniProcenat: number; // 0–100
  spoljasnjiProcenat: number; // 0–100
  ukupnaInvesticija: number; // RSD
}

// ── Section 5: Technical Equipment ───────────────────────────────────────────

export interface IpardTehnickaOprema {
  vrstaOpreme: string;
  brojKomada: number;
  opisStanja?: string;
}

// ── Section 7: Expected Effects ──────────────────────────────────────────────

export interface IpardOcekivaniEfekti {
  prosirenjePoslovanja: boolean; // Tab 7.1 — Proširenje postojeće delatnosti
  noviProizvod: boolean; // Uvođenje novog proizvoda
  unapredjenjeTehnika: boolean; // Unapređenje tehnike i tehnologije
  novaRadnaMesta: boolean; // Zapošljavanje novih radnika
  porastPrihoda: boolean; // Porast prihoda
  napomena?: string;
}

// ── Section 8: Financial Plan ─────────────────────────────────────────────────

export interface IpardProizvodProizvod {
  naziv: string;
  jedinicaMere: string;
  cenaPoJedinici: number; // RSD
  kolicinePoGodini: [number, number, number, number, number]; // G1–G5
}

export interface IpardMaterijalni {
  sirovineIMaterijali: number;
  ambalaza: number;
  potrosniMaterijal: number;
  ostaliMaterijal: number;
}

export interface IpardEnergija {
  elektricnaEnergija: number;
  voda: number;
  internet: number;
  ostalaEnergija: number;
}

export interface IpardUsluge {
  odrzavanjeOpreme: number;
  odrzavanjeObjekta: number;
  reklama: number;
  transport: number;
  ostaleUsluge: number;
}

export interface IpardAmortizacija {
  stavke: IpardAmortizacijaStavka[];
  ukupno: number;
}

export interface IpardAmortizacijaStavka {
  naziv: string;
  nabavnaVrednost: number; // RSD
  stopaAmortizacije: number; // percent
  godisnjiIznos: number; // RSD
}

export interface IpardRadnaSnaga {
  brojRadnika: number;
  prosecnaBrutoMesecna: number; // RSD
  godisnjiIznos: number; // RSD, derived: brojRadnika * prosecnaBrutoMesecna * 12
}

export interface IpardNematerijalni {
  bankarskeUsluge: number;
  administrativneUsluge: number;
  konsultantskiHonorar: number;
  ostalo?: number;
}

export interface IpardNeto {
  ukupniPrihodi: number;
  ukupniRashodi: number;
  netoPrihod: number; // derived: ukupniPrihodi - ukupniRashodi
}

export interface IpardFinansijskiPlan {
  // Tab 8.1 — Revenue by product/year
  proizvodi: IpardProizvodProizvod[];

  // Tab 8.2.1 — Material costs (annual)
  materijalniTroskovi: IpardMaterijalni;

  // Tab 8.2.2 — Energy costs (annual)
  energetskiTroskovi: IpardEnergija;

  // Tab 8.2.3 — Service costs (annual)
  usluge: IpardUsluge;

  // Tab 8.2.4 — Depreciation
  amortizacija: IpardAmortizacija;

  // Tab 8.2.5 — Labor
  radnaSnaga: IpardRadnaSnaga;

  // Tab 8.2.6 — Non-material costs (annual)
  nematerijalni: IpardNematerijalni;

  // Tab 8.2.7 — Total costs (derived sum of 8.2.1–8.2.6)
  ukupniRashodiGodisnje: number;

  // Tab 8.2.8 — Net income per year [G1, G2, G3, G4, G5]
  netoPrihodPoGodini: [IpardNeto, IpardNeto, IpardNeto, IpardNeto, IpardNeto];
}

// ── Section 9: Evaluation Effects ────────────────────────────────────────────

export interface IpardGotovinskiTok {
  // Tab 9.1 — Cash flow per year [G1–G5]
  poGodini: [number, number, number, number, number]; // net cash inflow
}

export interface IpardEkonomskiTok {
  // Tab 9.2 — Economic flow per year [G1–G5] (G1 includes investment outflow)
  poGodini: [number, number, number, number, number];
}

export interface IpardOcenaEfekata {
  gotovinskiTok: IpardGotovinskiTok;
  ekonomskiTok: IpardEkonomskiTok;

  // Derived summary indicators
  ekonomicnost: number; // Prihodi / Rashodi, must be > 1
  akumulativnost_pct: number; // NetoProfit / UkupniPrihodi * 100
  rentabilnost_pct: number; // NetoProfit / UkupnaInvesticija * 100
  povracajGodine: number; // UkupnaInvesticija / GodisnjiNeto
}

// ── Section 10: Risks ────────────────────────────────────────────────────────

export interface IpardRizik {
  vrstaRizika: string;
  opisRizika: string;
  preventivnaMera: string;
}

// ── Full IPARD Business Plan Template ────────────────────────────────────────

export interface IpardPoslovniPlan {
  // Metadata
  verzijaObrasca: string;
  datumIzrade: string; // ISO date

  // Sections
  osnovniPodaci: IpardOsnovniPodaci;
  registracija: IpardRegistracija;
  zemljisniFond: IpardZemljisniFond[];
  kulture: IpardKultura[];
  opisProjekta: IpardOpisProjekta;
  investicijaStavke: IpardStavkaInvesticije[];
  strukturaFinansiranja: IpardStrukturaFinansiranja;
  tehnickaOprema: IpardTehnickaOprema[];
  ocekivaniEfekti: IpardOcekivaniEfekti;
  finansijskiPlan: IpardFinansijskiPlan;
  ocenaEfekata: IpardOcenaEfekata;
  rizici: IpardRizik[];
}

// ── Financial formula helpers (reusable across templates) ────────────────────

/** Ekonomičnost = Ukupni prihodi / Ukupni rashodi. Mora biti > 1. */
export function izracunajEkonomicnost(prihodi: number, rashodi: number): number {
  return rashodi > 0 ? prihodi / rashodi : 0;
}

/** Akumulativnost (%) = Neto prihod / Ukupni prihodi × 100 */
export function izracunajAkumulativnost(netoPrihod: number, ukupniPrihodi: number): number {
  return ukupniPrihodi > 0 ? (netoPrihod / ukupniPrihodi) * 100 : 0;
}

/** Rentabilnost (%) = Neto prihod / Ukupna investicija × 100 */
export function izracunajRentabilnost(netoPrihod: number, ukupnaInvesticija: number): number {
  return ukupnaInvesticija > 0 ? (netoPrihod / ukupnaInvesticija) * 100 : 0;
}

/** Period povraćaja (godine) = Ukupna investicija / Prosečni godišnji neto prihod */
export function izracunajPovracaj(ukupnaInvesticija: number, prosecniGodisnji: number): number {
  return prosecniGodisnji > 0 ? ukupnaInvesticija / prosecniGodisnji : 0;
}

/** Ukupni materijalni rashodi = suma svih kategorija 8.2.1–8.2.6 */
export function izracunajUkupneRashode(
  mat: IpardMaterijalni,
  en: IpardEnergija,
  usl: IpardUsluge,
  amort: number,
  rad: number,
  nemat: IpardNematerijalni,
): number {
  const matSum = mat.sirovineIMaterijali + mat.ambalaza + mat.potrosniMaterijal + mat.ostaliMaterijal;
  const enSum = en.elektricnaEnergija + en.voda + en.internet + en.ostalaEnergija;
  const uslSum = usl.odrzavanjeOpreme + usl.odrzavanjeObjekta + usl.reklama + usl.transport + usl.ostaleUsluge;
  const nematSum = nemat.bankarskeUsluge + nemat.administrativneUsluge + nemat.konsultantskiHonorar + (nemat.ostalo ?? 0);
  return matSum + enSum + uslSum + amort + rad + nematSum;
}

/** Prihodi za godinu = suma(cena * kolicina) za sve proizvode */
export function izracunajPrihodeGodine(
  proizvodi: IpardProizvodProizvod[],
  godisnjiBroj: 0 | 1 | 2 | 3 | 4,
): number {
  return proizvodi.reduce((sum, p) => sum + p.cenaPoJedinici * p.kolicinePoGodini[godisnjiBroj], 0);
}
