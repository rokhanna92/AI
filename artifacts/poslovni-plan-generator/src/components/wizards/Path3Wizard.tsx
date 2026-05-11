import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import type {
  GlobalProfile,
  ThemeConfig,
  Path3State,
  ProizvodP3,
  CostRowP2,
  OsnovnoSredstvoP3,
  AmortizacijaRowP2,
} from "../../types";
import { PATH3_INIT, PATH3_STEPS, FONT } from "../../lib/constants";
import { calcPath3 } from "../../lib/math";
import { fmtRSD } from "../../lib/formatters";
import { generatePath3PDF } from "../../lib/pdf";
import { generatePath3Content } from "../../lib/ai";
import { StepWizard } from "./StepWizard";
import { Card } from "../shared/Card";
import { SectionHeader } from "../shared/SectionHeader";
import { JDInput } from "../shared/JDInput";
import { JDTextarea } from "../shared/JDTextarea";
import { LiveBadge } from "../shared/LiveBadge";
import { THead } from "../shared/THead";
import { FileText, Home, Map, BarChart3, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "agro-plan-path3-state";

interface Props {
  profile: GlobalProfile;
  onBack: () => void;
  tc: ThemeConfig;
}

export function Path3Wizard({ profile, onBack, tc }: Props) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Path3State>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...PATH3_INIT, ...JSON.parse(saved) } : PATH3_INIT;
    } catch {
      return PATH3_INIT;
    }
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, [s]);

  const [generating, setGenerating] = useState(false);

  const handleGenerateNarativniTekst = useCallback(async () => {
    setGenerating(true);
    try {
      const ai = await generatePath3Content(s);
      setS((prev) => ({
        ...prev,
        opisDelatnosti: ai.opisDelatnosti,
        trzisteProdajeTekst: ai.trzisteProdajeTekst,
        trzisteSnabdevanjaTekst: ai.trzisteSnabdevanjaTekst,
        opisPoslovneIdeje: ai.opisPoslovneIdeje,
        zakljucak: ai.zakljucak,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Greška pri generisanju:\n\n${msg}`);
    } finally {
      setGenerating(false);
    }
  }, [s]);

  const calc = calcPath3(s);

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
  const up = <K extends keyof Path3State>(k: K, v: Path3State[K]) =>
    setS((p) => ({ ...p, [k]: v }));

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

  const canProceed: Record<number, boolean> = {
    0: !!s.investitor && !!s.nazivPlana,
    1: true,
    2: true,
    3: s.osnSredstvaP3.length > 0,
    4: s.proizvodi.length > 0,
    5: true,
    6: true,
  };

  const povYears = calc.avgNet > 0 ? Math.floor(calc.povracaj) : 0;
  const povMonths =
    calc.avgNet > 0 ? Math.round((calc.povracaj - povYears) * 12) : 0;
  const povracajStr =
    calc.avgNet > 0 ? `${povYears} god. ${povMonths} mes.` : "–";

  return (
    <StepWizard
      steps={PATH3_STEPS}
      currentStep={step}
      setCurrentStep={setStep}
      onBack={onBack}
      onFinish={() => generatePath3PDF(profile, s)}
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
                placeholder="npr. Sistem za navodnjavanje kap-kap"
              />
              <JDInput
                label="Mesto realizacije"
                value={s.lokacija}
                onChange={(v) => up("lokacija", v)}
                tc={tc}
                placeholder="npr. Sombor, AP Vojvodina"
              />
            </div>
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="Rezime"
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
              icon={Home}
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
                placeholder="npr. Nabavka sistema za navodnjavanje kap-kap"
              />
              <JDInput
                label="4.5. Tržište prodaje"
                value={s.trzisteProdaje}
                onChange={(v) => up("trzisteProdaje", v)}
                tc={tc}
                placeholder="npr. Domaće"
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
              icon={CheckCircle2}
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
                placeholder="npr. 1 novi radnik"
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
                placeholder="npr. 40"
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
              title="1.1. Podaci o registrovanom poljoprivrednom gazdinstvu"
              table="Tabela 1.1."
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
                        "Podnosilac zahteva",
                        "investitor",
                        "npr. Petar Petrović",
                      ],
                      ["2.", "Ulica i broj", "ulicaBroj", "npr. Braće Radić 7"],
                      ["3.", "Mesto", "mesto", "npr. Sombor"],
                      ["4.", "JMBG/MB", "jmbgMb", "npr. 0101985800123"],
                      ["5.", "Telefon", "telefon", "npr. 064/123-4567"],
                      [
                        "6.",
                        "Elektronska pošta",
                        "email",
                        "npr. ime@gmail.com",
                      ],
                      ["7.", "BPG", "bpg", "npr. 500212345"],
                      [
                        "8.",
                        "Datum registracije",
                        "datumRegistracije",
                        "npr. 15.03.2022.",
                      ],
                      [
                        "9.",
                        "Primarna delatnost",
                        "primarnaDelatnost",
                        "npr. Ratarstvo — 0111",
                      ],
                      [
                        "10.",
                        "Sekundarna delatnost",
                        "sekundarnaDelatnost",
                        "npr. Povrtarstvo — 0113",
                      ],
                      [
                        "11.",
                        "Broj uposlenih na polj. gazdinstvu",
                        "brojUposlenih",
                        "npr. 2",
                      ],
                    ] as [string, string, keyof Path3State, string][]
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
                            up(key, e.target.value as Path3State[typeof key])
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
              icon={Map}
              title="1.2. Podaci o lokaciji ulaganja"
              table="Tabela 1.2."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead cols={["Red. broj", "Opis", "Vrednost"]} tc={tc} />
                <tbody>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-2 text-center w-16"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      1.
                    </td>
                    <td
                      className="px-3 py-2 w-56"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Katastarska opština
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        style={cell}
                        value={s.katOpstina}
                        onChange={(e) => up("katOpstina", e.target.value)}
                        placeholder="npr. KO Sombor"
                      />
                    </td>
                  </tr>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-2 text-center w-16"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      2.
                    </td>
                    <td
                      className="px-3 py-2 w-56"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Brojevi kat. parcela
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        style={cell}
                        value={s.katParcele}
                        onChange={(e) => up("katParcele", e.target.value)}
                        placeholder="npr. 1234, 1235, 1238/1"
                      />
                    </td>
                  </tr>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-2 text-center w-16"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      3.
                    </td>
                    <td
                      className="px-3 py-2 w-56"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Površina (ha)
                    </td>
                    <td className="px-3 py-1.5 w-40">
                      <input
                        type="number"
                        style={{ ...cellN, textAlign: "right" }}
                        value={s.povrsina_ha || ""}
                        onChange={(e) =>
                          up("povrsina_ha", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-2 text-center w-16"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      4.
                    </td>
                    <td
                      className="px-3 py-2 w-56"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Od ukupne u vlasništvu (ha)
                    </td>
                    <td className="px-3 py-1.5 w-40">
                      <input
                        type="number"
                        style={{ ...cellN, textAlign: "right" }}
                        value={s.lokVlasnistvo_ha || ""}
                        onChange={(e) =>
                          up(
                            "lokVlasnistvo_ha",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                  <tr style={{ borderBottom: rowBorder }}>
                    <td
                      className="px-3 py-2 text-center w-16"
                      style={{
                        color: tc.textMuted,
                        fontFamily: FONT.mono,
                        fontSize: "0.7rem",
                      }}
                    >
                      5.
                    </td>
                    <td
                      className="px-3 py-2 w-56"
                      style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    >
                      Od ukupne u zakupu (ha)
                    </td>
                    <td className="px-3 py-1.5 w-40">
                      <input
                        type="number"
                        style={{ ...cellN, textAlign: "right" }}
                        value={s.lokZakup_ha || ""}
                        onChange={(e) =>
                          up("lokZakup_ha", parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-5">
          {/* 1.3 Land ownership */}
          <Card tc={tc}>
            <SectionHeader
              icon={Map}
              title="1.3. Vlasništvo i struktura poseda"
              table="Tabela 1.3."
              tc={tc}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <THead
                  cols={["Red.", "Osnov po kome se koristi", "Površina (ha)"]}
                  tc={tc}
                />
                <tbody>
                  {(
                    [
                      ["1.", "Vlasništvo", "vlasnistvo_ha"],
                      ["2.", "Zakup", "zakup_ha"],
                      ["3.", "Ustupljeno na korišćenje bez naknade", null],
                    ] as [string, string, keyof Path3State | null][]
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
                                  (0 as Path3State[typeof key]),
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

          {/* 1.4 Opis delatnosti */}
          <Card tc={tc}>
            <SectionHeader
              icon={Home}
              title="1.4. Delatnost gazdinstva i organizacija posla"
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Kratko opisati proizvodni asortiman i karakteristike
              proizvoda/usluge pojedinačno. Navesti linije proizvodnje,
              uposlenost i organizaciju poslova.
            </p>
            <JDTextarea
              label="Opis delatnosti i organizacije"
              value={s.opisDelatnosti}
              onChange={(v) => up("opisDelatnosti", v)}
              tc={tc}
              rows={4}
            />
          </Card>

          {/* 1.5 Existing assets */}
          <Card tc={tc}>
            <SectionHeader
              icon={Home}
              title="1.5. Osnovna sredstva u upotrebi"
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
                    ] as [string, string, string, keyof Path3State][]
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
                                (0 as Path3State[typeof key]),
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
                    ] as [string, string, string, keyof Path3State][]
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
                                (0 as Path3State[typeof key]),
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
                      ["3.11.", "Prskалица", "kom.", "meh_prskAlica"],
                      ["3.12.", "Berač kukuruza", "kom.", "meh_beracKukuruza"],
                      ["3.13.", "Prikolica", "kom.", "meh_prikolica"],
                    ] as [string, string, string, keyof Path3State][]
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
                                (0 as Path3State[typeof key]),
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
                    ] as [string, string, string, keyof Path3State][]
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
                                (0 as Path3State[typeof key]),
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
      {step === 3 && (
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
              <strong> 1.4 Delatnost</strong>,{" "}
              <strong>2.1 Tržište prodaje</strong>,
              <strong> 2.2 Tržište snabdevanja</strong>,{" "}
              <strong>3.1 Poslovna ideja</strong> i{" "}
              <strong>6. Zaključak</strong>. Generisani tekst možete naknadno
              urediti.
            </p>
            <button
              onClick={handleGenerateNarativniTekst}
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
              icon={BarChart3}
              title="2.1. Tržište prodaje"
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Navesti korisnike proizvoda i usluga: potencijalne i po ugovoru.
            </p>
            <JDTextarea
              label="Opis tržišta prodaje"
              value={s.trzisteProdajeTekst}
              onChange={(v) => up("trzisteProdajeTekst", v)}
              tc={tc}
              rows={4}
            />
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="2.2. Tržište snabdevanja"
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Navesti dobavljače proizvoda i usluga: potencijalne i po ugovoru.
            </p>
            <JDTextarea
              label="Opis tržišta snabdevanja"
              value={s.trzisteSnabdevanjaTekst}
              onChange={(v) => up("trzisteSnabdevanjaTekst", v)}
              tc={tc}
              rows={4}
            />
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={Home}
              title="3.1. Kratak opis poslovne ideje – projekta"
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Navesti šta je predmet ulaganja, koji je cilj investiranja i gde
              je mesto plasmana...
            </p>
            <JDTextarea
              label="Opis poslovne ideje"
              value={s.opisPoslovneIdeje}
              onChange={(v) => up("opisPoslovneIdeje", v)}
              tc={tc}
              rows={4}
            />
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={Home}
              title="3.2. Ukupna investiciona ulaganja"
              table="Tabela 3.2."
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
              icon={Home}
              title="3.3. Ulaganje u osnovna sredstva"
              table="Tabela 3.3."
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
                  {s.osnSredstvaP3.map((o, i) => (
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
                              "osnSredstvaP3",
                              s.osnSredstvaP3.map((x) =>
                                x.id === o.id
                                  ? { ...x, naziv: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="npr. Pumpa stanica frekventna"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-20">
                        <input
                          type="number"
                          style={{ ...cellN, textAlign: "right" }}
                          value={o.kolicina || ""}
                          onChange={(e) =>
                            up(
                              "osnSredstvaP3",
                              s.osnSredstvaP3.map((x) =>
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
                              "osnSredstvaP3",
                              s.osnSredstvaP3.map((x) =>
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
                              "osnSredstvaP3",
                              s.osnSredstvaP3.filter((x) => x.id !== o.id),
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
                {s.osnSredstvaP3.length > 0 && (
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
                up("osnSredstvaP3", [
                  ...s.osnSredstvaP3,
                  {
                    id: uid(),
                    naziv: "",
                    kolicina: 1,
                    cenaSaPDV: 0,
                  } as OsnovnoSredstvoP3,
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
              icon={Home}
              title="3.4. Izvori finansiranja"
              table="Tabela 3.4."
              tc={tc}
            />
            <div className="overflow-x-auto">
              {(() => {
                const pct = (v: number) =>
                  calc.totalInv > 0
                    ? ((v / calc.totalInv) * 100).toFixed(2) + " %"
                    : "0,00 %";
                const sopOsn =
                  calc.totalInv > 0
                    ? calc.sopstvenaSredstva *
                      (calc.totalOsnovnaI / calc.totalInv)
                    : 0;
                const sopObn =
                  calc.totalInv > 0
                    ? calc.sopstvenaSredstva *
                      (calc.totalObrtnaI / calc.totalInv)
                    : 0;
                return (
                  <table
                    className="w-full text-xs"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <THead
                      cols={[
                        "Red.",
                        "Opis",
                        "",
                        "",
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
                          className="px-3 py-1.5 font-bold"
                          colSpan={3}
                          style={{
                            color: tc.tableCellText,
                            fontFamily: FONT.sans,
                          }}
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
                          {pct(calc.sopstvenaSredstva)}
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
                          colSpan={3}
                          style={{
                            color: tc.tableCellText,
                            fontFamily: FONT.sans,
                          }}
                        >
                          Osnovna sredstva
                        </td>
                        <td
                          className="px-3 py-1.5 text-right"
                          style={{ color: tc.textMuted, fontFamily: FONT.mono }}
                        >
                          {fmtRSD(sopOsn)}
                        </td>
                        <td></td>
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
                          colSpan={3}
                          style={{
                            color: tc.tableCellText,
                            fontFamily: FONT.sans,
                          }}
                        >
                          Obrtna sredstva
                        </td>
                        <td
                          className="px-3 py-1.5 text-right"
                          style={{ color: tc.textMuted, fontFamily: FONT.mono }}
                        >
                          {fmtRSD(sopObn)}
                        </td>
                        <td></td>
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
                          colSpan={3}
                          style={{
                            color: tc.tableCellText,
                            fontFamily: FONT.sans,
                          }}
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
                          {pct(calc.tujaSredstva)}
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
                        <td className="px-3 py-1.5" colSpan={3}>
                          <input
                            style={cell}
                            value={s.tudjIzvoriOpis}
                            onChange={(e) =>
                              up("tudjIzvoriOpis", e.target.value)
                            }
                            placeholder="npr. Bankarski kredit, Banca Intesa"
                          />
                        </td>
                        <td
                          className="px-3 py-1.5 text-right"
                          style={{ color: tc.textMuted, fontFamily: FONT.mono }}
                        >
                          {fmtRSD(calc.tujaSredstva)}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr
                        style={{ borderTop: `2px solid ${tc.tableRowBorder}` }}
                      >
                        <td
                          colSpan={4}
                          className="px-3 py-1.5 font-bold text-xs"
                          style={{
                            color: tc.tableCellText,
                            fontFamily: FONT.sans,
                          }}
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
                );
              })()}
            </div>
          </Card>
        </div>
      )}
      {step === 4 && (
        <div className="space-y-5">
          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="4.1. Plan prihoda: cena i količina po godinama"
              table="Tabela 4.1."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Za svaki proizvod uneti godišnju cenu po JM i godišnju količinu —
              prihod se računa automatski.
            </p>
            <div className="overflow-x-auto">
              <table
                className="w-full text-xs"
                style={{ borderCollapse: "collapse", minWidth: 900 }}
              >
                <thead>
                  <tr
                    style={{
                      background: tc.cardBg,
                      borderBottom: `2px solid ${tc.tableRowBorder}`,
                    }}
                  >
                    <th
                      className="px-2 py-2 text-center w-10"
                      style={{
                        color: tc.tableHeaderText,
                        fontFamily: FONT.mono,
                        fontSize: "0.6rem",
                      }}
                      rowSpan={2}
                    >
                      Red.
                    </th>
                    <th
                      className="px-3 py-2 text-left"
                      style={{
                        color: tc.tableHeaderText,
                        fontFamily: FONT.mono,
                        fontSize: "0.6rem",
                        minWidth: 120,
                      }}
                      rowSpan={2}
                    >
                      Proizvod
                    </th>
                    <th
                      className="px-2 py-2 text-center w-14"
                      style={{
                        color: tc.tableHeaderText,
                        fontFamily: FONT.mono,
                        fontSize: "0.6rem",
                      }}
                      rowSpan={2}
                    >
                      JM
                    </th>
                    {["God. I", "God. II", "God. III", "God. IV", "God. V"].map(
                      (yr, i) => (
                        <th
                          key={i}
                          className="px-1 py-1 text-center"
                          colSpan={3}
                          style={{
                            color: tc.tableHeaderText,
                            fontFamily: FONT.mono,
                            fontSize: "0.6rem",
                            borderLeft: `1px solid ${tc.tableRowBorder}`,
                          }}
                        >
                          {yr}
                        </th>
                      ),
                    )}
                    <th className="w-8"></th>
                  </tr>
                  <tr
                    style={{
                      background: tc.cardBg,
                      borderBottom: `2px solid ${tc.tableRowBorder}`,
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((yr) => [
                      <th
                        key={`c${yr}`}
                        className="px-1 py-1 text-center"
                        style={{
                          color: tc.tableHeaderText,
                          fontFamily: FONT.mono,
                          fontSize: "0.55rem",
                          borderLeft: `1px solid ${tc.tableRowBorder}`,
                          width: 60,
                        }}
                      >
                        Cena/JM
                      </th>,
                      <th
                        key={`q${yr}`}
                        className="px-1 py-1 text-center"
                        style={{
                          color: tc.tableHeaderText,
                          fontFamily: FONT.mono,
                          fontSize: "0.55rem",
                          width: 60,
                        }}
                      >
                        Kol.
                      </th>,
                      <th
                        key={`p${yr}`}
                        className="px-1 py-1 text-center"
                        style={{
                          color: tc.tableHeaderText,
                          fontFamily: FONT.mono,
                          fontSize: "0.55rem",
                          width: 70,
                        }}
                      >
                        Prihod
                      </th>,
                    ])}
                  </tr>
                </thead>
                <tbody>
                  {s.proizvodi.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: rowBorder }}>
                      <td
                        className="px-2 py-1.5 text-center"
                        style={{
                          color: tc.textMuted,
                          fontFamily: FONT.mono,
                          fontSize: "0.7rem",
                        }}
                      >
                        {i + 1}.
                      </td>
                      <td className="px-3 py-1.5">
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
                          placeholder="npr. Pšenica"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-14">
                        <input
                          style={cell}
                          value={p.jm}
                          onChange={(e) =>
                            up(
                              "proizvodi",
                              s.proizvodi.map((x) =>
                                x.id === p.id
                                  ? { ...x, jm: e.target.value }
                                  : x,
                              ),
                            )
                          }
                          placeholder="t"
                        />
                      </td>
                      {p.poGodinama.map((pg, yr) => [
                        <td
                          key={`c${yr}`}
                          className="px-1 py-1.5"
                          style={{
                            borderLeft: `1px solid ${tc.tableRowBorder}`,
                          }}
                        >
                          <CurrencyCell
                            value={pg.cena}
                            onChange={(nv) => {
                              const np = p.poGodinama.map((x, xi) =>
                                xi === yr ? { ...x, cena: nv } : x,
                              ) as ProizvodP3["poGodinama"];
                              up(
                                "proizvodi",
                                s.proizvodi.map((x) =>
                                  x.id === p.id ? { ...x, poGodinama: np } : x,
                                ),
                              );
                            }}
                            className="w-full focus:outline-none"
                            style={{ ...cellN, fontSize: "0.65rem" }}
                          />
                        </td>,
                        <td key={`q${yr}`} className="px-1 py-1.5">
                          <CurrencyCell
                            value={pg.kolicina}
                            onChange={(nv) => {
                              const np = p.poGodinama.map((x, xi) =>
                                xi === yr ? { ...x, kolicina: nv } : x,
                              ) as ProizvodP3["poGodinama"];
                              up(
                                "proizvodi",
                                s.proizvodi.map((x) =>
                                  x.id === p.id ? { ...x, poGodinama: np } : x,
                                ),
                              );
                            }}
                            className="w-full focus:outline-none"
                            style={{ ...cellN, fontSize: "0.65rem" }}
                          />
                        </td>,
                        <td
                          key={`p${yr}`}
                          className="px-1 py-1.5 text-right"
                          style={{
                            color: tc.highlight,
                            fontFamily: FONT.mono,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                          }}
                        >
                          {fmtRSD(pg.cena * pg.kolicina)}
                        </td>,
                      ])}
                      <td className="px-1 py-1.5 w-8">
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
                        colSpan={3}
                        className="px-3 py-1.5 font-bold text-xs"
                        style={{
                          color: tc.tableCellText,
                          fontFamily: FONT.sans,
                        }}
                      >
                        Ukupno prihod:
                      </td>
                      {[0, 1, 2, 3, 4].map((yr) => [
                        <td
                          key={`tc${yr}`}
                          style={{
                            borderLeft: `1px solid ${tc.tableRowBorder}`,
                          }}
                        ></td>,
                        <td key={`tq${yr}`}></td>,
                        <td
                          key={`tp${yr}`}
                          className="px-1 py-1.5 text-right font-bold text-xs"
                          style={{ color: tc.highlight, fontFamily: FONT.mono }}
                        >
                          {fmtRSD(calc.prihodiPoGodini[yr])}
                        </td>,
                      ])}
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <button
              onClick={() => {
                const newP: ProizvodP3 = {
                  id: uid(),
                  naziv: "",
                  jm: "kom",
                  poGodinama: [
                    { cena: 0, kolicina: 0 },
                    { cena: 0, kolicina: 0 },
                    { cena: 0, kolicina: 0 },
                    { cena: 0, kolicina: 0 },
                    { cena: 0, kolicina: 0 },
                  ],
                };
                up("proizvodi", [...s.proizvodi, newP]);
              }}
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
              <Plus size={11} /> Dodaj proizvod
            </button>
          </Card>
        </div>
      )}
      {step === 5 && (
        <div className="space-y-5">
          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="4.2.1. Direktan materijal"
              table="Tabela 4.2.1."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (troškovi nabavke sirovine i potrošnog materijala)
            </p>
            <CostTable
              rows={s.direktanMaterijal}
              onChange={(v) => up("direktanMaterijal", v)}
            />
          </Card>

          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="4.2.2. Energija i gorivo"
              table="Tabela 4.2.2."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (električna energija, gorivo i sl.)
            </p>
            <CostTable
              rows={s.energijaGorivo}
              onChange={(v) => up("energijaGorivo", v)}
            />
          </Card>
          <Card tc={tc}>
            <SectionHeader
              icon={BarChart3}
              title="4.2.3. Amortizacija"
              table="Tabela 4.2.3."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              Godišnja amortizacija = nabavna vrednost × stopa / 100.
              Neamortizovana vrednost = vrednost − godišnja × 5.
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
                    "Nabavna vrednost",
                    "Stopa (%)",
                    "God. amortizacija",
                    "Neamortizovana vred.",
                    "",
                  ]}
                  tc={tc}
                />
                <tbody>
                  {s.amortizacijaP3.map((a, i) => {
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
                                "amortizacijaP3",
                                s.amortizacijaP3.map((x) =>
                                  x.id === a.id
                                    ? { ...x, naziv: e.target.value }
                                    : x,
                                ),
                              )
                            }
                            placeholder="npr. Sistem za navodnjavanje"
                          />
                        </td>
                        <td className="px-2 py-1.5 w-36">
                          <CurrencyCell
                            value={a.nabavnaVrednost}
                            onChange={(nv) =>
                              up(
                                "amortizacijaP3",
                                s.amortizacijaP3.map((x) =>
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
                                "amortizacijaP3",
                                s.amortizacijaP3.map((x) =>
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
                                "amortizacijaP3",
                                s.amortizacijaP3.filter((x) => x.id !== a.id),
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
                up("amortizacijaP3", [
                  ...s.amortizacijaP3,
                  {
                    id: uid(),
                    naziv: "",
                    nabavnaVrednost: 0,
                    stopaAmortizacije: 10,
                  } as AmortizacijaRowP2,
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
              title="4.2.4. Spoljna radna snaga"
              table="Tabela 4.2.4."
              tc={tc}
            />
            <p
              className="text-xs italic mb-3"
              style={{ color: tc.textMuted, fontFamily: FONT.sans }}
            >
              (spoljni radnici, angažovani po ugovoru)
            </p>
            <CostTable
              rows={s.radnaSnagaVanjska}
              onChange={(v) => up("radnaSnagaVanjska", v)}
            />
          </Card>

          {/* Live summary */}
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
              icon={BarChart3}
              title="5.3. Statička ocena projekta (automatski izračunato, poslednja godina)"
              table="God. V"
              tc={tc}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {[
                {
                  lbl: "5.3.1 Ekonomičnost",
                  val: calc.ekonomicnost.toFixed(3),
                  ok: calc.ekonomicnost > 1,
                },
                {
                  lbl: "5.3.2 Akumulativnost",
                  val: `${calc.akumulativnost.toFixed(2)} %`,
                  ok: calc.akumulativnost > 0,
                },
                {
                  lbl: "5.3.3 Rentabilnost",
                  val: `${calc.rentabilnost.toFixed(2)} %`,
                  ok: calc.rentabilnost > 0,
                },
                { lbl: "Povraćaj investicije", val: povracajStr, ok: true },
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

          <Card tc={tc}>
            <SectionHeader
              icon={CheckCircle2}
              title="6. Zaključna ocena o projektu"
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
        </div>
      )}
    </StepWizard>
  );
}
