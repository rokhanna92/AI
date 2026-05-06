import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { GlobalProfile, Path1State, Path2State, Path3State } from "../types";
import { calcPath1, calcPath2, calcPath3 } from "./math";
import { fmtRSD, fmtN, formatNarrative } from "./formatters";

const PDF_HS = {
  fillColor: [54, 124, 43] as [number, number, number],
  textColor: 255,
  fontStyle: "bold" as const,
  fontSize: 8,
};
const PDF_BASE = {
  styles: { fontSize: 7.5, cellPadding: 2.5 },
  headStyles: PDF_HS,
  alternateRowStyles: { fillColor: [235, 245, 232] as [number, number, number] },
  theme: "grid" as const,
};
const PDF_FS = {
  fontStyle: "bold" as const,
  fillColor: [212, 235, 208] as [number, number, number],
};

function addCoverPage(doc: jsPDF, p: GlobalProfile, title: string, sub: string) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(54, 124, 43);
  doc.rect(0, 0, pw, 55, "F");
  doc.setFillColor(255, 222, 0);
  doc.rect(0, 52, pw, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 222, 0);
  doc.text("AGRO", 14, 22);
  doc.setTextColor(255, 255, 255);
  doc.text("PLAN", 14 + doc.getTextWidth("AGRO") + 2, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Ministarstvo poljoprivrede RS · IPARD program", 14, 32);
  doc.setFontSize(8);
  doc.setTextColor(200, 240, 190);
  doc.text(sub, 14, 42);
  doc.setTextColor(26, 26, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, pw / 2, 74, { align: "center", maxWidth: 175 });
  autoTable(doc, {
    startY: 84,
    body: [
      ["Naziv gazdinstva:", p.gazdinstvoName],
      ["Nosilac:", p.nosilac],
      ["JMBG/MB:", p.jmbgMb],
      ["BPG:", p.bpg],
      ["Opština:", p.opstina],
      ["Kontakt:", `${p.telefon} | ${p.email}`],
      ["Banka / Račun:", `${p.banka} | ${p.racun}`],
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 }, 1: { cellWidth: 130 } },
    ...PDF_BASE,
    headStyles: undefined,
    alternateRowStyles: { fillColor: [248, 252, 248] as [number, number, number] },
  });
}

function addPageNums(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  const pw = doc.internal.pageSize.getWidth();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160);
    doc.text(`Str. ${i} od ${total}`, pw - 14, 290, { align: "right" });
  }
}

function tblH(doc: jsPDF, y: number, text: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(54, 124, 43);
  doc.text(text, 14, y);
}

export function generatePath1PDF(profile: GlobalProfile, s: Path1State) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const calc = calcPath1(s);
  addCoverPage(doc, profile, "POSLOVNI PLAN GAZDINSTVA\n(Model Agro Vojvodina – IPARD Mera 1)", "Model poslovnog plana za investicije u fizičku imovinu");
  doc.addPage();
  tblH(doc, 18, "Tabela 1.1 – Zemljišni fond");
  autoTable(doc, {
    startY: 23,
    head: [["Br.", "Katastarska opština", "Broj parcele", "Površina (ha)", "Vlasništvo", "Kultura"]],
    body: s.parcels.map((p, i) => [i + 1, p.katMunicipality, p.parcelNumber, fmtN(p.area, 2), p.ownership, p.crop]),
    foot: [["", "UKUPNO", "", fmtN(s.parcels.reduce((a, p) => a + p.area, 0), 2) + " ha", "", ""]],
    footStyles: PDF_FS,
    ...PDF_BASE,
  });
  let y = (doc as any).lastAutoTable.finalY + 10;
  tblH(doc, y, "Tabela 1.2 – Stočni fond");
  autoTable(doc, {
    startY: y + 5,
    head: [["Vrsta stoke", "Broj grla", "Vrednost/grlu (RSD)", "Ukupno (RSD)"]],
    body: s.livestock.map(l => [l.name, l.qty, fmtRSD(l.valuePerHead), fmtRSD(l.qty * l.valuePerHead)]),
    foot: [["UKUPNO", "", "", fmtRSD(s.livestock.reduce((a, l) => a + l.qty * l.valuePerHead, 0))]],
    footStyles: PDF_FS,
    ...PDF_BASE,
  });
  y = (doc as any).lastAutoTable.finalY + 10;
  tblH(doc, y, "Tabela 1.3 – Objekti");
  autoTable(doc, {
    startY: y + 5,
    head: [["Naziv objekta", "Površina (m²)", "Vrednost (RSD)"]],
    body: s.buildings.map(b => [b.name, fmtN(b.area), fmtRSD(b.value)]),
    foot: [["UKUPNO", "", fmtRSD(s.buildings.reduce((a, b) => a + b.value, 0))]],
    footStyles: PDF_FS,
    ...PDF_BASE,
  });
  y = (doc as any).lastAutoTable.finalY + 10;
  tblH(doc, y, "Tabela 1.4 – Mehanizacija");
  autoTable(doc, {
    startY: y + 5,
    head: [["Naziv", "Kom", "Vrednost (RSD)"]],
    body: s.machinery.map(m => [m.name, m.qty, fmtRSD(m.value)]),
    foot: [["UKUPNO", "", fmtRSD(s.machinery.reduce((a, m) => a + m.value, 0))]],
    footStyles: PDF_FS,
    ...PDF_BASE,
  });
  doc.addPage();
  tblH(doc, 18, "Tabela 1.5 – Vrednost osnovnih sredstava");
  autoTable(doc, {
    startY: 23,
    body: [
      ["Zemljište", fmtRSD(s.landValue)],
      ["Objekti", fmtRSD(s.buildingValue)],
      ["Stočni fond", fmtRSD(s.livestockValue)],
      ["Mehanizacija", fmtRSD(s.equipmentValue)],
    ],
    foot: [["UKUPNA AKTIVA", fmtRSD(calc.totalAssets)]],
    footStyles: PDF_FS,
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } },
    ...PDF_BASE,
    headStyles: undefined,
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y, "Tabela 3.2 – Specifikacija investicije");
  autoTable(doc, {
    startY: y + 5,
    head: [["Stavka", "JM", "Količina", "Cena neto (RSD)", "Ukupno neto (RSD)", "Ukupno sa PDV (RSD)"]],
    body: s.investmentItems.map(i => [i.name, i.unit, i.qty, fmtRSD(i.priceNet), fmtRSD(i.priceNet * i.qty), fmtRSD(i.priceNet * i.qty * 1.2)]),
    foot: [["UKUPNO", "", "", "", fmtRSD(calc.totalInvNet), fmtRSD(calc.totalInvGross)]],
    footStyles: PDF_FS,
    ...PDF_BASE,
  });
  doc.addPage();
  tblH(doc, 18, "Tabela 3.3 – Izvori finansiranja");
  autoTable(doc, {
    startY: 23,
    body: [
      ["Sopstvena sredstva", fmtRSD(s.ownFunds)],
      ["IPARD podsticaj (50% neto vrednosti)", fmtRSD(calc.grants)],
      ["Kredit (ostatak)", fmtRSD(Math.max(0, calc.loan))],
      ["UKUPNO ULAGANJE (sa PDV)", fmtRSD(calc.totalInvGross)],
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 100 } },
    ...PDF_BASE,
    headStyles: undefined,
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y, "Tabela 5.1 – Projekcija prihoda i neto dobiti");
  autoTable(doc, {
    startY: y + 5,
    head: [["Pozicija", "G1 (2026)", "G2 (2027)", "G3 (2028)", "G4 (2029)", "G5 (2030)"]],
    body: [
      ["Prihodi (RSD)", ...calc.profits.map(p => fmtRSD(p.revenue))],
      ["Amortizacija (RSD)", ...calc.profits.map(() => fmtRSD(calc.annualDep))],
      ["Bruto dobit (RSD)", ...calc.profits.map(p => fmtRSD(p.gross))],
      ["Porez 10% (RSD)", ...calc.profits.map(p => fmtRSD(p.tax))],
      ["NETO DOBIT (RSD)", ...calc.profits.map(p => fmtRSD(p.net))],
    ],
    ...PDF_BASE,
    styles: { fontSize: 7, cellPadding: 2 },
    didParseCell: (d: any) => {
      if (d.row.index === 4) {
        d.cell.styles.fontStyle = "bold";
        d.cell.styles.fillColor = [212, 235, 208];
      }
    },
  });
  addPageNums(doc);
  doc.save(`PoslovniPlan_IPARD_${profile.gazdinstvoName.replace(/\s/g, "_")}.pdf`);
}

export function generatePath2PDF(profile: GlobalProfile, s: Path2State) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const calc = calcPath2(s);
  addCoverPage(doc, profile, "POSLOVNI PLAN\n(Model Mladi Preduzetnik)", "Prilagođeno za start-up podsticaje i ekonomsku ocenu projekta");
  doc.addPage();
  tblH(doc, 18, "Sekcija 3 – Opis poslovne ideje i analiza tržišta");
  const pw = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50);
  const d1 = doc.splitTextToSize(`Poslovna ideja: ${formatNarrative(s.opisPoslovneIdeje)}`, pw - 28);
  doc.text(d1, 14, 26);
  let y = 26 + d1.length * 5 + 8;
  const d2 = doc.splitTextToSize(`Prodajno: ${formatNarrative(s.analizaProdajnog)}\n\nNabavno: ${formatNarrative(s.analizaNabavnog)}`, pw - 28);
  doc.text(d2, 14, y + 8);
  y = y + 8 + d2.length * 5 + 10;
  if (y > 230) { doc.addPage(); y = 18; }
  tblH(doc, y, "Tabela 8.1 – Plan prihoda (5 godina)");
  autoTable(doc, {
    startY: y + 5,
    head: [["Proizvod", "J. cena (RSD)", "2026", "2027", "2028", "2029", "2030", "Prosek (RSD)"]],
    body: s.products.map(p => [p.name, fmtRSD(p.unitPrice), ...p.qty.map(q => fmtRSD(p.unitPrice * q)), fmtRSD(p.qty.reduce((a, q) => a + p.unitPrice * q, 0) / 5)]),
    foot: [["UKUPNO", "", ...calc.revenueByYear.map(r => fmtRSD(r)), fmtRSD(calc.revenueByYear.reduce((a, r) => a + r, 0) / 5)]],
    footStyles: PDF_FS,
    ...PDF_BASE,
    styles: { fontSize: 7, cellPadding: 2 },
  });
  doc.addPage();
  tblH(doc, 18, "Tabele 8.2.1 – 8.2.6 – Pregled troškova");
  autoTable(doc, {
    startY: 23,
    head: [["Kategorija troška", "Iznos (RSD/god)"]],
    body: [
      ["8.2.1 – Seme i sadni materijal", fmtRSD(s.materialCosts.seeds)],
      ["8.2.1 – Đubrivo", fmtRSD(s.materialCosts.fertilizer)],
      ["8.2.1 – Hemijska zaštita bilja", fmtRSD(s.materialCosts.chemicals)],
      ["8.2.2 – Gorivo", fmtRSD(s.energyCosts.fuel)],
      ["8.2.2 – Električna energija", fmtRSD(s.energyCosts.electricity)],
      ["8.2.4 – Amortizacija (10%)", fmtRSD(calc.amortizacija)],
      ["8.2.5 – Osiguranje", fmtRSD(s.nonMaterialCosts.insurance)],
      ["8.2.5 – Računovodstvo", fmtRSD(s.nonMaterialCosts.accounting)],
      ["8.2.5 – Registracije/takse", fmtRSD(s.nonMaterialCosts.registration)],
      [`8.2.6 – Bruto zarade (${s.workers} radn. x ${fmtRSD(s.monthlyWage)}/mes x 12)`, fmtRSD(calc.laborAnnual)],
    ],
    foot: [["UKUPNI TROŠKOVI (godišnje)", fmtRSD(calc.totalCosts)]],
    footStyles: PDF_FS,
    ...PDF_BASE,
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y, "Tabela 8.2.8 – Bilans uspeha");
  autoTable(doc, {
    startY: y + 5,
    head: [["Pozicija", "2026", "2027", "2028", "2029", "2030"]],
    body: [
      ["Ukupni prihodi (RSD)", ...calc.results.map(r => fmtRSD(r.rev))],
      ["Ukupni rashodi (RSD)", ...calc.results.map(r => fmtRSD(r.totalCosts))],
      ["Bruto dobit (RSD)", ...calc.results.map(r => fmtRSD(r.gross))],
      ["Porez (10%) (RSD)", ...calc.results.map(r => fmtRSD(r.tax))],
      ["NETO DOBIT (RSD)", ...calc.results.map(r => fmtRSD(r.net))],
    ],
    ...PDF_BASE,
    styles: { fontSize: 7, cellPadding: 2 },
    didParseCell: (d: any) => {
      if (d.row.index === 4) {
        d.cell.styles.fontStyle = "bold";
        d.cell.styles.fillColor = [212, 235, 208];
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y, "Tabela 9 – Ocena efikasnosti projekta");
  autoTable(doc, {
    startY: y + 5,
    head: [["Pokazatelj", "Formula", "Vrednost", "Ocena"]],
    body: [
      ["ROI – Rentabilnost", "Neto dobit / Ulaganja x 100", `${calc.roi.toFixed(1)}%`, calc.roi > 10 ? "Prihvatljivo" : "Ispod praga"],
      ["Ekonomičnost", "Ukupni prihod / Ukupni rashod", calc.economicity.toFixed(3), calc.economicity >= 1 ? "Projekat je ekonomican" : "Nije ekonomican"],
      ["Vreme povracaja", "Ulaganja / Godišnji neto priliv", `${calc.payback.toFixed(1)} god.`, ""],
    ],
    ...PDF_BASE,
  });
  addPageNums(doc);
  doc.save(`PoslovniPlan_MladiPreduzetnik_${profile.gazdinstvoName.replace(/\s/g, "_")}.pdf`);
}

export function generatePath3PDF(profile: GlobalProfile, s: Path3State) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const calc = calcPath3(s);
  addCoverPage(doc, profile, "POSLOVNI PLAN – SISTEM ZA NAVODNJAVANJE\n(Tehnička investicija)", "Model poslovnog plana za navodnjavanje – IPARD Mera 1");
  doc.addPage();
  tblH(doc, 18, "Tabela 1.2 – Lokacija investicije");
  autoTable(doc, {
    startY: 23,
    body: [
      ["Katastarska opština", s.katMunicipality],
      ["Površina pod navodnjavanjem", `${fmtN(s.hectares, 2)} ha`],
      ["Postojeće pumpe", s.existingPumps],
      ["Postojeći traktori", s.existingTractors],
      ["Ostala mehanizacija/alati", s.existingTools],
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 } },
    ...PDF_BASE,
    headStyles: undefined,
  });
  const y33 = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y33, "Tabela 3.3 – Specifikacija investicionih stavki");
  autoTable(doc, {
    startY: y33 + 5,
    head: [["Br.", "Naziv stavke", "J.M.", "Količina", "Cena (RSD)", "Ukupno (RSD)"]],
    body: s.items.map((i, idx) => [idx + 1, i.name, i.unit, i.qty, fmtRSD(i.price), fmtRSD(i.price * i.qty)]),
    foot: [["", "UKUPNO INVESTICIJA", "", "", "", fmtRSD(calc.totalInv)]],
    footStyles: PDF_FS,
    ...PDF_BASE,
  });
  const y53 = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y53, "Tabela 5.3 – Staticka ocena efikasnosti investicije");
  autoTable(doc, {
    startY: y53 + 5,
    head: [["Godina", "Prihodi (RSD)", "Rashodi (RSD)", "Neto efekat (RSD)", "Koef. efikasnosti", "Ocena"]],
    body: calc.efficiency.map(e => [e.year, fmtRSD(e.revenue), fmtRSD(e.expense), fmtRSD(e.net), e.coeff.toFixed(3), e.coeff > 1 ? "Prihvatljivo" : "Ispod 1.0"]),
    foot: [["PROSEK", "", "", fmtRSD(calc.efficiency.reduce((a, e) => a + e.net, 0) / 5), calc.avgCoeff.toFixed(3), calc.avgCoeff > 1 ? "PROJEKAT VALIDAN" : "NIJE VALIDAN"]],
    footStyles: { ...PDF_FS, fillColor: calc.avgCoeff > 1 ? [212, 235, 208] : [254, 226, 226] as [number, number, number] },
    ...PDF_BASE,
  });
  addPageNums(doc);
  doc.save(`PoslovniPlan_Navodnjavanje_${profile.gazdinstvoName.replace(/\s/g, "_")}.pdf`);
}
