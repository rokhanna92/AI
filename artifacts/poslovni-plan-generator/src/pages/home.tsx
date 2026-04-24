"use client";

import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface CostItem {
  id: string;
  name: string;
  unit: string;
  qty: number;
  priceWithVAT: number;
  vatRate: number; // 0.20 or 0.10 or 0
}

interface ExistingAsset {
  id: string;
  name: string;
  type: "land" | "machinery" | "building" | "other";
  quantity: number;
  unit: string;
  bookValue: number;
}

interface CadastralParcel {
  id: string;
  number: string;
  municipality: string;
  area: number;
  culture: string;
}

interface YearProjection {
  year: number;
  yieldTonPerHa: number;
  pricePerTon: number;
  hectares: number;
  otherRevenue: number;
}

interface FormState {
  // Tab 1 – Osnovni podaci
  applicantName: string;
  bpg: string;
  jmbg: string;
  mb: string;
  address: string;
  municipality: string;
  phone: string;
  email: string;
  bankAccount: string;
  bankName: string;
  cadastralParcels: CadastralParcel[];

  // Tab 2 – Postojeća imovina
  existingAssets: ExistingAsset[];
  totalFarmAreaHa: number;
  currentCrops: string;

  // Tab 3 – Investicija i plan
  projectTitle: string;
  projectDescription: string;
  projectObjective: string;
  investmentItems: CostItem[];
  ownFundsPercent: number;
  ipardGrantPercent: number;
  loanPercent: number;
  loanInterestRate: number;
  loanTermYears: number;
  implementationMonths: number;
  startYear: number;

  // Tab 4 – Finansijska projekcija
  productName: string;
  productUnit: string;
  projections: YearProjection[];
  variableCostPerTon: number;
  fixedCostsAnnual: number;
  laborCostsAnnual: number;
  depreciationRate: number;
  taxRate: number;
  residualValuePercent: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE  – "Genius" Demo Mode (Apple Orchard Vojvodina)
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_STATE: FormState = {
  applicantName: "Agro Vojvodina d.o.o.",
  bpg: "500123456",
  jmbg: "0101980710012",
  mb: "21345678",
  address: "Ul. Nikole Tesle 14",
  municipality: "Pančevo",
  phone: "+381 63 123 4567",
  email: "info@agrovojvodina.rs",
  bankAccount: "160-0000000123456-91",
  bankName: "Banca Intesa a.d. Beograd",
  cadastralParcels: [
    { id: "p1", number: "1234/1", municipality: "Pančevo", area: 4.5, culture: "Voćnjak – jabuka" },
    { id: "p2", number: "1234/2", municipality: "Pančevo", area: 3.2, culture: "Voćnjak – jabuka" },
    { id: "p3", number: "1235/1", municipality: "Pančevo", area: 2.3, culture: "Voćnjak – jabuka" },
  ],

  existingAssets: [
    { id: "a1", name: "Traktor IMT 577 DV", type: "machinery", quantity: 1, unit: "kom", bookValue: 1200000 },
    { id: "a2", name: "Atomizer orošivač", type: "machinery", quantity: 1, unit: "kom", bookValue: 350000 },
    { id: "a3", name: "Magacin za voće (hladnjača)", type: "building", quantity: 1, unit: "m²", bookValue: 2800000 },
    { id: "a4", name: "Poljoprivredno zemljište", type: "land", quantity: 10, unit: "ha", bookValue: 12000000 },
  ],
  totalFarmAreaHa: 10,
  currentCrops: "Intenzivni voćnjak jabuke (sorte Gala i Pink Lady), zasađen 2019. godine na površini od 10 ha, razmak sadnje 3,5 × 1,2 m, sistem uzgoja vitko vreteno (Slender Spindle).",

  projectTitle: "Uvođenje sistema precizne fertirigacije u intenzivnom voćnjaku jabuke – 10 ha, Vojvodina",
  projectDescription:
    "Projekat podrazumeva instalaciju savremenog sistema kapljičnog navodnjavanja sa integrisanom fertirigacijom i digitalnom kontrolom vlage na zasadu jabuke (Gala/Pink Lady) površine 10 ha. " +
    "Sistem omogućava preciznu primenu vode i hraniva prema stvarnim potrebama biljke, praćenjem evapotranspiracije (ET₀) i tenziometrijskih merenja. " +
    "Automatizovana kontrolna jedinica upravlja radom sektora navodnjavanja, doziranjem đubriva u vodi i alarmiranjem pri kritičnim vrednostima. " +
    "Implementacija digitalne kontrole vlage garantuje smanjenje potrošnje vode za 40% u odnosu na klasične metode, uz povećanje prinosa prve klase.",
  projectObjective:
    "Cilj projekta je optimizacija prinosa prve klase jabuke kroz preciznu fertirigaciju, smanjenje troškova inputa i povećanje konkurentnosti gazdinstva na tržištu EU. " +
    "Petogodišnja projekcija prihoda bazirana je na kalibraciji modela evapotranspiracije (FAO-56 Penman-Monteith) prilagođenom agroklimatskim uslovima Vojvodine.",
  investmentItems: [
    { id: "i1", name: "Sistem kapljičnog navodnjavanja (laterale, kapaljke, filteri)", unit: "kompletan sistem/ha", qty: 10, priceWithVAT: 180000, vatRate: 0.20 },
    { id: "i2", name: "Centralna pumpa stanica (frekventni regulator, bypass)", unit: "kom", qty: 1, priceWithVAT: 420000, vatRate: 0.20 },
    { id: "i3", name: "Fertigacioni injektor (Venturi + dozirna pumpa A+B)", unit: "kom", qty: 2, priceWithVAT: 95000, vatRate: 0.20 },
    { id: "i4", name: "Digitalna kontrolna jedinica + senzori vlage (10 tačaka)", unit: "kom", qty: 1, priceWithVAT: 380000, vatRate: 0.20 },
    { id: "i5", name: "PE cevi glavnog razvoda (dn 63–110 mm)", unit: "m", qty: 850, priceWithVAT: 620, vatRate: 0.20 },
    { id: "i6", name: "Montaža i puštanje u rad (radna snaga + transport)", unit: "paušal", qty: 1, priceWithVAT: 310000, vatRate: 0.20 },
    { id: "i7", name: "Projekat navodnjavanja (hidrotehnički elaborat)", unit: "kom", qty: 1, priceWithVAT: 120000, vatRate: 0.20 },
  ],
  ownFundsPercent: 50,
  ipardGrantPercent: 50,
  loanPercent: 0,
  loanInterestRate: 3.5,
  loanTermYears: 7,
  implementationMonths: 8,
  startYear: 2025,

  productName: "Jabuka klase Extra/I (Gala & Pink Lady)",
  productUnit: "tona",
  projections: [
    { year: 2025, yieldTonPerHa: 30, pricePerTon: 65000, hectares: 10, otherRevenue: 180000 },
    { year: 2026, yieldTonPerHa: 38, pricePerTon: 67000, hectares: 10, otherRevenue: 150000 },
    { year: 2027, yieldTonPerHa: 45, pricePerTon: 69000, hectares: 10, otherRevenue: 120000 },
    { year: 2028, yieldTonPerHa: 52, pricePerTon: 71000, hectares: 10, otherRevenue: 100000 },
    { year: 2029, yieldTonPerHa: 55, pricePerTon: 73000, hectares: 10, otherRevenue: 100000 },
  ],
  variableCostPerTon: 18000,
  fixedCostsAnnual: 420000,
  laborCostsAnnual: 650000,
  depreciationRate: 0.10,
  taxRate: 0.10,
  residualValuePercent: 0.20,
};

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function calcNetPrice(item: CostItem) {
  return item.priceWithVAT / (1 + item.vatRate);
}

function calcTotalInvestmentNet(items: CostItem[]) {
  return items.reduce((s, i) => s + calcNetPrice(i) * i.qty, 0);
}

function calcTotalInvestmentGross(items: CostItem[]) {
  return items.reduce((s, i) => s + i.priceWithVAT * i.qty, 0);
}

interface YearFinancials {
  year: number;
  revenue: number;
  variableCosts: number;
  fixedCosts: number;
  laborCosts: number;
  grossProfit: number;
  depreciation: number;
  ebit: number;
  tax: number;
  netProfit: number;
  cashFlow: number;
  cumulativeCashFlow: number;
}

function calcFinancials(state: FormState): {
  years: YearFinancials[];
  totalInvestmentNet: number;
  totalInvestmentGross: number;
  npv: number;
  irr: number;
  payback: number;
  economy: number;
  accumulativeness: number;
  profitability: number;
  roi: number;
} {
  const totalInvestmentNet = calcTotalInvestmentNet(state.investmentItems);
  const totalInvestmentGross = calcTotalInvestmentGross(state.investmentItems);
  const annualDepreciation = totalInvestmentNet * state.depreciationRate;
  const residualValue = totalInvestmentNet * state.residualValuePercent;

  const years: YearFinancials[] = [];
  let cumCF = -totalInvestmentNet;

  for (let i = 0; i < state.projections.length; i++) {
    const p = state.projections[i];
    const revenue = p.yieldTonPerHa * p.hectares * p.pricePerTon + p.otherRevenue;
    const variableCosts = p.yieldTonPerHa * p.hectares * state.variableCostPerTon;
    const fixedCosts = state.fixedCostsAnnual;
    const laborCosts = state.laborCostsAnnual;
    const grossProfit = revenue - variableCosts - fixedCosts - laborCosts;
    const ebit = grossProfit - annualDepreciation;
    const tax = Math.max(0, ebit * state.taxRate);
    const netProfit = ebit - tax;
    const isLastYear = i === state.projections.length - 1;
    const cashFlow = netProfit + annualDepreciation + (isLastYear ? residualValue : 0);
    cumCF += cashFlow;
    years.push({
      year: p.year,
      revenue,
      variableCosts,
      fixedCosts,
      laborCosts,
      grossProfit,
      depreciation: annualDepreciation,
      ebit,
      tax,
      netProfit,
      cashFlow,
      cumulativeCashFlow: cumCF,
    });
  }

  // NPV at 8% discount
  const discountRate = 0.08;
  let npv = -totalInvestmentNet;
  years.forEach((y, idx) => {
    npv += y.cashFlow / Math.pow(1 + discountRate, idx + 1);
  });

  // IRR (Newton-Raphson approximation)
  let irr = 0.2;
  for (let iter = 0; iter < 100; iter++) {
    let f = -totalInvestmentNet;
    let df = 0;
    years.forEach((y, idx) => {
      f += y.cashFlow / Math.pow(1 + irr, idx + 1);
      df -= ((idx + 1) * y.cashFlow) / Math.pow(1 + irr, idx + 2);
    });
    if (Math.abs(f) < 1) break;
    irr -= f / df;
  }

  // Payback period
  let payback = 0;
  let cumulative = -totalInvestmentNet;
  for (let i = 0; i < years.length; i++) {
    if (cumulative < 0) {
      cumulative += years[i].cashFlow;
      if (cumulative >= 0) {
        const prev = cumulative - years[i].cashFlow;
        payback = i + 1 - cumulative / years[i].cashFlow;
      } else {
        payback = i + 2;
      }
    }
  }

  const totalRevenue = years.reduce((s, y) => s + y.revenue, 0);
  const totalCosts = years.reduce((s, y) => s + y.variableCosts + y.fixedCosts + y.laborCosts, 0);
  const totalNetProfit = years.reduce((s, y) => s + y.netProfit, 0);
  const avgNetProfit = totalNetProfit / years.length;

  const economy = totalRevenue / (totalCosts || 1);
  const accumulativeness = (avgNetProfit / (totalRevenue / years.length)) * 100;
  const profitability = (avgNetProfit / (totalInvestmentNet || 1)) * 100;
  const roi = (totalNetProfit / (totalInvestmentNet || 1)) * 100;

  return { years, totalInvestmentNet, totalInvestmentGross, npv, irr: irr * 100, payback, economy, accumulativeness, profitability, roi };
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("sr-RS", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtRSD(n: number) {
  return `${fmt(n)} RSD`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

function downloadPdf(state: FormState) {
  const calc = calcFinancials(state);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const tblDefaults = {
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [28, 70, 35] as [number, number, number], textColor: 255, fontStyle: "bold" as const },
    alternateRowStyles: { fillColor: [242, 247, 242] as [number, number, number] },
    theme: "grid" as const,
  };

  // ── COVER PAGE ──
  doc.setFillColor(28, 70, 35);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("POSLOVNI PLAN", pageWidth / 2, 22, { align: "center" });
  doc.setFontSize(11);
  doc.text("IPARD / Ministarstvo poljoprivrede Republike Srbije", pageWidth / 2, 32, { align: "center" });
  doc.setFontSize(9);
  doc.text("Mera 1 – Investicije u fizicku imovinu poljoprivrednih gazdinstava", pageWidth / 2, 41, { align: "center" });

  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(state.projectTitle, pageWidth / 2, 65, { align: "center", maxWidth: 170 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const coverData = [
    ["Podnosilac zahteva:", state.applicantName],
    ["BPG broj:", state.bpg],
    ["JMBG / MB:", state.jmbg || state.mb],
    ["Opstina:", state.municipality],
    ["Adresa:", state.address],
    ["Kontakt:", `${state.phone} | ${state.email}`],
    ["Banka / Racun:", `${state.bankName} | ${state.bankAccount}`],
  ];

  autoTable(doc, {
    startY: 85,
    body: coverData,
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 }, 1: { cellWidth: 120 } },
    ...tblDefaults,
    headStyles: undefined,
    alternateRowStyles: { fillColor: [250, 252, 250] },
  });

  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text(`Datum izrade: ${new Date().toLocaleDateString("sr-RS")}`, 14, 285);
  doc.text("Stranica 1", pageWidth - 14, 285, { align: "right" });

  // ── TABLE 1.1 – CADASTRAL PARCELS ──
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(28, 70, 35);
  doc.text("Tabela 1.1 – Podaci o lokaciji: Katastarske parcele", 14, 20);

  autoTable(doc, {
    startY: 26,
    head: [["Br.", "Broj parcele", "Opstina / KO", "Povrsina (ha)", "Kultura"]],
    body: state.cadastralParcels.map((p, i) => [
      i + 1,
      p.number,
      p.municipality,
      p.area.toFixed(2),
      p.culture,
    ]),
    foot: [["", "UKUPNO", "", state.cadastralParcels.reduce((s, p) => s + p.area, 0).toFixed(2), ""]],
    footStyles: { fontStyle: "bold", fillColor: [220, 235, 220] },
    ...tblDefaults,
  });

  // ── TABLE 1.5 – EXISTING ASSETS ──
  const y15 = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(28, 70, 35);
  doc.text("Tabela 1.5 – Popis postojece imovine gazdinstva", 14, y15);

  autoTable(doc, {
    startY: y15 + 6,
    head: [["Br.", "Naziv imovine", "Vrsta", "Kol.", "J.M.", "Knjig. vrednost (RSD)"]],
    body: state.existingAssets.map((a, i) => [
      i + 1,
      a.name,
      a.type === "land" ? "Zemljiste" : a.type === "machinery" ? "Masina/oprema" : a.type === "building" ? "Objekat" : "Ostalo",
      a.quantity,
      a.unit,
      fmt(a.bookValue),
    ]),
    foot: [["", "UKUPNO", "", "", "", fmt(state.existingAssets.reduce((s, a) => s + a.bookValue, 0))]],
    footStyles: { fontStyle: "bold", fillColor: [220, 235, 220] },
    ...tblDefaults,
  });

  // ── TABLE 3.2 – INVESTMENT COST BREAKDOWN ──
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(28, 70, 35);
  doc.text("Tabela 3.2 – Specifikacija investicionih troskova (sa i bez PDV-a)", 14, 20);

  autoTable(doc, {
    startY: 26,
    head: [["Br.", "Opis stavke", "J.M.", "Kol.", "Cena sa PDV (RSD)", "Cena bez PDV (RSD)", "Ukupno bez PDV (RSD)", "Stopa PDV (%)"]],
    body: state.investmentItems.map((item, i) => [
      i + 1,
      item.name,
      item.unit,
      item.qty,
      fmt(item.priceWithVAT),
      fmt(calcNetPrice(item)),
      fmt(calcNetPrice(item) * item.qty),
      `${(item.vatRate * 100).toFixed(0)}%`,
    ]),
    foot: [
      ["", "UKUPNO (bez PDV-a)", "", "", "", "", fmt(calc.totalInvestmentNet), ""],
      ["", "UKUPNO (sa PDV-om)", "", "", fmt(calc.totalInvestmentGross), "", "", ""],
    ],
    footStyles: { fontStyle: "bold", fillColor: [220, 235, 220] },
    ...tblDefaults,
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: { 1: { cellWidth: 55 } },
  });

  // ── TABLE 3.3 – FINANCING STRUCTURE ──
  const y33 = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(28, 70, 35);
  doc.text("Tabela 3.3 – Struktura finansiranja investicije", 14, y33);

  const ownFunds = (calc.totalInvestmentNet * state.ownFundsPercent) / 100;
  const ipardGrant = (calc.totalInvestmentNet * state.ipardGrantPercent) / 100;
  const loanAmount = (calc.totalInvestmentNet * state.loanPercent) / 100;

  autoTable(doc, {
    startY: y33 + 6,
    head: [["Izvor finansiranja", "Iznos (RSD)", "Ucesce (%)"]],
    body: [
      ["Sopstvena sredstva", fmt(ownFunds), `${state.ownFundsPercent}%`],
      ["IPARD grant (namenski bespovratna sredstva)", fmt(ipardGrant), `${state.ipardGrantPercent}%`],
      ["Kredit / zajam", fmt(loanAmount), `${state.loanPercent}%`],
    ],
    foot: [["UKUPNO", fmt(calc.totalInvestmentNet), "100%"]],
    footStyles: { fontStyle: "bold", fillColor: [220, 235, 220] },
    ...tblDefaults,
  });

  // ── TABLE 4.1 – AMORTIZATION (10% on net value) ──
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(28, 70, 35);
  doc.text("Tabela 4.1 – Plan amortizacije opreme (stopa 10% na vrednost bez PDV-a)", 14, 20);

  let bookVal = calc.totalInvestmentNet;
  const amorRows = state.projections.map((p) => {
    const dep = bookVal * state.depreciationRate;
    const end = bookVal - dep;
    const row = [p.year, fmt(bookVal), fmt(dep), fmt(end)];
    bookVal = end;
    return row;
  });

  autoTable(doc, {
    startY: 26,
    head: [["Godina", "Pocetak perioda (RSD)", "Amortizacija (RSD)", "Kraj perioda (RSD)"]],
    body: amorRows,
    ...tblDefaults,
  });

  // ── TABLE 5.1 – INCOME STATEMENT (Bilans uspeha) ──
  const y51 = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(28, 70, 35);
  doc.text("Tabela 5.1 – Projekcija Bilansa Uspeha (5 godina)", 14, y51);

  const bsHead = [["Pozicija", ...calc.years.map((y) => y.year.toString())]];
  const bsBody = [
    ["1. Prihodi od prodaje (RSD)", ...calc.years.map((y) => fmt(y.revenue))],
    ["2. Varijabilni troskovi (RSD)", ...calc.years.map((y) => fmt(y.variableCosts))],
    ["3. Fiksni troskovi (RSD)", ...calc.years.map((y) => fmt(y.fixedCosts))],
    ["4. Troskovi rada (RSD)", ...calc.years.map((y) => fmt(y.laborCosts))],
    ["5. Bruto dobit (1-2-3-4) (RSD)", ...calc.years.map((y) => fmt(y.grossProfit))],
    ["6. Amortizacija (RSD)", ...calc.years.map((y) => fmt(y.depreciation))],
    ["7. EBIT (5-6) (RSD)", ...calc.years.map((y) => fmt(y.ebit))],
    ["8. Porez na dobit (10%) (RSD)", ...calc.years.map((y) => fmt(y.tax))],
    ["9. Neto dobit (7-8) (RSD)", ...calc.years.map((y) => fmt(y.netProfit))],
  ];

  autoTable(doc, {
    startY: y51 + 6,
    head: bsHead,
    body: bsBody,
    ...tblDefaults,
    styles: { fontSize: 7, cellPadding: 2 },
    bodyStyles: { fillColor: undefined },
    rowPageBreak: "avoid",
    didParseCell: (data: any) => {
      if (data.row.index === 4 || data.row.index === 8) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [210, 230, 210];
      }
    },
  });

  // ── TABLE 5.2 – CASH FLOW ──
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(28, 70, 35);
  doc.text("Tabela 5.2 – Projekcija Gotovinskog Toka (Cash Flow)", 14, 20);

  const cfHead = [["Pozicija", "God. 0", ...calc.years.map((y) => y.year.toString())]];
  const cfBody = [
    ["Investicija (RSD)", fmt(-calc.totalInvestmentNet), ...calc.years.map(() => "—")],
    ["Neto dobit (RSD)", "—", ...calc.years.map((y) => fmt(y.netProfit))],
    ["+ Amortizacija (RSD)", "—", ...calc.years.map((y) => fmt(y.depreciation))],
    [
      "+ Ostatak vrednosti (God. 5) (RSD)",
      "—",
      ...calc.years.map((y, i) =>
        i === calc.years.length - 1 ? fmt(calc.totalInvestmentNet * state.residualValuePercent) : "—"
      ),
    ],
    ["Neto Cash Flow (RSD)", fmt(-calc.totalInvestmentNet), ...calc.years.map((y) => fmt(y.cashFlow))],
    [
      "Kumulativni CF (RSD)",
      fmt(-calc.totalInvestmentNet),
      ...calc.years.map((y) => fmt(y.cumulativeCashFlow)),
    ],
  ];

  autoTable(doc, {
    startY: 26,
    head: cfHead,
    body: cfBody,
    ...tblDefaults,
    styles: { fontSize: 7, cellPadding: 2 },
    didParseCell: (data: any) => {
      if (data.row.index === 4 || data.row.index === 5) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [210, 230, 210];
      }
    },
  });

  // ── TABLE 6.1 – KEY FINANCIAL INDICATORS ──
  const y61 = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(28, 70, 35);
  doc.text("Tabela 6.1 – Kljucni finansijski pokazatelji projekta", 14, y61);

  autoTable(doc, {
    startY: y61 + 6,
    head: [["Pokazatelj", "Formula", "Vrednost", "Ocena"]],
    body: [
      ["Ekonomicnost (E)", "UP / UI", calc.economy.toFixed(3), calc.economy >= 1 ? "Projekat je ekonomican" : "Ispod praga"],
      ["Akumulativnost (A)", "(D / UPr) × 100", `${calc.accumulativeness.toFixed(1)}%`, "Stopa akumulacije neto dobiti"],
      ["Rentabilnost (R)", "(D / PVI) × 100", `${calc.profitability.toFixed(1)}%`, "Prinos na ulozeni kapital"],
      ["NPV (8%)", "Σ CF / (1+r)ⁿ – I₀", fmtRSD(calc.npv), calc.npv > 0 ? "Investicija se isplati" : "Negativno"],
      ["IRR", "NPV = 0", `${calc.irr.toFixed(1)}%`, calc.irr > 8 ? "Prihvatljivo (>8%)" : "Ispod diskontne stope"],
      ["ROI (5 god.)", "(Σ Neto dobiti / I₀) × 100", `${calc.roi.toFixed(1)}%`, "Ukupan prinos na kapital"],
      ["Povrat investicije", "Payback period", `${calc.payback.toFixed(1)} god.`, "Vreme povrata"],
    ],
    ...tblDefaults,
    columnStyles: { 1: { cellWidth: 38 }, 3: { cellWidth: 55 } },
  });

  // ── FOOTER ON LAST PAGE ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `${state.applicantName} | BPG: ${state.bpg} | Poverljivo – interno`,
      14,
      290
    );
    doc.text(`Stranica ${i} od ${totalPages}`, pageWidth - 14, 290, { align: "right" });
  }

  doc.save(`Poslovni_Plan_${state.applicantName.replace(/\s/g, "_")}_${state.startYear}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-emerald-800 mb-1 tracking-wide uppercase">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  id,
  placeholder,
  className = "",
}: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  id?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition ${className}`}
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition resize-none"
    />
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-xl">{icon}</span>
      <h3 className="text-base font-bold text-emerald-900 tracking-tight">{children}</h3>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  color = "emerald",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon: string;
}) {
  const colors: Record<string, string> = {
    emerald: "from-emerald-50 to-green-50 border-emerald-200 text-emerald-700",
    blue: "from-blue-50 to-sky-50 border-blue-200 text-blue-700",
    amber: "from-amber-50 to-yellow-50 border-amber-200 text-amber-700",
    rose: "from-rose-50 to-pink-50 border-rose-200 text-rose-700",
    violet: "from-violet-50 to-purple-50 border-violet-200 text-violet-700",
    teal: "from-teal-50 to-cyan-50 border-teal-200 text-teal-700",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-black tracking-tight">{value}</div>
      {sub && <div className="text-xs mt-1 opacity-60">{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB PANELS
// ─────────────────────────────────────────────────────────────────────────────

function Tab1({ state, setState }: { state: FormState; setState: (s: FormState) => void }) {
  const upd = (field: keyof FormState) => (val: string) => setState({ ...state, [field]: val });

  function updateParcel(id: string, field: keyof CadastralParcel, val: string) {
    setState({
      ...state,
      cadastralParcels: state.cadastralParcels.map((p) =>
        p.id === id ? { ...p, [field]: field === "area" ? parseFloat(val) || 0 : val } : p
      ),
    });
  }

  function addParcel() {
    setState({
      ...state,
      cadastralParcels: [
        ...state.cadastralParcels,
        { id: `p${Date.now()}`, number: "", municipality: "", area: 0, culture: "" },
      ],
    });
  }

  function removeParcel(id: string) {
    setState({ ...state, cadastralParcels: state.cadastralParcels.filter((p) => p.id !== id) });
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon="🏢">Podaci o podnosiocu zahteva</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Naziv gazdinstva / preduzeća</Label>
            <Input value={state.applicantName} onChange={upd("applicantName")} />
          </div>
          <div>
            <Label>BPG broj</Label>
            <Input value={state.bpg} onChange={upd("bpg")} placeholder="500xxxxxx" />
          </div>
          <div>
            <Label>JMBG (fizičko lice)</Label>
            <Input value={state.jmbg} onChange={upd("jmbg")} placeholder="0101980XXXXXX" />
          </div>
          <div>
            <Label>MB (pravno lice / preduzetnik)</Label>
            <Input value={state.mb} onChange={upd("mb")} placeholder="2XXXXXXX" />
          </div>
          <div>
            <Label>Adresa</Label>
            <Input value={state.address} onChange={upd("address")} />
          </div>
          <div>
            <Label>Opština / Mesto</Label>
            <Input value={state.municipality} onChange={upd("municipality")} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input value={state.phone} onChange={upd("phone")} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input value={state.email} onChange={upd("email")} type="email" />
          </div>
          <div>
            <Label>Naziv banke</Label>
            <Input value={state.bankName} onChange={upd("bankName")} />
          </div>
          <div>
            <Label>Broj računa</Label>
            <Input value={state.bankAccount} onChange={upd("bankAccount")} />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon="📍">Tabela 1.1 – Podaci o lokaciji (katastarske parcele)</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-emerald-800 text-white">
                {["Br.", "Broj parcele", "Opština / KO", "Površina (ha)", "Kultura", ""].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.cadastralParcels.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-emerald-50/40"}>
                  <td className="px-3 py-1.5 text-slate-500 text-xs">{i + 1}</td>
                  <td className="px-2 py-1.5"><Input value={p.number} onChange={(v) => updateParcel(p.id, "number", v)} /></td>
                  <td className="px-2 py-1.5"><Input value={p.municipality} onChange={(v) => updateParcel(p.id, "municipality", v)} /></td>
                  <td className="px-2 py-1.5"><Input value={p.area} onChange={(v) => updateParcel(p.id, "area", v)} type="number" /></td>
                  <td className="px-2 py-1.5"><Input value={p.culture} onChange={(v) => updateParcel(p.id, "culture", v)} /></td>
                  <td className="px-2 py-1.5">
                    <button onClick={() => removeParcel(p.id)} className="text-red-400 hover:text-red-600 text-sm font-bold transition">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50 font-semibold">
                <td colSpan={3} className="px-3 py-2 text-xs text-emerald-800">Ukupno</td>
                <td className="px-3 py-2 text-xs text-emerald-900 font-bold">{state.cadastralParcels.reduce((s, p) => s + p.area, 0).toFixed(2)} ha</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
        <button
          onClick={addParcel}
          className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition"
        >
          <span className="text-base font-black">＋</span> Dodaj parcelu
        </button>
      </Card>
    </div>
  );
}

function Tab2({ state, setState }: { state: FormState; setState: (s: FormState) => void }) {
  function updateAsset(id: string, field: keyof ExistingAsset, val: string) {
    setState({
      ...state,
      existingAssets: state.existingAssets.map((a) =>
        a.id === id
          ? { ...a, [field]: field === "bookValue" || field === "quantity" ? parseFloat(val) || 0 : val }
          : a
      ),
    });
  }

  function addAsset() {
    setState({
      ...state,
      existingAssets: [
        ...state.existingAssets,
        { id: `a${Date.now()}`, name: "", type: "machinery", quantity: 1, unit: "kom", bookValue: 0 },
      ],
    });
  }

  function removeAsset(id: string) {
    setState({ ...state, existingAssets: state.existingAssets.filter((a) => a.id !== id) });
  }

  const assetTypes = [
    { value: "land", label: "Zemljište" },
    { value: "machinery", label: "Mašina/Oprema" },
    { value: "building", label: "Objekat" },
    { value: "other", label: "Ostalo" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon="🌾">Opis trenutnog stanja gazdinstva</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-1">
            <Label>Ukupna površina gazdinstva (ha)</Label>
            <Input
              value={state.totalFarmAreaHa}
              onChange={(v) => setState({ ...state, totalFarmAreaHa: parseFloat(v) || 0 })}
              type="number"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Trenutne kulture i zasadi</Label>
            <Textarea
              value={state.currentCrops}
              onChange={(v) => setState({ ...state, currentCrops: v })}
              rows={3}
            />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon="📋">Tabela 1.5 – Popis postojeće imovine gazdinstva</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-emerald-800 text-white">
                {["Br.", "Naziv imovine", "Vrsta", "Količina", "J.M.", "Knj. vrednost (RSD)", ""].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.existingAssets.map((a, i) => (
                <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-emerald-50/40"}>
                  <td className="px-3 py-1.5 text-slate-500 text-xs">{i + 1}</td>
                  <td className="px-2 py-1.5"><Input value={a.name} onChange={(v) => updateAsset(a.id, "name", v)} /></td>
                  <td className="px-2 py-1.5">
                    <select
                      value={a.type}
                      onChange={(e) => updateAsset(a.id, "type", e.target.value)}
                      className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none w-full"
                    >
                      {assetTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5"><Input value={a.quantity} onChange={(v) => updateAsset(a.id, "quantity", v)} type="number" /></td>
                  <td className="px-2 py-1.5"><Input value={a.unit} onChange={(v) => updateAsset(a.id, "unit", v)} /></td>
                  <td className="px-2 py-1.5"><Input value={a.bookValue} onChange={(v) => updateAsset(a.id, "bookValue", v)} type="number" /></td>
                  <td className="px-2 py-1.5">
                    <button onClick={() => removeAsset(a.id)} className="text-red-400 hover:text-red-600 font-bold transition">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50 font-semibold">
                <td colSpan={5} className="px-3 py-2 text-xs text-emerald-800">UKUPNO knjig. vrednost</td>
                <td className="px-3 py-2 text-xs text-emerald-900 font-bold">
                  {fmtRSD(state.existingAssets.reduce((s, a) => s + a.bookValue, 0))}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <button
          onClick={addAsset}
          className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition"
        >
          <span className="text-base font-black">＋</span> Dodaj imovinu
        </button>
      </Card>
    </div>
  );
}

function Tab3({ state, setState }: { state: FormState; setState: (s: FormState) => void }) {
  const upd = (field: keyof FormState) => (val: string) =>
    setState({ ...state, [field]: isNaN(Number(val)) ? val : Number(val) || val });

  function updateItem(id: string, field: keyof CostItem, val: string) {
    setState({
      ...state,
      investmentItems: state.investmentItems.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "name" || field === "unit" ? val : parseFloat(val) || 0 }
          : item
      ),
    });
  }

  function addItem() {
    setState({
      ...state,
      investmentItems: [
        ...state.investmentItems,
        { id: `i${Date.now()}`, name: "", unit: "kom", qty: 1, priceWithVAT: 0, vatRate: 0.20 },
      ],
    });
  }

  function removeItem(id: string) {
    setState({ ...state, investmentItems: state.investmentItems.filter((i) => i.id !== id) });
  }

  const totalNet = calcTotalInvestmentNet(state.investmentItems);
  const totalGross = calcTotalInvestmentGross(state.investmentItems);

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon="🎯">Opis projekta</SectionTitle>
        <div className="space-y-4">
          <div>
            <Label>Naziv projekta</Label>
            <Input value={state.projectTitle} onChange={(v) => setState({ ...state, projectTitle: v })} />
          </div>
          <div>
            <Label>Opis projekta (konzultantski tekst)</Label>
            <Textarea value={state.projectDescription} onChange={(v) => setState({ ...state, projectDescription: v })} rows={5} />
          </div>
          <div>
            <Label>Cilj projekta i očekivani rezultati</Label>
            <Textarea value={state.projectObjective} onChange={(v) => setState({ ...state, projectObjective: v })} rows={4} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Godina početka</Label>
              <Input value={state.startYear} onChange={upd("startYear")} type="number" />
            </div>
            <div>
              <Label>Rok realizacije (meseci)</Label>
              <Input value={state.implementationMonths} onChange={upd("implementationMonths")} type="number" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon="💰">Tabela 3.2 – Specifikacija investicionih troškova</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-emerald-800 text-white">
                {["Br.", "Naziv stavke", "J.M.", "Kol.", "Cena sa PDV (RSD)", "Stopa PDV", "Neto (RSD)", "Ukupno neto (RSD)", ""].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.investmentItems.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-emerald-50/40"}>
                  <td className="px-3 py-1.5 text-slate-500 text-xs">{i + 1}</td>
                  <td className="px-2 py-1.5 min-w-[160px]"><Input value={item.name} onChange={(v) => updateItem(item.id, "name", v)} /></td>
                  <td className="px-2 py-1.5 w-24"><Input value={item.unit} onChange={(v) => updateItem(item.id, "unit", v)} /></td>
                  <td className="px-2 py-1.5 w-20"><Input value={item.qty} onChange={(v) => updateItem(item.id, "qty", v)} type="number" /></td>
                  <td className="px-2 py-1.5 w-32"><Input value={item.priceWithVAT} onChange={(v) => updateItem(item.id, "priceWithVAT", v)} type="number" /></td>
                  <td className="px-2 py-1.5 w-24">
                    <select
                      value={item.vatRate}
                      onChange={(e) => updateItem(item.id, "vatRate", e.target.value)}
                      className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-sm focus:border-emerald-500 focus:outline-none w-full"
                    >
                      <option value="0.20">20%</option>
                      <option value="0.10">10%</option>
                      <option value="0">0%</option>
                    </select>
                  </td>
                  <td className="px-3 py-1.5 text-xs text-slate-600 w-28">{fmt(calcNetPrice(item))}</td>
                  <td className="px-3 py-1.5 text-xs font-semibold text-emerald-800 w-32">{fmt(calcNetPrice(item) * item.qty)}</td>
                  <td className="px-2 py-1.5">
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 font-bold transition">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-700 text-white font-bold">
                <td colSpan={7} className="px-3 py-2 text-xs">UKUPNO (bez PDV-a)</td>
                <td className="px-3 py-2 text-xs">{fmtRSD(totalNet)}</td>
                <td />
              </tr>
              <tr className="bg-emerald-50 text-emerald-700 font-semibold">
                <td colSpan={7} className="px-3 py-2 text-xs">UKUPNO (sa PDV-om)</td>
                <td className="px-3 py-2 text-xs">{fmtRSD(totalGross)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <button onClick={addItem} className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition">
          <span className="text-base font-black">＋</span> Dodaj stavku
        </button>
      </Card>

      <Card>
        <SectionTitle icon="🏦">Tabela 3.3 – Struktura finansiranja</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Sopstvena sredstva (%)", field: "ownFundsPercent" as const },
            { label: "IPARD grant (%)", field: "ipardGrantPercent" as const },
            { label: "Kredit (%)", field: "loanPercent" as const },
          ].map(({ label, field }) => (
            <div key={field}>
              <Label>{label}</Label>
              <Input value={state[field] as number} onChange={upd(field)} type="number" />
              <div className="text-xs text-slate-500 mt-1">
                = {fmtRSD((totalNet * (state[field] as number)) / 100)}
              </div>
            </div>
          ))}
        </div>

        {/* Visual bar */}
        <div className="mt-4">
          <div className="h-4 rounded-full overflow-hidden flex gap-0.5">
            <div
              className="bg-emerald-600 transition-all"
              style={{ width: `${state.ownFundsPercent}%` }}
              title={`Sopstvena: ${state.ownFundsPercent}%`}
            />
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${state.ipardGrantPercent}%` }}
              title={`IPARD: ${state.ipardGrantPercent}%`}
            />
            <div
              className="bg-blue-400 transition-all"
              style={{ width: `${state.loanPercent}%` }}
              title={`Kredit: ${state.loanPercent}%`}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-600 rounded-sm inline-block" />Sopstvena</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded-sm inline-block" />IPARD grant</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-sm inline-block" />Kredit</span>
          </div>
        </div>

        {state.loanPercent > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-100">
            <div>
              <Label>Kamatna stopa (%)</Label>
              <Input value={state.loanInterestRate} onChange={upd("loanInterestRate")} type="number" />
            </div>
            <div>
              <Label>Rok otplate (god.)</Label>
              <Input value={state.loanTermYears} onChange={upd("loanTermYears")} type="number" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Tab4({ state, setState }: { state: FormState; setState: (s: FormState) => void }) {
  const upd = (field: keyof FormState) => (val: string) =>
    setState({ ...state, [field]: parseFloat(val) || 0 });

  function updateProjection(idx: number, field: keyof YearProjection, val: string) {
    const updated = [...state.projections];
    updated[idx] = { ...updated[idx], [field]: parseFloat(val) || 0 };
    setState({ ...state, projections: updated });
  }

  const calc = calcFinancials(state);

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle icon="📊">Projekcija prihoda (5-godišnja)</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div>
            <Label>Naziv proizvoda</Label>
            <Input value={state.productName} onChange={(v) => setState({ ...state, productName: v })} />
          </div>
          <div>
            <Label>Jedinica mere</Label>
            <Input value={state.productUnit} onChange={(v) => setState({ ...state, productUnit: v })} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-emerald-800 text-white">
                {["Godina", "Prinos (t/ha)", "Ha", "Cena/t (RSD)", "Ostali prihodi (RSD)", "Ukupni prihodi (RSD)"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.projections.map((p, i) => {
                const rev = p.yieldTonPerHa * p.hectares * p.pricePerTon + p.otherRevenue;
                return (
                  <tr key={p.year} className={i % 2 === 0 ? "bg-white" : "bg-emerald-50/40"}>
                    <td className="px-3 py-1.5 font-bold text-emerald-800 text-xs">{p.year}</td>
                    <td className="px-2 py-1.5"><Input value={p.yieldTonPerHa} onChange={(v) => updateProjection(i, "yieldTonPerHa", v)} type="number" /></td>
                    <td className="px-2 py-1.5"><Input value={p.hectares} onChange={(v) => updateProjection(i, "hectares", v)} type="number" /></td>
                    <td className="px-2 py-1.5"><Input value={p.pricePerTon} onChange={(v) => updateProjection(i, "pricePerTon", v)} type="number" /></td>
                    <td className="px-2 py-1.5"><Input value={p.otherRevenue} onChange={(v) => updateProjection(i, "otherRevenue", v)} type="number" /></td>
                    <td className="px-3 py-1.5 font-bold text-emerald-800 text-xs">{fmtRSD(rev)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionTitle icon="💸">Troškovi poslovanja</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label>Varijabilni troškovi (RSD/t)</Label>
            <Input value={state.variableCostPerTon} onChange={upd("variableCostPerTon")} type="number" />
            <p className="text-xs text-slate-500 mt-1">Inputi, zaštita, berba itd. po toni</p>
          </div>
          <div>
            <Label>Fiksni troškovi godišnji (RSD)</Label>
            <Input value={state.fixedCostsAnnual} onChange={upd("fixedCostsAnnual")} type="number" />
            <p className="text-xs text-slate-500 mt-1">Komunalije, osiguranje, održavanje</p>
          </div>
          <div>
            <Label>Troškovi rada godišnji (RSD)</Label>
            <Input value={state.laborCostsAnnual} onChange={upd("laborCostsAnnual")} type="number" />
            <p className="text-xs text-slate-500 mt-1">Plate, doprinosi, sezonski radnici</p>
          </div>
          <div>
            <Label>Stopa amortizacije opreme (%)</Label>
            <Input value={state.depreciationRate * 100} onChange={(v) => setState({ ...state, depreciationRate: (parseFloat(v) || 0) / 100 })} type="number" />
            <p className="text-xs text-slate-500 mt-1">IPARD standard: 10% godišnje na cenu bez PDV-a</p>
          </div>
          <div>
            <Label>Stopa poreza na dobit (%)</Label>
            <Input value={state.taxRate * 100} onChange={(v) => setState({ ...state, taxRate: (parseFloat(v) || 0) / 100 })} type="number" />
          </div>
          <div>
            <Label>Ostatak vrednosti na kraju – Godina 5 (%)</Label>
            <Input value={state.residualValuePercent * 100} onChange={(v) => setState({ ...state, residualValuePercent: (parseFloat(v) || 0) / 100 })} type="number" />
            <p className="text-xs text-slate-500 mt-1">Ostatak vrednosti kao % od neto investicije</p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon="📈">Pregled projektovanih finansija</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-800 text-white">
                {["Pozicija", ...calc.years.map((y) => y.year)].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Prihodi (RSD)", key: "revenue" as const, bold: false },
                { label: "Var. troškovi (RSD)", key: "variableCosts" as const, bold: false },
                { label: "Fiksni troškovi (RSD)", key: "fixedCosts" as const, bold: false },
                { label: "Troškovi rada (RSD)", key: "laborCosts" as const, bold: false },
                { label: "Bruto dobit (RSD)", key: "grossProfit" as const, bold: true },
                { label: "Amortizacija (RSD)", key: "depreciation" as const, bold: false },
                { label: "EBIT (RSD)", key: "ebit" as const, bold: true },
                { label: "Porez na dobit 10% (RSD)", key: "tax" as const, bold: false },
                { label: "NETO DOBIT (RSD)", key: "netProfit" as const, bold: true },
              ].map(({ label, key, bold }, ri) => (
                <tr key={key} className={ri % 2 === 0 ? "bg-white" : "bg-emerald-50/30"}>
                  <td className={`px-3 py-2 ${bold ? "font-bold text-emerald-900" : "text-slate-700"}`}>{label}</td>
                  {calc.years.map((y) => (
                    <td key={y.year} className={`px-3 py-2 text-right ${bold ? "font-bold text-emerald-800" : ""}`}>
                      {fmt(y[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS / DASHBOARD SCREEN
// ─────────────────────────────────────────────────────────────────────────────

function SuccessDashboard({ state, onBack }: { state: FormState; onBack: () => void }) {
  const calc = calcFinancials(state);
  const totalInvestmentNet = calc.totalInvestmentNet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 text-white text-3xl mb-4 shadow-lg">
            ✓
          </div>
          <h1 className="text-3xl font-black text-emerald-900 tracking-tight">Poslovni plan je spreman!</h1>
          <p className="text-slate-600 mt-2 text-sm">{state.projectTitle}</p>
          <p className="text-slate-500 text-xs mt-1">{state.applicantName} · BPG: {state.bpg}</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <KPICard label="Ukupna investicija" value={`${fmt(totalInvestmentNet / 1000000, 2)}M`} sub="RSD (bez PDV-a)" icon="💰" color="emerald" />
          <KPICard label="NPV (8%)" value={`${fmt(calc.npv / 1000, 0)}K`} sub="RSD" icon="📈" color={calc.npv > 0 ? "blue" : "rose"} />
          <KPICard label="IRR" value={`${calc.irr.toFixed(1)}%`} sub="Interna stopa prinosa" icon="🎯" color="teal" />
          <KPICard label="Payback period" value={`${calc.payback.toFixed(1)} god.`} sub="Povrat investicije" icon="⏱" color="amber" />
          <KPICard label="Rentabilnost" value={`${calc.profitability.toFixed(1)}%`} sub="D/PVI × 100" icon="📊" color="violet" />
          <KPICard label="Ekonomičnost" value={calc.economy.toFixed(2)} sub="UP/UI (>1 = dobro)" icon="⚖️" color={calc.economy >= 1 ? "emerald" : "rose"} />
        </div>

        {/* Financial Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <SectionTitle icon="💹">Finansijski rezime projekta</SectionTitle>
            <div className="space-y-3">
              {[
                { label: "Ukupna investicija (bez PDV)", value: fmtRSD(totalInvestmentNet) },
                { label: "Ukupna investicija (sa PDV)", value: fmtRSD(calc.totalInvestmentGross) },
                { label: "Ekonomičnost (E = UP/UI)", value: calc.economy.toFixed(3) },
                { label: "Akumulativnost (D/UPr × 100)", value: `${calc.accumulativeness.toFixed(1)}%` },
                { label: "Rentabilnost (D/PVI × 100)", value: `${calc.profitability.toFixed(1)}%` },
                { label: "ROI (5 godina)", value: `${calc.roi.toFixed(1)}%` },
                { label: "NPV pri diskontnoj stopi 8%", value: fmtRSD(calc.npv) },
                { label: "Interna stopa prinosa (IRR)", value: `${calc.irr.toFixed(1)}%` },
                { label: "Period povrata investicije", value: `${calc.payback.toFixed(1)} godina` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-emerald-50 last:border-0">
                  <span className="text-xs text-slate-600">{label}</span>
                  <span className="text-sm font-bold text-emerald-800">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle icon="📅">Neto Cash Flow po godinama</SectionTitle>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 pb-1 border-b border-emerald-100">
                <span>Godina 0 (Investicija)</span>
                <span className="font-bold text-red-600">– {fmtRSD(totalInvestmentNet)}</span>
              </div>
              {calc.years.map((y, i) => {
                const maxCF = Math.max(...calc.years.map((y) => Math.abs(y.cashFlow)));
                const pct = (Math.abs(y.cashFlow) / maxCF) * 100;
                return (
                  <div key={y.year}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-600">
                        {y.year} {i === calc.years.length - 1 ? "(+ ostatak vrednosti)" : ""}
                      </span>
                      <span className="font-bold text-emerald-700">{fmtRSD(y.cashFlow)}</span>
                    </div>
                    <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Kum: {fmtRSD(y.cumulativeCashFlow)}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => downloadPdf(state)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-4 shadow-lg transition text-sm"
          >
            <span className="text-lg">📄</span>
            Preuzmi PDF (Zvanični format)
          </button>
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 text-emerald-800 font-semibold px-8 py-4 transition text-sm"
          >
            <span>←</span> Vrati se na obrazac
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HOME COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 0, label: "Osnovni podaci", icon: "👤", short: "Podaci" },
  { id: 1, label: "Postojeća imovina", icon: "🏚", short: "Imovina" },
  { id: 2, label: "Investicija i plan", icon: "🌱", short: "Investicija" },
  { id: 3, label: "Finansijska projekcija", icon: "📊", short: "Finansije" },
];

export default function Home() {
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = useCallback(() => {
    const errs: string[] = [];
    if (!state.applicantName.trim()) errs.push("Naziv gazdinstva je obavezan");
    if (!state.bpg.trim()) errs.push("BPG broj je obavezan");
    if (state.investmentItems.length === 0) errs.push("Dodajte bar jednu investicionu stavku");
    if (state.projections.some((p) => p.yieldTonPerHa <= 0)) errs.push("Prinos mora biti > 0 za sve godine");
    const totalPct = state.ownFundsPercent + state.ipardGrantPercent + state.loanPercent;
    if (Math.abs(totalPct - 100) > 0.5) errs.push(`Struktura finansiranja mora biti 100% (trenutno ${totalPct}%)`);
    return errs;
  }, [state]);

  function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setSubmitted(true);
  }

  if (submitted) {
    return <SuccessDashboard state={state} onBack={() => setSubmitted(false)} />;
  }

  const calc = calcFinancials(state);
  const totalNet = calcTotalInvestmentNet(state.investmentItems);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white">
      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-50 bg-emerald-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <div className="font-black text-sm tracking-tight leading-tight">AgroPlan Pro</div>
              <div className="text-emerald-300 text-xs leading-tight">IPARD / Ministarstvo poljoprivrede RS</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs text-emerald-200">
            <span>Investicija: <strong className="text-white">{fmtRSD(totalNet)}</strong></span>
            <span>IRR: <strong className="text-white">{calc.irr.toFixed(1)}%</strong></span>
            <span>NPV: <strong className={calc.npv > 0 ? "text-emerald-300" : "text-red-300"}>{fmtRSD(calc.npv)}</strong></span>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-amber-400 hover:bg-amber-300 text-emerald-900 font-black text-xs px-4 py-2 rounded-lg shadow transition"
          >
            Generiši PDF ↗
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-700 mb-2">⚠ Molimo ispravite sledeće greške:</p>
            <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* Progress/Tabs */}
        <div className="mb-6">
          <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-emerald-100">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-700 text-white shadow-md"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:block">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mini Live KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {[
            { label: "Investicija (bez PDV)", value: fmtRSD(totalNet), icon: "💰" },
            { label: "NPV (8%)", value: fmtRSD(calc.npv), icon: "📈" },
            { label: "IRR", value: `${calc.irr.toFixed(1)}%`, icon: "🎯" },
            { label: "Povrat (god.)", value: `${calc.payback.toFixed(1)}`, icon: "⏱" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-xl border border-emerald-100 shadow-sm px-3 py-2 flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="text-sm font-black text-emerald-800">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 0 && <Tab1 state={state} setState={setState} />}
          {activeTab === 1 && <Tab2 state={state} setState={setState} />}
          {activeTab === 2 && <Tab3 state={state} setState={setState} />}
          {activeTab === 3 && <Tab4 state={state} setState={setState} />}
        </div>

        {/* Bottom Nav */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
            disabled={activeTab === 0}
            className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 text-emerald-800 font-semibold px-5 py-3 transition text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prethodni korak
          </button>

          {activeTab < TABS.length - 1 ? (
            <button
              onClick={() => setActiveTab(activeTab + 1)}
              className="flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 shadow-md transition text-sm"
            >
              Sledeći korak →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-black px-8 py-3 shadow-lg transition text-sm"
            >
              <span className="text-base">📄</span> Generiši poslovni plan
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-emerald-100 bg-white py-4 text-center text-xs text-slate-400">
        AgroPlan Pro · Usklađeno sa IPARD standardima i modelom Ministarstva poljoprivrede RS ·{" "}
        <span className="text-emerald-600 font-semibold">Tabele: 1.1 · 1.5 · 3.2 · 3.3 · 4.1 · 5.1 · 5.2 · 6.1</span>
      </footer>
    </div>
  );
}