// ═══════════════════════════════════════════════════════════════════════════
// IPARD TypeScript интерфејси
// Сви типови за генерисање PDF пословних планова
// ═══════════════════════════════════════════════════════════════════════════

// ── Заједнички типови за резиме (све три путање) ─────────────────────────────

/** Један ред у табели „1. Резиме пословног плана" */
export interface RezimeUnos {
  /** Назив ставке – исписује се у другој колони табеле */
  naziv: string;
  /** Вредност: текст, број (форматира се аутоматски) или null (→ „–") */
  vrednost: string | number | null;
}

/** Коренска структура резимеа – кључеви облика „1.1", „2.3", „5.5" итд. */
export interface RezimeJSON {
  rezime_poslovnog_plana: Record<string, RezimeUnos>;
}

/** Поља насловне стране PDF-а */
export interface CoverPodaci {
  naziv_plana: string;
  investitor: string;
  mesto_realizacije: string;
  godina: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PATH 1 — IPARD пословни план (воћарство / прерада / дестилација)
// ═══════════════════════════════════════════════════════════════════════════

/** Табела 2.1 – подаци о носиоцу газдинства */
export interface Tabela21IPARD {
  imeNaziv: string;
  sediste: string;
  mesto: string;
  pib: string;
  maticniBroj: string;
  sifraDelatnosti: string;
  telefon: string;
  email: string;
}

/** Табела 2.2 – подаци о регистрованом газдинству */
export interface Tabela22IPARD {
  adresaGazdinstva: string;
  bpg: string;
  datumRegistracije: string;
  brojZaposlenih: number;
}

/** Табела 2.3 – структура поседа (у m²) */
export interface Tabela23IPARD {
  vlasnistvo_m2: number;
  zakup_m2: number;
  ustupljeno_m2: number;
}

/** Секција 2 – сви подаци о газдинству */
export interface IPARDPodaci {
  tabela21: Tabela21IPARD;
  tabela22: Tabela22IPARD;
  tabela23: Tabela23IPARD;
  opisAktivnosti: string;
}

/** Ставка основног средства у инвестицији */
export interface OsnovnoSredstvoIPARD {
  id: string;
  naziv: string;
  kolicina: number;
  cenaSaPDV: number;
}

/** Секција 4 – инвестиција */
export interface IPARDInvesticija {
  namena: string;
  pocetak: string;           // формат „MM/GGGG"
  zavrsetak: string;         // формат „MM/GGGG"
  ekonomskiVek: number;      // у годинама
  osnSredstva: OsnovnoSredstvoIPARD[];
  sopstvenaProcenat: number; // 0–100
}

/** Биљна култура са површином */
export interface KulturaIPARD {
  id: string;
  naziv: string;
  povrsina_ha: number;
}

/** Производ / услуга са ценом и плановима по годинама */
export interface ProizvodIPARD {
  id: string;
  naziv: string;
  jm: string;
  cena: number;
  kolicinePoGodini: [number, number, number, number, number];
}

/** Секција 8.1 – прихоf */
export interface IPARDPrihodi {
  kulture: KulturaIPARD[];
  proizvodi: ProizvodIPARD[];
}

/** Ставка амортизације */
export interface AmortizacijaIPARD {
  id: string;
  naziv: string;
  nabavnaVrednost: number;
  stopa: number; // у процентима (нпр. 10 = 10% годишње)
}

/** Секција 8.2 – структура трошкова */
export interface IPARDTroskovi {
  materijalni: {
    sirovine: number;
    ambalaza: number;
    ostali: number;
  };
  energija: {
    struja: number;
    voda: number;
    ostala: number;
  };
  usluge: {
    odrzavanje: number;
    ostale: number;
  };
  amortizacija: AmortizacijaIPARD[];
  radnaSnaga: {
    broj: number;
    godisnjiTrosak: number;
  };
  nematerijalni: {
    banka: number;
    osiguranje: number;
    ostali: number;
  };
}

/**
 * Коренска структура JSON фајла за Path 1.
 * Проширује RezimeJSON → поље rezime_poslovnog_plana је обавезно.
 */
export interface IPARDPlanJSON extends RezimeJSON {
  cover: CoverPodaci;
  podaci: IPARDPodaci;
  investicija: IPARDInvesticija;
  prihodi: IPARDPrihodi;
  troskovi: IPARDTroskovi;
}

// ═══════════════════════════════════════════════════════════════════════════
// PATH 2 — Основни пословни план (ратарство / сточарство)
// ═══════════════════════════════════════════════════════════════════════════

export interface Path2Proizvod {
  naziv: string;
  jm: string;
  cena: number;
  kolicinePoGodini: [number, number, number, number, number];
}

export interface IPARDPath2JSON extends RezimeJSON {
  cover: CoverPodaci;
  opis_poslovne_ideje: string;
  analiza_prodajnog_trista: string;
  analiza_nabavnog_trista: string;
  prihodi: {
    proizvodi: Path2Proizvod[];
  };
  troskovi: {
    materijalni: {
      semenje: number;
      djubrivo: number;
      hemija: number;
    };
    energija: {
      gorivo: number;
      struja: number;
    };
    nematerijalni: {
      osiguranje: number;
      racunovodstvo: number;
      registracija: number;
    };
    radnaSnaga: {
      broj: number;
      mesecnaZarada: number;
    };
    ukupnaInvesticija: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PATH 3 — Систем за наводњавање
// ═══════════════════════════════════════════════════════════════════════════

export interface NavodnjavanjeStavka {
  id: string;
  naziv: string;
  jm: string;
  kolicina: number;
  cena: number;
}

export interface IPARDPath3JSON extends RezimeJSON {
  cover: CoverPodaci;
  lokacija: {
    katastarska_opstina: string;
    povrsina_ha: number;
  };
  tehnika: {
    postojece_pumpe: string;
    postojeci_traktori: string;
    postojeca_oprema: string;
    stavke: NavodnjavanjeStavka[];
  };
  efikasnost: {
    prihodi_po_godini: [number, number, number, number, number];
    rashodi_po_godini: [number, number, number, number, number];
  };
}
