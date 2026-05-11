import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  GlobalProfile,
  Path1State,
  Path2State,
  Path3State,
} from "../types";
import type { IPARDPlanJSON } from "../types/ipard";
import { calcPath1, calcPath2, calcPath3 } from "./math";
import { fmtRSD, fmtN } from "./formatters";
import { addNormalFont } from "./fonts-normal";
import { addBoldFont } from "./fonts-bold";
import { type IPARDAIContent, AI_PLACEHOLDER } from "./ai";

export type RezimeUnos = { naziv: string; vrednost: string | number | null };

export type RezimeJSON = { rezime_poslovnog_plana: Record<string, RezimeUnos> };

const НАСЛОВИ_СЕКЦИЈА: Record<string, string> = {
  "1": "Пословни план",
  "2": "Предрачунска вредност улагања",
  "3": "Извори финансирања",
  "4": "Предмет инвестирања",
  "5": "Очекивани ефекти пројекта",
};

const БОЈА_НАСЛОВА: [number, number, number] = [255, 255, 255];
const БОЈА_ИВИЦЕ: [number, number, number] = [0, 0, 0];
const БОЈА_БЕЛА: [number, number, number] = [255, 255, 255];

function formatujVrednost(kljuc: string, v: string | number | null): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;

  const sekcija = kljuc.split(".")[0];

  if (sekcija === "2" || sekcija === "3")
    return (
      v.toLocaleString("sr-RS", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " РСД"
    );

  if (kljuc === "5.1") return v.toFixed(3);
  if (kljuc === "5.2" || kljuc === "5.3") return v.toFixed(2) + " %";

  return v.toLocaleString("sr-RS");
}

export function generateRezimeTable(
  doc: jsPDF,
  startY: number,
  podaci: RezimeJSON,
): number {
  const unosi = podaci.rezime_poslovnog_plana;

  const основниСтил: Parameters<typeof autoTable>[1] = {
    theme: "grid",
    styles: {
      font: "DejaVuSans",
      fontStyle: "normal",
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fontSize: 8,
      fillColor: БОЈА_БЕЛА,
      textColor: 0,
      lineWidth: 0.3,
      lineColor: БОЈА_ИВИЦЕ,
    },
    bodyStyles: {
      lineWidth: 0.3,
      lineColor: БОЈА_ИВИЦЕ,
    },
    alternateRowStyles: { fillColor: БОЈА_БЕЛА },
  };

  const редови: any[] = [];
  let тренутнаСекција = "";

  for (const [кључ, унос] of Object.entries(unosi)) {
    const секција = кључ.split(".")[0];

    if (секција !== тренутнаСекција) {
      const насловСекције = НАСЛОВИ_СЕКЦИЈА[секција] ?? секција + ". секција";
      редови.push([
        {
          content: секција + ".",
          styles: {
            fontStyle: "bold" as const,
            fillColor: БОЈА_НАСЛОВА,
            textColor: 0,
          },
        },
        {
          content: насловСекције,
          styles: {
            fontStyle: "bold" as const,
            fillColor: БОЈА_НАСЛОВА,
            textColor: 0,
          },
        },
        {
          content: "",
          styles: { fillColor: БОЈА_НАСЛОВА },
        },
      ]);
      тренутнаСекција = секција;
    }

    редови.push([
      кључ + ".",
      унос.naziv,
      {
        content: formatujVrednost(кључ, унос.vrednost),
        styles: { halign: "right" as const },
      },
    ]);
  }

  autoTable(doc, {
    startY,
    columnStyles: {
      0: { cellWidth: 18, halign: "center" as const },
      1: { cellWidth: 72 },
      2: { cellWidth: 80, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: {
            fontStyle: "bold" as const,
            halign: "center" as const,
            valign: "middle" as const,
          },
        },
        {
          content: "Опис",
          colSpan: 2,
          styles: { fontStyle: "bold" as const, halign: "center" as const },
        },
      ],
    ],
    body: редови,
    ...основниСтил,
  });

  return (doc as any).lastAutoTable.finalY;
}

const PDF_HS = {
  fillColor: [54, 124, 43] as [number, number, number],
  textColor: 255,
  fontStyle: "bold" as const,
  fontSize: 8,
};
const PDF_BASE = {
  styles: { fontSize: 7.5, cellPadding: 2.5 },
  headStyles: PDF_HS,
  alternateRowStyles: {
    fillColor: [235, 245, 232] as [number, number, number],
  },
  theme: "grid" as const,
};
const PDF_FS = {
  fontStyle: "bold" as const,
  fillColor: [212, 235, 208] as [number, number, number],
};

function addCoverPage(
  doc: jsPDF,
  p: GlobalProfile,
  title: string,
  sub: string,
) {
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
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 130 },
    },
    ...PDF_BASE,
    headStyles: undefined,
    alternateRowStyles: {
      fillColor: [248, 252, 248] as [number, number, number],
    },
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

// PATH 1 — IPARD VOJVODINA

function ipardToPath1State(plan: IPARDPlanJSON): Path1State {
  return {
    tabela11: {
      naziv: plan.cover.naziv_plana,
      investitor: plan.cover.investitor,
      lokacija: plan.cover.mesto_realizacije,
    },
    tabela21: {
      imeNaziv: plan.podaci.tabela21.imeNaziv,
      sediste: plan.podaci.tabela21.sediste,
      mesto: plan.podaci.tabela21.mesto,
      pib: plan.podaci.tabela21.pib,
      maticniBroj: plan.podaci.tabela21.maticniBroj,
      sifraDelatnosti: plan.podaci.tabela21.sifraDelatnosti,
      telefon: plan.podaci.tabela21.telefon,
      email: plan.podaci.tabela21.email,
    },
    tabela22: {
      adresaGazdinstva: plan.podaci.tabela22.adresaGazdinstva,
      bpg: plan.podaci.tabela22.bpg,
      datumRegistracije: plan.podaci.tabela22.datumRegistracije,
      brojZaposlenih: plan.podaci.tabela22.brojZaposlenih,
    },
    tabela23: {
      vlasnistvo_m2: plan.podaci.tabela23.vlasnistvo_m2,
      zakup_m2: plan.podaci.tabela23.zakup_m2,
      ustupljeno_m2: plan.podaci.tabela23.ustupljeno_m2,
    },
    kulture: plan.prihodi.kulture.map((k) => ({
      id: k.id,
      naziv: k.naziv,
      povrsina_ha: k.povrsina_ha,
    })),
    opisAktivnosti: plan.podaci.opisAktivnosti,
    namenaInvesticije: plan.investicija.namena,
    pocetakInvesticije: plan.investicija.pocetak,
    zavrsetakInvesticije: plan.investicija.zavrsetak,
    ekonomskiVek: plan.investicija.ekonomskiVek,
    osnSredstva: plan.investicija.osnSredstva.map((o) => ({
      id: o.id,
      naziv: o.naziv,
      kolicina: o.kolicina,
      cenaSaPDV: o.cenaSaPDV,
    })),
    sopstvenaProcenat: plan.investicija.sopstvenaProcenat,
    proizvodi: plan.prihodi.proizvodi.map((p) => ({
      id: p.id,
      naziv: p.naziv,
      jedinicaMere: p.jm,
      prodajnaCena: p.cena,
      kolicinePoGodini: p.kolicinePoGodini,
    })),
    trosak_sirovine: plan.troskovi.materijalni.sirovine,
    trosak_ambalaza: plan.troskovi.materijalni.ambalaza,
    trosak_ostaliMat: plan.troskovi.materijalni.ostali,
    trosak_struja: plan.troskovi.energija.struja,
    trosak_voda: plan.troskovi.energija.voda,
    trosak_ostalaEn: plan.troskovi.energija.ostala,
    trosak_odrzavanje: plan.troskovi.usluge.odrzavanje,
    trosak_ostaleUsl: plan.troskovi.usluge.ostale,
    amortizacija: plan.troskovi.amortizacija.map((a) => ({
      id: a.id,
      naziv: a.naziv,
      nabavnaVrednost: a.nabavnaVrednost,
      stopaAmortizacije: a.stopa,
    })),
    radnaSnaga_broj: plan.troskovi.radnaSnaga.broj,
    radnaSnaga_godisnjiTrosak: plan.troskovi.radnaSnaga.godisnjiTrosak,
    trosak_banka: plan.troskovi.nematerijalni.banka,
    trosak_osiguranje: plan.troskovi.nematerijalni.osiguranje,
    trosak_ostaliNemat: plan.troskovi.nematerijalni.ostali,
  };
}

export function buildIPARDFromState(
  _profile: GlobalProfile,
  s: Path1State,
): IPARDPlanJSON {
  const calc = calcPath1(s);
  const avgNet = calc.avgNet;
  const avgPrihod = calc.avgPrihod;
  const akum = avgPrihod > 0 ? (avgNet / avgPrihod) * 100 : 0;
  const rent = calc.totalInvSaPDV > 0 ? (avgNet / calc.totalInvSaPDV) * 100 : 0;
  const povYr = Math.floor(calc.povracaj);
  const povMo = (calc.povracaj - povYr) * 12;

  return {
    cover: {
      naziv_plana: s.tabela11.naziv,
      investitor: s.tabela21.imeNaziv,
      mesto_realizacije: s.tabela11.lokacija || s.tabela21.mesto,
      godina: String(new Date().getFullYear()),
    },
    rezime_poslovnog_plana: {
      "1.1": { naziv: "Назив", vrednost: s.tabela11.naziv },
      "1.2": {
        naziv: "Инвеститор",
        vrednost: `${s.tabela21.imeNaziv}, БПГ ${s.tabela22.bpg}, ${s.tabela21.sediste}, ${s.tabela21.mesto}`,
      },
      "1.3": {
        naziv: "Локација",
        vrednost: `${s.tabela21.sediste}, ${s.tabela21.mesto}`,
      },
      "2.1": { naziv: "Укупна улагања (са ПДВ)", vrednost: calc.totalInvSaPDV },
      "2.2": {
        naziv: "Улагања у основна средства",
        vrednost: calc.totalInvSaPDV,
      },
      "2.3": { naziv: "Улагања у обртна средства", vrednost: null },
      "3.1": {
        naziv: "Укупни извори финансирања",
        vrednost: calc.totalInvSaPDV,
      },
      "3.2": {
        naziv: `Сопствени извори (${s.sopstvenaProcenat}%)`,
        vrednost: calc.sopstvenaSredstva,
      },
      "3.3": {
        naziv: `Туђи извори (${100 - s.sopstvenaProcenat}%)`,
        vrednost: calc.tujaSredstva,
      },
      "4.1": { naziv: "Намена", vrednost: s.namenaInvesticije },
      "4.2": { naziv: "Почетак инвестирања", vrednost: s.pocetakInvesticije },
      "4.3": {
        naziv: "Завршетак инвестирања",
        vrednost: s.zavrsetakInvesticije,
      },
      "4.4": {
        naziv: "Економски век пројекта",
        vrednost: `${s.ekonomskiVek} година`,
      },
      "4.5": { naziv: "Тржиште продаје", vrednost: "1. Домаће\n2. Иностранo" },
      "5.1": { naziv: "Економичност", vrednost: calc.ekonomicnost },
      "5.2": { naziv: "Акумулативност", vrednost: akum },
      "5.3": { naziv: "Рентабилност", vrednost: rent },
      "5.4": {
        naziv: "Време повраћаја инвестиције",
        vrednost: `${povYr} год. и ${povMo.toFixed(2)} мес.`,
      },
      "5.5": {
        naziv: "Укупна ангажованост радне снаге",
        vrednost: `${s.radnaSnaga_broj} стална запослена радника`,
      },
    },
    podaci: {
      tabela21: { ...s.tabela21 },
      tabela22: { ...s.tabela22 },
      tabela23: { ...s.tabela23 },
      opisAktivnosti: s.opisAktivnosti,
    },
    investicija: {
      namena: s.namenaInvesticije,
      pocetak: s.pocetakInvesticije,
      zavrsetak: s.zavrsetakInvesticije,
      ekonomskiVek: s.ekonomskiVek,
      osnSredstva: s.osnSredstva.map((o) => ({ ...o })),
      sopstvenaProcenat: s.sopstvenaProcenat,
    },
    prihodi: {
      kulture: s.kulture.map((k) => ({ ...k })),
      proizvodi: s.proizvodi.map((p) => ({
        id: p.id,
        naziv: p.naziv,
        jm: p.jedinicaMere,
        cena: p.prodajnaCena,
        kolicinePoGodini: p.kolicinePoGodini,
      })),
    },
    troskovi: {
      materijalni: {
        sirovine: s.trosak_sirovine,
        ambalaza: s.trosak_ambalaza,
        ostali: s.trosak_ostaliMat,
      },
      energija: {
        struja: s.trosak_struja,
        voda: s.trosak_voda,
        ostala: s.trosak_ostalaEn,
      },
      usluge: { odrzavanje: s.trosak_odrzavanje, ostale: s.trosak_ostaleUsl },
      amortizacija: s.amortizacija.map((a) => ({
        id: a.id,
        naziv: a.naziv,
        nabavnaVrednost: a.nabavnaVrednost,
        stopa: a.stopaAmortizacije,
      })),
      radnaSnaga: {
        broj: s.radnaSnaga_broj,
        godisnjiTrosak: s.radnaSnaga_godisnjiTrosak,
      },
      nematerijalni: {
        banka: s.trosak_banka,
        osiguranje: s.trosak_osiguranje,
        ostali: s.trosak_ostaliNemat,
      },
    },
  };
}

function drawPieChart(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  data: { label: string; value: number }[],
) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0 || data.length === 0) return;

  const PALETTE: [number, number, number][] = [
    [52, 168, 83],
    [251, 188, 4],
    [66, 133, 244],
    [234, 67, 53],
    [103, 58, 183],
    [0, 188, 212],
    [255, 152, 0],
  ];

  let startAngle = -Math.PI / 2;
  const STEPS = 48;

  data.forEach((slice, i) => {
    if (slice.value <= 0) return;
    const sweep = (slice.value / total) * 2 * Math.PI;
    const [rv, gv, bv] = PALETTE[i % PALETTE.length];
    doc.setFillColor(rv, gv, bv);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);

    const pts: [number, number][] = [[cx, cy]];
    for (let j = 0; j <= STEPS; j++) {
      const a = startAngle + (j / STEPS) * sweep;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    const relLines: number[][] = pts
      .slice(1)
      .map((p, j) => [p[0] - pts[j][0], p[1] - pts[j][1]]);
    doc.lines(relLines, pts[0][0], pts[0][1], [1, 1], "FD", true);
    startAngle += sweep;
  });

  const legendX = cx + r + 8;
  let legendY =
    cy - Math.min(r * 0.7, (data.filter((d) => d.value > 0).length * 7) / 2);
  const BOX = 3.5;
  data.forEach((slice, i) => {
    if (slice.value <= 0) return;
    const pct = ((slice.value / total) * 100).toFixed(1);
    const [rv, gv, bv] = PALETTE[i % PALETTE.length];
    doc.setFillColor(rv, gv, bv);
    doc.setLineWidth(0);
    doc.rect(legendX, legendY - BOX + 0.5, BOX, BOX, "F");
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(7);
    doc.setTextColor(0);
    doc.text(
      `${slice.label}: ${slice.value.toFixed(2)} ha (${pct}%)`,
      legendX + BOX + 2,
      legendY,
    );
    legendY += 7;
  });
}

export function generatePath1PDF(
  plan: IPARDPlanJSON,
  ai: IPARDAIContent = AI_PLACEHOLDER,
) {
  const s = ipardToPath1State(plan);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  addNormalFont(doc);
  addBoldFont(doc);

  doc.setLineHeightFactor(1.85);

  const calc = calcPath1(s);
  const pw = doc.internal.pageSize.getWidth();
  const ML = 20;
  const MR = 20;
  const TW = pw - ML - MR;

  const n2 = (v: number) =>
    v.toLocaleString("sr-RS", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const n0 = (v: number) =>
    v.toLocaleString("sr-RS", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const matTrosk = calc.trosak82_1 + calc.trosak82_2 + calc.trosak82_3;
  const nematTrosk = calc.trosak82_4 + calc.trosak82_5 + calc.trosak82_6;
  const rashodiBeAmort = calc.ukupniRashodi - calc.trosak82_4;
  const avgNet = calc.avgNet;
  const avgPrihod = calc.avgPrihod;
  const akumulativnost = avgPrihod > 0 ? (avgNet / avgPrihod) * 100 : 0;
  const rentabilnost =
    calc.totalInvSaPDV > 0 ? (avgNet / calc.totalInvSaPDV) * 100 : 0;
  const povYears = Math.floor(calc.povracaj);
  const povMonths = (calc.povracaj - povYears) * 12;
  const residualValue = s.amortizacija.reduce((a, i) => {
    const depr =
      ((i.nabavnaVrednost * i.stopaAmortizacije) / 100) *
      Math.min(s.ekonomskiVek, 5);
    return a + Math.max(0, i.nabavnaVrednost - depr);
  }, 0);

  const YRS = ["I", "II", "III", "IV", "V"];

  const B: Parameters<typeof autoTable>[1] = {
    theme: "grid",
    styles: {
      font: "DejaVuSans",
      fontStyle: "normal",
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fontSize: 8,
      fillColor: [255, 255, 255] as [number, number, number],
      textColor: 0,
      lineWidth: 0.3,
      lineColor: [0, 0, 0] as [number, number, number],
    },
    bodyStyles: {
      lineWidth: 0.3,
      lineColor: [0, 0, 0] as [number, number, number],
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255] as [number, number, number],
    },
    margin: { left: ML, right: MR },
  };

  // Text helpers
  const setN = (size = 9) => {
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(size);
    doc.setTextColor(0);
  };
  const setB = (size = 9) => {
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(size);
    doc.setTextColor(0);
  };

  // 1.85 line-height: 1pt = 0.3528mm; lineH per pt = 1.85/2.835 ≈ 0.653
  const LH = (size: number) => (size * 1.85) / 2.835;

  const wrap = (text: string, y: number, size = 7.5, indent = 0): number => {
    setN(size);
    const lines = doc.splitTextToSize(text, TW - indent);
    doc.text(lines, ML + indent, y);
    return y + lines.length * LH(size) + 2;
  };

  const bullet = (text: string, y: number, size = 7.5): number => {
    setN(size);
    const lines = doc.splitTextToSize("•  " + text, TW - 5);
    doc.text(lines, ML + 5, y);
    return y + lines.length * LH(size) + 2;
  };

  const secH = (text: string, y: number, size = 11): number => {
    setB(size);
    doc.text(text, ML, y);
    return y + size * 0.5 + 3;
  };

  const subH = (text: string, y: number, size = 10): number => {
    setB(size);
    doc.text(text, ML, y);
    return y + size * 0.45 + 3;
  };

  const tblLabel = (text: string, y: number): number => {
    setN(7.5);
    doc.text(text, ML, y);
    return y + 5;
  };

  // Landscape page dimensions (used for all Section 8–9 tables)
  const LML = 14;
  const LMR = 14;

  // Cost/cash column widths (portrait, 10+40+5×24 = 170mm)
  const costCols = {
    0: { cellWidth: 10, halign: "center" as const },
    1: { cellWidth: 40 },
    2: { cellWidth: 24, halign: "right" as const },
    3: { cellWidth: 24, halign: "right" as const },
    4: { cellWidth: 24, halign: "right" as const },
    5: { cellWidth: 24, halign: "right" as const },
    6: { cellWidth: 24, halign: "right" as const },
  };

  const costHead = (col2Label = "Назив") => [
    [
      {
        content: "Ред.\nброј",
        styles: { fontStyle: "bold", halign: "center", valign: "middle" },
      },
      { content: col2Label, styles: { fontStyle: "bold", valign: "middle" } },
      {
        content: "Износ трошкова по годинама пројекта",
        colSpan: 5,
        styles: { fontStyle: "bold", halign: "center" },
      },
    ],
    [
      "",
      "",
      ...YRS.map((yr) => ({
        content: yr,
        styles: { fontStyle: "bold", halign: "center" },
      })),
    ],
  ];

  const summaryHead = (col2Label = "Назив") => [
    [
      {
        content: "Ред.\nброј",
        styles: { fontStyle: "bold", halign: "center", valign: "middle" },
      },
      { content: col2Label, styles: { fontStyle: "bold", valign: "middle" } },
      {
        content: "Године пројекта",
        colSpan: 5,
        styles: { fontStyle: "bold", halign: "center" },
      },
    ],
    [
      "",
      "",
      ...YRS.map((yr) => ({
        content: yr,
        styles: { fontStyle: "bold", halign: "center" },
      })),
    ],
  ];

  const ukupnoRow = (val: number) => [
    { content: "Укупно", colSpan: 2, styles: { fontStyle: "bold" as const } },
    "",
    ...YRS.map(() => ({
      content: n2(val),
      styles: { fontStyle: "bold" as const, halign: "right" as const },
    })),
  ];

  const cashCols = {
    0: { cellWidth: 10, halign: "center" as const },
    1: { cellWidth: 40 },
    2: { cellWidth: 24, halign: "right" as const },
    3: { cellWidth: 24, halign: "right" as const },
    4: { cellWidth: 24, halign: "right" as const },
    5: { cellWidth: 24, halign: "right" as const },
    6: { cellWidth: 24, halign: "right" as const },
  };

  const cashHead = [
    [
      {
        content: "Ред.\nброј",
        rowSpan: 2,
        styles: { fontStyle: "bold", halign: "center", valign: "middle" },
      },
      {
        content: "Назив",
        rowSpan: 2,
        styles: { fontStyle: "bold", valign: "middle" },
      },
      {
        content: "Године пројекта",
        colSpan: 5,
        styles: { fontStyle: "bold", halign: "center" },
      },
    ],
    [
      "",
      "",
      ...YRS.map((yr) => ({
        content: yr,
        styles: { fontStyle: "bold", halign: "center" },
      })),
    ],
  ];

  const boldCell = (v: string) => ({
    content: v,
    styles: { fontStyle: "bold" as const, halign: "right" as const },
  });
  const checkPage = (needed = 25) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 18;
    }
  };

  let y = 0;

  // Naslovna Strana Path2/Path3
  const cw1 = pw;
  const shortDash1 = "-".repeat(54);
  const longDash1 = "-".repeat(96);

  setB(9);
  doc.text(
    "IPARD МЕРА 1 - ПОСЛОВНИ ПЛАН ПОЉОПРИВРЕДНОГ ГАЗДИНСТВА",
    cw1 / 2,
    22,
    { align: "center" },
  );

  const setI1 = (size = 9) => {
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(size);
    doc.setTextColor(80);
  };
  setI1(7.5);
  const p1Subtitle = doc.splitTextToSize(
    "Инвестиције у физичка средства пољопривредних газдинстава — IPARD III програм подршке рурном развоју Републике Србије",
    TW,
  );
  doc.text(p1Subtitle, cw1 / 2, 30, { align: "center" });

  setN(9);
  doc.text(shortDash1, cw1 / 2, 52, { align: "center" });
  doc.text(plan.cover.investitor || "Име и презиме", cw1 / 2, 57, {
    align: "center",
  });
  setB(14);
  doc.text("П О С Л О В Н И  П Л А Н", cw1 / 2, 128, { align: "center" });
  setN(9);
  doc.text(longDash1, cw1 / 2, 147, { align: "center" });
  doc.text(plan.cover.naziv_plana || "Назив пословног плана", cw1 / 2, 153, {
    align: "center",
  });
  doc.text(longDash1, cw1 / 2, 166, { align: "center" });
  doc.text(
    plan.cover.mesto_realizacije || "Место реализације пословног плана",
    cw1 / 2,
    172,
    { align: "center" },
  );
  setB(11);
  doc.text(`${plan.cover.godina}. година`, cw1 / 2, 240, { align: "center" });

  // Strana 2 -- 1. Rezime Poslovnog Plana

  doc.addPage();
  setB(10);
  doc.text("1.    Резиме пословног плана", ML, 18);

  generateRezimeTable(doc, 22, plan);

  // PAGE 3 — Section 2: Basic data (Tab 2.1, 2.2, 2.3 + start of 2.4)
  doc.addPage();
  y = 18;
  y = secH("2.    ОСНОВНИ ПОДАЦИ О РЕГИСТРОВАНОМ ПОЉ. ГАЗДИНСТВУ", y, 11);
  y += 3;
  y = subH("2.1. Подаци о носиоцу регистрованог пољ. газдинства", y, 10);
  y = tblLabel("Табела 2.1.", y);

  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 74 },
      2: { cellWidth: 82 },
    },
    head: [
      [
        {
          content: "Ред. број",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Опис",
          colSpan: 2,
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ["1.", "Ime и презиме/Назив", s.tabela21.imeNaziv],
      ["2.", "Седиште (Улица и број)", s.tabela21.sediste],
      ["3.", "Место", s.tabela21.mesto],
      ["4.", "ПИБ*", s.tabela21.pib],
      ["5.", "Матични број*", s.tabela21.maticniBroj],
      ["6.", "Шифра делатности у АПР*", s.tabela21.sifraDelatnosti],
      ["7.", "Телефон", s.tabela21.telefon],
      ["8.", "Електронска пошта", s.tabela21.email],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 3;
  setN(7.5);
  doc.text("* само за правна лица и предузетнике", ML, y);
  y += 8;

  y = subH(
    "2.2. Подаци о регистрованом пољ. газдинству, предузетнику/правном лицу",
    y,
    10,
  );
  y = tblLabel("Табела 2.2.", y);

  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 74 },
      2: { cellWidth: 82 },
    },
    head: [
      [
        {
          content: "Ред. број",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Опис",
          colSpan: 2,
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ["1.", "Адреса пољ. газдинства", s.tabela22.adresaGazdinstva],
      ["2.", "БПГ", s.tabela22.bpg],
      ["3.", "Датум регистрације", s.tabela22.datumRegistracije],
      ["4.", "Број запослених*", String(s.tabela22.brojZaposlenih)],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 3;
  setN(7.5);
  doc.text("* само за правна лица и предузетнике", ML, y);
  y += 8;

  y = subH("2.3. Власништво и структура поседа", y, 10);
  y = tblLabel("Табела 2.3.", y);
  const totalM2 =
    s.tabela23.vlasnistvo_m2 + s.tabela23.zakup_m2 + s.tabela23.ustupljeno_m2;

  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 18, halign: "center" as const },
      1: { cellWidth: 102 },
      2: { cellWidth: 50, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        {
          content: "Основ по ком се користи",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Површина (m²)",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      [
        "1.",
        "Власништво",
        s.tabela23.vlasnistvo_m2 > 0 ? n0(s.tabela23.vlasnistvo_m2) : "-",
      ],
      ["2.", "Закуп", s.tabela23.zakup_m2 > 0 ? n0(s.tabela23.zakup_m2) : "-"],
      [
        "3.",
        "Уступљено на коришћење без накнаде",
        s.tabela23.ustupljeno_m2 > 0 ? n0(s.tabela23.ustupljeno_m2) : "-",
      ],
      [
        { content: "Укупно:", colSpan: 2, styles: { fontStyle: "bold" } },
        "",
        {
          content: n0(totalM2),
          styles: { fontStyle: "bold", halign: "right" },
        },
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  if (y < 210) {
    y = subH("2.4. Делатност газдинства и организација посла", y, 10);
    const intro = `Привредно друштво ${plan.cover.investitor} бави се пољопривредном производњом. ${s.opisAktivnosti || "[АИ: опис основне делатности газдинства]"}`;
    y = wrap(intro, y, 7.5);
    y += 3;
    setN(7.5);
    doc.text(
      "На газдинству се производе следеће културе (Граф. 1 – Сетвена структура пољ. газдинства):",
      ML,
      y,
    );
    y += 6;
    s.kulture.forEach((k) => {
      y = bullet(
        `${k.naziv} на површини од ${fmtN(k.povrsina_ha, 4)} ha`,
        y,
        7.5,
      );
    });
  }

  // PAGE 4 — Section 2.4 continued (chart placeholder + product/org description)
  doc.addPage();
  y = 18;
  if (s.namenaInvesticije) {
    y = wrap(s.namenaInvesticije.replace(/\.+$/, "") + ".", y, 7.5);
    y += 6;
  }

  setB(7.5);
  doc.text("Граф. 1 – Сетвена структура пољ. газдинства", ML, y);
  y += 5;
  if (s.kulture.length > 0) {
    drawPieChart(
      doc,
      ML + 28,
      y + 26,
      22,
      s.kulture.map((k) => ({ label: k.naziv, value: k.povrsina_ha })),
    );
    y += 56;
  } else {
    doc.setDrawColor(180);
    doc.setFillColor(245, 245, 245);
    doc.rect(ML + 20, y, TW - 40, 40, "FD");
    setN(8);
    doc.setTextColor(130);
    doc.text("[Нема уписаних биљних култура]", pw / 2, y + 22, {
      align: "center",
    });
    doc.setTextColor(0);
    y += 46;
  }

  setB(7.5);
  doc.text("Карактеристике производа:", ML, y);
  y += 6;
  y = wrap(ai.karakteristikeProizvoda, y, 7.5);
  y += 4;
  setB(7.5);
  doc.text("Линије производње:", ML, y);
  y += 6;
  setN(7.5);
  y = wrap(ai.linijeProizvodnje, y, 7.5);
  y += 4;

  // Section 2.4 continued (org, employment)
  checkPage(45);
  setB(7.5);
  doc.text("Организација послова:", ML, y);
  y += 6;
  y = wrap(ai.organizacijaPoslova, y, 7.5);
  y += 6;
  setB(7.5);
  doc.text("Упошљеност:", ML, y);
  y += 6;
  setN(7.5);
  doc.text("У оквиру газдинства ангажовани су:", ML, y);
  y += 5;
  y = bullet(
    `${s.radnaSnaga_broj} стално запослена радника у оквиру привредног друштва`,
    y,
  );
  y = bullet("сезонска радна снага у периоду бербе", y);
  y += 8;

  y = secH("3.    ОПИС САДАШЊЕГ СТАЊА", y, 11);
  y += 2;
  y = subH(
    "3.1. Опис производног програма и постојећи техничко-технолошки услови",
    y,
    10,
  );
  y += 2;
  setB(7.5);
  doc.text(
    "а) Навести постојеће производе и укратко описати сваки појединачно.",
    ML,
    y,
  );
  y += 7;
  y = wrap(
    `Привредно друштво ${plan.cover.investitor} бави се примарном пољопривредном производњом.`,
    y,
  );
  y += 3;
  if (s.proizvodi.length > 0) {
    setN(7.5);
    doc.text("Производи / услуге газдинства:", ML, y);
    y += 5;
    s.proizvodi.forEach((p: any) => {
      y = bullet(p.naziv || String(p), y);
    });
  }
  y += 3;
  y = wrap(ai.tehnoloskaOpremljenost, y, 7.5);

  // Sections 3.2, 3.3
  checkPage(35);
  setB(9.5);
  doc.text("б) Да ли постоји могућност проширења производног програма?", ML, y);
  y += 7;
  y = wrap(ai.prosirenjePrograma, y, 7.5);
  y += 8;

  y = subH(
    "3.2.  Тржиште набавке (кратак опис тренутног стања тржишта набавке)",
    y,
    10,
  );
  y += 2;
  y = wrap(ai.trzistaNabavke, y, 7.5);
  y += 8;

  y = subH(
    "3.3. Тржиште продаје (кратак опис тренутног стања тржишта продаје)",
    y,
    10,
  );
  y += 2;
  y = wrap(ai.trzistaProdaje, y, 7.5);

  // PAGE 7 — Section 4: Investment data (Tab 4.2, 4.3)

  doc.addPage();
  y = 18;
  y = secH("4.    ПОДАЦИ О ИНВЕСТИЦИЈИ И ФИНАНСИРАЊУ", y, 11);
  y += 2;
  y = subH("4.1. Предмет и циљ инвестиције", y, 10);
  y += 2;
  y = wrap(
    `Предмет инвестиције је ${s.namenaInvesticije}, у циљу унапређења постојећих производних процеса газдинства привредног друштва ${plan.cover.investitor}.`,
    y,
  );
  y += 3;
  setN(7.5);
  doc.text("Укупна вредност инвестиције износи ", ML, y);
  setB(7.5);
  doc.text(
    `${n2(calc.totalInvSaPDV)} динара.`,
    ML + doc.getTextWidth("Укупна вредност инвестиције износи "),
    y,
  );
  y += 10;

  y = subH("4.2. Укупна инвестициона улагања", y, 10);
  y = tblLabel("Табела 4.2.", y);

  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 12, halign: "center" as const },
      1: { cellWidth: 44 },
      2: { cellWidth: 28, halign: "right" as const },
      3: { cellWidth: 30, halign: "right" as const },
      4: { cellWidth: 36, halign: "right" as const },
      5: { cellWidth: 20, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        {
          content: "Опис",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        {
          content: "Унета\nсредства",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Нова\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Укупна\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Учешће\n(%)",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "Основна средства", styles: { fontStyle: "bold" } },
        "0,00",
        n2(calc.totalInvSaPDV),
        n2(calc.totalInvSaPDV),
        "100%",
      ],
      ...s.osnSredstva.map((i, idx) => [
        `${idx + 1}.`,
        i.naziv,
        "0,00",
        n2(i.kolicina * i.cenaSaPDV),
        n2(i.kolicina * i.cenaSaPDV),
        calc.totalInvSaPDV > 0
          ? n0(
              Math.round(
                ((i.kolicina * i.cenaSaPDV) / calc.totalInvSaPDV) * 100,
              ),
            ) + "%"
          : "0%",
      ]),
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "Обртна средства", styles: { fontStyle: "bold" } },
        "-",
        "-",
        "0,00",
        "0%",
      ],
      [
        { content: "Укупно (I+II)", colSpan: 2, styles: { fontStyle: "bold" } },
        "0,00",
        n2(calc.totalInvSaPDV),
        n2(calc.totalInvSaPDV),
        "100%",
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  y = subH("4.3. Улагање у основна средства", y, 10);
  y = tblLabel("Табела 4.3.", y);

  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 10, halign: "center" as const },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: "center" as const },
      3: { cellWidth: 50, halign: "right" as const },
      4: { cellWidth: 40, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред. број",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Назив основног средства",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Комада/\nкол.",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Цена по ком. са ПДВ",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Вредност",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ...s.osnSredstva.map((i, idx) => [
        `${idx + 1}.`,
        i.naziv,
        i.kolicina,
        n2(i.cenaSaPDV),
        n2(i.kolicina * i.cenaSaPDV),
      ]),
      [
        { content: "Укупно", colSpan: 4, styles: { fontStyle: "bold" } },
        {
          content: n2(calc.totalInvSaPDV),
          styles: { fontStyle: "bold", halign: "right" },
        },
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });

  // PAGE 8 — Tab 4.4 + Section 5 + Section 6

  doc.addPage();
  y = 18;
  y = subH("4.4. Извори финансирања", y, 10);
  y = tblLabel("Табела 4.4.", y);

  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 12, halign: "center" as const },
      1: { cellWidth: 44 },
      2: { cellWidth: 28, halign: "right" as const },
      3: { cellWidth: 30, halign: "right" as const },
      4: { cellWidth: 36, halign: "right" as const },
      5: { cellWidth: 20, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "Опис", styles: { fontStyle: "bold", valign: "middle" } },
        {
          content: "Унета\nсредства",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Нова\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Укупна\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Учешће\n(%)",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "Сопствени извори", styles: { fontStyle: "bold" } },
        "0,00",
        n2(calc.sopstvenaSredstva),
        n2(calc.sopstvenaSredstva),
        `${s.sopstvenaProcenat}%`,
      ],
      [
        "1.",
        "Основна средства",
        "0,00",
        n2(calc.sopstvenaSredstva),
        n2(calc.sopstvenaSredstva),
        `${s.sopstvenaProcenat}%`,
      ],
      ["2.", "Обртна средства", "0,00", "0,00", "0,00", "0%"],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "Туђи извори", styles: { fontStyle: "bold" } },
        "0,00",
        n2(calc.tujaSredstva),
        n2(calc.tujaSredstva),
        `${100 - s.sopstvenaProcenat}%`,
      ],
      [
        "1.",
        "Основна средства",
        "",
        n2(calc.tujaSredstva),
        n2(calc.tujaSredstva),
        `${100 - s.sopstvenaProcenat}%`,
      ],
      [
        { content: "Укупно (I+II)", colSpan: 2, styles: { fontStyle: "bold" } },
        "0,00",
        n2(calc.totalInvSaPDV),
        n2(calc.totalInvSaPDV),
        "100%",
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  y = secH("5.    ПОТРЕБНА РАДНА СНАГА", y, 11);
  y += 2;
  y = wrap(ai.radnaSnagaNarativ, y);
  y += 3;
  setN(7.5);
  doc.text(
    `Газдинство тренутно запошљава: ${s.radnaSnaga_broj} радника.`,
    ML,
    y,
  );
  y += 8;

  y = secH("6.    ДИСТРИБУЦИЈА И ПРОМОЦИЈА", y, 11);
  y += 2;
  setB(7.5);
  doc.text("Канали дистрибуције:", ML, y);
  y += 6;
  setN(7.5);
  y = wrap(ai.distribucija, y, 7.5);
  y += 4;
  setB(7.5);
  doc.text("Начин промоције:", ML, y);
  y += 6;
  setN(7.5);
  y = wrap(ai.promocija, y, 7.5);

  // PAGE 9 — Section 7: Očekivani efekti (DA/NE)

  doc.addPage();
  y = 18;
  setB(11);
  doc.text("7.    ОЧЕКИВАНИ ЕФЕКТИ", ML, y);
  y += 6;
  setN(7.5);
  doc.text(
    "Реализацијом овог пројекта се очекује (заокружите Да или Не):",
    ML,
    y,
  );
  y += 12;

  const efekti = [
    "Проширење асортимана",
    "Увођење новог производа",
    "Унапређење постојећег производа",
    "Повећање запослености",
    "Повећање прихода у пословању",
  ];
  efekti.forEach((text, i) => {
    setN(7.5);
    doc.text(`${i + 1}.`, ML + 10, y);
    doc.text(text, ML + 20, y);
    setB(7.5);
    doc.text("ДА", ML + 115, y);
    doc.text("/", ML + 126, y);
    doc.text("НЕ", ML + 132, y);
    setN(7.5);
    y += 12;
  });

  // PAGE 10 — Section 8.1: Revenue plan (LANDSCAPE)

  doc.addPage("a4", "l");
  y = 14;
  setB(11);
  doc.text("8. ФИНАНСИЈСКИ ПЛАН", LML, y);
  y += 8;
  setB(10);
  doc.text("8.1. Формирање укупног прихода", LML, y);
  y += 5;
  setN(7.5);
  doc.text("Табела 8.1.", LML, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 8, halign: "center" as const },
      1: { cellWidth: 50 },
      2: { cellWidth: 14, halign: "center" as const },
      3: { cellWidth: 22, halign: "right" as const },
      4: { cellWidth: 17, halign: "right" as const },
      5: { cellWidth: 17, halign: "right" as const },
      6: { cellWidth: 17, halign: "right" as const },
      7: { cellWidth: 17, halign: "right" as const },
      8: { cellWidth: 17, halign: "right" as const },
      9: { cellWidth: 18, halign: "right" as const },
      10: { cellWidth: 18, halign: "right" as const },
      11: { cellWidth: 18, halign: "right" as const },
      12: { cellWidth: 18, halign: "right" as const },
      13: { cellWidth: 18, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Редни\nбр.",
          rowSpan: 2,
          styles: { valign: "middle", halign: "center", fontStyle: "bold" },
        },
        {
          content: "Производ/\nуслуга",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Ј.\nмере",
          rowSpan: 2,
          styles: { valign: "middle", halign: "center", fontStyle: "bold" },
        },
        {
          content: "Продајна\nцена",
          rowSpan: 2,
          styles: { valign: "middle", halign: "right", fontStyle: "bold" },
        },
        {
          content: "Обим продаје по годинама",
          colSpan: 5,
          styles: { halign: "center", fontStyle: "bold" },
        },
        {
          content: "Приход у динарима по годинама",
          colSpan: 5,
          styles: { halign: "center", fontStyle: "bold" },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
      [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "9=4x5",
        "10=4x6",
        "11=4x7",
        "12=4x8",
        "13=4x9",
      ],
    ],
    body: [
      ...s.proizvodi.map((p, idx) => [
        `${idx + 1}.`,
        p.naziv,
        p.jedinicaMere,
        n2(p.prodajnaCena),
        ...p.kolicinePoGodini.map((q) => n2(q)),
        ...p.kolicinePoGodini.map((q) => n2(p.prodajnaCena * q)),
      ]),
      [
        { content: "Укупно", colSpan: 4, styles: { fontStyle: "bold" } },
        "",
        "",
        "",
        ...Array(5).fill(""),
        ...calc.prihodiPoGodini.map((r) => boldCell(n2(r))),
      ],
    ],
    ...B,
    margin: { left: LML, right: LMR },
    styles: { ...(B.styles as object), fontSize: 6 } as any,
  });

  // PAGE 11 — Sections 8.2.1, 8.2.2, 8.2.3 (PORTRAIT)

  doc.addPage("a4", "p");
  y = 18;
  setB(10);
  doc.text("8.2. Структура трошкова", ML, y);
  y += 8;

  const renderCostTable = (
    title: string,
    label: string,
    rows: [string, string, number][],
    total: number,
    startY: number,
    col2Label = "Назив",
  ): number => {
    setB(9.5);
    doc.text(title, ML, startY);
    startY += 5;
    setN(7.5);
    doc.text(label, ML, startY);
    startY += 5;
    autoTable(doc, {
      startY,
      columnStyles: costCols,
      head: costHead(col2Label) as any,
      body: [
        ...rows.map(([num, name, val]) => [
          num,
          name,
          ...YRS.map(() => n2(val)),
        ]),
        ukupnoRow(total),
      ],
      ...B,
      styles: { ...(B.styles as object), fontSize: 7.5 } as any,
    });
    return (doc as any).lastAutoTable.finalY + 8;
  };

  y = renderCostTable(
    "8.2.1. Директан материјал",
    "Табела 8.2.1.",
    [
      ["1.", "Сировине и материјал", s.trosak_sirovine],
      ["2.", "Амбалажа (флаше, чепови, етикете)", s.trosak_ambalaza],
      ["3.", "Остали материјал", s.trosak_ostaliMat],
    ],
    calc.trosak82_1,
    y,
    "Трошкови",
  );

  y = renderCostTable(
    "8.2.2. Комунални и енергетски трошкови",
    "Табела 8.2.2.",
    [
      ["1.", "Електрична енергија", s.trosak_struja],
      ["2.", "Вода и канализација", s.trosak_voda],
      ["3.", "Остали трошкови", s.trosak_ostalaEn],
    ],
    calc.trosak82_2,
    y,
  );

  y = renderCostTable(
    "8.2.3. Трошкови производних услуга",
    "Табела 8.2.3.",
    [
      ["1.", "Одржавање опреме", s.trosak_odrzavanje],
      ["2.", "Остале услуге (маркетинг, транспорт)", s.trosak_ostaleUsl],
    ],
    calc.trosak82_3,
    y,
  );

  // PAGE 12 — Sections 8.2.4, 8.2.5, 8.2.6 (PORTRAIT)

  doc.addPage("a4", "p");
  y = 18;
  setB(9.5);
  doc.text("8.2.4. Амортизација", ML, y);
  y += 5;
  setN(7.5);
  doc.text("Табела 8.2.4.", ML, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 6, halign: "center" as const },
      1: { cellWidth: 22 },
      2: { cellWidth: 22, halign: "right" as const },
      3: { cellWidth: 12, halign: "center" as const },
      4: { cellWidth: 18, halign: "right" as const },
      5: { cellWidth: 18, halign: "right" as const },
      6: { cellWidth: 18, halign: "right" as const },
      7: { cellWidth: 18, halign: "right" as const },
      8: { cellWidth: 18, halign: "right" as const },
      9: { cellWidth: 18, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nбр.",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
          rowSpan: 2,
        },
        {
          content: "Назив",
          styles: { fontStyle: "bold", valign: "middle" },
          rowSpan: 2,
        },
        {
          content: "Набавна\nвредност",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
          rowSpan: 2,
        },
        {
          content: "Стопа\nаморт.\n(%)",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
          rowSpan: 2,
        },
        {
          content: "Износ трошкова по годинама пројекта",
          colSpan: 5,
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Неаморт.\nвредност",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
          rowSpan: 2,
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { fontStyle: "bold" as const, halign: "center" as const },
        })),
      ],
    ],
    body: [
      ...s.amortizacija.map((a, idx) => {
        const annual = (a.nabavnaVrednost * a.stopaAmortizacije) / 100;
        const residual = Math.max(
          0,
          a.nabavnaVrednost - annual * Math.min(s.ekonomskiVek, 10),
        );
        return [
          `${idx + 1}.`,
          a.naziv,
          n2(a.nabavnaVrednost),
          `${a.stopaAmortizacije},00%`,
          ...YRS.map(() => n2(annual)),
          n2(residual),
        ];
      }),
      [
        { content: "Укупно", colSpan: 4, styles: { fontStyle: "bold" } },
        ...YRS.map(() => boldCell(n2(calc.trosak82_4))),
        boldCell(n2(residualValue)),
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 5.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  y = renderCostTable(
    "8.2.5. Трошкови радне снаге",
    "Табела 8.2.5.",
    [["1", `${s.radnaSnaga_broj} Радника`, s.radnaSnaga_godisnjiTrosak]],
    calc.trosak82_5,
    y,
  );

  y = renderCostTable(
    "8.2.6. Нематеријални трошкови",
    "Табела 8.2.6.",
    [
      ["1", "Банкарске услуге и провизије", s.trosak_banka],
      ["2", "Административни трошкови (таксе, дозволе)", s.trosak_osiguranje],
      ["3", "Консултантске услуге", s.trosak_ostaliNemat],
    ],
    calc.trosak82_6,
    y,
  );

  // PAGE 13 — Sections 8.2.7 (total costs) + 8.2.8 (income statement) (PORTRAIT)

  doc.addPage("a4", "p");
  y = 18;
  setB(9.5);
  doc.text("8.2.7. Укупни трошкови", ML, y);
  y += 5;
  setN(7.5);
  doc.text("Табела 8.2.7.", ML, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    columnStyles: costCols,
    head: summaryHead() as any,
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        {
          content: "Материјални трошкови (1+2+3)",
          styles: { fontStyle: "bold" },
        },
        ...YRS.map(() => boldCell(n2(matTrosk))),
      ],
      ["1.", "Директан материјал", ...YRS.map(() => n2(calc.trosak82_1))],
      [
        "2.",
        "Комунални и енергетски трошкови",
        ...YRS.map(() => n2(calc.trosak82_2)),
      ],
      [
        "3.",
        "Трошкови производних услуга",
        ...YRS.map(() => n2(calc.trosak82_3)),
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        {
          content: "Нематеријални трошкови (1+2+3)",
          styles: { fontStyle: "bold" },
        },
        ...YRS.map(() => boldCell(n2(nematTrosk))),
      ],
      ["1.", "Амортизација", ...YRS.map(() => n2(calc.trosak82_4))],
      ["2.", "Трошкови радне снаге", ...YRS.map(() => n2(calc.trosak82_5))],
      ["3.", "Нематеријални трошкови", ...YRS.map(() => n2(calc.trosak82_6))],
      [
        {
          content: "УКУПНО ПОСЛОВНИ РАСХОДИ (I+II)",
          colSpan: 2,
          styles: { fontStyle: "bold" },
        },
        "",
        ...YRS.map(() => boldCell(n2(calc.ukupniRashodi))),
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;
  checkPage(90);

  setB(9.5);
  doc.text("8.2.8. Биланс успеха", ML, y);
  y += 5;
  setN(7.5);
  doc.text("Табела 8.2.8.", ML, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    columnStyles: costCols,
    head: summaryHead() as any,
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "УКУПАН ПРИХОД", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldCell(n2(r.prihod))),
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "УКУПНИ РАСХОДИ (1+2)", styles: { fontStyle: "bold" } },
        ...YRS.map(() => boldCell(n2(calc.ukupniRashodi))),
      ],
      ["1.", "Материјални трошкови", ...YRS.map(() => n2(matTrosk))],
      ["2.", "Нематеријални трошкови", ...YRS.map(() => n2(nematTrosk))],
      [
        { content: "III", styles: { fontStyle: "bold" } },
        { content: "БРУТО ДОБИТ (I-II)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldCell(n2(r.gross))),
      ],
      [
        { content: "IV", styles: { fontStyle: "bold" } },
        { content: "ПОРЕЗ НА ДОБИТ (10%)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldCell(n2(r.tax))),
      ],
      [
        { content: "V", styles: { fontStyle: "bold" } },
        { content: "НЕТО ДОБИТ (III-IV)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldCell(n2(r.net))),
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });

  // PAGE 14 — Sections 9.1 + 9.2: Cash flow tables (PORTRAIT)

  doc.addPage("a4", "p");
  y = 18;
  setB(11);
  doc.text("9. ОЦЕНА ЕФЕКАТА ПРОЈЕКТА", ML, y);
  y += 8;
  setB(10);
  doc.text("9.1. Готовински ток", ML, y);
  y += 5;
  setN(7.5);
  doc.text("Табела 9.1.", ML, y);
  y += 5;

  const gtPrimY0 = calc.netPoGodini[0].prihod + calc.totalInvSaPDV;
  const gtIzdY0 = calc.totalInvSaPDV + rashodiBeAmort;
  const gtNetoY0 = gtPrimY0 - gtIzdY0;

  autoTable(doc, {
    startY: y,
    columnStyles: cashCols,
    head: cashHead as any,
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ПРИМАЊА (1+2+3)", styles: { fontStyle: "bold" } },
        boldCell(n2(gtPrimY0)),
        ...calc.netPoGodini.slice(1).map((r) => boldCell(n2(r.prihod))),
      ],
      ["1.", "Укупан приход", ...calc.netPoGodini.map((r) => n2(r.prihod))],
      ["2.", "Извори финансирања", n2(calc.totalInvSaPDV), "", "", "", ""],
      ["", "2.1. Сопствени извори", n2(calc.sopstvenaSredstva), "", "", "", ""],
      ["", "2.2. Туђи извори", n2(calc.tujaSredstva), "", "", "", ""],
      ["3.", "Остатак вредности пројекта", "", "", "", "", n2(residualValue)],
      ["", "3.1. Основна средства", "", "", "", "", n2(residualValue)],
      ["", "3.2. Обртна средства", "", "", "", "", ""],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ИЗДАВАЊА (4+5+6)", styles: { fontStyle: "bold" } },
        boldCell(n2(gtIzdY0)),
        ...YRS.slice(1).map(() => boldCell(n2(rashodiBeAmort))),
      ],
      ["4.", "Вредност инвестиције", n2(calc.totalInvSaPDV), "", "", "", ""],
      ["", "4.1. У основна средства", n2(calc.totalInvSaPDV), "", "", "", ""],
      ["", "4.2. У обртна средства", "0,00", "", "", "", ""],
      [
        "5.",
        "Пословни расходи без амортизације и камате по кредиту",
        ...YRS.map(() => n2(rashodiBeAmort)),
      ],
      ["6.", "Обавезе према изворима финансирања", "", "", "", "", ""],
      [
        { content: "III", styles: { fontStyle: "bold" } },
        { content: "НЕТО ПРИМАЊА (I-II)", styles: { fontStyle: "bold" } },
        boldCell(n2(gtNetoY0)),
        ...calc.netPoGodini
          .slice(1)
          .map((r) => boldCell(n2(r.prihod - rashodiBeAmort))),
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 7 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  setB(10);
  doc.text("9.2. Економски ток", ML, y);
  y += 5;
  setN(7.5);
  doc.text("Табела 9.2.", ML, y);
  y += 5;

  const ekIzdY0 = calc.totalInvSaPDV + rashodiBeAmort + calc.netPoGodini[0].tax;
  const ekIzd = calc.netPoGodini.map((r, i) =>
    i === 0 ? ekIzdY0 : rashodiBeAmort + r.tax,
  );
  const ekNeto = calc.netPoGodini.map((r, i) => r.prihod - ekIzd[i]);

  autoTable(doc, {
    startY: y,
    columnStyles: cashCols,
    head: cashHead as any,
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ПРИМАЊА (1+2)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldCell(n2(r.prihod))),
      ],
      ["1.", "Укупан приход", ...calc.netPoGodini.map((r) => n2(r.prihod))],
      ["2.", "Остатак вредности пројекта", "", "", "", "", n2(residualValue)],
      ["", "2.1. Основна средства", "", "", "", "", n2(residualValue)],
      ["", "2.2. Обртна средства", "", "", "", "", ""],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ИЗДАВАЊА (3+4+5)", styles: { fontStyle: "bold" } },
        ...ekIzd.map((v) => boldCell(n2(v))),
      ],
      [
        "3.",
        "Вредност инвестиције (3.1+3.2)",
        n2(calc.totalInvSaPDV),
        "",
        "",
        "",
        "",
      ],
      ["", "3.1. У основна средства", n2(calc.totalInvSaPDV), "", "", "", ""],
      ["", "3.2. У обртна средства", "0,00", "", "", "", ""],
      [
        "4.",
        "Пословни расходи без амортизације и камате по кредиту",
        ...YRS.map(() => n2(rashodiBeAmort)),
      ],
      ["5.", "Порез на добит", ...calc.netPoGodini.map((r) => n2(r.tax))],
      [
        { content: "III", styles: { fontStyle: "bold" } },
        { content: "НЕТО ПРИМИЦИ (I-II)", styles: { fontStyle: "bold" } },
        ...ekNeto.map((v) => boldCell(n2(v))),
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 7 } as any,
  });

  // PAGE 15 — Section 9.3: Static project assessment (PORTRAIT)

  doc.addPage("a4", "p");
  y = 18;
  setB(10);
  doc.text("9.3. Оцена пројекта (статичка)", ML, y);
  y += 5;
  setN(7.5);
  doc.text(
    `Статичка оцена инвестиционог пројекта односи се на последњу (у овом случају ${Math.min(s.ekonomskiVek, 5)}.) годину пројекта`,
    ML,
    y,
  );
  y += 10;

  const lastPrihod =
    calc.netPoGodini[Math.min(s.ekonomskiVek, 5) - 1]?.prihod ??
    calc.netPoGodini[4].prihod;

  // 9.3.1
  setB(9.5);
  doc.text("9.3.1. Економичност производње", ML, y);
  y += 6;
  setN(7.5);
  [
    "Коефицијент економичности = УП / УИ > 1",
    "где су:",
    "УП – укупна примања и;",
    "УИ – укупна издавања",
  ].forEach((l) => {
    doc.text(l, ML, y);
    y += 5;
  });
  y += 3;
  setB(7.5);
  const econF = `Коефицијент економичности = ${n2(lastPrihod)} / ${n2(rashodiBeAmort)} = ${calc.ekonomicnost.toFixed(2)}`;
  const econFLines = doc.splitTextToSize(econF, TW);
  doc.text(econFLines, ML, y);
  y += econFLines.length * 4.5 + 4;
  setN(7.5);
  y = wrap(
    "Коефицијент економичности је већи од један, што указује на чињеницу да су укупни примици већи од укупних издатака. Сходно овоме може се констатовати да је инвестициони пројекат економичан, што значи да је инвестиција исплатива.",
    y,
  );
  y += 8;

  // 9.3.2
  setB(9.5);
  doc.text("9.3.2. Акумулативност (рентабилност) производње", ML, y);
  y += 6;
  setN(7.5);
  [
    "Стопа акумулативности = Д / УПр x 100",
    "где је:",
    "Д – добит;",
    "УПр – укупан приход.",
  ].forEach((l) => {
    doc.text(l, ML, y);
    y += 5;
  });
  y += 3;
  setB(7.5);
  const akumF = `Стопа акумулативности = ${n2(avgNet)} / ${n2(avgPrihod)} * 100 = ${akumulativnost.toFixed(2)}`;
  const akumFLines = doc.splitTextToSize(akumF, TW);
  doc.text(akumFLines, ML, y);
  y += akumFLines.length * 4.5 + 4;
  setN(7.5);
  y = wrap(
    "Стопа акумулативности је већа од 5,00 % (претпостављена пондерисана цена капитала). Сходно томе, може се констатовати да је инвестициони пројекат акумулативан.",
    y,
  );
  y += 8;

  // 9.3.3
  setB(9.5);
  doc.text(
    "9.3.3. Рентабилност инвестиције (предрачунске вредности инвестиције)",
    ML,
    y,
  );
  y += 6;
  setN(7.5);
  [
    "Стопа рентабилности инвестиције = Д / ПВИ x 100",
    "где је:",
    "ПВИ – предрачунска вредност инвестиције.",
  ].forEach((l) => {
    doc.text(l, ML, y);
    y += 5;
  });
  y += 3;
  setB(7.5);
  const rentF = `Стопа рентабилности инвестиције = ${n2(avgNet)} / ${n2(calc.totalInvSaPDV)} * 100 = ${rentabilnost.toFixed(2)}`;
  const rentFLines = doc.splitTextToSize(rentF, TW);
  doc.text(rentFLines, ML, y);
  y += rentFLines.length * 4.5 + 4;
  setN(7.5);
  y = wrap(
    "Стопа рентабилности је већа од 5,00 % (претпостављена пондерисана цена капитала). Сходно томе, може се констатовати да је инвестициони пројекат рентабилан.",
    y,
  );

  // PAGE 16 — Section 9.3.4 (payback) + Section 10 (risks)

  doc.addPage("a4", "p");
  y = 18;
  setB(9.5);
  doc.text("9.3.4. Време повраћаја инвестиције", ML, y);
  y += 5;
  setN(7.5);
  doc.text("Време повраћаја инвестиције = ПВИ / Д", ML, y);
  y += 8;
  setB(7.5);
  const payF = `Време повраћаја инвестиције = ${n2(calc.totalInvSaPDV)} / ${n2(avgNet)} = ${calc.povracaj.toFixed(2)}`;
  const payFLines = doc.splitTextToSize(payF, TW);
  doc.text(payFLines, ML, y);
  y += payFLines.length * 4.5 + 4;
  setN(7.5);
  y = wrap(
    `Сходно горњем обрачуну, инвестициони пројекат ће се исплатити за ${calc.povracaj.toFixed(2)} године. Дакле, време повраћаја инвестиције износи ${povYears} године и ${povMonths.toFixed(2)} месеца (${(calc.povracaj - povYears).toFixed(2)} x 12 месеци).`,
    y,
  );
  y += 12;

  setB(11);
  doc.text("10.   ПОТЕНЦИЈАЛНИ РИЗИЦИ", ML, y);
  y += 7;
  y = tblLabel("Табела 10.1.", y);

  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 82 },
      2: { cellWidth: 74 },
    },
    head: [
      [
        {
          content: "Ред. број",
          styles: { fontStyle: "bold", halign: "center" },
        },
        { content: "Врста ризика", styles: { fontStyle: "bold" } },
        { content: "Превентивна мера", styles: { fontStyle: "bold" } },
      ],
    ],
    body: [
      [
        "1.",
        "Климатски ризик (мраз, суша, временске непогоде)",
        "Примена агротехничких мера, избор отпорних сорти, осигурање засада",
      ],
      [
        "2.",
        "Тржишни ризик (промена цена и тражње)",
        "Диверзификација канала продаје, унапређење квалитета и брендирања",
      ],
      [
        "3.",
        "Ризик сировине (смањен принос)",
        "Sopstvena сировинска база, могућност набавке од других произвођача",
      ],
      [
        "4.",
        "Финансијски ризик (неликвидност, кашњење наплате)",
        "Планирање трошкова, продаја кроз више канала, постепено ширење",
      ],
      [
        "5.",
        "Технолошки ризик (квар опреме, нееfikasna производња)",
        "Набавка квалитетне опреме, редовно одржавање и сервисирање",
      ],
      [
        "6.",
        "Регулаторни ризик (промена прописа)",
        "Праћење законске регулативе и усклађивање са прописима",
      ],
      [
        "7.",
        "Ризик пласмана (спорија продаја)",
        "Планирање производње, постепен излазак на тржиште",
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 8 } as any,
  });

  // PAGE 17 — Section 11: Conclusion + Signature

  doc.addPage("a4", "p");
  y = 18;
  setB(11);
  doc.text("11.   ЗАКЉУЧНА ОЦЕНА О ПРОЈЕКТУ", ML, y);
  y += 10;

  y = wrap(ai.zakljucak1, y, 9.5);
  y += 4;
  y = wrap(ai.zakljucak2, y, 9.5);
  y += 4;
  y = wrap(ai.zakljucak3, y, 9.5);
  y += 4;
  setN(9.5);
  doc.text(
    "Финансијски показатељи пројекта указују на његову исплативост:",
    ML,
    y,
  );
  y += 6;
  [
    `коефицијент економичности већи је од 1 (${calc.ekonomicnost.toFixed(2)}),`,
    `стопа акумулативности износи ${akumulativnost.toFixed(2)}%,`,
    `стопа рентабилности инвестиције ${rentabilnost.toFixed(2)}%,`,
    `време повраћаја инвестиције је ${povYears} године и ${povMonths.toFixed(2)} месеца.`,
  ].forEach((t) => {
    y = bullet(t, y, 9.5);
  });
  y += 4;
  y = wrap(
    "Наведени показатељи потврђују да пројекат обезбеђује покриће свих трошкова и остварење добити у релативно кратком року.",
    y,
    9.5,
  );
  y += 4;
  y = wrap(
    "Иако су идентификовани одређени ризици (климатски, тржишни, финансијски и технолошки), предвиђене превентивне мере значајно умањују њихов утицај и омогућавају стабилно пословање у дугом року.",
    y,
    9.5,
  );
  y += 6;
  setB(9.5);
  const finalText =
    "На основу свега наведеног, може се закључити да је пројекат исплатив, одржив и оправдан за реализацију, те да ће допринети повећању прихода, унапређењу конкурентности и даљем развоју газдинства.";
  const finalLines = doc.splitTextToSize(finalText, TW);
  doc.text(finalLines, ML, y);
  y += finalLines.length * 5 + 24;

  setB(10);
  doc.text(s.tabela11.investitor || s.tabela21.imeNaziv, pw - MR - 65, y);
  y += 12;
  doc.text("Потпис", pw - MR - 65, y);

  // ── Page numbers (skip cover = doc page 1; number content pages 1…N) ─────
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    setN(8);
    doc.setTextColor(100);
    doc.text(String(i - 1), pageW / 2, pageH - 6, { align: "center" });
    doc.setTextColor(0);
  }

  const safeName = (
    s.tabela11.investitor ||
    s.tabela21.imeNaziv ||
    "Plan"
  ).replace(/\s/g, "_");
  doc.save(`PoslovniPlan_IPARD_${safeName}.pdf`);
}

// PATH 2 — МЛАДИ ПРЕДУЗЕТНИК (12-page template)

export function generatePath2PDF(profile: GlobalProfile, s: Path2State) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  addNormalFont(doc);
  addBoldFont(doc);

  const calc = calcPath2(s);
  const ML = 20,
    MR = 20,
    TW = 170;
  const n2 = (v: number) =>
    v.toLocaleString("sr-RS", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const n0 = (v: number) => (v !== 0 ? v.toLocaleString("sr-RS") : "");
  const YRS = ["I", "II", "III", "IV", "V"];

  const setN = (size = 9) => {
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(size);
    doc.setTextColor(0);
  };
  const setB = (size = 9) => {
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(size);
    doc.setTextColor(0);
  };
  const setI = (size = 9) => {
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(size);
    doc.setTextColor(80);
  };

  let y = 18;
  const checkPage = (needed = 25) => {
    if (y + needed > 278) {
      doc.addPage();
      y = 18;
    }
  };

  const B: Parameters<typeof autoTable>[1] = {
    theme: "grid",
    styles: {
      font: "DejaVuSans",
      fontStyle: "normal",
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fontSize: 8,
      fillColor: [255, 255, 255] as [number, number, number],
      textColor: 0,
      lineWidth: 0.3,
      lineColor: [0, 0, 0] as [number, number, number],
    },
    bodyStyles: {
      lineWidth: 0.3,
      lineColor: [0, 0, 0] as [number, number, number],
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255] as [number, number, number],
    },
    margin: { left: ML, right: MR },
  };

  const boldR = (c: string) => ({
    content: c,
    styles: { fontStyle: "bold" as const, halign: "right" as const },
  });

  // helper: write italic grey instruction text
  const instrText = (text: string) => {
    setI(8.5);
    const lines = doc.splitTextToSize(text, TW);
    doc.text(lines, ML, y);
    y += lines.length * 4.5 + 2;
  };

  // helper: write user-entered body text
  const bodyText = (text: string | undefined) => {
    if (!text) return;
    setN(9);
    const lines = doc.splitTextToSize(text, TW);
    doc.text(lines, ML, y);
    y += lines.length * 5 + 3;
  };

  // PAGE 1: Cover
  const cw = 210;
  const shortDash = "-".repeat(54);
  const longDash = "-".repeat(96);
  setN(9);
  doc.text(shortDash, cw / 2, 38, { align: "center" });
  doc.text("Име и презиме", cw / 2, 43, { align: "center" });
  setB(14);
  doc.text("П О С Л О В Н И  П Л А Н", cw / 2, 128, { align: "center" });
  setN(9);
  doc.text(longDash, cw / 2, 147, { align: "center" });
  doc.text(s.nazivPlana || "Назив пословног плана", cw / 2, 153, {
    align: "center",
  });
  doc.text(longDash, cw / 2, 166, { align: "center" });
  doc.text(s.lokacija || "Место реализације пословног плана", cw / 2, 172, {
    align: "center",
  });
  setB(11);
  doc.text(`${s.godina || "2026"}. година`, cw / 2, 240, { align: "center" });

  // PAGE 2: Section 1 -- Resume
  doc.addPage();
  y = 18;
  setB(10);
  doc.text("1.   Резиме пословног плана", ML, y);
  y += 7;

  const povYears = calc.avgNet > 0 ? Math.floor(calc.povracaj) : 0;
  const povMonths =
    calc.avgNet > 0 ? Math.round((calc.povracaj - povYears) * 12) : 0;
  const povracajStr =
    calc.avgNet > 0 ? `${povYears} год. ${povMonths} мес.` : "";

  y =
    generateRezimeTable(doc, y, {
      rezime_poslovnog_plana: {
        "1.1": { naziv: "Назив", vrednost: s.nazivPlana || "" },
        "1.2": { naziv: "Инвеститор", vrednost: s.investitor || "" },
        "1.3": { naziv: "Локација", vrednost: s.lokacija || "" },
        "2.1": { naziv: "Укупна улагања", vrednost: calc.totalInv },
        "2.2": {
          naziv: "Улагања у основна средства",
          vrednost: calc.totalOsnovnaI,
        },
        "2.3": {
          naziv: "Улагања у обртна средства",
          vrednost: calc.totalObrtnaI > 0 ? calc.totalObrtnaI : null,
        },
        "3.1": { naziv: "Укупни извори", vrednost: calc.totalInv },
        "3.2": { naziv: "Сопствени извори", vrednost: calc.sopstvenaSredstva },
        "3.3": { naziv: "Туђи извори", vrednost: calc.tujaSredstva },
        "4.1": { naziv: "Намена", vrednost: s.namenaInvesticije || "" },
        "4.2": {
          naziv: "Почетак инвестирања",
          vrednost: s.pocetakInvesticije || "",
        },
        "4.3": {
          naziv: "Завршетак инвестирања",
          vrednost: s.zavrsetakInvesticije || "",
        },
        "4.4": {
          naziv: "Економски век пројекта",
          vrednost: s.ekonomskiVek || "",
        },
        "4.5": { naziv: "Тржиште продаје", vrednost: s.trzisteProdaje || "" },
        "5.1": { naziv: "Економичност", vrednost: calc.ekonomicnost },
        "5.2": { naziv: "Акумулативност", vrednost: calc.akumulativnost },
        "5.3": { naziv: "Рентабилност", vrednost: calc.rentabilnost },
        "5.4": { naziv: "Време повраћаја инвестиције", vrednost: povracajStr },
        "5.5": {
          naziv: "Укупна ангажованост радне снаге",
          vrednost: s.angRaSnage || "",
        },
      },
    }) + 8;

  // PAGE 3: Section 2 — Farm data

  doc.addPage();
  y = 18;
  setB(11);
  doc.text(
    "2.   ОСНОВНИ ПОДАЦИ О РЕГИСТРОВАНОМ ПОЉОПРИВРЕДНОМ ГАЗДИНСТВУ",
    ML,
    y,
  );
  y += 9;

  // 2.1
  setB(9.5);
  doc.text(
    "2.1. Подаци о носиоцу регистрованог пољопривредног газдинства",
    ML,
    y,
  );
  y += 5;
  setN(8);
  doc.text("Табела 2.1.", ML, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 58 },
      2: { cellWidth: 98 },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        {
          content: "Опис",
          colSpan: 2,
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ["1.", "Име и презиме", s.investitor || ""],
      ["2.", "Адреса", s.adresaNosioca || ""],
      ["3.", "Место", s.mestoNosioca || ""],
      ["4.", "ЈМБГ", s.jmbg || ""],
      ["5.", "Телефон", s.telefon || ""],
      ["6.", "Електронска пошта", s.email || ""],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // 2.2
  setB(9.5);
  doc.text("2.2. Подаци о регистрованом пољопривредном газдинству", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 2.2.", ML, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 58 },
      2: { cellWidth: 98 },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        {
          content: "Опис",
          colSpan: 2,
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ["1.", "Адреса пољопривредног газдинства", s.adresaNosioca || ""],
      ["2.", "БПГ", s.bpg || ""],
      ["3.", "Датум регистрације", s.datumRegistracije || ""],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // 2.3
  setB(9.5);
  doc.text("2.3. Власништво и структура поседа", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 2.3.", ML, y);
  y += 4;
  const totalLand = s.vlasnistvo_ha + s.zakup_ha;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 114 },
      2: { cellWidth: 42, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        {
          content: "Земљиште и објекти у употреби\nОснов по коме се користи",
          styles: { fontStyle: "bold" },
        },
        {
          content: "Површина (ха/м2)",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ["1.", "Власништво", s.vlasnistvo_ha > 0 ? n2(s.vlasnistvo_ha) : ""],
      ["2.", "Закуп", s.zakup_ha > 0 ? n2(s.zakup_ha) : ""],
      ["3.", "Уступљено на коришћење без накнаде", ""],
      [
        { content: "Укупно:", colSpan: 2, styles: { fontStyle: "bold" } },
        {
          content: totalLand > 0 ? n2(totalLand) : "",
          styles: { fontStyle: "bold", halign: "right" as const },
        },
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // 2.4
  setB(9.5);
  doc.text("2.4. Делатност газдинства и организација посла", ML, y);
  y += 5;
  instrText(
    "Кратко описати производни асортиман и карактеристике производа/услуге појединачно. Сходно томе, потребно је навести линије производње, упосленост и организацију послова на газдинству.",
  );
  bodyText(s.opisDelatnosti);
  y += 2;

  // 2.5
  setB(9.5);
  doc.text("2.5. Основна средства у употреби", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 1.5.", ML, y);
  y += 4;

  const b = (c: string) => ({
    content: c,
    styles: { fontStyle: "bold" as const },
  });
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 94 },
      2: { cellWidth: 28, halign: "center" as const },
      3: { cellWidth: 34, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "Назив", styles: { fontStyle: "bold", halign: "center" } },
        {
          content: "Јединица мере",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Количина",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      [b("1."), b("Земљиште"), "", ""],
      ["1.1.", "Оранице и баште", "ha", n0(s.zem_oranice)],
      ["1.2.", "Ливаде", "ha", n0(s.zem_livade)],
      ["1.3.", "Пашњаци", "ha", n0(s.zem_pasnjaci)],
      ["1.4.", "Воћњаци", "ha", n0(s.zem_vocnjaci)],
      ["1.5.", "Виногради", "ha", n0(s.zem_vinogradi)],
      ["1.6.", "Шуме", "ha", n0(s.zem_sume)],
      [b("2."), b("Објекти"), "", ""],
      ["2.1.", "Кућа", "m²", n0(s.obj_kuca)],
      ["2.2.", "Стаја", "m²", n0(s.obj_staja)],
      ["2.3.", "Живинарник", "m²", n0(s.obj_zivinjarnik)],
      ["2.4.", "Силос", "m²", n0(s.obj_silos)],
      ["2.5.", "Амбар", "m²", n0(s.obj_ambar)],
      ["2.6.", "Гаража", "m²", n0(s.obj_garaza)],
      [b("3."), b("Механизација"), "", ""],
      ["3.1.", "Трактор", "ком.", n0(s.meh_traktor)],
      ["3.2.", "Комбајн", "ком.", n0(s.meh_kombajn)],
      ["3.3.", "Плуг", "ком.", n0(s.meh_plug)],
      ["3.4.", "Тањирача", "ком.", n0(s.meh_tanjiraca)],
      ["3.5.", "Дрљача", "ком.", n0(s.meh_drljaca)],
      ["3.6.", "Сетоспремач", "ком.", n0(s.meh_setoSpremac)],
      ["3.7.", "Сејалица", "ком.", n0(s.meh_sejalica)],
      ["3.8.", "Култиватор", "ком.", n0(s.meh_kultivator)],
      ["3.9.", "Расипач мин. Хранива", "ком.", n0(s.meh_rasipacMin)],
      ["3.10.", "Расипач стајског ђубрива", "ком.", n0(s.meh_rasipacStaj)],
      ["3.11.", "Прскалица", "ком.", n0(s.meh_prskAlica)],
      ["3.12.", "Берач кукуруза", "ком.", n0(s.meh_beracKukuruza)],
      ["3.13.", "Приколица", "ком.", n0(s.meh_prikolica)],
      [b("4."), b("Сточни фонд"), "", ""],
      ["4.1.", "Краве", "ком.", n0(s.stoc_krave)],
      ["4.2.", "Свиње", "ком.", n0(s.stoc_svinje)],
      ["4.3.", "Овце", "ком.", n0(s.stoc_ovce)],
      ["4.4.", "Козе", "ком.", n0(s.stoc_koze)],
      ["4.5.", "Живина", "ком.", n0(s.stoc_zivina)],
      ["4.6.", "Коњи", "ком.", n0(s.stoc_konji)],
      ["4.7.", "Кунићи", "ком.", n0(s.stoc_kunici)],
      ["4.8.", "Кошнице пчела", "ком.", n0(s.stoc_kosnice)],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Section 3
  checkPage(20);
  setB(11);
  doc.text("3.   ОПИС САДАШЊЕГ СТАЊА", ML, y);
  y += 9;

  setB(10);
  doc.text("3.1.Опис производног програма на газдинству", ML, y);
  y += 6;
  setB(9);
  doc.text(
    "а) Навести постојеће производе и укратко описати сваки појединачно.",
    ML,
    y,
  );
  y += 5;
  instrText("(навести културе, животиње на газдинству).");
  bodyText(s.opisProizvodnog);
  checkPage(15);
  setB(9);
  doc.text("б) Да ли постоји могућност проширења производног програма?", ML, y);
  y += 5;
  instrText(
    "(Уколико постоји могућност и желите да је реализујете, наведите који су то производи. Такође наведите да ли располажете свом неопходном опремом и одговарајућим објектима за њихову реализацију, а уколико не располажете, наведите која је то опрема коју је неопходно набавити.)",
  );
  bodyText(s.opisProsirenjaPrograma);
  checkPage(15);
  setB(10);
  doc.text(
    "3.2. Тржиште набавке (кратак опис тренутног стања тржишта набавке)",
    ML,
    y,
  );
  y += 5;
  instrText(
    "(За тренутну производњу или планирану производњу, наведите који су то репроматеријали и сировине које морате набавити како бисте обавили производњу.)",
  );
  bodyText(s.opisTrzisteNabavke);
  checkPage(15);
  setB(10);
  doc.text(
    "3.3.Тржиште продаје (кратак опис тренутног стања тржишта продаје)",
    ML,
    y,
  );
  y += 5;
  instrText("(Опишите постојеће и потенцијалне купце за Ваш производ).");
  bodyText(s.opisTrzisteProadaje);

  // Section 4
  doc.addPage();
  y = 18;
  setB(11);
  doc.text("4.   ПОДАЦИ О ИНВЕСТИЦИЈИ И ФИНАНСИРАЊУ", ML, y);
  y += 9;

  setB(10);
  doc.text("4.1. Предмет и циљ инвестиције", ML, y);
  y += 5;
  instrText(
    "(Укратко описати инвестицију и који је укупни износ инвестиције, да ли се набавља из иностранства или на домаћем тржишту, навести да ли је коришћено кредитно финансирање и уколико јесте навести износ кредита, рок у коме се кредит враћа, висина рате и сл.)",
  );
  bodyText(s.predmetCiljInvesticije);
  y += 3;

  // 4.2
  checkPage(45);
  setB(9.5);
  doc.text("4.2. Укупна инвестициона улагања", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 4.2.", ML, y);
  y += 4;
  const pct = (v: number) =>
    calc.totalInv > 0
      ? ((v / calc.totalInv) * 100).toFixed(2) + " %"
      : "0,00 %";
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 12, halign: "center" as const },
      1: { cellWidth: 52 },
      2: { cellWidth: 26, halign: "right" as const },
      3: { cellWidth: 26, halign: "right" as const },
      4: { cellWidth: 26, halign: "right" as const },
      5: { cellWidth: 28, halign: "center" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "Опис", styles: { fontStyle: "bold" } },
        {
          content: "Унета\nсредства",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Нова\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Укупна\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Учешће у\nукупним\nулагањима (%)",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "Основна средства", styles: { fontStyle: "bold" } },
        n2(s.unetaOsnovnaI),
        n2(calc.novaOsnovnaI),
        {
          content: n2(calc.totalOsnovnaI),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: pct(calc.totalOsnovnaI), styles: { fontStyle: "bold" } },
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "Обртна средства", styles: { fontStyle: "bold" } },
        n2(s.unetaObratnaI),
        n2(s.obrtnaInvesticija),
        {
          content: n2(calc.totalObrtnaI),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: pct(calc.totalObrtnaI), styles: { fontStyle: "bold" } },
      ],
      [
        { content: "Укупно (I+II)", colSpan: 2, styles: { fontStyle: "bold" } },
        n2(s.unetaOsnovnaI + s.unetaObratnaI),
        n2(calc.novaOsnovnaI + s.obrtnaInvesticija),
        {
          content: n2(calc.totalInv),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: "100,00 %", styles: { fontStyle: "bold" } },
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  // 4.3
  checkPage(40);
  setB(9.5);
  doc.text("4.3. Улагање у основна средства", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 4.3", ML, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 12, halign: "center" as const },
      1: { cellWidth: 82 },
      2: { cellWidth: 18, halign: "right" as const },
      3: { cellWidth: 30, halign: "right" as const },
      4: { cellWidth: 28, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "Назив основног средства", styles: { fontStyle: "bold" } },
        { content: "Комада", styles: { fontStyle: "bold", halign: "center" } },
        {
          content: "Цена по ком.\nса ПДВ",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Вредност",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ...s.osnSredstvaP2.map((os, i) => [
        `${i + 1}.`,
        os.naziv,
        { content: String(os.kolicina), styles: { halign: "right" as const } },
        { content: n2(os.cenaSaPDV), styles: { halign: "right" as const } },
        {
          content: n2(os.kolicina * os.cenaSaPDV),
          styles: { halign: "right" as const },
        },
      ]),
      [
        { content: "Укупно", colSpan: 4, styles: { fontStyle: "bold" } },
        boldR(n2(calc.novaOsnovnaI)),
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  // 4.4
  checkPage(45);
  setB(9.5);
  doc.text("4.4. Извори финансирања", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 4.4.", ML, y);
  y += 4;
  const sopOsn =
    calc.totalInv > 0
      ? calc.sopstvenaSredstva * (calc.totalOsnovnaI / calc.totalInv)
      : 0;
  const sopObn =
    calc.totalInv > 0
      ? calc.sopstvenaSredstva * (calc.totalObrtnaI / calc.totalInv)
      : 0;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 12, halign: "center" as const },
      1: { cellWidth: 52 },
      2: { cellWidth: 26, halign: "right" as const },
      3: { cellWidth: 26, halign: "right" as const },
      4: { cellWidth: 26, halign: "right" as const },
      5: { cellWidth: 28, halign: "center" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "Опис", styles: { fontStyle: "bold" } },
        {
          content: "Унета\nсредства",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Нова\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Укупна\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Учешће у\nукупним\nулагањима (%)",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "Сопствени извори", styles: { fontStyle: "bold" } },
        "",
        "",
        {
          content: n2(calc.sopstvenaSredstva),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: pct(calc.sopstvenaSredstva), styles: { fontStyle: "bold" } },
      ],
      [
        "1.",
        "Основна средства",
        "",
        "",
        { content: n2(sopOsn), styles: { halign: "right" as const } },
        "",
      ],
      [
        "2.",
        "Обртна средства",
        "",
        "",
        { content: n2(sopObn), styles: { halign: "right" as const } },
        "",
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "Туђи извори", styles: { fontStyle: "bold" } },
        "",
        "",
        {
          content: n2(calc.tujaSredstva),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: pct(calc.tujaSredstva), styles: { fontStyle: "bold" } },
      ],
      [
        "1.",
        s.tudjIzvoriOpis || "",
        "",
        "",
        {
          content: n2(calc.tujaSredstva),
          styles: { halign: "right" as const },
        },
        "",
      ],
      [
        { content: "Укупно (I+II)", colSpan: 2, styles: { fontStyle: "bold" } },
        "",
        "",
        {
          content: n2(calc.totalInv),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: "100,00 %", styles: { fontStyle: "bold" } },
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Sections 5, 6, 7
  doc.addPage();
  y = 18;
  setB(11);
  doc.text("5.   ПОТРЕБНА РАДНА СНАГА", ML, y);
  y += 6;
  instrText(
    "(Да ли је потребно запошљавање нових радника на неодређено или одређено време? Уколико јесте, образложите за обављање којих послова су вам они потребни, као и временски период у коме намеравате да их ангажујете)",
  );
  bodyText(s.opisRadneSnage);
  y += 4;

  checkPage(20);
  setB(11);
  doc.text(
    "6.   ДИСТРИБУЦИЈА И ПРОМОЦИЈА (КАНАЛИ ДИСТРИБУЦИЈЕ И НАЧИН РЕКЛАМИРАЊА)",
    ML,
    y,
  );
  y += 6;
  instrText(
    "(Опишите на који начин планирате да ваше производе рекламирате код купаца и на који начин намеравате да ваше производе учините доступним својим потенцијалним купцима (директна продаја на газдинству, продаја преко малопродајних објеката, продаја преко велепродаја и дистрибутера и др.)",
  );
  bodyText(s.opisDistribucije);
  y += 4;

  checkPage(55);
  setB(11);
  doc.text("7.   ОЧЕКИВАНИ ЕФЕКТИ", ML, y);
  y += 6;
  setN(9);
  doc.text(
    "Реализацијом овог пројекта се очекује (заокружите Да или Не):",
    ML,
    y,
  );
  y += 7;
  const effects: [string, string, boolean][] = [
    ["1.", "Проширење асортимана", s.efektProsirenjeAsortimana],
    ["2.", "Увођење новог производа", s.efektNoviProizvod],
    ["3.", "Унапређење постојећег производа", s.efektUnapredjenje],
    ["4.", "Повећање запослености", s.efektPovecZaposlenosti],
    ["5.", "Повећање прихода у пословању", s.efektPovecPrihoda],
  ];
  for (const [num, label, val] of effects) {
    setN(9);
    doc.setTextColor(0);
    doc.text(`${num}     ${label}`, ML + 8, y);
    setB(9);
    doc.setTextColor(val ? 0 : 180);
    doc.text("ДА", ML + 118, y);
    doc.setTextColor(val ? 180 : 0);
    doc.text("НЕ", ML + 132, y);
    y += 7;
  }

  // Section 8: Financial plan
  doc.addPage();
  y = 18;
  setB(11);
  doc.text("8.   ФИНАНСИЈСКИ ПЛАН", ML, y);
  y += 8;
  setB(10);
  doc.text("8.1. Формирање укупног прихода", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 8.1.", ML, y);
  y += 4;

  // 14 cols: 9+31+12+18 + 5×10 + 5×10 = 170mm
  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    columnStyles: {
      0: { cellWidth: 9, halign: "center" as const },
      1: { cellWidth: 31 },
      2: { cellWidth: 12, halign: "center" as const },
      3: { cellWidth: 18, halign: "right" as const },
      4: { cellWidth: 10, halign: "right" as const },
      5: { cellWidth: 10, halign: "right" as const },
      6: { cellWidth: 10, halign: "right" as const },
      7: { cellWidth: 10, halign: "right" as const },
      8: { cellWidth: 10, halign: "right" as const },
      9: { cellWidth: 10, halign: "right" as const },
      10: { cellWidth: 10, halign: "right" as const },
      11: { cellWidth: 10, halign: "right" as const },
      12: { cellWidth: 10, halign: "right" as const },
      13: { cellWidth: 10, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Редни\nброј",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Производ/услуга",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Јед.\nмере",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Продајна цена\nу динарима",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "right" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Обим продаје по годинама у јединици мере",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
        {
          content: "Приход по годинама у динарима",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
    ],
    body: [
      // reference row
      [
        {
          content: "1",
          styles: {
            halign: "center" as const,
            fillColor: [245, 245, 245] as [number, number, number],
          },
        },
        {
          content: "2",
          styles: { fillColor: [245, 245, 245] as [number, number, number] },
        },
        {
          content: "3",
          styles: {
            halign: "center" as const,
            fillColor: [245, 245, 245] as [number, number, number],
          },
        },
        {
          content: "4",
          styles: {
            halign: "center" as const,
            fillColor: [245, 245, 245] as [number, number, number],
          },
        },
        ...["5", "6", "7", "8", "9"].map((n) => ({
          content: n,
          styles: {
            halign: "center" as const,
            fillColor: [245, 245, 245] as [number, number, number],
          },
        })),
        ...["9=4x5", "10=4x6", "11=4x7", "12=4x8", "13=4x9"].map((n) => ({
          content: n,
          styles: {
            halign: "center" as const,
            fillColor: [245, 245, 245] as [number, number, number],
            fontSize: 5.5,
          },
        })),
      ],
      ...s.proizvodi.map((p, i) => [
        { content: `${i + 1}.`, styles: { halign: "center" as const } },
        p.naziv,
        { content: p.jedinicaMere, styles: { halign: "center" as const } },
        n2(p.prodajnaCena),
        ...p.kolicinePoGodini.map((q) => n2(q)),
        ...p.kolicinePoGodini.map((q) => n2(p.prodajnaCena * q)),
      ]),
      // filler rows up to 7 products
      ...Array(Math.max(0, 7 - s.proizvodi.length))
        .fill(null)
        .map(() => ["", "", "", "", "", "", "", "", "", "", "", "", "", ""]),
      [
        { content: "Укупно:", colSpan: 4, styles: { fontStyle: "bold" } },
        ...calc.prihodiPoGodini.map(() => ""),
        ...calc.prihodiPoGodini.map((r) => boldR(n2(r))),
      ],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 6.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // cost table helper
  const costTbl = (
    title: string,
    tabRef: string,
    subheader: string,
    rows: {
      id: string;
      naziv: string;
      poGodinama: [number, number, number, number, number];
    }[],
    totals: [number, number, number, number, number],
  ) => {
    checkPage(55);
    setB(9.5);
    const tl = doc.splitTextToSize(title, TW);
    doc.text(tl, ML, y);
    y += tl.length * 5 + 1;
    setN(8);
    doc.text(tabRef, ML, y);
    y += 4;
    const cW = (TW - 12 - 38) / 5; // ~24mm
    autoTable(doc, {
      startY: y,
      columnStyles: {
        0: { cellWidth: 12, halign: "center" as const },
        1: { cellWidth: 38 },
        2: { cellWidth: cW, halign: "right" as const },
        3: { cellWidth: cW, halign: "right" as const },
        4: { cellWidth: cW, halign: "right" as const },
        5: { cellWidth: cW, halign: "right" as const },
        6: { cellWidth: cW, halign: "right" as const },
      },
      head: [
        [
          {
            content: "Ред.\nброј",
            rowSpan: 2,
            styles: {
              valign: "middle",
              halign: "center" as const,
              fontStyle: "bold",
            },
          },
          {
            content: "Назив",
            rowSpan: 2,
            styles: { valign: "middle", fontStyle: "bold" },
          },
          {
            content: subheader,
            colSpan: 5,
            styles: { halign: "center" as const, fontStyle: "bold" },
          },
        ],
        [
          ...YRS.map((yr) => ({
            content: yr,
            styles: { halign: "center" as const, fontStyle: "bold" as const },
          })),
        ],
      ],
      body: [
        ...rows.map((r, i) => [
          `${i + 1}.`,
          r.naziv,
          ...r.poGodinama.map((v) => n2(v)),
        ]),
        [
          { content: "Укупно", colSpan: 2, styles: { fontStyle: "bold" } },
          ...totals.map((v) => boldR(n2(v))),
        ],
      ],
      ...B,
    });
    y = (doc as any).lastAutoTable.finalY + 7;
  };

  setB(10);
  doc.text("8.2. Структура трошкова", ML, y);
  y += 7;

  costTbl(
    "8.2.1. Директан материјал (трошкови набавке сировине и потрошног материјала, и сл.)",
    "Табела 8.2.1.",
    "Трошкови директног материјала по годинама пројекта",
    s.direktanMaterijal,
    calc.direktanMatPoGodini,
  );
  costTbl(
    "8.2.2. Комунални и енергетски трошкови\n(електрична енергија, вода, канализација, грејање, интернет и телекомуникације)",
    "Табела 8.2.2.",
    "Износ комуналних и енергетских трошкова по годинама пројекта",
    s.komunalni,
    calc.komunalniPoGodini,
  );
  costTbl(
    "8.2.3 Трошкови производних услуга\n(очекивани годишњи трошак за услуге одржавање објеката, опреме и осталих основних средстава, закупнине простора, трошкове рекламирања итд.)",
    "Табела 8.2.3.",
    "Износ трошкова производних услуга",
    s.usluge,
    calc.uslugePoGodini,
  );

  // 8.2.4 Amortization (10 cols: 9+25+22+12+5×16+22 = 170)
  checkPage(55);
  setB(9.5);
  const d824lines = doc.splitTextToSize(
    "8.2.4. Амортизација\nПриликом израчунавања амортизације, узима се у обзир само основна цена коштања (без урачунатог ПДВ-а).",
    TW,
  );
  doc.text(d824lines, ML, y);
  y += d824lines.length * 5 + 1;
  setN(8);
  doc.text("Табела 8.2.4.", ML, y);
  y += 4;
  const amW = (TW - 9 - 25 - 22 - 12 - 22) / 5; // =16mm
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 9, halign: "center" as const },
      1: { cellWidth: 25 },
      2: { cellWidth: 22, halign: "right" as const },
      3: { cellWidth: 12, halign: "right" as const },
      4: { cellWidth: amW, halign: "right" as const },
      5: { cellWidth: amW, halign: "right" as const },
      6: { cellWidth: amW, halign: "right" as const },
      7: { cellWidth: amW, halign: "right" as const },
      8: { cellWidth: amW, halign: "right" as const },
      9: { cellWidth: 22, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nбр.",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Назив",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Набавна\nвредност",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "right" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Стопа\nамортиз.\n(%)",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "right" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Износ трошкова амортизације по годинама пројекта",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
        {
          content: "Неамортизована\nвредност",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "right" as const,
            fontStyle: "bold",
          },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
    ],
    body: calc.amortizacijaRows.map((a, i) => [
      `${i + 1}.`,
      a.naziv,
      n2(a.nabavnaVrednost),
      `${a.stopaAmortizacije} %`,
      n2(a.godisnja),
      n2(a.godisnja),
      n2(a.godisnja),
      n2(a.godisnja),
      n2(a.godisnja),
      n2(a.neamortizovana),
    ]),
    ...B,
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  costTbl(
    "8.2.5. Трошкови радне снаге",
    "Табела 8.2.5.",
    "Износ трошкова радне снаге по годинама пројекта",
    s.radnaSnaga,
    calc.radnaSnagaPoGodini,
  );
  costTbl(
    "8.2.6. Нематеријални трошкови\n(очекивани годишњи трошак за услуге рачуновође, осигурања и сл.)",
    "Табела 8.2.6.",
    "Износ нематеријалних трошкова по годинама пројекта",
    s.nematerijalni,
    calc.nematerijalniPoGodini,
  );

  // 8.2.7 summary costs
  checkPage(65);
  setB(9.5);
  doc.text("8.2.7. Укупни трошкови", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 8.2.7.", ML, y);
  y += 4;
  const yW = (TW - 12 - 54) / 5; // ~20.8mm
  const tblSummary = (opts: Parameters<typeof autoTable>[1]) =>
    autoTable(doc, {
      columnStyles: {
        0: { cellWidth: 12, halign: "center" as const },
        1: { cellWidth: 54 },
        2: { cellWidth: yW, halign: "right" as const },
        3: { cellWidth: yW, halign: "right" as const },
        4: { cellWidth: yW, halign: "right" as const },
        5: { cellWidth: yW, halign: "right" as const },
        6: { cellWidth: yW, halign: "right" as const },
      },
      head: [
        [
          {
            content: "Ред.\nброј",
            rowSpan: 2,
            styles: {
              valign: "middle",
              halign: "center" as const,
              fontStyle: "bold",
            },
          },
          {
            content: "НАЗИВ",
            rowSpan: 2,
            styles: { valign: "middle", fontStyle: "bold" },
          },
          {
            content: "ГОДИНА",
            colSpan: 5,
            styles: { halign: "center" as const, fontStyle: "bold" },
          },
        ],
        [
          ...YRS.map((yr) => ({
            content: yr,
            styles: { halign: "center" as const, fontStyle: "bold" as const },
          })),
        ],
      ],
      ...B,
      ...opts,
    });

  tblSummary({
    startY: y,
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        {
          content: "МАТЕРИЈАЛНИ ТРОШКОВИ (1+2+3)",
          styles: { fontStyle: "bold" },
        },
        ...calc.materijalnPoGodini.map((v) => boldR(n2(v))),
      ],
      [
        "1.",
        "Директан материјал",
        ...calc.direktanMatPoGodini.map((v) => n2(v)),
      ],
      [
        "2.",
        "Комунални и енергетски трошкови",
        ...calc.komunalniPoGodini.map((v) => n2(v)),
      ],
      [
        "3.",
        "Трошкови производних услуга",
        ...calc.uslugePoGodini.map((v) => n2(v)),
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        {
          content: "НЕМАТЕРИЈАЛНИ ТРОШКОВИ (1+2+3)",
          styles: { fontStyle: "bold" },
        },
        ...calc.nematPoGodini.map((v) => boldR(n2(v))),
      ],
      ["1.", "Амортизација", ...calc.amortizacijaPoGodini.map((v) => n2(v))],
      [
        "2.",
        "Трошкови радне снаге",
        ...calc.radnaSnagaPoGodini.map((v) => n2(v)),
      ],
      [
        "3.",
        "Нематеријални трошкови",
        ...calc.nematerijalniPoGodini.map((v) => n2(v)),
      ],
      [
        {
          content: "УКУПНО ПОСЛОВНИ РАСХОДИ (I+II)",
          colSpan: 2,
          styles: { fontStyle: "bold" },
        },
        ...calc.ukupniRashodiPoGodini.map((v) => boldR(n2(v))),
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  // 8.2.8 balance
  checkPage(60);
  setB(9.5);
  doc.text("8.2.8. Биланс успеха", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 8.2.8.", ML, y);
  y += 4;
  tblSummary({
    startY: y,
    head: [
      [
        {
          content: "Ред.\nброј",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Назив",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Године пројекта",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "УКУПАН ПРИХОД", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.prihod))),
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "УКУПНИ РАСХОДИ (1+2+3)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.rashodi))),
      ],
      [
        "1.",
        "Материјални трошкови",
        ...calc.netPoGodini.map((r) => n2(r.materijalni)),
      ],
      [
        "2.",
        "Нематеријални трошкови",
        ...calc.netPoGodini.map((r) => n2(r.nematerijalni)),
      ],
      [
        { content: "III", styles: { fontStyle: "bold" } },
        { content: "БРУТО ДОБИТ (I-II)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.gross))),
      ],
      [
        { content: "IV", styles: { fontStyle: "bold" } },
        { content: "ПОРЕЗ НА ДОБИТ (10%)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.tax))),
      ],
      [
        { content: "V", styles: { fontStyle: "bold" } },
        { content: "НЕТО ДОБИТ (III-IV)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.net))),
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Section 9
  checkPage(20);
  setB(11);
  doc.text("9.   ОЦЕНА ЕФЕКАТА ПРОЈЕКТА", ML, y);
  y += 8;

  // 9.1 Cash flow
  setB(10);
  doc.text("9.1. Готовински ток", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 9.1.", ML, y);
  y += 4;
  const amort = (i: number) =>
    calc.amortizacijaPoGodini[i as 0 | 1 | 2 | 3 | 4] || 0;
  const rashodiBezAmort = (i: number) => calc.netPoGodini[i].rashodi - amort(i);
  tblSummary({
    startY: y,
    head: [
      [
        {
          content: "Ред.\nброј",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Назив",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Године пројекта",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ПРИМАЊА (1+2+3)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              calc.netPoGodini[i].prihod +
                (i === 0 ? calc.totalInv : 0) +
                (i === 4 ? calc.residualOsnovnaI + calc.totalObrtnaI : 0),
            ),
          ),
        ),
      ],
      ["1.", "Укупан приход", ...calc.netPoGodini.map((r) => n2(r.prihod))],
      ["2.", "Извори финансирања", n2(calc.totalInv), "", "", "", ""],
      ["", "2.1.Сопствени извори", n2(calc.sopstvenaSredstva), "", "", "", ""],
      ["", "2.2.Туђи извори", n2(calc.tujaSredstva), "", "", "", ""],
      [
        "3.",
        "Остатак вредности пројекта",
        "",
        "",
        "",
        "",
        n2(calc.residualOsnovnaI + calc.totalObrtnaI),
      ],
      ["", "3.1.Основна средства", "", "", "", "", n2(calc.residualOsnovnaI)],
      ["", "3.2.Обртна средства", "", "", "", "", n2(calc.totalObrtnaI)],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ИЗДАВАЊА (4+5+6+7)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(n2((i === 0 ? calc.totalInv : 0) + rashodiBezAmort(i))),
        ),
      ],
      ["4.", "Вредност инвестиције", n2(calc.totalInv), "", "", "", ""],
      ["", "4.1.У основна средства", n2(calc.totalOsnovnaI), "", "", "", ""],
      ["", "4.2.У обртна средства", n2(calc.totalObrtnaI), "", "", "", ""],
      [
        "5.",
        "Пословни расходи без амортизације и камате по кредиту",
        ...[0, 1, 2, 3, 4].map((i) => n2(rashodiBezAmort(i))),
      ],
      ["6.", "Обавезе према изворима финансирања", "", "", "", "", ""],
      [
        { content: "III", styles: { fontStyle: "bold" } },
        { content: "НЕТО ПРИМАЊА (I-II)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              calc.netPoGodini[i].prihod +
                (i === 0 ? 0 : 0) +
                (i === 4 ? calc.residualOsnovnaI + calc.totalObrtnaI : 0) -
                (i === 0 ? calc.totalInv : 0) -
                rashodiBezAmort(i),
            ),
          ),
        ),
      ],
    ],
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  // 9.2 Economic flow
  checkPage(60);
  setB(10);
  doc.text("9.2. Економски ток", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 9.2.", ML, y);
  y += 4;
  tblSummary({
    startY: y,
    head: [
      [
        {
          content: "Ред.\nброј",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Назив",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Године пројекта",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ПРИМАЊА (1+2)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              calc.netPoGodini[i].prihod +
                (i === 4 ? calc.residualOsnovnaI + calc.totalObrtnaI : 0),
            ),
          ),
        ),
      ],
      ["1.", "Укупан приход", ...calc.netPoGodini.map((r) => n2(r.prihod))],
      [
        "2.",
        "Остатак вредности пројекта",
        "",
        "",
        "",
        "",
        n2(calc.residualOsnovnaI + calc.totalObrtnaI),
      ],
      ["", "2.1.Основна средства", "", "", "", "", n2(calc.residualOsnovnaI)],
      ["", "2.2.Обртна средства", "", "", "", "", n2(calc.totalObrtnaI)],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ИЗДАВАЊА (3+4+5)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              (i === 0 ? calc.totalInv : 0) +
                rashodiBezAmort(i) +
                calc.netPoGodini[i].tax,
            ),
          ),
        ),
      ],
      ["4.", "Вредност инвестиције", n2(calc.totalInv), "", "", "", ""],
      ["", "3.1.У основна средства", n2(calc.totalOsnovnaI), "", "", "", ""],
      ["", "3.2.У обртна средства", n2(calc.totalObrtnaI), "", "", "", ""],
      [
        "5.",
        "Пословни расходи без амортизације и камате по кредиту",
        ...[0, 1, 2, 3, 4].map((i) => n2(rashodiBezAmort(i))),
      ],
      ["6.", "Порез на добит", ...calc.netPoGodini.map((r) => n2(r.tax))],
      [
        { content: "III", styles: { fontStyle: "bold" } },
        { content: "НЕТО ПРИМАЊА (I-II)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              calc.netPoGodini[i].prihod +
                (i === 4 ? calc.residualOsnovnaI + calc.totalObrtnaI : 0) -
                (i === 0 ? calc.totalInv : 0) -
                rashodiBezAmort(i) -
                calc.netPoGodini[i].tax,
            ),
          ),
        ),
      ],
    ],
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 9.3 Static assessment
  checkPage(90);
  setB(10);
  doc.text("9.3. Оцена пројекта (статичка)", ML, y);
  y += 5;
  instrText(
    "Статичка оцена инвестиционог пројекта се односи на последњу годину пројекта.",
  );
  y += 2;
  const last = calc.netPoGodini[4];
  const a93: [string, string, string][] = [
    [
      "9.3.1. Економичност производње",
      "Коефицијент економичности = УП / УИ > 1\nгде су:\nУП – укупна примања и;\nУИ – укупна издавања.",
      `Коефицијент економичности = ${n2(last.prihod)} / ${n2(last.rashodi)} = ${calc.ekonomicnost.toFixed(3)}`,
    ],
    [
      "9.3.2. Акумулативност (рентабилност) производње",
      "Стопа акумулативности = Д / УПр x 100\nгде је:\nД – добит;\nУПр – укупан приход.",
      `Стопа акумулативности = ${n2(last.net)} / ${n2(last.prihod)} x 100 = ${calc.akumulativnost.toFixed(2)} %`,
    ],
    [
      "9.3.3. Рентабилност инвестиције (предрачунске вредности инвестиције)",
      "Стопа рентабилности инвестиције = Д / ПВИ x 100\nгде је:\nПВИ – предрачунска вредност инвестиције.",
      `Стопа рентабилности инвестиције = ${n2(last.net)} / ${n2(calc.totalInv)} x 100 = ${calc.rentabilnost.toFixed(2)} %`,
    ],
    [
      "9.3.4. Време повраћаја инвестиције",
      "Време повраћаја инвестиције = ПВИ / Д",
      `Време повраћаја = ${n2(calc.totalInv)} / ${n2(calc.avgNet)} = ${calc.povracaj.toFixed(2)} (${povracajStr})`,
    ],
  ];
  for (const [head93, formula, result] of a93) {
    checkPage(28);
    setB(9.5);
    doc.setTextColor(0);
    doc.text(head93, ML, y);
    y += 5;
    instrText(formula);
    setN(9);
    doc.setTextColor(0);
    const rl = doc.splitTextToSize(result, TW);
    doc.text(rl, ML, y);
    y += rl.length * 5 + 4;
  }

  // Section 10: Risks
  checkPage(55);
  setB(11);
  doc.text("10.  ПОТЕНЦИЈАЛНИ РИЗИЦИ –", ML, y);
  y += 6;
  instrText(
    "(Навести потенцијалне ризике пословања (тржишни, финансијски ризици, климатски и инфраструктурни ризици и мере управљања ризицима).",
  );
  setN(8);
  doc.setTextColor(0);
  doc.text("Табела 10.1.", ML, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 12, halign: "center" as const },
      1: { cellWidth: 20 },
      2: { cellWidth: 69 },
      3: { cellWidth: 69 },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "", styles: { fontStyle: "bold" } },
        { content: "Врста ризика", styles: { fontStyle: "bold" } },
        { content: "Превентивна мера", styles: { fontStyle: "bold" } },
      ],
    ],
    body: [
      ...s.rizici.map((r, i) => [`${i + 1}.`, "", r.vrsta, r.mera]),
      ...Array(Math.max(0, 4 - s.rizici.length)).fill(["", "", "", ""]),
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Section 11: Conclusion
  checkPage(60);
  setB(11);
  doc.text("11.  ЗАКЉУЧНА ОЦЕНА О ПРОЈЕКТУ", ML, y);
  y += 8;
  bodyText(s.zakljucak);
  y += 20;
  const pw2 = doc.internal.pageSize.getWidth();
  setN(9);
  doc.setTextColor(0);
  doc.text("Име и презиме", pw2 - MR, y, { align: "right" });
  y += 10;
  setB(9);
  doc.text("Потпис", pw2 - MR, y, { align: "right" });

  // Page numbers
  const total = doc.getNumberOfPages();
  for (let pg = 1; pg <= total; pg++) {
    doc.setPage(pg);
    const ph = doc.internal.pageSize.getHeight();
    const pw3 = doc.internal.pageSize.getWidth();
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(String(pg), pw3 / 2, ph - 7, { align: "center" });
  }

  doc.save(
    `PoslovniPlan_MladiPreduzetnik_${(s.investitor || profile.gazdinstvoName).replace(/\s+/g, "_")}.pdf`,
  );
}

// PATH 3 — МОДЕЛ ОБРАСЦА ПОСЛОВНОГ ПЛАНА 7.1 (Наводњавање)

export function generatePath3PDF(_profile: GlobalProfile, s: Path3State) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  addNormalFont(doc);
  addBoldFont(doc);

  const calc = calcPath3(s);
  const ML = 20,
    MR = 20,
    TW = 170;
  const n2 = (v: number) =>
    v.toLocaleString("sr-RS", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const n0 = (v: number) => (v !== 0 ? v.toLocaleString("sr-RS") : "");
  const YRS = ["I", "II", "III", "IV", "V"];

  const setN = (size = 9) => {
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(size);
    doc.setTextColor(0);
  };
  const setB = (size = 9) => {
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(size);
    doc.setTextColor(0);
  };
  const setI = (size = 9) => {
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(size);
    doc.setTextColor(80);
  };

  let y = 18;
  const checkPage = (needed = 25) => {
    if (y + needed > 278) {
      doc.addPage();
      y = 18;
    }
  };

  const B: Parameters<typeof autoTable>[1] = {
    theme: "grid",
    styles: {
      font: "DejaVuSans",
      fontStyle: "normal",
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      font: "DejaVuSans",
      fontStyle: "bold",
      fontSize: 8,
      fillColor: [255, 255, 255] as [number, number, number],
      textColor: 0,
      lineWidth: 0.3,
      lineColor: [0, 0, 0] as [number, number, number],
    },
    bodyStyles: {
      lineWidth: 0.3,
      lineColor: [0, 0, 0] as [number, number, number],
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255] as [number, number, number],
    },
    margin: { left: ML, right: MR },
  };

  const boldR = (c: string) => ({
    content: c,
    styles: { fontStyle: "bold" as const, halign: "right" as const },
  });

  const instrText = (text: string) => {
    setI(8.5);
    const lines = doc.splitTextToSize(text, TW);
    doc.text(lines, ML, y);
    y += lines.length * 4.5 + 2;
  };

  const bodyText = (text: string | undefined) => {
    if (!text) return;
    setN(9);
    const lines = doc.splitTextToSize(text, TW);
    doc.text(lines, ML, y);
    y += lines.length * 5 + 3;
  };

  // PAGE 1: Cover
  const cw = 210;
  const shortDash = "-".repeat(54);
  const longDash = "-".repeat(96);

  // Top italic subtitle
  setB(9);
  doc.text("МОДЕЛ ОБРАСЦА ПОСЛОВНОГ ПЛАНА 7.1", cw / 2, 22, {
    align: "center",
  });
  setI(7.5);
  const subtitleLines = doc.splitTextToSize(
    "Активност 1. - Суфинансирање набавке система и опреме за наводњавање и опреме за побољшање водног, ваздушног и топлотног режима биљака у АП Војводини у 2026. години, за инвестиције преко 300.000,00 динара са ПДВ-ом",
    TW,
  );
  doc.text(subtitleLines, cw / 2, 30, { align: "center" });

  setN(9);
  doc.text(shortDash, cw / 2, 52, { align: "center" });
  doc.text(s.investitor || "Име и презиме", cw / 2, 57, { align: "center" });
  setB(14);
  doc.text("П О С Л О В Н И  П Л А Н", cw / 2, 128, { align: "center" });
  setN(9);
  doc.text(longDash, cw / 2, 147, { align: "center" });
  doc.text(s.nazivPlana || "Назив пословног плана", cw / 2, 153, {
    align: "center",
  });
  doc.text(longDash, cw / 2, 166, { align: "center" });
  doc.text(s.lokacija || "Место реализације пословног плана", cw / 2, 172, {
    align: "center",
  });
  setB(11);
  doc.text(`${s.godina || "2026"}. годинa`, cw / 2, 240, { align: "center" });

  // PAGE 2: Resume
  doc.addPage();
  y = 18;
  setB(10);
  doc.text("1.   Резиме пословног плана", ML, y);
  y += 7;

  const povYears = calc.avgNet > 0 ? Math.floor(calc.povracaj) : 0;
  const povMonths =
    calc.avgNet > 0 ? Math.round((calc.povracaj - povYears) * 12) : 0;
  const povracajStr =
    calc.avgNet > 0 ? `${povYears} год. ${povMonths} мес.` : "";

  y =
    generateRezimeTable(doc, y, {
      rezime_poslovnog_plana: {
        "1.1": { naziv: "Назив", vrednost: s.nazivPlana || "" },
        "1.2": { naziv: "Инвеститор", vrednost: s.investitor || "" },
        "1.3": { naziv: "Локација", vrednost: s.lokacija || "" },
        "2.1": { naziv: "Укупна улагања", vrednost: calc.totalInv },
        "2.2": {
          naziv: "Улагања у основна средства",
          vrednost: calc.totalOsnovnaI,
        },
        "2.3": {
          naziv: "Улагања у обртна средства",
          vrednost: calc.totalObrtnaI > 0 ? calc.totalObrtnaI : null,
        },
        "3.1": { naziv: "Укупни извори", vrednost: calc.totalInv },
        "3.2": { naziv: "Сопствени извори", vrednost: calc.sopstvenaSredstva },
        "3.3": { naziv: "Туђи извори", vrednost: calc.tujaSredstva },
        "4.1": { naziv: "Намена", vrednost: s.namenaInvesticije || "" },
        "4.2": {
          naziv: "Почетак инвестирања",
          vrednost: s.pocetakInvesticije || "",
        },
        "4.3": {
          naziv: "Завршетак инвестирања",
          vrednost: s.zavrsetakInvesticije || "",
        },
        "4.4": {
          naziv: "Економски век пројекта",
          vrednost: s.ekonomskiVek || "",
        },
        "4.5": { naziv: "Тржиште продаје", vrednost: s.trzisteProdaje || "" },
        "5.1": { naziv: "Економичност", vrednost: calc.ekonomicnost },
        "5.2": { naziv: "Акумулативност", vrednost: calc.akumulativnost },
        "5.3": { naziv: "Рентабилност", vrednost: calc.rentabilnost },
        "5.4": { naziv: "Време повраћаја инвестиције", vrednost: povracajStr },
        "5.5": {
          naziv: "Укупна ангажованост радне снаге",
          vrednost: s.angRaSnage || "",
        },
      },
    }) + 8;

  // PAGE 3: Section 1 — Osnovni Podaci
  doc.addPage();
  y = 18;
  setB(11);
  doc.text(
    "1.   ОСНОВНИ ПОДАЦИ О РЕГИСТРОВАНОМ ПОЉОПРИВРЕДНОМ ГАЗДИНСТВУ",
    ML,
    y,
  );
  y += 9;

  // 1.1
  setB(9.5);
  doc.text("1.1. Подаци о регистрованом пољопривредном газдинству", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 1.1.", ML, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 78 },
      2: { cellWidth: 78 },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        {
          content: "Опис",
          colSpan: 2,
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ["1.", "Подносилац захтева", s.investitor || ""],
      ["2.", "Улица и број", s.ulicaBroj || ""],
      ["3.", "Место", s.mesto || ""],
      ["4.", "ЈМБГ/МБ", s.jmbgMb || ""],
      ["5.", "Телефон", s.telefon || ""],
      ["6.", "Електронска пошта", s.email || ""],
      ["7.", "БПГ", s.bpg || ""],
      ["8.", "Датум регистрације", s.datumRegistracije || ""],
      ["9.", "Примарна делатност", s.primarnaDelatnost || ""],
      ["10.", "Секундарна делатност", s.sekundarnaDelatnost || ""],
      ["11.", "Број упослених на пољ.газдинству", s.brojUposlenih || ""],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // 1.2
  setB(9.5);
  doc.text("1.2. Подаци о локацији улагања", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 1.2.", ML, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 78 },
      2: { cellWidth: 78 },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        {
          content: "Опис",
          colSpan: 2,
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ["1.", "Катастарска општина", s.katOpstina || ""],
      ["2.", "Бројеви катастарских парцела", s.katParcele || ""],
      ["3.", "Површина (ha)", s.povrsina_ha > 0 ? n2(s.povrsina_ha) : ""],
      [
        "4.",
        "Од укупне у власништву (ha)",
        s.lokVlasnistvo_ha > 0 ? n2(s.lokVlasnistvo_ha) : "",
      ],
      [
        "5.",
        "Од укупне у закупу (ha)",
        s.lokZakup_ha > 0 ? n2(s.lokZakup_ha) : "",
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // 1.3
  checkPage(35);
  setB(9.5);
  doc.text("1.3. Власништво и структура поседа", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 1.3.", ML, y);
  y += 4;
  const totalLand = s.vlasnistvo_ha + s.zakup_ha;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 114 },
      2: { cellWidth: 42, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        {
          content: "Земљиште и објекти у употреби\nОснов по коме се користи",
          styles: { fontStyle: "bold" },
        },
        {
          content: "Површина (ха/м2)",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ["1.", "Власништво", s.vlasnistvo_ha > 0 ? n2(s.vlasnistvo_ha) : ""],
      ["2.", "Закуп", s.zakup_ha > 0 ? n2(s.zakup_ha) : ""],
      ["3.", "Уступљено на коришћење без накнаде", ""],
      [
        { content: "Укупно:", colSpan: 2, styles: { fontStyle: "bold" } },
        {
          content: totalLand > 0 ? n2(totalLand) : "",
          styles: { fontStyle: "bold", halign: "right" as const },
        },
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 6;

  // 1.4
  checkPage(20);
  setB(9.5);
  doc.text("1.4. Делатност газдинства и организација посла", ML, y);
  y += 5;
  instrText(
    "Кратко описати производни асортиман и карактеристике производа/услуге појединачно. Сходно томе, потребно је навести линије производње, упосленост и организацију послова на газдинству.",
  );
  bodyText(s.opisDelatnosti);
  y += 2;

  // 1.5
  checkPage(15);
  setB(9.5);
  doc.text("1.5. Основна средства у употреби", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 1.5.", ML, y);
  y += 4;

  const b3 = (c: string) => ({
    content: c,
    styles: { fontStyle: "bold" as const },
  });
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 14, halign: "center" as const },
      1: { cellWidth: 94 },
      2: { cellWidth: 28, halign: "center" as const },
      3: { cellWidth: 34, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "Назив", styles: { fontStyle: "bold", halign: "center" } },
        {
          content: "Јединица мере",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Количина",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      [b3("1."), b3("Земљиште"), "", ""],
      ["1.1.", "Оранице и баште", "ha", n0(s.zem_oranice)],
      ["1.2.", "Ливаде", "ha", n0(s.zem_livade)],
      ["1.3.", "Пашњаци", "ha", n0(s.zem_pasnjaci)],
      ["1.4.", "Воћњаци", "ha", n0(s.zem_vocnjaci)],
      ["1.5.", "Виногради", "ha", n0(s.zem_vinogradi)],
      ["1.6.", "Шуме", "ha", n0(s.zem_sume)],
      [b3("2."), b3("Објекти"), "", ""],
      ["2.1.", "Кућа", "m²", n0(s.obj_kuca)],
      ["2.2.", "Стаја", "m²", n0(s.obj_staja)],
      ["2.3.", "Живинарник", "m²", n0(s.obj_zivinjarnik)],
      ["2.4.", "Силос", "m²", n0(s.obj_silos)],
      ["2.5.", "Амбар", "m²", n0(s.obj_ambar)],
      ["2.6.", "Гаража", "m²", n0(s.obj_garaza)],
      [b3("3."), b3("Механизација"), "", ""],
      ["3.1.", "Трактор", "ком.", n0(s.meh_traktor)],
      ["3.2.", "Комбајн", "ком.", n0(s.meh_kombajn)],
      ["3.3.", "Плуг", "ком.", n0(s.meh_plug)],
      ["3.4.", "Тањирача", "ком.", n0(s.meh_tanjiraca)],
      ["3.5.", "Дрљача", "ком.", n0(s.meh_drljaca)],
      ["3.6.", "Сетоспремач", "ком.", n0(s.meh_setoSpremac)],
      ["3.7.", "Сејалица", "ком.", n0(s.meh_sejalica)],
      ["3.8.", "Култиватор", "ком.", n0(s.meh_kultivator)],
      ["3.9.", "Расипач мин. Хранива", "ком.", n0(s.meh_rasipacMin)],
      ["3.10.", "Расипач стајског ђубрива", "ком.", n0(s.meh_rasipacStaj)],
      ["3.11.", "Прскалица", "ком.", n0(s.meh_prskAlica)],
      ["3.12.", "Берач кукуруза", "ком.", n0(s.meh_beracKukuruza)],
      ["3.13.", "Приколица", "ком.", n0(s.meh_prikolica)],
      [b3("4."), b3("Сточни фонд"), "", ""],
      ["4.1.", "Краве", "ком.", n0(s.stoc_krave)],
      ["4.2.", "Свиње", "ком.", n0(s.stoc_svinje)],
      ["4.3.", "Овце", "ком.", n0(s.stoc_ovce)],
      ["4.4.", "Козе", "ком.", n0(s.stoc_koze)],
      ["4.5.", "Живина", "ком.", n0(s.stoc_zivina)],
      ["4.6.", "Коњи", "ком.", n0(s.stoc_konji)],
      ["4.7.", "Кунићи", "ком.", n0(s.stoc_kunici)],
      ["4.8.", "Кошнице пчела", "ком.", n0(s.stoc_kosnice)],
    ],
    ...B,
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Section 2
  checkPage(20);
  setB(11);
  doc.text("2.   ТРЖИШНИ АСПЕКТИ", ML, y);
  y += 8;

  setB(10);
  doc.text("2.1. Тржиште продаје", ML, y);
  y += 5;
  instrText(
    "(Навести кориснике производа и услуга: потенцијалне и по уговору.)",
  );
  bodyText(s.trzisteProdajeTekst);
  y += 2;

  checkPage(15);
  setB(10);
  doc.text("2.2. Тржиште снабдевања", ML, y);
  y += 5;
  instrText(
    "(Навести добављаче производа и услуга: потенцијалне и по уговору.)",
  );
  bodyText(s.trzisteSnabdevanjaTekst);

  // Section 3
  doc.addPage();
  y = 18;
  setB(11);
  doc.text("3.   ОСНОВНИ ПОДАЦИ О ИНВЕСТИЦИЈИ", ML, y);
  y += 8;

  setB(10);
  doc.text("3.1. Краtak опис пословне идеје – пројекта", ML, y);
  y += 5;
  instrText(
    "(Навести шта је предмет улагања, који је циљ инвестирања и где је место пласмана...)",
  );
  bodyText(s.opisPoslovneIdeje);
  y += 3;

  // 3.2
  checkPage(45);
  setB(9.5);
  doc.text("3.2. Укупна инвестициона улагања", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 3.2.", ML, y);
  y += 4;
  const pct3 = (v: number) =>
    calc.totalInv > 0
      ? ((v / calc.totalInv) * 100).toFixed(2) + " %"
      : "0,00 %";
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 12, halign: "center" as const },
      1: { cellWidth: 52 },
      2: { cellWidth: 26, halign: "right" as const },
      3: { cellWidth: 26, halign: "right" as const },
      4: { cellWidth: 26, halign: "right" as const },
      5: { cellWidth: 28, halign: "center" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "Опис", styles: { fontStyle: "bold" } },
        {
          content: "Унета\nсредства",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Нова\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Укупна\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Учешће у\nукупним\nулагањима (%)",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "Основна средства", styles: { fontStyle: "bold" } },
        n2(s.unetaOsnovnaI),
        n2(calc.novaOsnovnaI),
        {
          content: n2(calc.totalOsnovnaI),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: pct3(calc.totalOsnovnaI), styles: { fontStyle: "bold" } },
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "Обртна средства", styles: { fontStyle: "bold" } },
        n2(s.unetaObratnaI),
        n2(s.obrtnaInvesticija),
        {
          content: n2(calc.totalObrtnaI),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: pct3(calc.totalObrtnaI), styles: { fontStyle: "bold" } },
      ],
      [
        { content: "Укупно (I+II)", colSpan: 2, styles: { fontStyle: "bold" } },
        n2(s.unetaOsnovnaI + s.unetaObratnaI),
        n2(calc.novaOsnovnaI + s.obrtnaInvesticija),
        {
          content: n2(calc.totalInv),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: "100,00 %", styles: { fontStyle: "bold" } },
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  // 3.3
  checkPage(40);
  setB(9.5);
  doc.text("3.3. Улагање у основна средства", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 3.3.", ML, y);
  y += 4;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 12, halign: "center" as const },
      1: { cellWidth: 82 },
      2: { cellWidth: 18, halign: "right" as const },
      3: { cellWidth: 30, halign: "right" as const },
      4: { cellWidth: 28, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "Назив основног средства", styles: { fontStyle: "bold" } },
        { content: "Комада", styles: { fontStyle: "bold", halign: "center" } },
        {
          content: "Цена по ком.\nса ПДВ",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Вредност",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      ...s.osnSredstvaP3.map((os, i) => [
        `${i + 1}.`,
        os.naziv,
        { content: String(os.kolicina), styles: { halign: "right" as const } },
        { content: n2(os.cenaSaPDV), styles: { halign: "right" as const } },
        {
          content: n2(os.kolicina * os.cenaSaPDV),
          styles: { halign: "right" as const },
        },
      ]),
      [
        { content: "Укупно", colSpan: 4, styles: { fontStyle: "bold" } },
        boldR(n2(calc.novaOsnovnaI)),
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  // 3.4
  checkPage(45);
  setB(9.5);
  doc.text("3.4. Извори финансирања", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 3.4.", ML, y);
  y += 4;
  const sopOsn3 =
    calc.totalInv > 0
      ? calc.sopstvenaSredstva * (calc.totalOsnovnaI / calc.totalInv)
      : 0;
  const sopObn3 =
    calc.totalInv > 0
      ? calc.sopstvenaSredstva * (calc.totalObrtnaI / calc.totalInv)
      : 0;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 12, halign: "center" as const },
      1: { cellWidth: 52 },
      2: { cellWidth: 26, halign: "right" as const },
      3: { cellWidth: 26, halign: "right" as const },
      4: { cellWidth: 26, halign: "right" as const },
      5: { cellWidth: 28, halign: "center" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          styles: { fontStyle: "bold", halign: "center", valign: "middle" },
        },
        { content: "Опис", styles: { fontStyle: "bold" } },
        {
          content: "Унета\nсредства",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Нова\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Укупна\nулагања",
          styles: { fontStyle: "bold", halign: "center" },
        },
        {
          content: "Учешће у\nукупним\nулагањима (%)",
          styles: { fontStyle: "bold", halign: "center" },
        },
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "Сопствени извори", styles: { fontStyle: "bold" } },
        "",
        "",
        {
          content: n2(calc.sopstvenaSredstva),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        {
          content: pct3(calc.sopstvenaSredstva),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        "1.",
        "Основна средства",
        "",
        "",
        { content: n2(sopOsn3), styles: { halign: "right" as const } },
        "",
      ],
      [
        "2.",
        "Обртна средства",
        "",
        "",
        { content: n2(sopObn3), styles: { halign: "right" as const } },
        "",
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "Туђи извори", styles: { fontStyle: "bold" } },
        "",
        "",
        {
          content: n2(calc.tujaSredstva),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: pct3(calc.tujaSredstva), styles: { fontStyle: "bold" } },
      ],
      [
        "1.",
        s.tudjIzvoriOpis || "",
        "",
        "",
        {
          content: n2(calc.tujaSredstva),
          styles: { halign: "right" as const },
        },
        "",
      ],
      [
        { content: "Укупно (I+II)", colSpan: 2, styles: { fontStyle: "bold" } },
        "",
        "",
        {
          content: n2(calc.totalInv),
          styles: { fontStyle: "bold", halign: "right" as const },
        },
        { content: "100,00 %", styles: { fontStyle: "bold" } },
      ],
    ],
    ...B,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Section 4.1: Revenue -- LANDSCAPE
  doc.addPage("a4", "l");
  y = 18;
  const LML = 14;
  setB(10);
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text("4.   ФИНАНСИЈСКИ ПЛАН", LML, y);
  y += 8;
  setB(9.5);
  doc.text("4.1. Формирање укупног прихода", LML, y);
  y += 5;
  setN(8);
  doc.text("Табела 4.1.", LML, y);
  y += 4;

  // Landscape cols: 9+25+12 + 5*(20+20+25) = 9+25+12+325 =371 → too wide. Use narrower.
  // Total landscape width ~269mm. Cols: 9+25+12 + 5*( 16+16+22) = 46 + 5*54 = 46+270=316 → still wide
  // Simplify: 9+30+10 + 5*(16+16+18) = 49+5*50=49+250=299 ≈ ok for landscape 269mm
  // Actually landscape A4 content width = 297 - 14*2 = 269mm
  // Fixed widths: 9+25+10 + 5*(cena+kol+prihod) = 44 + 5*(c+k+p)
  // 269 - 44 = 225, /5 = 45 per year, split as 13+12+20
  const cC = 13,
    kC = 12,
    pC = 20;

  const BL: Parameters<typeof autoTable>[1] = {
    ...B,
    margin: { left: LML, right: LML },
  };

  autoTable(doc, {
    startY: y,
    margin: { left: LML, right: LML },
    columnStyles: {
      0: { cellWidth: 9, halign: "center" as const },
      1: { cellWidth: 25 },
      2: { cellWidth: 10, halign: "center" as const },
      3: { cellWidth: cC, halign: "right" as const },
      4: { cellWidth: kC, halign: "right" as const },
      5: { cellWidth: pC, halign: "right" as const },
      6: { cellWidth: cC, halign: "right" as const },
      7: { cellWidth: kC, halign: "right" as const },
      8: { cellWidth: pC, halign: "right" as const },
      9: { cellWidth: cC, halign: "right" as const },
      10: { cellWidth: kC, halign: "right" as const },
      11: { cellWidth: pC, halign: "right" as const },
      12: { cellWidth: cC, halign: "right" as const },
      13: { cellWidth: kC, halign: "right" as const },
      14: { cellWidth: pC, halign: "right" as const },
      15: { cellWidth: cC, halign: "right" as const },
      16: { cellWidth: kC, halign: "right" as const },
      17: { cellWidth: pC, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nброј",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Производ",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "ЈМ",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Год. I",
          colSpan: 3,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
        {
          content: "Год. II",
          colSpan: 3,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
        {
          content: "Год. III",
          colSpan: 3,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
        {
          content: "Год. IV",
          colSpan: 3,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
        {
          content: "Год. V",
          colSpan: 3,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
      ],
      [
        "",
        "",
        "",
        ...[...Array(5)].flatMap(() => [
          {
            content: "Цена по ЈМ",
            styles: { halign: "center" as const, fontStyle: "bold" as const },
          },
          {
            content: "Год. кол.",
            styles: { halign: "center" as const, fontStyle: "bold" as const },
          },
          {
            content: "Укупан\nприход",
            styles: { halign: "center" as const, fontStyle: "bold" as const },
          },
        ]),
      ],
    ],
    body: [
      ...s.proizvodi.map((p, i) => [
        { content: `${i + 1}.`, styles: { halign: "center" as const } },
        p.naziv,
        { content: p.jm, styles: { halign: "center" as const } },
        ...p.poGodinama.flatMap((pg) => [
          n2(pg.cena),
          n2(pg.kolicina),
          n2(pg.cena * pg.kolicina),
        ]),
      ]),
      ...Array(Math.max(0, 5 - s.proizvodi.length))
        .fill(null)
        .map(() => [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]),
      [
        {
          content: "Укупно приход:",
          colSpan: 3,
          styles: { fontStyle: "bold" },
        },
        ...calc.prihodiPoGodini.flatMap((v) => ["", "", boldR(n2(v))]),
      ],
    ],
    ...BL,
    styles: { ...(BL.styles as object), fontSize: 6.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Sections 4.2.1–4.2.4 cost tables -- back to PORTRAIT
  doc.addPage("a4", "p");
  y = 18;
  setB(10);
  doc.text("4.2. Структура трошкова", ML, y);
  y += 7;

  const costTbl3 = (
    title: string,
    tabRef: string,
    subheader: string,
    rows: {
      id: string;
      naziv: string;
      poGodinama: [number, number, number, number, number];
    }[],
    totals: [number, number, number, number, number],
  ) => {
    checkPage(55);
    setB(9.5);
    const tl = doc.splitTextToSize(title, TW);
    doc.text(tl, ML, y);
    y += tl.length * 5 + 1;
    setN(8);
    doc.text(tabRef, ML, y);
    y += 4;
    const cW = (TW - 12 - 38) / 5;
    autoTable(doc, {
      startY: y,
      columnStyles: {
        0: { cellWidth: 12, halign: "center" as const },
        1: { cellWidth: 38 },
        2: { cellWidth: cW, halign: "right" as const },
        3: { cellWidth: cW, halign: "right" as const },
        4: { cellWidth: cW, halign: "right" as const },
        5: { cellWidth: cW, halign: "right" as const },
        6: { cellWidth: cW, halign: "right" as const },
      },
      head: [
        [
          {
            content: "Ред.\nброј",
            rowSpan: 2,
            styles: {
              valign: "middle",
              halign: "center" as const,
              fontStyle: "bold",
            },
          },
          {
            content: "Назив",
            rowSpan: 2,
            styles: { valign: "middle", fontStyle: "bold" },
          },
          {
            content: subheader,
            colSpan: 5,
            styles: { halign: "center" as const, fontStyle: "bold" },
          },
        ],
        [
          ...YRS.map((yr) => ({
            content: yr,
            styles: { halign: "center" as const, fontStyle: "bold" as const },
          })),
        ],
      ],
      body: [
        ...rows.map((r, i) => [
          `${i + 1}.`,
          r.naziv,
          ...r.poGodinama.map((v) => n2(v)),
        ]),
        [
          { content: "Укупно", colSpan: 2, styles: { fontStyle: "bold" } },
          ...totals.map((v) => boldR(n2(v))),
        ],
      ],
      ...B,
    });
    y = (doc as any).lastAutoTable.finalY + 7;
  };

  costTbl3(
    "4.2.1. Директан материјал (трошкови набавке сировине и потрошног материјала)",
    "Табела 4.2.1.",
    "Трошкови директног материјала по годинама пројекта",
    s.direktanMaterijal,
    calc.direktanMatPoGodini,
  );
  costTbl3(
    "4.2.2. Енергија и гориво\n(електрична енергија, гориво и сл.)",
    "Табела 4.2.2.",
    "Износ трошкова енергије и горива по годинама пројекта",
    s.energijaGorivo,
    calc.energijaGorivoPoGodini,
  );

  // 4.2.3 Amortization
  checkPage(55);
  setB(9.5);
  const d423lines = doc.splitTextToSize(
    "4.2.3. Амортизација\nПриликом израчунавања амортизације, узима се у обзир само основна цена коштања (без урачунатог ПДВ-а).",
    TW,
  );
  doc.text(d423lines, ML, y);
  y += d423lines.length * 5 + 1;
  setN(8);
  doc.text("Табела 4.2.3.", ML, y);
  y += 4;
  const amW3 = (TW - 9 - 25 - 22 - 12 - 22) / 5;
  autoTable(doc, {
    startY: y,
    columnStyles: {
      0: { cellWidth: 9, halign: "center" as const },
      1: { cellWidth: 25 },
      2: { cellWidth: 22, halign: "right" as const },
      3: { cellWidth: 12, halign: "right" as const },
      4: { cellWidth: amW3, halign: "right" as const },
      5: { cellWidth: amW3, halign: "right" as const },
      6: { cellWidth: amW3, halign: "right" as const },
      7: { cellWidth: amW3, halign: "right" as const },
      8: { cellWidth: amW3, halign: "right" as const },
      9: { cellWidth: 22, halign: "right" as const },
    },
    head: [
      [
        {
          content: "Ред.\nбр.",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Назив",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Набавна\nвредност",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "right" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Стопа\nамортиз.\n(%)",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "right" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Износ трошкова амортизације по годинама пројекта",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
        {
          content: "Неамортизована\nвредност",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "right" as const,
            fontStyle: "bold",
          },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
    ],
    body: calc.amortizacijaRows.map((a, i) => [
      `${i + 1}.`,
      a.naziv,
      n2(a.nabavnaVrednost),
      `${a.stopaAmortizacije} %`,
      n2(a.godisnja),
      n2(a.godisnja),
      n2(a.godisnja),
      n2(a.godisnja),
      n2(a.godisnja),
      n2(a.neamortizovana),
    ]),
    ...B,
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  costTbl3(
    "4.2.4. Спољна радна снага",
    "Табела 4.2.4.",
    "Износ трошкова радне снаге по годинама пројекта",
    s.radnaSnagaVanjska,
    calc.radnaSnagaPoGodini,
  );

  // 4.2.5 Summary costs
  checkPage(65);
  setB(9.5);
  doc.text("4.2.5. Укупни трошкови", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 4.2.5.", ML, y);
  y += 4;
  const yW3 = (TW - 12 - 54) / 5;
  const tblSummary3 = (opts: Parameters<typeof autoTable>[1]) =>
    autoTable(doc, {
      columnStyles: {
        0: { cellWidth: 12, halign: "center" as const },
        1: { cellWidth: 54 },
        2: { cellWidth: yW3, halign: "right" as const },
        3: { cellWidth: yW3, halign: "right" as const },
        4: { cellWidth: yW3, halign: "right" as const },
        5: { cellWidth: yW3, halign: "right" as const },
        6: { cellWidth: yW3, halign: "right" as const },
      },
      head: [
        [
          {
            content: "Ред.\nброј",
            rowSpan: 2,
            styles: {
              valign: "middle",
              halign: "center" as const,
              fontStyle: "bold",
            },
          },
          {
            content: "НАЗИВ",
            rowSpan: 2,
            styles: { valign: "middle", fontStyle: "bold" },
          },
          {
            content: "ГОДИНА",
            colSpan: 5,
            styles: { halign: "center" as const, fontStyle: "bold" },
          },
        ],
        [
          ...YRS.map((yr) => ({
            content: yr,
            styles: { halign: "center" as const, fontStyle: "bold" as const },
          })),
        ],
      ],
      ...B,
      ...opts,
    });

  tblSummary3({
    startY: y,
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        {
          content: "МАТЕРИЈАЛНИ ТРОШКОВИ (1+2)",
          styles: { fontStyle: "bold" },
        },
        ...calc.materijalnPoGodini.map((v) => boldR(n2(v))),
      ],
      [
        "1.",
        "Директан материјал",
        ...calc.direktanMatPoGodini.map((v) => n2(v)),
      ],
      [
        "2.",
        "Енергија и гориво",
        ...calc.energijaGorivoPoGodini.map((v) => n2(v)),
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        {
          content: "НЕМАТЕРИЈАЛНИ ТРОШКОВИ (1+2)",
          styles: { fontStyle: "bold" },
        },
        ...calc.nematPoGodini.map((v) => boldR(n2(v))),
      ],
      ["1.", "Амортизација", ...calc.amortizacijaPoGodini.map((v) => n2(v))],
      [
        "2.",
        "Спољна радна снага",
        ...calc.radnaSnagaPoGodini.map((v) => n2(v)),
      ],
      [
        {
          content: "УКУПНО ПОСЛОВНИ РАСХОДИ (I+II)",
          colSpan: 2,
          styles: { fontStyle: "bold" },
        },
        ...calc.ukupniRashodiPoGodini.map((v) => boldR(n2(v))),
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  // 4.2.6 Balance sheet
  checkPage(60);
  setB(9.5);
  doc.text("4.2.6. Биланс успеха", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 4.2.6.", ML, y);
  y += 4;
  tblSummary3({
    startY: y,
    head: [
      [
        {
          content: "Ред.\nброј",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Назив",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Године пројекта",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "УКУПАН ПРИХОД", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.prihod))),
      ],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "УКУПНИ РАСХОДИ (1+2)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.rashodi))),
      ],
      [
        "1.",
        "Материјални трошкови",
        ...calc.netPoGodini.map((r) => n2(r.materijalni)),
      ],
      [
        "2.",
        "Нематеријални трошкови",
        ...calc.netPoGodini.map((r) => n2(r.nematerijalni)),
      ],
      [
        { content: "III", styles: { fontStyle: "bold" } },
        { content: "БРУТО ДОБИТ (I-II)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.gross))),
      ],
      [
        { content: "IV", styles: { fontStyle: "bold" } },
        { content: "ПОРЕЗ НА ДОБИТ (10%)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.tax))),
      ],
      [
        { content: "V", styles: { fontStyle: "bold" } },
        { content: "НЕТО ДОБИТ (III-IV)", styles: { fontStyle: "bold" } },
        ...calc.netPoGodini.map((r) => boldR(n2(r.net))),
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Section 5 -- Cash flow + Economic flow
  checkPage(20);
  setB(11);
  doc.text("5.   ОЦЕНА ЕФЕКАТА ПРОЈЕКТА", ML, y);
  y += 8;

  const rashodiBezAmort3 = (i: number) =>
    calc.rashodiBezAmorPoGodini[i as 0 | 1 | 2 | 3 | 4];

  // 5.1 Cash flow
  setB(10);
  doc.text("5.1. Готовински ток", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 5.1.", ML, y);
  y += 4;
  tblSummary3({
    startY: y,
    head: [
      [
        {
          content: "Ред.\nброј",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Назив",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Године пројекта",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ПРИМАЊА (1+2+3)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              calc.netPoGodini[i].prihod +
                (i === 0 ? calc.totalInv : 0) +
                (i === 4 ? calc.residualOsnovnaI + calc.totalObrtnaI : 0),
            ),
          ),
        ),
      ],
      ["1.", "Укупан приход", ...calc.netPoGodini.map((r) => n2(r.prihod))],
      ["2.", "Извори финансирања", n2(calc.totalInv), "", "", "", ""],
      ["", "2.1. Сопствени извори", n2(calc.sopstvenaSredstva), "", "", "", ""],
      ["", "2.2. Туђи извори", n2(calc.tujaSredstva), "", "", "", ""],
      [
        "3.",
        "Остатак вредности пројекта",
        "",
        "",
        "",
        "",
        n2(calc.residualOsnovnaI + calc.totalObrtnaI),
      ],
      ["", "3.1. Основна средства", "", "", "", "", n2(calc.residualOsnovnaI)],
      ["", "3.2. Обртна средства", "", "", "", "", n2(calc.totalObrtnaI)],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ИЗДАВАЊА (4+5+6)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(n2((i === 0 ? calc.totalInv : 0) + rashodiBezAmort3(i))),
        ),
      ],
      ["4.", "Вредност инвестиције", n2(calc.totalInv), "", "", "", ""],
      ["", "4.1. У основна средства", n2(calc.totalOsnovnaI), "", "", "", ""],
      ["", "4.2. У обртна средства", n2(calc.totalObrtnaI), "", "", "", ""],
      [
        "5.",
        "Пословни расходи без амортизације",
        ...[0, 1, 2, 3, 4].map((i) => n2(rashodiBezAmort3(i))),
      ],
      ["6.", "Обавезе према изворима финансирања", "", "", "", "", ""],
      [
        { content: "III", styles: { fontStyle: "bold" } },
        { content: "НЕТО ПРИМАЊА (I-II)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              calc.netPoGodini[i].prihod +
                (i === 4 ? calc.residualOsnovnaI + calc.totalObrtnaI : 0) -
                (i === 0 ? calc.totalInv : 0) -
                rashodiBezAmort3(i),
            ),
          ),
        ),
      ],
    ],
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 7;

  // 5.2 Economic flow
  checkPage(60);
  setB(10);
  doc.text("5.2. Економски ток", ML, y);
  y += 5;
  setN(8);
  doc.text("Табела 5.2.", ML, y);
  y += 4;
  tblSummary3({
    startY: y,
    head: [
      [
        {
          content: "Ред.\nброј",
          rowSpan: 2,
          styles: {
            valign: "middle",
            halign: "center" as const,
            fontStyle: "bold",
          },
        },
        {
          content: "Назив",
          rowSpan: 2,
          styles: { valign: "middle", fontStyle: "bold" },
        },
        {
          content: "Године пројекта",
          colSpan: 5,
          styles: { halign: "center" as const, fontStyle: "bold" },
        },
      ],
      [
        ...YRS.map((yr) => ({
          content: yr,
          styles: { halign: "center" as const, fontStyle: "bold" as const },
        })),
      ],
    ],
    body: [
      [
        { content: "I", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ПРИМАЊА (1+2)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              calc.netPoGodini[i].prihod +
                (i === 4 ? calc.residualOsnovnaI + calc.totalObrtnaI : 0),
            ),
          ),
        ),
      ],
      ["1.", "Укупан приход", ...calc.netPoGodini.map((r) => n2(r.prihod))],
      [
        "2.",
        "Остатак вредности пројекта",
        "",
        "",
        "",
        "",
        n2(calc.residualOsnovnaI + calc.totalObrtnaI),
      ],
      ["", "2.1. Основна средства", "", "", "", "", n2(calc.residualOsnovnaI)],
      ["", "2.2. Обртна средства", "", "", "", "", n2(calc.totalObrtnaI)],
      [
        { content: "II", styles: { fontStyle: "bold" } },
        { content: "УКУПНА ИЗДАВАЊА (3+4+5)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              (i === 0 ? calc.totalInv : 0) +
                rashodiBezAmort3(i) +
                calc.netPoGodini[i].tax,
            ),
          ),
        ),
      ],
      ["3.", "Вредност инвестиције", n2(calc.totalInv), "", "", "", ""],
      ["", "3.1. У основна средства", n2(calc.totalOsnovnaI), "", "", "", ""],
      ["", "3.2. У обртна средства", n2(calc.totalObrtnaI), "", "", "", ""],
      [
        "4.",
        "Пословни расходи без амортизације",
        ...[0, 1, 2, 3, 4].map((i) => n2(rashodiBezAmort3(i))),
      ],
      ["5.", "Порез на добит", ...calc.netPoGodini.map((r) => n2(r.tax))],
      [
        { content: "III", styles: { fontStyle: "bold" } },
        { content: "НЕТО ПРИМИЦИ (I-II)", styles: { fontStyle: "bold" } },
        ...[0, 1, 2, 3, 4].map((i) =>
          boldR(
            n2(
              calc.netPoGodini[i].prihod +
                (i === 4 ? calc.residualOsnovnaI + calc.totalObrtnaI : 0) -
                (i === 0 ? calc.totalInv : 0) -
                rashodiBezAmort3(i) -
                calc.netPoGodini[i].tax,
            ),
          ),
        ),
      ],
    ],
    styles: { ...(B.styles as object), fontSize: 7.5 } as any,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // 5.3 Static assessment
  checkPage(90);
  setB(10);
  doc.text("5.3. Оцена пројекта (статичка)", ML, y);
  y += 5;
  instrText(
    "Статичка оцена инвестиционог пројекта се односи на последњу годину пројекта.",
  );
  y += 2;
  const last3 = calc.netPoGodini[4];
  const a53: [string, string, string][] = [
    [
      "5.3.1. Економичност производње",
      "Коефицијент економичности = УП / УИ > 1\nгде су:\nУП – укупна примања и;\nУИ – укупна издавања.",
      `Коефицијент економичности = ${n2(last3.prihod)} / ${n2(last3.rashodi)} = ${calc.ekonomicnost.toFixed(3)}`,
    ],
    [
      "5.3.2. Акумулативност (рентабилност) производње",
      "Стопа акумулативности = Д / УПр x 100\nгде је:\nД – добит;\nУПр – укупан приход.",
      `Стопа акумулативности = ${n2(last3.net)} / ${n2(last3.prihod)} x 100 = ${calc.akumulativnost.toFixed(2)} %`,
    ],
    [
      "5.3.3. Рентабилност инвестиције (предрачунске вредности инвестиције)",
      "Стопа рентабилности инвестиције = Д / ПВИ x 100\nгде је:\nПВИ – предрачунска вредност инвестиције.",
      `Стопа рентабилности инвестиције = ${n2(last3.net)} / ${n2(calc.totalInv)} x 100 = ${calc.rentabilnost.toFixed(2)} %`,
    ],
    [
      "5.3.4. Време повраћаја инвестиције",
      "Време повраћаја инвестиције = ПВИ / Д",
      `Време повраћаја = ${n2(calc.totalInv)} / ${n2(calc.avgNet)} = ${calc.povracaj.toFixed(2)} (${povracajStr})`,
    ],
  ];
  for (const [head53, formula, result] of a53) {
    checkPage(28);
    setB(9.5);
    doc.setTextColor(0);
    doc.text(head53, ML, y);
    y += 5;
    instrText(formula);
    setN(9);
    doc.setTextColor(0);
    const rl = doc.splitTextToSize(result, TW);
    doc.text(rl, ML, y);
    y += rl.length * 5 + 4;
  }

  // Section 6: Conclusion
  checkPage(60);
  setB(11);
  doc.text("6.   ЗАКЉУЧНА ОЦЕНА О ПРОЈЕКТУ", ML, y);
  y += 8;
  bodyText(s.zakljucak);
  y += 20;
  const pw3f = doc.internal.pageSize.getWidth();
  setN(9);
  doc.setTextColor(0);
  doc.text("Име и презиме", pw3f - MR, y, { align: "right" });
  y += 10;
  setB(9);
  doc.text("Потпис", pw3f - MR, y, { align: "right" });

  // Page numbers
  const total3 = doc.getNumberOfPages();
  for (let pg = 1; pg <= total3; pg++) {
    doc.setPage(pg);
    const ph = doc.internal.pageSize.getHeight();
    const pw = doc.internal.pageSize.getWidth();
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text(String(pg), pw / 2, ph - 7, { align: "center" });
  }

  doc.save(
    `PoslovniPlan_Navodnjavanje_${(s.investitor || "Plan").replace(/\s+/g, "_")}.pdf`,
  );
}
