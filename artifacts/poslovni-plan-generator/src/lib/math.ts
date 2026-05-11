import type { Path1State, Path2State, Path3State } from "../types";

export function calcPath1(s: Path1State) {
  // Investment
  const totalInvSaPDV = s.osnSredstva.reduce(
    (a, i) => a + i.kolicina * i.cenaSaPDV,
    0,
  );
  const sopstvenaSredstva = (totalInvSaPDV * s.sopstvenaProcenat) / 100;
  const tujaSredstva = totalInvSaPDV - sopstvenaSredstva;

  // Revenue per year (G1–G5)
  const prihodiPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    s.proizvodi.reduce(
      (sum, p) =>
        sum + p.prodajnaCena * p.kolicinePoGodini[yr as 0 | 1 | 2 | 3 | 4],
      0,
    ),
  );

  // Cost for categories
  const trosak82_1 = s.trosak_sirovine + s.trosak_ambalaza + s.trosak_ostaliMat;
  const trosak82_2 = s.trosak_struja + s.trosak_voda + s.trosak_ostalaEn;
  const trosak82_3 = s.trosak_odrzavanje + s.trosak_ostaleUsl;
  const trosak82_4 = s.amortizacija.reduce(
    (a, i) => a + (i.nabavnaVrednost * i.stopaAmortizacije) / 100,
    0,
  );
  const trosak82_5 = s.radnaSnaga_godisnjiTrosak;
  const trosak82_6 =
    s.trosak_banka + s.trosak_osiguranje + s.trosak_ostaliNemat;
  const ukupniRashodi =
    trosak82_1 + trosak82_2 + trosak82_3 + trosak82_4 + trosak82_5 + trosak82_6;

  // Net per year
  const netPoGodini = prihodiPoGodini.map((prihod) => {
    const gross = prihod - ukupniRashodi;
    const tax = Math.max(0, gross * 0.1);
    return { prihod, gross, tax, net: gross - tax };
  });

  const avgPrihod = prihodiPoGodini.reduce((a, v) => a + v, 0) / 5;
  const ekonomicnost = ukupniRashodi > 0 ? avgPrihod / ukupniRashodi : 0;
  const avgNet = netPoGodini.reduce((a, v) => a + v.net, 0) / 5;
  const povracaj = avgNet > 0 ? totalInvSaPDV / avgNet : 0;

  return {
    totalInvSaPDV,
    sopstvenaSredstva,
    tujaSredstva,
    prihodiPoGodini,
    trosak82_1,
    trosak82_2,
    trosak82_3,
    trosak82_4,
    trosak82_5,
    trosak82_6,
    ukupniRashodi,
    netPoGodini,
    avgPrihod,
    ekonomicnost,
    avgNet,
    povracaj,
  };
}

export function calcPath2(s: Path2State) {
  // Investment (Tables 4.2–4.4)
  const novaOsnovnaI = s.osnSredstvaP2.reduce(
    (a, i) => a + i.kolicina * i.cenaSaPDV,
    0,
  );
  const totalOsnovnaI = s.unetaOsnovnaI + novaOsnovnaI;
  const totalObrtnaI = s.unetaObratnaI + s.obrtnaInvesticija;
  const totalInv = totalOsnovnaI + totalObrtnaI;

  const sopstvenaSredstva = (totalInv * s.sopstvenoUcescePct) / 100;
  const tujaSredstva = totalInv - sopstvenaSredstva;

  // Revenue per year (Table 8.1)
  const prihodiPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    s.proizvodi.reduce(
      (sum, p) =>
        sum + p.prodajnaCena * p.kolicinePoGodini[yr as 0 | 1 | 2 | 3 | 4],
      0,
    ),
  ) as [number, number, number, number, number];

  // Cost category totals per year
  const sumCat = (
    rows: { poGodinama: [number, number, number, number, number] }[],
    yr: number,
  ) => rows.reduce((a, r) => a + r.poGodinama[yr], 0);

  const direktanMatPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    sumCat(s.direktanMaterijal, yr),
  ) as [number, number, number, number, number];
  const komunalniPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    sumCat(s.komunalni, yr),
  ) as [number, number, number, number, number];
  const uslugePoGodini = [0, 1, 2, 3, 4].map((yr) => sumCat(s.usluge, yr)) as [
    number,
    number,
    number,
    number,
    number,
  ];
  const radnaSnagaPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    sumCat(s.radnaSnaga, yr),
  ) as [number, number, number, number, number];
  const nematerijalniPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    sumCat(s.nematerijalni, yr),
  ) as [number, number, number, number, number];

  // 8.2.4 Amortization: nabavna × stopa/100 per year (same each year)
  const amortizacijaRows = s.amortizacija.map((a) => ({
    ...a,
    godisnja: (a.nabavnaVrednost * a.stopaAmortizacije) / 100,
    neamortizovana: Math.max(
      0,
      a.nabavnaVrednost - ((a.nabavnaVrednost * a.stopaAmortizacije) / 100) * 5,
    ),
  }));
  const amortizacijaPoGodini = [0, 1, 2, 3, 4].map(() =>
    amortizacijaRows.reduce((a, r) => a + r.godisnja, 0),
  ) as [number, number, number, number, number];

  // Materijalni = 8.2.1 + 8.2.2 + 8.2.3
  const materijalnPoGodini = [0, 1, 2, 3, 4].map(
    (yr) =>
      direktanMatPoGodini[yr] + komunalniPoGodini[yr] + uslugePoGodini[yr],
  ) as [number, number, number, number, number];

  // Nematerijalni = 8.2.4 + 8.2.5 + 8.2.6
  const nematPoGodini = [0, 1, 2, 3, 4].map(
    (yr) =>
      amortizacijaPoGodini[yr] +
      radnaSnagaPoGodini[yr] +
      nematerijalniPoGodini[yr],
  ) as [number, number, number, number, number];

  // Ukupni rashodi per year = materijalni + nematerijalni
  const ukupniRashodiPoGodini = [0, 1, 2, 3, 4].map(
    (yr) => materijalnPoGodini[yr] + nematPoGodini[yr],
  ) as [number, number, number, number, number];

  // P&L per year
  const netPoGodini = prihodiPoGodini.map((prihod, yr) => {
    const rashodi = ukupniRashodiPoGodini[yr];
    const gross = prihod - rashodi;
    const tax = Math.max(0, gross * 0.1);
    return {
      prihod,
      rashodi,
      materijalni: materijalnPoGodini[yr],
      nematerijalni: nematPoGodini[yr],
      gross,
      tax,
      net: gross - tax,
    };
  });

  // Static assessment (last year = Year 5)
  const last = netPoGodini[4];
  const ekonomicnost = last.rashodi > 0 ? last.prihod / last.rashodi : 0;
  const akumulativnost = last.prihod > 0 ? (last.net / last.prihod) * 100 : 0;
  const rentabilnost = totalInv > 0 ? (last.net / totalInv) * 100 : 0;
  const avgNet = netPoGodini.reduce((a, r) => a + r.net, 0) / 5;
  const povracaj = avgNet > 0 ? totalInv / avgNet : 0;

  // Residual value of fixed assets (for 9.1)
  const residualOsnovnaI = amortizacijaRows.reduce(
    (a, r) => a + r.neamortizovana,
    0,
  );

  return {
    novaOsnovnaI,
    totalOsnovnaI,
    totalObrtnaI,
    totalInv,
    sopstvenaSredstva,
    tujaSredstva,
    prihodiPoGodini,
    direktanMatPoGodini,
    komunalniPoGodini,
    uslugePoGodini,
    amortizacijaRows,
    amortizacijaPoGodini,
    radnaSnagaPoGodini,
    nematerijalniPoGodini,
    materijalnPoGodini,
    nematPoGodini,
    ukupniRashodiPoGodini,
    netPoGodini,
    ekonomicnost,
    akumulativnost,
    rentabilnost,
    avgNet,
    povracaj,
    residualOsnovnaI,
  };
}

export function calcPath3(s: Path3State) {
  const novaOsnovnaI = s.osnSredstvaP3.reduce(
    (a, i) => a + i.kolicina * i.cenaSaPDV,
    0,
  );
  const totalOsnovnaI = s.unetaOsnovnaI + novaOsnovnaI;
  const totalObrtnaI = s.unetaObratnaI + s.obrtnaInvesticija;
  const totalInv = totalOsnovnaI + totalObrtnaI;
  const sopstvenaSredstva = (totalInv * s.sopstvenoUcescePct) / 100;
  const tujaSredstva = totalInv - sopstvenaSredstva;

  const prihodiPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    s.proizvodi.reduce(
      (sum, p) =>
        sum +
        p.poGodinama[yr as 0 | 1 | 2 | 3 | 4].cena *
          p.poGodinama[yr as 0 | 1 | 2 | 3 | 4].kolicina,
      0,
    ),
  ) as [number, number, number, number, number];

  const sumCat = (
    rows: { poGodinama: [number, number, number, number, number] }[],
    yr: number,
  ) => rows.reduce((a, r) => a + r.poGodinama[yr], 0);

  const direktanMatPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    sumCat(s.direktanMaterijal, yr),
  ) as [number, number, number, number, number];
  const energijaGorivoPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    sumCat(s.energijaGorivo, yr),
  ) as [number, number, number, number, number];
  const radnaSnagaPoGodini = [0, 1, 2, 3, 4].map((yr) =>
    sumCat(s.radnaSnagaVanjska, yr),
  ) as [number, number, number, number, number];

  const amortizacijaRows = s.amortizacijaP3.map((a) => ({
    ...a,
    godisnja: (a.nabavnaVrednost * a.stopaAmortizacije) / 100,
    neamortizovana: Math.max(
      0,
      a.nabavnaVrednost - ((a.nabavnaVrednost * a.stopaAmortizacije) / 100) * 5,
    ),
  }));
  const amortizacijaPoGodini = [0, 1, 2, 3, 4].map(() =>
    amortizacijaRows.reduce((a, r) => a + r.godisnja, 0),
  ) as [number, number, number, number, number];

  // Materijalni = 4.2.1 + 4.2.2
  const materijalnPoGodini = [0, 1, 2, 3, 4].map(
    (yr) => direktanMatPoGodini[yr] + energijaGorivoPoGodini[yr],
  ) as [number, number, number, number, number];

  // Nematerijalni = 4.2.3 + 4.2.4
  const nematPoGodini = [0, 1, 2, 3, 4].map(
    (yr) => amortizacijaPoGodini[yr] + radnaSnagaPoGodini[yr],
  ) as [number, number, number, number, number];

  const ukupniRashodiPoGodini = [0, 1, 2, 3, 4].map(
    (yr) => materijalnPoGodini[yr] + nematPoGodini[yr],
  ) as [number, number, number, number, number];

  const netPoGodini = prihodiPoGodini.map((prihod, yr) => {
    const rashodi = ukupniRashodiPoGodini[yr];
    const gross = prihod - rashodi;
    const tax = Math.max(0, gross * 0.1);
    return {
      prihod,
      rashodi,
      materijalni: materijalnPoGodini[yr],
      nematerijalni: nematPoGodini[yr],
      gross,
      tax,
      net: gross - tax,
    };
  });

  const last = netPoGodini[4];
  const ekonomicnost = last.rashodi > 0 ? last.prihod / last.rashodi : 0;
  const akumulativnost = last.prihod > 0 ? (last.net / last.prihod) * 100 : 0;
  const rentabilnost = totalInv > 0 ? (last.net / totalInv) * 100 : 0;
  const avgNet = netPoGodini.reduce((a, r) => a + r.net, 0) / 5;
  const povracaj = avgNet > 0 ? totalInv / avgNet : 0;
  const residualOsnovnaI = amortizacijaRows.reduce(
    (a, r) => a + r.neamortizovana,
    0,
  );
  // Poslovni rashodi bez amortizacije = mat + radna snaga (no depreciation)
  const rashodiBezAmorPoGodini = [0, 1, 2, 3, 4].map(
    (yr) => materijalnPoGodini[yr] + radnaSnagaPoGodini[yr],
  ) as [number, number, number, number, number];

  return {
    novaOsnovnaI,
    totalOsnovnaI,
    totalObrtnaI,
    totalInv,
    sopstvenaSredstva,
    tujaSredstva,
    prihodiPoGodini,
    direktanMatPoGodini,
    energijaGorivoPoGodini,
    amortizacijaRows,
    amortizacijaPoGodini,
    radnaSnagaPoGodini,
    materijalnPoGodini,
    nematPoGodini,
    ukupniRashodiPoGodini,
    netPoGodini,
    ekonomicnost,
    akumulativnost,
    rentabilnost,
    avgNet,
    povracaj,
    residualOsnovnaI,
    rashodiBezAmorPoGodini,
  };
}
