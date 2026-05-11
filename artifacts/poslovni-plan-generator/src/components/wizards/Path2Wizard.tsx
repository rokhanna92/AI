import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import type {
  GlobalProfile,
  ThemeConfig,
  Path2State,
  ProizvodPrihod,
  CostRowP2,
  OsnovnoSredstvoP2,
  AmortizacijaRowP2,
  RizikRow,
} from "../../types";
import { PATH2_INIT, PATH2_STEPS, FONT } from "../../lib/constants";
import { calcPath2 } from "../../lib/math";
import { fmtRSD } from "../../lib/formatters";
import { generatePath2PDF } from "../../lib/pdf";
import { generatePath2Content } from "../../lib/ai";
import { StepWizard } from "./StepWizard";
import { Card } from "../shared/Card";
import { SectionHeader } from "../shared/SectionHeader";
import { JDInput } from "../shared/JDInput";
import { JDTextarea } from "../shared/JDTextarea";
import { LiveBadge } from "../shared/LiveBadge";
import { THead } from "../shared/THead";
import {
  FileText,
  Home,
  ClipboardList,
  Building2,
  Users,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const STORAGE_KEY = "agro-plan-path2-state";

interface Props {
  profile: GlobalProfile;
  onBack: () => void;
  tc: ThemeConfig;
}

export function Path2Wizard({ profile, onBack, tc }: Props) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Path2State>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...PATH2_INIT, ...JSON.parse(saved) } : PATH2_INIT;
    } catch {
      return PATH2_INIT;
    }
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, [s]);

  const [generating, setGenerating] = useState(false);
  const calc = calcPath2(s);

  const handleGenerateAI = useCallback(async () => {
    setGenerating(true);
    try {
      const ai = await generatePath2Content(s);
      setS((prev) => ({
        ...prev,
        opisDelatnosti: ai.opisDelatnosti,
        opisProizvodnog: ai.opisProizvodnog,
        opisProsirenjaPrograma: ai.opisProsirenjaPrograma,
        opisTrzisteNabavke: ai.opisTrzisteNabavke,
        opisTrzisteProadaje: ai.opisTrzisteProadaje,
        opisRadneSnage: ai.opisRadneSnage,
        opisDistribucije: ai.opisDistribucije,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Greška pri generisanju:\n\n${msg}`);
    } finally {
      setGenerating(false);
    }
  }, [s]);

  // Shared styles
  const cell: React.CSSProperties = {
    background: "transparent",
    color: tc.tableCellText,
    fontFamily: FONT.sans,
    fontSize: "0.72rem",
    border: "none",
    outline: "none",
    width: "100%",
  };
  const cellN: React.CSSProperties = {
    ...cell,
    color: tc.tableNumText,
    fontFamily: FONT.mono,
    fontWeight: 700,
    textAlign: "right",
  };
  const rowBorder = `1px solid ${tc.tableRowBorder}`;
  const uid = () => Math.random().toString(36).slice(2, 9);
  const up = <K extends keyof Path2State>(k: K, v: Path2State[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  // Currency input
  function CurrencyCell({
    value,
    onChange,
    style,
    className,
  }: {
    value: number;
    onChange: (v: number) => void;
    style?: React.CSSProperties;
    className?: string;
  }) {
    const [focused, setF] = useState(false);
    const [raw, setRaw] = useState("");
    const fmt = (n: number) =>
      n !== 0
        ? n.toLocaleString("sr-RS", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "";
    return (
      <input
        type="text"
        inputMode="decimal"
        className={className}
        style={style}
        value={focused ? raw : fmt(value)}
        placeholder={focused ? "" : "0"}
        onFocus={() => {
          setRaw(value !== 0 ? String(value) : "");
          setF(true);
        }}
        onChange={(e) => setRaw(e.target.value.replace(/[^0-9.,]/g, ""))}
        onBlur={() => {
          setF(false);
          onChange(parseFloat(raw.replace(/\./g, "").replace(",", ".")) || 0);
        }}
      />
    );
  }

  // Per-year cost table (8.2.1–8.2.3, 8.2.5–8.2.6)
  function CostTable({
    rows,
    onChange,
  }: {
    rows: CostRowP2[];
    onChange: (r: CostRowP2[]) => void;
  }) {
    const addRow = () =>
      onChange([
        ...rows,
        { id: uid(), naziv: "", poGodinama: [0, 0, 0, 0, 0] },
      ]);
    const del = (id: string) => onChange(rows.filter((r) => r.id !== id));
    const updRow = (id: string, k: "naziv" | number, v: string | number) =>
      onChange(
        rows.map((r) => {
          if (r.id !== id) return r;
          if (k === "naziv") return { ...r, naziv: v as string };
          const pg = [...r.poGodinama] as [
            number,
            number,
            number,
            number,
            number,
          ];
          pg[k as number] = v as number;
          return { ...r, poGodinama: pg };
        }),
      );
    return (
      <div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"
            style={{ borderCollapse: "collapse" }}
          >
            <THead
              cols={[
                "Naziv troška / stavke",
                "God. I",
                "God. II",
                "God. III",
                "God. IV",
                "God. V",
                "",
              ]}
              tc={tc}
            />
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: rowBorder }}>
                  <td className="px-3 py-1.5" style={{ minWidth: 180 }}>
                    <input
                      style={cell}
                      value={r.naziv}
                      onChange={(e) => updRow(r.id, "naziv", e.target.value)}
                      placeholder="Naziv..."
                    />
                  </td>
                  {r.poGodinama.map((v, qi) => (
                    <td key={qi} className="px-2 py-1.5" style={{ width: 96 }}>
                      <CurrencyCell
                        value={v}
                        onChange={(nv) => updRow(r.id, qi, nv)}
                        className="w-full focus:outline-none"
                        style={cellN}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5" style={{ width: 32 }}>
                    <button
                      onClick={() => del(r.id)}
                      style={{ color: tc.textMuted }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "#f87171")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          tc.textMuted)
                      }
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: `2px solid ${tc.tableRowBorder}` }}>
                  <td
                    className="px-3 py-1.5 text-xs font-bold"
                    style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                  >
                    Ukupno
                  </td>
                  {[0, 1, 2, 3, 4].map((yr) => (
                    <td
                      key={yr}
                      className="px-2 py-1.5 text-right text-xs font-bold"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(rows.reduce((a, r) => a + r.poGodinama[yr], 0))}
                    </td>
                  ))}
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <button
          onClick={addRow}
          className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            color: tc.addRowText,
            border: `1px dashed ${tc.addRowBorder}`,
            fontFamily: FONT.sans,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = tc.addRowHoverText;
            (e.currentTarget as HTMLElement).style.background =
              tc.addRowHoverBg;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = tc.addRowText;
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <Plus size={11} /> Dodaj stavku
        </button>
      </div>
    );
  }

  // canProceed
  const canProceed: Record<number, boolean> = {
    0: !!s.nazivPlana && !!s.investitor,
    1: true,
    2: true,
    3: s.osnSredstvaP2.length > 0,
    4: true,
    5: s.proizvodi.length > 0,
    6: true,
  };

  return (
    <StepWizard
      steps={PATH2_STEPS}
      currentStep={step}
      setCurrentStep={setStep}
      onBack={onBack}
      onFinish={() => generatePath2PDF(profile, s)}
      tc={tc}
      canProceed={canProceed[step] ?? true}
    >
      {step === 0 && (
        <div className="space-y-5">
          <Card tc={tc}>
            <SectionHeader
              icon={FileText}
              title="Naslovna strana"
              table="Strana 1"
              tc={tc}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <JDInput
                label="Investitor"
                value={s.investitor}
                onChange={(v) => up("investitor", v)}
                tc={tc}
                placeholder="npr. Petar Petrović"
              />
              <JDInput
                label="Godina"
                value={s.godina}
                onChange={(v) => up("godina", v)}
                tc={tc}
                placeholder="2026"
              />
              <JDInput
                label="Naziv poslovnog plana"
                value={s.nazivPlana}
                onChange={(v) => up("nazivPlana", v)}
                tc={tc}
                placeholder="npr. Proširenje stočarskog gazdinstva"
              />
              <JDInput
                label="Mesto realizacije"
                value={s.lokacija}
                onChange={(v) => up("lokacija", v)}
                tc={tc}
                placeholder="npr. selo Rakovica, opština Kruševac"
              />
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="1. Rezime poslovnog plana"
              table="Red. 1.1–1.3"
              tc={tc}
            />
            <p
              className="text-xs mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Polja 1.1–1.3 se automatski popunjavaju iz naslovne strane iznad.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2">
              {[
                ["1.1.", "Naziv", s.nazivPlana],
                ["1.2.", "Investitor", s.investitor],
                ["1.3.", "Lokacija", s.lokacija],
              ].map(([num, lbl, val]) => (
                <div
                  key={num}
                  className="rounded-lg px-3 py-2"
                  style={{
                    border: `1px solid ${tc.tableRowBorder}`,
                    background: tc.cardBg,
                  }}
                >
                  <div
                    className="text-[9px] uppercase tracking-widest mb-0.5"
                    style={{ color: tc.textMuted, fontFamily: FONT.mono }}
                  >
                    {num} {lbl}
                  </div>
                  <div
                    className="text-xs font-bold truncate"
                    style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                  >
                    {val || ""}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={Building2}
              title="Rezime: Predmet investiranja"
              table="Red. 4.1–4.5"
              tc={tc}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <JDInput
                label="4.1. Namena investicije"
                value={s.namenaInvesticije}
                onChange={(v) => up("namenaInvesticije", v)}
                tc={tc}
                placeholder="npr. Nabavka traktora, krave..."
              />
              <JDInput
                label="4.5. Tržište prodaje"
                value={s.trzisteProdaje}
                onChange={(v) => up("trzisteProdaje", v)}
                tc={tc}
                placeholder="npr. Domaće / Inostrano"
              />
              <JDInput
                label="4.2. Početak investiranja"
                value={s.pocetakInvesticije}
                onChange={(v) => up("pocetakInvesticije", v)}
                tc={tc}
                placeholder="npr. jun 2026."
              />
              <JDInput
                label="4.3. Završetak investiranja"
                value={s.zavrsetakInvesticije}
                onChange={(v) => up("zavrsetakInvesticije", v)}
                tc={tc}
                placeholder="npr. decembar 2026."
              />
              <JDInput
                label="4.4. Ekonomski vek projekta"
                value={s.ekonomskiVek}
                onChange={(v) => up("ekonomskiVek", v)}
                tc={tc}
                placeholder="npr. 10 godina"
              />
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={Users}
              title="Rezime: Efekti i finansiranje"
              table="Red. 5.5"
              tc={tc}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <JDInput
                label="5.5. Ukupna angažovanost radne snage"
                value={s.angRaSnage}
                onChange={(v) => up("angRaSnage", v)}
                tc={tc}
                placeholder="npr. 1 novi radnik na određeno"
              />
              <JDInput
                label="Sopstveno učešće u finansiranju (%)"
                type="number"
                value={s.sopstvenoUcescePct}
                onChange={(v) =>
                  up(
                    "sopstvenoUcescePct",
                    Math.min(100, Math.max(0, parseFloat(v) || 0)),
                  )
                }
                tc={tc}
                placeholder="npr. 30"
              />
            </div>
          </Card>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-5">
          <Card tc={tc}>
            <SectionHeader
              icon={Home}
              title="2.1. Podaci o nosiocu registrovanog poljoprivrednog gazdinstva"
              table="Tabela 2.1."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead cols={["Red. broj", "Opis", "Vrednost"]} tc={tc} />
                <tbody>
                  {(
                    [
                      [
                        "1.",
                        "Ime i prezime",
                        "investitor",
                        "text",
                        "Petar Petrović",
                      ],
                      [
                        "2.",
                        "Adresa",
                        "adresaNosioca",
                        "text",
                        "npr. Rakovica 45",
                      ],
                      ["3.", "Mesto", "mestoNosioca", "text", "npr. Kruševac"],
                      ["4.", "JMBG", "jmbg", "text", "npr. 1212993800123"],
                      ["5.", "Telefon", "telefon", "text", "npr. 064/123-4567"],
                      [
                        "6.",
                        "Elektronska pošta",
                        "email",
                        "text",
                        "npr. ime@gmail.com",
                      ],
                    ] as [string, string, keyof Path2State, string, string][]
                  ).map(([num, lbl, key, , ph]) => (
                    <tr key={key} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-2 text-center w-16"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {num}
                      </td>
                      <td
                        className="px-3 py-2 w-56"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        {lbl}
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          style={cell}
                          value={s[key] as string}
                          onChange={(e) =>
                            up(key, e.target.value as Path2State[typeof key])
                          }
                          placeholder={ph}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={Home}
              title="2.2. Podaci o registrovanom poljoprivrednom gazdinstvu"
              table="Tabela 2.2."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead cols={["Red. broj", "Opis", "Vrednost"]} tc={tc} />
                <tbody>
                  {(
                    [
                      [
                        "1.",
                        "Adresa poljoprivrednog gazdinstva",
                        "adresaNosioca",
                        "npr. Rakovica 45, Kruševac",
                      ],
                      ["2.", "BPG", "bpg", "npr. 12345678"],
                      [
                        "3.",
                        "Datum registracije",
                        "datumRegistracije",
                        "npr. 15.03.2022.",
                      ],
                    ] as [string, string, keyof Path2State, string][]
                  ).map(([num, lbl, key, ph]) => (
                    <tr key={key} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-2 text-center w-16"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {num}
                      </td>
                      <td
                        className="px-3 py-2 w-64"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        {lbl}
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          style={cell}
                          value={s[key] as string}
                          onChange={(e) =>
                            up(key, e.target.value as Path2State[typeof key])
                          }
                          placeholder={ph}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={Home}
              title="2.3. Vlasništvo i struktura poseda"
              table="Tabela 2.3."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead
                  cols={[
                    "Red.",
                    "Osnov po kome se koristi",
                    "Površina (ha/m²)",
                  ]}
                  tc={tc}
                />
                <tbody>
                  {(
                    [
                      ["1.", "Vlasništvo", "vlasnistvo_ha"],
                      ["2.", "Zakup", "zakup_ha"],
                      ["3.", "Ustupljeno na korišćenje bez naknade", null],
                    ] as [string, string, keyof Path2State | null][]
                  ).map(([num, lbl, key]) => (
                    <tr key={lbl} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-2 text-center w-16"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {num}
                      </td>
                      <td
                        className="px-3 py-2"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        {lbl}
                      </td>
                      <td className="px-3 py-1.5 w-40">
                        {key ? (
                          <input
                            type="number"
                            style={{ ...cellN, textAlign: "right" }}
                            value={(s[key] as number) || ""}
                            onChange={(e) =>
                              up(
                                key,
                                parseFloat(e.target.value) ||
                                  (0 as Path2State[typeof key]),
                              )
                            }
                            placeholder="0.00"
                          />
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${tc.tableRowBorder}` }}>
                    <td
                      colSpan={2}
                      className="px-3 py-1.5 font-bold text-xs"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Ukupno:
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold text-xs"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {(s.vlasnistvo_ha + s.zakup_ha).toLocaleString("sr-RS", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
          <Card tc={tc}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <SectionHeader
                icon={Home}
                title="2.4. Delatnost gazdinstva i organizacija posla"
                tc={tc}
              />
              <span
                className="flex items-center gap-1 text-[9px] uppercase tracking-widest shrink-0 mt-0.5"
                style={{ color: tc.accent, fontFamily: FONT.mono }}
              >
                <Sparkles size={10} /> Narativno polje
              </span>
            </div>
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Kratko opisati proizvodni asortiman i karakteristike
              proizvoda/usluge pojedinačno. Shodno tome, potrebno je navesti
              linije proizvodnje, uposlenost i organizaciju poslova na
              gazdinstvu.
              <em style={{ color: tc.accent }}>
                {" "}
                (Generisati narativni tekst u Koraku 3 → Opis)
              </em>
            </p>
            <JDTextarea
              label="Opis delatnosti i organizacije"
              value={s.opisDelatnosti}
              onChange={(v) => up("opisDelatnosti", v)}
              tc={tc}
              rows={4}
            />
          </Card>

          {/* Tabela 1.5 — 2.5 assets */}
          <Card tc={tc}>
            <SectionHeader
              icon={Home}
              title="2.5. Osnovna sredstva u upotrebi"
              table="Tabela 1.5."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead
                  cols={["Red. broj", "Naziv", "Jedinica mere", "Količina"]}
                  tc={tc}
                />
                <tbody>
                  {/* 1. Zemljište */}
                  <tr style={{ background: tc.cardBg }}>
                    <td
                      className="px-3 py-1.5 text-center font-bold"
                      style={{
                        color: tc.tableCellText,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      1.
                    </td>
                    <td
                      className="px-3 py-1.5 font-bold"
                      colSpan={3}
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Zemljište
                    </td>
                  </tr>
                  {(
                    [
                      ["1.1.", "Oranice i bašte", "ha", "zem_oranice"],
                      ["1.2.", "Livade", "ha", "zem_livade"],
                      ["1.3.", "Pašnjaci", "ha", "zem_pasnjaci"],
                      ["1.4.", "Voćnjaci", "ha", "zem_vocnjaci"],
                      ["1.5.", "Vinogradi", "ha", "zem_vinogradi"],
                      ["1.6.", "Šume", "ha", "zem_sume"],
                    ] as [string, string, string, keyof Path2State][]
                  ).map(([num, lbl, jm, key]) => (
                    <tr key={key} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-1.5 text-center w-16"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {num}
                      </td>
                      <td
                        className="px-3 py-1.5 w-56"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        {lbl}
                      </td>
                      <td
                        className="px-3 py-1.5 w-24 text-center"
                        style={{ color: tc.textMuted, fontFamily: FONT.sans }}
                      >
                        {jm}
                      </td>
                      <td className="px-3 py-1.5 w-32">
                        <input
                          type="number"
                          style={{ ...cellN, textAlign: "right" }}
                          value={(s[key] as number) || ""}
                          onChange={(e) =>
                            up(
                              key,
                              parseFloat(e.target.value) ||
                                (0 as Path2State[typeof key]),
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}

                  {/* 2. Objekti */}
                  <tr style={{ background: tc.cardBg }}>
                    <td
                      className="px-3 py-1.5 text-center font-bold"
                      style={{
                        color: tc.tableCellText,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      2.
                    </td>
                    <td
                      className="px-3 py-1.5 font-bold"
                      colSpan={3}
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Objekti
                    </td>
                  </tr>
                  {(
                    [
                      ["2.1.", "Kuća", "m²", "obj_kuca"],
                      ["2.2.", "Staja", "m²", "obj_staja"],
                      ["2.3.", "Živinarnik", "m²", "obj_zivinjarnik"],
                      ["2.4.", "Silos", "m²", "obj_silos"],
                      ["2.5.", "Ambar", "m²", "obj_ambar"],
                      ["2.6.", "Garaža", "m²", "obj_garaza"],
                    ] as [string, string, string, keyof Path2State][]
                  ).map(([num, lbl, jm, key]) => (
                    <tr key={key} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-1.5 text-center w-16"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {num}
                      </td>
                      <td
                        className="px-3 py-1.5 w-56"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        {lbl}
                      </td>
                      <td
                        className="px-3 py-1.5 w-24 text-center"
                        style={{ color: tc.textMuted, fontFamily: FONT.sans }}
                      >
                        {jm}
                      </td>
                      <td className="px-3 py-1.5 w-32">
                        <input
                          type="number"
                          style={{ ...cellN, textAlign: "right" }}
                          value={(s[key] as number) || ""}
                          onChange={(e) =>
                            up(
                              key,
                              parseFloat(e.target.value) ||
                                (0 as Path2State[typeof key]),
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}

                  {/* 3. Mehanizacija */}
                  <tr style={{ background: tc.cardBg }}>
                    <td
                      className="px-3 py-1.5 text-center font-bold"
                      style={{
                        color: tc.tableCellText,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      3.
                    </td>
                    <td
                      className="px-3 py-1.5 font-bold"
                      colSpan={3}
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Mehanizacija
                    </td>
                  </tr>
                  {(
                    [
                      ["3.1.", "Traktor", "kom.", "meh_traktor"],
                      ["3.2.", "Kombajn", "kom.", "meh_kombajn"],
                      ["3.3.", "Plug", "kom.", "meh_plug"],
                      ["3.4.", "Tanjirača", "kom.", "meh_tanjiraca"],
                      ["3.5.", "Drljača", "kom.", "meh_drljaca"],
                      ["3.6.", "Setospremač", "kom.", "meh_setoSpremac"],
                      ["3.7.", "Sejalica", "kom.", "meh_sejalica"],
                      ["3.8.", "Kultivator", "kom.", "meh_kultivator"],
                      [
                        "3.9.",
                        "Rasipač min. hraniva",
                        "kom.",
                        "meh_rasipacMin",
                      ],
                      [
                        "3.10.",
                        "Rasipač stajskog đubriva",
                        "kom.",
                        "meh_rasipacStaj",
                      ],
                      ["3.11.", "Prskалica", "kom.", "meh_prskAlica"],
                      ["3.12.", "Berač kukuruza", "kom.", "meh_beracKukuruza"],
                      ["3.13.", "Prikolica", "kom.", "meh_prikolica"],
                    ] as [string, string, string, keyof Path2State][]
                  ).map(([num, lbl, jm, key]) => (
                    <tr key={key} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-1.5 text-center w-16"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {num}
                      </td>
                      <td
                        className="px-3 py-1.5 w-56"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        {lbl}
                      </td>
                      <td
                        className="px-3 py-1.5 w-24 text-center"
                        style={{ color: tc.textMuted, fontFamily: FONT.sans }}
                      >
                        {jm}
                      </td>
                      <td className="px-3 py-1.5 w-32">
                        <input
                          type="number"
                          style={{ ...cellN, textAlign: "right" }}
                          value={(s[key] as number) || ""}
                          onChange={(e) =>
                            up(
                              key,
                              parseInt(e.target.value) ||
                                (0 as Path2State[typeof key]),
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}

                  {/* 4. Stočni fond */}
                  <tr style={{ background: tc.cardBg }}>
                    <td
                      className="px-3 py-1.5 text-center font-bold"
                      style={{
                        color: tc.tableCellText,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      4.
                    </td>
                    <td
                      className="px-3 py-1.5 font-bold"
                      colSpan={3}
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Stočni fond
                    </td>
                  </tr>
                  {(
                    [
                      ["4.1.", "Krave", "kom.", "stoc_krave"],
                      ["4.2.", "Svinje", "kom.", "stoc_svinje"],
                      ["4.3.", "Ovce", "kom.", "stoc_ovce"],
                      ["4.4.", "Koze", "kom.", "stoc_koze"],
                      ["4.5.", "Živina", "kom.", "stoc_zivina"],
                      ["4.6.", "Konji", "kom.", "stoc_konji"],
                      ["4.7.", "Kunići", "kom.", "stoc_kunici"],
                      ["4.8.", "Košnice pčela", "kom.", "stoc_kosnice"],
                    ] as [string, string, string, keyof Path2State][]
                  ).map(([num, lbl, jm, key]) => (
                    <tr key={key} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-1.5 text-center w-16"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {num}
                      </td>
                      <td
                        className="px-3 py-1.5 w-56"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        {lbl}
                      </td>
                      <td
                        className="px-3 py-1.5 w-24 text-center"
                        style={{ color: tc.textMuted, fontFamily: FONT.sans }}
                      >
                        {jm}
                      </td>
                      <td className="px-3 py-1.5 w-32">
                        <input
                          type="number"
                          style={{ ...cellN, textAlign: "right" }}
                          value={(s[key] as number) || ""}
                          onChange={(e) =>
                            up(
                              key,
                              parseInt(e.target.value) ||
                                (0 as Path2State[typeof key]),
                            )
                          }
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-5">
          <Card tc={tc}>
            <SectionHeader
              icon={Sparkles}
              title="Generisanje narativnog teksta"
              tc={tc}
            />
            <p
              className="text-xs mb-4"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Na osnovu unetih podataka o gazdinstvu automatski će se popuniti
              tekstualna polja:
              <strong> 2.4 Delatnost</strong>, <strong>3.1a Proizvodi</strong>,{" "}
              <strong>3.1b Proširenje</strong>,
              <strong> 3.2 Tržište nabavke</strong>,{" "}
              <strong>3.3 Tržište prodaje</strong>,
              <strong> 5. Radna snaga</strong> i{" "}
              <strong>6. Distribucija</strong>. Generisani tekst možete naknadno
              urediti.
            </p>
            <button
              onClick={handleGenerateAI}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
              style={{
                background: generating ? tc.accentDim : tc.accent,
                color: "#fff",
                border: `1px solid ${tc.accent}`,
                fontFamily: FONT.sans,
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              <Sparkles size={14} />
              {generating
                ? "Generisanje u toku..."
                : "Generiši narativni tekst"}
            </button>
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={ClipboardList}
              title="3.1. Opis proizvodnog programa na gazdinstvu"
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              a) Navesti postojeće proizvode i ukratko opisati svaki
              pojedinačno. (navesti kulture, životinje na gazdinstvu).
            </p>
            <JDTextarea
              label="a) Postojeći proizvodi i karakteristike"
              value={s.opisProizvodnog}
              onChange={(v) => up("opisProizvodnog", v)}
              tc={tc}
              rows={4}
            />
            <div className="mt-4">
              <p
                className="text-xs italic mb-2"
                style={{ color: tc.textMuted, fontFamily: FONT.sans }}
              >
                b) Da li postoji mogućnost proširenja proizvodnog programa?
                (Ukoliko postoji mogućnost i želite da je realizujete, navedite
                koje su to proizvodi i da li raspolažete neophodnom opremom.)
              </p>
              <JDTextarea
                label="b) Mogućnost proširenja proizvodnog programa"
                value={s.opisProsirenjaPrograma}
                onChange={(v) => up("opisProsirenjaPrograma", v)}
                tc={tc}
                rows={3}
              />
            </div>
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={ClipboardList}
              title="3.2. Tržište nabavke (kratak opis trenutnog stanja tržišta nabavke)"
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (Za trenutnu proizvodnju ili planiranu proizvodnju, navedite koji
              su to repromaterijali i sirovine koje morate nabaviti. Za svaki od
              navedenih stavki opišite i dobavljače.)
            </p>
            <JDTextarea
              label="Repromaterijali, sirovine i dobavljači"
              value={s.opisTrzisteNabavke}
              onChange={(v) => up("opisTrzisteNabavke", v)}
              tc={tc}
              rows={4}
            />
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={ClipboardList}
              title="3.3. Tržište prodaje (kratak opis trenutnog stanja tržišta prodaje)"
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (Opišite postojeće i potencijalne kupce za Vaš proizvod.)
            </p>
            <JDTextarea
              label="Postojeći i potencijalni kupci"
              value={s.opisTrzisteProadaje}
              onChange={(v) => up("opisTrzisteProadaje", v)}
              tc={tc}
              rows={4}
            />
          </Card>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-5">
          <Card tc={tc}>
            <SectionHeader
              icon={Building2}
              title="4.1. Predmet i cilj investicije"
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (Ukratko opisati investiciju i koji je ukupni iznos investicije,
              da li se nabavlja iz inostranstva ili na domaćem tržištu, navesti
              da li je korišćeno kreditno finansiranje i ukoliko jeste navesti
              iznos kredita, rok u kome se kredit vraća, visina rate i sl.)
            </p>
            <JDTextarea
              label="Opis predmeta i cilja investicije"
              value={s.predmetCiljInvesticije}
              onChange={(v) => up("predmetCiljInvesticije", v)}
              tc={tc}
              rows={4}
            />
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={Building2}
              title="4.2. Ukupna investiciona ulaganja"
              table="Tabela 4.2."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead
                  cols={[
                    "Red.",
                    "Opis",
                    "Uneta sredstva (RSD)",
                    "Nova ulaganja (RSD)",
                    "Ukupna ulaganja (RSD)",
                    "Učešće (%)",
                  ]}
                  tc={tc}
                />
                <tbody>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-1.5 text-center font-bold w-12"
                      style={{
                        color: tc.tableCellText,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      I
                    </td>
                    <td
                      className="px-3 py-1.5 font-bold w-44"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Osnovna sredstva
                    </td>
                    <td className="px-2 py-1.5 w-36">
                      <CurrencyCell
                        value={s.unetaOsnovnaI}
                        onChange={(v) => up("unetaOsnovnaI", v)}
                        className="w-full focus:outline-none"
                        style={cellN}
                      />
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold w-36"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(calc.novaOsnovnaI)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold w-36"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(calc.totalOsnovnaI)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right w-24"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      {calc.totalInv > 0
                        ? ((calc.totalOsnovnaI / calc.totalInv) * 100).toFixed(
                            2,
                          ) + " %"
                        : "0,00 %"}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-1.5 text-center font-bold w-12"
                      style={{
                        color: tc.tableCellText,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      II
                    </td>
                    <td
                      className="px-3 py-1.5 font-bold"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Obrtna sredstva
                    </td>
                    <td className="px-2 py-1.5">
                      <CurrencyCell
                        value={s.unetaObratnaI}
                        onChange={(v) => up("unetaObratnaI", v)}
                        className="w-full focus:outline-none"
                        style={cellN}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <CurrencyCell
                        value={s.obrtnaInvesticija}
                        onChange={(v) => up("obrtnaInvesticija", v)}
                        className="w-full focus:outline-none"
                        style={cellN}
                      />
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(calc.totalObrtnaI)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      {calc.totalInv > 0
                        ? ((calc.totalObrtnaI / calc.totalInv) * 100).toFixed(
                            2,
                          ) + " %"
                        : "0,00 %"}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${tc.tableRowBorder}` }}>
                    <td
                      colSpan={2}
                      className="px-3 py-1.5 font-bold text-xs"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Ukupno (I+II)
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold text-xs"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(s.unetaOsnovnaI + s.unetaObratnaI)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold text-xs"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(calc.novaOsnovnaI + s.obrtnaInvesticija)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold text-xs"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(calc.totalInv)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold text-xs"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      100,00 %
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={Building2}
              title="4.3. Ulaganje u osnovna sredstva"
              table="Tabela 4.3."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead
                  cols={[
                    "Red.",
                    "Naziv osnovnog sredstva",
                    "Komada",
                    "Cena po kom. sa PDV (RSD)",
                    "Vrednost (RSD)",
                    "",
                  ]}
                  tc={tc}
                />
                <tbody>
                  {s.osnSredstvaP2.map((o, i) => (
                    <tr key={o.id} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-1.5 text-center w-12"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {i + 1}.
                      </td>
                      <td className="px-3 py-1.5" style={{ minWidth: 200 }}>
                        <input
                          style={cell}
                          value={o.naziv}
                          onChange={(e) =>
                            up(
                              "osnSredstvaP2",
                              s.osnSredstvaP2.map((x) =>
                                x.id === o.id
                                  ? { ...x, naziv: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="npr. Traktor 60 KS (novi)"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-20">
                        <input
                          type="number"
                          style={{ ...cellN, textAlign: "right" }}
                          value={o.kolicina || ""}
                          onChange={(e) =>
                            up(
                              "osnSredstvaP2",
                              s.osnSredstvaP2.map((x) =>
                                x.id === o.id
                                  ? {
                                      ...x,
                                      kolicina: parseInt(e.target.value) || 0,
                                    }
                                  : x,
                              ),
                            )
                          }
                          placeholder="1"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-36">
                        <CurrencyCell
                          value={o.cenaSaPDV}
                          onChange={(nv) =>
                            up(
                              "osnSredstvaP2",
                              s.osnSredstvaP2.map((x) =>
                                x.id === o.id ? { ...x, cenaSaPDV: nv } : x,
                              ),
                            )
                          }
                          className="w-full focus:outline-none"
                          style={cellN}
                        />
                      </td>
                      <td
                        className="px-3 py-1.5 text-right font-bold w-36"
                        style={{ color: tc.highlight, fontFamily: FONT.mono }}
                      >
                        {fmtRSD(o.kolicina * o.cenaSaPDV)}
                      </td>
                      <td className="px-2 py-1.5 w-8">
                        <button
                          onClick={() =>
                            up(
                              "osnSredstvaP2",
                              s.osnSredstvaP2.filter((x) => x.id !== o.id),
                            )
                          }
                          style={{ color: tc.textMuted }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              "#f87171")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              tc.textMuted)
                          }
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {s.osnSredstvaP2.length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${tc.tableRowBorder}` }}>
                      <td
                        colSpan={4}
                        className="px-3 py-1.5 font-bold text-xs"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        Ukupno
                      </td>
                      <td
                        className="px-3 py-1.5 text-right font-bold text-xs"
                        style={{ color: tc.highlight, fontFamily: FONT.mono }}
                      >
                        {fmtRSD(calc.novaOsnovnaI)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <button
              onClick={() =>
                up("osnSredstvaP2", [
                  ...s.osnSredstvaP2,
                  { id: uid(), naziv: "", kolicina: 1, cenaSaPDV: 0 },
                ])
              }
              className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                color: tc.addRowText,
                border: `1px dashed ${tc.addRowBorder}`,
                fontFamily: FONT.sans,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  tc.addRowHoverText;
                (e.currentTarget as HTMLElement).style.background =
                  tc.addRowHoverBg;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = tc.addRowText;
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <Plus size={11} /> Dodaj sredstvo
            </button>
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={Building2}
              title="4.4. Izvori finansiranja"
              table="Tabela 4.4."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead
                  cols={["Red.", "Opis", "Ukupna ulaganja (RSD)", "Učešće (%)"]}
                  tc={tc}
                />
                <tbody>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-1.5 text-center font-bold w-12"
                      style={{
                        color: tc.tableCellText,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      I
                    </td>
                    <td
                      className="px-3 py-1.5 font-bold"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Sopstveni izvori
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(calc.sopstvenaSredstva)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      {s.sopstvenoUcescePct.toFixed(2)} %
                    </td>
                  </tr>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-1.5 text-center"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      1.
                    </td>
                    <td
                      className="px-3 py-1.5"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Osnovna sredstva
                    </td>
                    <td
                      className="px-3 py-1.5 text-right"
                      style={{ color: tc.textMuted, fontFamily: FONT.mono }}
                    >
                      {calc.totalInv > 0
                        ? fmtRSD(
                            (calc.sopstvenaSredstva * calc.totalOsnovnaI) /
                              calc.totalInv,
                          )
                        : "–"}
                    </td>
                    <td />
                  </tr>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-1.5 text-center"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      2.
                    </td>
                    <td
                      className="px-3 py-1.5"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Obrtna sredstva
                    </td>
                    <td
                      className="px-3 py-1.5 text-right"
                      style={{ color: tc.textMuted, fontFamily: FONT.mono }}
                    >
                      {calc.totalInv > 0
                        ? fmtRSD(
                            (calc.sopstvenaSredstva * calc.totalObrtnaI) /
                              calc.totalInv,
                          )
                        : "–"}
                    </td>
                    <td />
                  </tr>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-1.5 text-center font-bold w-12"
                      style={{
                        color: tc.tableCellText,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      II
                    </td>
                    <td
                      className="px-3 py-1.5 font-bold"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Tuđi izvori
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(calc.tujaSredstva)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      {(100 - s.sopstvenoUcescePct).toFixed(2)} %
                    </td>
                  </tr>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-1.5 text-center"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      1.
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        style={cell}
                        value={s.tudjIzvoriOpis}
                        onChange={(e) => up("tudjIzvoriOpis", e.target.value)}
                        placeholder="npr. Bankarski kredit, Banca Intesa"
                      />
                    </td>
                    <td
                      className="px-3 py-1.5 text-right"
                      style={{ color: tc.textMuted, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(calc.tujaSredstva)}
                    </td>
                    <td />
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${tc.tableRowBorder}` }}>
                    <td
                      colSpan={2}
                      className="px-3 py-1.5 font-bold text-xs"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Ukupno (I+II)
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold text-xs"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      {fmtRSD(calc.totalInv)}
                    </td>
                    <td
                      className="px-3 py-1.5 text-right font-bold text-xs"
                      style={{ color: tc.highlight, fontFamily: FONT.mono }}
                    >
                      100,00 %
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-5">
          <Card tc={tc}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <SectionHeader
                icon={Users}
                title="5. Potrebna radna snaga"
                tc={tc}
              />
              <span
                className="flex items-center gap-1 text-[9px] uppercase tracking-widest shrink-0 mt-0.5"
                style={{ color: tc.accent, fontFamily: FONT.mono }}
              >
                <Sparkles size={10} /> Narativno polje
              </span>
            </div>
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (Da li je potrebno zapošljavanje novih radnika na neodređeno ili
              određeno vreme? Ukoliko jeste, obrazložite za obavljanje kojih
              poslova su vam oni potrebni, kao i vremenski period u kome
              nameravate da ih angažujete.)
            </p>
            <JDTextarea
              label="Opis potreba za radnom snagom"
              value={s.opisRadneSnage}
              onChange={(v) => up("opisRadneSnage", v)}
              tc={tc}
              rows={4}
            />
          </Card>

          <Card tc={tc}>
            <div className="flex items-start justify-between gap-3 mb-1">
              <SectionHeader
                icon={ClipboardList}
                title="6. Distribucija i promocija (kanali distribucije i način reklamiranja)"
                tc={tc}
              />
              <span
                className="flex items-center gap-1 text-[9px] uppercase tracking-widest shrink-0 mt-0.5"
                style={{ color: tc.accent, fontFamily: FONT.mono }}
              >
                <Sparkles size={10} /> Narativno polje
              </span>
            </div>
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (Opišite na koji način planirate da vaše proizvode reklamirate kod
              kupaca i na koji način nameravate da vaše proizvode učinite
              dostupnim svojim potencijalnim kupcima.)
            </p>
            <JDTextarea
              label="Kanali distribucije i način reklamiranja"
              value={s.opisDistribucije}
              onChange={(v) => up("opisDistribucije", v)}
              tc={tc}
              rows={4}
            />
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={CheckCircle2}
              title="7. Očekivani efekti"
              tc={tc}
            />
            <p
              className="text-xs mb-4"
              style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
            >
              Realizacijom ovog projekta se očekuje (zaokružite Da ili Ne):
            </p>
            <div className="space-y-3">
              {(
                [
                  ["efektProsirenjeAsortimana", "1.", "Proširenje asortimana"],
                  ["efektNoviProizvod", "2.", "Uvođenje novog proizvoda"],
                  [
                    "efektUnapredjenje",
                    "3.",
                    "Unapređenje postojećeg proizvoda",
                  ],
                  ["efektPovecZaposlenosti", "4.", "Povećanje zaposlenosti"],
                  ["efektPovecPrihoda", "5.", "Povećanje prihoda u poslovanju"],
                ] as [keyof Path2State, string, string][]
              ).map(([k, num, lbl]) => {
                const val = s[k] as boolean;
                return (
                  <div
                    key={k}
                    className="flex items-center gap-4 py-2 px-3 rounded-lg"
                    style={{ border: `1px solid ${tc.tableRowBorder}` }}
                  >
                    <span
                      className="text-xs w-6"
                      style={{ color: tc.textMuted, fontFamily: FONT.mono }}
                    >
                      {num}
                    </span>
                    <span
                      className="flex-1 text-sm"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      {lbl}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => up(k, true as Path2State[typeof k])}
                        className="px-4 py-1 rounded text-xs font-bold transition-all"
                        style={{
                          background: val ? tc.accent : "transparent",
                          color: val ? "#fff" : tc.textMuted,
                          border: `1px solid ${val ? tc.accent : tc.tableRowBorder}`,
                        }}
                      >
                        DA
                      </button>
                      <button
                        onClick={() => up(k, false as Path2State[typeof k])}
                        className="px-4 py-1 rounded text-xs font-bold transition-all"
                        style={{
                          background: !val ? tc.highlight : "transparent",
                          color: !val ? "#fff" : tc.textMuted,
                          border: `1px solid ${!val ? tc.highlight : tc.tableRowBorder}`,
                        }}
                      >
                        NE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
      {step === 5 && (
        <div className="space-y-5">
          {/* 8.1 Prihodi */}
          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="8.1. Formiranje ukupnog prihoda"
              table="Tabela 8.1."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead
                  cols={[
                    "Red.",
                    "Proizvod/usluga",
                    "JM",
                    "Prodajna cena (RSD)",
                    "God. I (kol.)",
                    "God. II (kol.)",
                    "God. III (kol.)",
                    "God. IV (kol.)",
                    "God. V (kol.)",
                    "",
                  ]}
                  tc={tc}
                />
                <tbody>
                  {s.proizvodi.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-1.5 text-center w-10"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {i + 1}.
                      </td>
                      <td className="px-3 py-1.5" style={{ minWidth: 150 }}>
                        <input
                          style={cell}
                          value={p.naziv}
                          onChange={(e) =>
                            up(
                              "proizvodi",
                              s.proizvodi.map((x) =>
                                x.id === p.id
                                  ? { ...x, naziv: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="npr. Sirovo mleko"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-16">
                        <input
                          style={cell}
                          value={p.jedinicaMere}
                          onChange={(e) =>
                            up(
                              "proizvodi",
                              s.proizvodi.map((x) =>
                                x.id === p.id
                                  ? { ...x, jedinicaMere: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="lit"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-28">
                        <CurrencyCell
                          value={p.prodajnaCena}
                          onChange={(nv) =>
                            up(
                              "proizvodi",
                              s.proizvodi.map((x) =>
                                x.id === p.id ? { ...x, prodajnaCena: nv } : x,
                              ),
                            )
                          }
                          className="w-full focus:outline-none"
                          style={cellN}
                        />
                      </td>
                      {p.kolicinePoGodini.map((q, qi) => (
                        <td key={qi} className="px-2 py-1.5 w-24">
                          <CurrencyCell
                            value={q}
                            onChange={(nv) => {
                              const nq = [...p.kolicinePoGodini] as [
                                number,
                                number,
                                number,
                                number,
                                number,
                              ];
                              nq[qi] = nv;
                              up(
                                "proizvodi",
                                s.proizvodi.map((x) =>
                                  x.id === p.id
                                    ? { ...x, kolicinePoGodini: nq }
                                    : x,
                                ),
                              );
                            }}
                            className="w-full focus:outline-none"
                            style={cellN}
                          />
                        </td>
                      ))}
                      <td className="px-2 py-1.5 w-8">
                        <button
                          onClick={() =>
                            up(
                              "proizvodi",
                              s.proizvodi.filter((x) => x.id !== p.id),
                            )
                          }
                          style={{ color: tc.textMuted }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              "#f87171")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              tc.textMuted)
                          }
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {s.proizvodi.length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${tc.tableRowBorder}` }}>
                      <td
                        colSpan={4}
                        className="px-3 py-1.5 font-bold text-xs"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        Ukupno prihod:
                      </td>
                      {calc.prihodiPoGodini.map((r, i) => (
                        <td
                          key={i}
                          className="px-2 py-1.5 text-right font-bold text-xs"
                          style={{ color: tc.highlight, fontFamily: FONT.mono }}
                        >
                          {fmtRSD(r)}
                        </td>
                      ))}
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <button
              onClick={() =>
                up("proizvodi", [
                  ...s.proizvodi,
                  {
                    id: uid(),
                    naziv: "",
                    jedinicaMere: "kom",
                    prodajnaCena: 0,
                    kolicinePoGodini: [0, 0, 0, 0, 0],
                  },
                ])
              }
              className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                color: tc.addRowText,
                border: `1px dashed ${tc.addRowBorder}`,
                fontFamily: FONT.sans,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  tc.addRowHoverText;
                (e.currentTarget as HTMLElement).style.background =
                  tc.addRowHoverBg;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = tc.addRowText;
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <Plus size={11} /> Dodaj proizvod / uslugu
            </button>
          </Card>

          {/* 8.2 cost tables */}
          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="8.2.1. Direktan materijal"
              table="Tabela 8.2.1."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (troškovi nabavke sirovine i potrošnog materijala, i sl.)
            </p>
            <CostTable
              rows={s.direktanMaterijal}
              onChange={(v) => up("direktanMaterijal", v)}
            />
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="8.2.2. Komunalni i energetski troškovi"
              table="Tabela 8.2.2."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (električna energija, voda, kanalizacija, grejanje, internet i
              telekomunikacije)
            </p>
            <CostTable
              rows={s.komunalni}
              onChange={(v) => up("komunalni", v)}
            />
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="8.2.3. Troškovi proizvodnih usluga"
              table="Tabela 8.2.3."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (očekivani godišnji trošak za usluge održavanja objekata, opreme i
              ostalih osnovnih sredstava, zakupnine prostora, troškove
              reklamiranja itd.)
            </p>
            <CostTable rows={s.usluge} onChange={(v) => up("usluge", v)} />
          </Card>

          {/* 8.2.4 Amortizacija */}
          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="8.2.4. Amortizacija"
              table="Tabela 8.2.4."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Prilikom izračunavanja amortizacije, uzima se u obzir samo osnovna
              cena koštanja (bez uračunatog PDV-a).
            </p>
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead
                  cols={[
                    "Red.",
                    "Naziv",
                    "Nabavna vrednost (RSD)",
                    "Stopa amort. (%)",
                    "God. amortizacija",
                    "Neamortizovana vrednost",
                    "",
                  ]}
                  tc={tc}
                />
                <tbody>
                  {s.amortizacija.map((a, i) => {
                    const godisnja =
                      (a.nabavnaVrednost * a.stopaAmortizacije) / 100;
                    const neamort = Math.max(
                      0,
                      a.nabavnaVrednost - godisnja * 5,
                    );
                    return (
                      <tr key={a.id} style={{ borderBottom: rowBorder }}>
                        <td
                          className="px-3 py-1.5 text-center w-10"
                          style={{
                            color: tc.textMuted,
                            fontFamily: FONT.mono,
                            fontSize: "0.7rem",
                          }}
                        >
                          {i + 1}.
                        </td>
                        <td className="px-3 py-1.5" style={{ minWidth: 150 }}>
                          <input
                            style={cell}
                            value={a.naziv}
                            onChange={(e) =>
                              up(
                                "amortizacija",
                                s.amortizacija.map((x) =>
                                  x.id === a.id
                                    ? { ...x, naziv: e.target.value }
                                    : x,
                                ),
                              )
                            }
                            placeholder="npr. Traktor 60KS"
                          />
                        </td>
                        <td className="px-2 py-1.5 w-36">
                          <CurrencyCell
                            value={a.nabavnaVrednost}
                            onChange={(nv) =>
                              up(
                                "amortizacija",
                                s.amortizacija.map((x) =>
                                  x.id === a.id
                                    ? { ...x, nabavnaVrednost: nv }
                                    : x,
                                ),
                              )
                            }
                            className="w-full focus:outline-none"
                            style={cellN}
                          />
                        </td>
                        <td className="px-2 py-1.5 w-20">
                          <input
                            type="number"
                            style={{ ...cellN, textAlign: "right" }}
                            value={a.stopaAmortizacije || ""}
                            onChange={(e) =>
                              up(
                                "amortizacija",
                                s.amortizacija.map((x) =>
                                  x.id === a.id
                                    ? {
                                        ...x,
                                        stopaAmortizacije:
                                          parseFloat(e.target.value) || 0,
                                      }
                                    : x,
                                ),
                              )
                            }
                            placeholder="10"
                          />
                        </td>
                        <td
                          className="px-3 py-1.5 text-right font-bold"
                          style={{ color: tc.highlight, fontFamily: FONT.mono }}
                        >
                          {fmtRSD(godisnja)}
                        </td>
                        <td
                          className="px-3 py-1.5 text-right"
                          style={{ color: tc.textMuted, fontFamily: FONT.mono }}
                        >
                          {fmtRSD(neamort)}
                        </td>
                        <td className="px-2 py-1.5 w-8">
                          <button
                            onClick={() =>
                              up(
                                "amortizacija",
                                s.amortizacija.filter((x) => x.id !== a.id),
                              )
                            }
                            style={{ color: tc.textMuted }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.color =
                                "#f87171")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.color =
                                tc.textMuted)
                            }
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              onClick={() =>
                up("amortizacija", [
                  ...s.amortizacija,
                  {
                    id: uid(),
                    naziv: "",
                    nabavnaVrednost: 0,
                    stopaAmortizacije: 10,
                  },
                ])
              }
              className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                color: tc.addRowText,
                border: `1px dashed ${tc.addRowBorder}`,
                fontFamily: FONT.sans,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  tc.addRowHoverText;
                (e.currentTarget as HTMLElement).style.background =
                  tc.addRowHoverBg;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = tc.addRowText;
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <Plus size={11} /> Dodaj sredstvo za amortizaciju
            </button>
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="8.2.5. Troškovi radne snage"
              table="Tabela 8.2.5."
              tc={tc}
            />
            <CostTable
              rows={s.radnaSnaga}
              onChange={(v) => up("radnaSnaga", v)}
            />
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="8.2.6. Nematerijalni troškovi"
              table="Tabela 8.2.6."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (očekivani godišnji trošak za usluge računovođe, osiguranja i sl.)
            </p>
            <CostTable
              rows={s.nematerijalni}
              onChange={(v) => up("nematerijalni", v)}
            />
          </Card>
          {s.proizvodi.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <LiveBadge
                label="Ukupan prihod (God. V)"
                value={fmtRSD(calc.prihodiPoGodini[4])}
                hi
                tc={tc}
              />
              <LiveBadge
                label="Ukupni rashodi (God. V)"
                value={fmtRSD(calc.ukupniRashodiPoGodini[4])}
                tc={tc}
              />
              <LiveBadge
                label="Neto dobit (God. V)"
                value={fmtRSD(calc.netPoGodini[4].net)}
                hi
                tc={tc}
              />
            </div>
          )}
        </div>
      )}
      {step === 6 && (
        <div className="space-y-5">
          <Card tc={tc}>
            <SectionHeader
              icon={ClipboardList}
              title="10. Potencijalni rizici"
              table="Tabela 10.1."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (Navesti potencijalne rizike poslovanja: tržišni, finansijski,
              klimatski i infrastrukturni rizici i mere upravljanja rizicima.)
            </p>
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead
                  cols={["Red.", "Vrsta rizika", "Preventivna mera", ""]}
                  tc={tc}
                />
                <tbody>
                  {s.rizici.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-3 py-1.5 text-center w-12"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {i + 1}.
                      </td>
                      <td className="px-3 py-1.5" style={{ minWidth: 200 }}>
                        <input
                          style={cell}
                          value={r.vrsta}
                          onChange={(e) =>
                            up(
                              "rizici",
                              s.rizici.map((x) =>
                                x.id === r.id
                                  ? { ...x, vrsta: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="npr. Klimatski rizik, suša"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          style={cell}
                          value={r.mera}
                          onChange={(e) =>
                            up(
                              "rizici",
                              s.rizici.map((x) =>
                                x.id === r.id
                                  ? { ...x, mera: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="npr. Osiguranje useva + sistem za navodnjavanje"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-8">
                        <button
                          onClick={() =>
                            up(
                              "rizici",
                              s.rizici.filter((x) => x.id !== r.id),
                            )
                          }
                          style={{ color: tc.textMuted }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              "#f87171")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              tc.textMuted)
                          }
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() =>
                up("rizici", [...s.rizici, { id: uid(), vrsta: "", mera: "" }])
              }
              className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                color: tc.addRowText,
                border: `1px dashed ${tc.addRowBorder}`,
                fontFamily: FONT.sans,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  tc.addRowHoverText;
                (e.currentTarget as HTMLElement).style.background =
                  tc.addRowHoverBg;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = tc.addRowText;
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <Plus size={11} /> Dodaj rizik
            </button>
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={CheckCircle2}
              title="11. Zaključna ocena o projektu"
              tc={tc}
            />
            <JDTextarea
              label="Zaključna ocena"
              value={s.zakljucak}
              onChange={(v) => up("zakljucak", v)}
              tc={tc}
              rows={5}
              placeholder="npr. Projekat je isplativ i preporučuje se za realizaciju..."
            />
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="9.3. Statička ocena projekta (automatski izračunato, poslednja godina)"
              table="God. V"
              tc={tc}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {[
                {
                  lbl: "5.1 Ekonomičnost",
                  val: calc.ekonomicnost.toFixed(3),
                  ok: calc.ekonomicnost > 1,
                },
                {
                  lbl: "5.2 Akumulativnost",
                  val: `${calc.akumulativnost.toFixed(2)} %`,
                  ok: calc.akumulativnost > 0,
                },
                {
                  lbl: "5.3 Rentabilnost",
                  val: `${calc.rentabilnost.toFixed(2)} %`,
                  ok: calc.rentabilnost > 0,
                },
                {
                  lbl: "Povraćaj investicije",
                  val:
                    calc.avgNet > 0
                      ? `${Math.floor(calc.povracaj)} god. ${Math.round((calc.povracaj - Math.floor(calc.povracaj)) * 12)} mes.`
                      : "–",
                  ok: true,
                },
              ].map(({ lbl, val, ok }) => (
                <div
                  key={lbl}
                  className="p-4 rounded-xl"
                  style={{
                    background: ok ? tc.statPositiveBg : tc.statNegativeBg,
                    border: `1px solid ${tc.cardBorder}`,
                  }}
                >
                  <div
                    className="text-[9px] uppercase tracking-widest mb-1"
                    style={{ color: tc.statMutedText, fontFamily: FONT.mono }}
                  >
                    {lbl}
                  </div>
                  <div
                    className="text-base font-bold"
                    style={{ color: tc.textPrimary, fontFamily: FONT.mono }}
                  >
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </StepWizard>
  );
}
