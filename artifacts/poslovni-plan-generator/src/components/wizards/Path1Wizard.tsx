import { useState, useCallback, useEffect } from "react";
import {
  FileText, Building2 as BuildingIcon, MapPin, Activity,
  Leaf, Target, Layers, TrendingUp, Zap, Settings, Users, CreditCard,
} from "lucide-react";
import type { GlobalProfile, ThemeConfig, Path1State, ProizvodPrihod, AmortizacijaStavka } from "../../types";
import { PATH1_INIT, PATH1_STEPS, FONT } from "../../lib/constants";
import { calcPath1 } from "../../lib/math";
import { fmtRSD } from "../../lib/formatters";
import { generatePath1PDF, buildIPARDFromState } from "../../lib/pdf";
import { generateIPARDContent } from "../../lib/ai";
import { StepWizard } from "./StepWizard";
import { Card } from "../shared/Card";
import { SectionHeader } from "../shared/SectionHeader";
import { JDInput } from "../shared/JDInput";
import { JDTextarea } from "../shared/JDTextarea";
import { LiveBadge } from "../shared/LiveBadge";
import { AddRowBtn } from "../shared/AddRowBtn";
import { RemoveBtn } from "../shared/RemoveBtn";

interface Path1WizardProps {
  profile: GlobalProfile;
  onBack: () => void;
  tc: ThemeConfig;
}

const STORAGE_KEY = "agro-plan-path1-state";

export function Path1Wizard({ profile, onBack, tc }: Path1WizardProps) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Path1State>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...PATH1_INIT, ...JSON.parse(saved) } : PATH1_INIT;
    } catch { return PATH1_INIT; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, [s]);
  const [generating, setGenerating] = useState(false);
  const calc = calcPath1(s);

  const handleFinish = useCallback(async () => {
    setGenerating(true);
    try {
      const aiContent = await generateIPARDContent(s);
      generatePath1PDF(buildIPARDFromState(profile, s), aiContent);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[AiZolo] Грешка:", err);
      alert(`Грешка при генерисању:\n\n${msg}\n\nPDF ће бити генерисан без нарративног текста.`);
      generatePath1PDF(buildIPARDFromState(profile, s));
    } finally {
      setGenerating(false);
    }
  }, [s, profile]);

  const fmtSrb = (n: number) =>
    n !== 0 ? n.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";

  function CurrencyCell({ value, onChange, className, style, placeholder }: {
    value: number; onChange: (v: number) => void;
    className?: string; style?: React.CSSProperties; placeholder?: string;
  }) {
    const [focused, setCFocused] = useState(false);
    const [raw, setRaw] = useState("");
    return (
      <input
        type="text" inputMode="decimal"
        className={className} style={style}
        value={focused ? raw : fmtSrb(value)}
        placeholder={focused ? "" : (placeholder ?? "0")}
        onFocus={() => { setRaw(value !== 0 ? String(value) : ""); setCFocused(true); }}
        onChange={e => setRaw(e.target.value.replace(/[^0-9.,]/g, ""))}
        onBlur={() => {
          setCFocused(false);
          onChange(parseFloat(raw.replace(/\./g, "").replace(",", ".")) || 0);
        }}
      />
    );
  }

  const uid = () => Math.random().toString(36).slice(2);

  const addKultura = () => setS({ ...s, kulture: [...s.kulture, { id: uid(), naziv: "", povrsina_ha: 0 }] });
  const remKultura = (id: string) => setS({ ...s, kulture: s.kulture.filter(k => k.id !== id) });
  const updKultura = (id: string, key: "naziv" | "povrsina_ha", val: any) => {
    const n = s.kulture.map(k => k.id === id ? { ...k, [key]: val } : k);
    setS({ ...s, kulture: n });
  };

  const addOsn = () => setS({ ...s, osnSredstva: [...s.osnSredstva, { id: uid(), naziv: "", kolicina: 1, cenaSaPDV: 0 }] });
  const remOsn = (id: string) => setS({ ...s, osnSredstva: s.osnSredstva.filter(i => i.id !== id) });
  const updOsn = (id: string, key: string, val: any) => {
    const n = s.osnSredstva.map(i => i.id === id ? { ...i, [key]: val } : i);
    setS({ ...s, osnSredstva: n });
  };

  const addProizvod = () => setS({ ...s, proizvodi: [...s.proizvodi, { id: uid(), naziv: "", jedinicaMere: "kom", prodajnaCena: 0, kolicinePoGodini: [0, 0, 0, 0, 0] }] });
  const remProizvod = (id: string) => setS({ ...s, proizvodi: s.proizvodi.filter(p => p.id !== id) });
  const updProizvod = <K extends keyof ProizvodPrihod>(id: string, key: K, val: ProizvodPrihod[K]) => {
    const n = s.proizvodi.map(p => p.id === id ? { ...p, [key]: val } : p);
    setS({ ...s, proizvodi: n });
  };

  const addAmort = () => setS({ ...s, amortizacija: [...s.amortizacija, { id: uid(), naziv: "", nabavnaVrednost: 0, stopaAmortizacije: 10 }] });
  const remAmort = (id: string) => setS({ ...s, amortizacija: s.amortizacija.filter(a => a.id !== id) });
  const updAmort = <K extends keyof AmortizacijaStavka>(id: string, key: K, val: AmortizacijaStavka[K]) => {
    const n = s.amortizacija.map(a => a.id === id ? { ...a, [key]: val } : a);
    setS({ ...s, amortizacija: n });
  };

  const step0Valid = s.tabela11.naziv.trim() !== "" && s.tabela11.investitor.trim() !== "" && s.tabela11.lokacija.trim() !== "";
  const step1Valid = s.tabela21.imeNaziv.trim() !== "" && s.tabela21.pib.trim() !== "" && s.tabela22.bpg.trim() !== "";

  const totalHa = s.kulture.reduce((a, k) => a + k.povrsina_ha, 0);

  const thStyle = {
    color: tc.tableHeaderText,
    fontFamily: FONT.sans,
    fontSize: "0.6rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    padding: "10px 12px",
  };

  return (
    <StepWizard
      steps={PATH1_STEPS}
      currentStep={step}
      setCurrentStep={setStep}
      onBack={onBack}
      onFinish={handleFinish}
      isGenerating={generating}
      tc={tc}
      canProceed={step === 0 ? step0Valid : step === 1 ? step1Valid : true}
    >

      {step === 0 && (
        <Card tc={tc}>
          <SectionHeader icon={FileText} title="NASLOVNA STRANA POSLOVNOG PLANA" table="Tabela 1.1" tc={tc} />
          <div className="grid grid-cols-1 gap-6 max-w-2xl">
            <JDInput label="Naziv poslovnog plana" value={s.tabela11.naziv}
              onChange={v => setS({ ...s, tabela11: { ...s.tabela11, naziv: v } })}
              placeholder="npr. Proširenje stočarskog gazdinstva" tc={tc} />
            <JDInput label="Investitor" value={s.tabela11.investitor}
              onChange={v => setS({ ...s, tabela11: { ...s.tabela11, investitor: v } })}
              placeholder="npr. Petar Petrović" tc={tc} />
            <JDInput label="Mesto realizacije" value={s.tabela11.lokacija}
              onChange={v => setS({ ...s, tabela11: { ...s.tabela11, lokacija: v } })}
              placeholder="npr. Novi Sad" tc={tc} />
          </div>

          {(s.tabela11.naziv || s.tabela11.investitor || s.tabela11.lokacija) && (
            <div className="mt-8 p-6 rounded-xl" style={{ background: tc.narrativeBg, border: `1px solid ${tc.narrativeBorder}`, borderLeft: `3px solid ${tc.accent}66` }}>
              <p className="text-[10px] uppercase tracking-[0.2em] mb-4 font-bold" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>
                Pregled naslovne strane PDF-a
              </p>
              <p className="text-lg font-black" style={{ color: tc.textPrimary, fontFamily: FONT.sans }}>{s.tabela11.naziv}</p>
              <p className="text-sm mt-1" style={{ color: tc.textSecondary, fontFamily: FONT.sans }}>
                Investitor: <span className="font-semibold">{s.tabela11.investitor}</span>
              </p>
              <p className="text-sm" style={{ color: tc.textSecondary, fontFamily: FONT.sans }}>
                Lokacija: <span className="font-semibold">{s.tabela11.lokacija}</span>
              </p>
            </div>
          )}
          {!step0Valid && (
            <p className="mt-4 text-xs" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>
              ↳ Popunite sva tri polja da biste nastavili.
            </p>
          )}
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="px-6 py-4 rounded-xl" style={{ background: tc.accentBg, border: `1px solid ${tc.accentBorder}` }}>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold mb-1" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>Predračunska vrednost ulaganja</p>
            <p className="text-xs" style={{ color: tc.textSecondary, fontFamily: FONT.sans }}>Opšti podaci o aplikantu i gazdinstvu - identično IPARD obrascu.</p>
          </div>

          <Card tc={tc}>
            <SectionHeader icon={BuildingIcon} title="Opšti podaci o aplikantu" table="Tabela 2.1" tc={tc} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ borderBottom: `2px solid ${tc.tableRowBorder}` }}>
                  <th style={thStyle} className="text-left w-8">Br.</th>
                  <th style={thStyle} className="text-left">Opis</th>
                  <th style={thStyle} className="text-left">Vrednost</th>
                </tr></thead>
                <tbody>
                  {([
                    [1, "Ime i prezime / Naziv", "imeNaziv", "Unesite ime / naziv"],
                    [2, "Sediste (Ulica i broj)", "sediste", "Unesite sedište"],
                    [3, "Mesto", "mesto", "Unesite mesto"],
                    [4, "PIB *", "pib", "Unesite PIB"],
                    [5, "Maticni broj *", "maticniBroj", "Unesite matični broj"],
                    [6, "Sifra delatnosti u APR *", "sifraDelatnosti", "Unesite šifru delatnosti"],
                    [7, "Telefon", "telefon", "Unesite telefon"],
                    [8, "Elektronska posta", "email", "Unesite e-mail adresu"],
                  ] as [number, string, keyof typeof s.tabela21, string][]).map(([num, label, key, ph]) => (
                    <tr key={num} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                      <td className="px-3 py-2 text-xs" style={{ color: tc.textMuted, fontFamily: FONT.sans }}>{num}.</td>
                      <td className="px-3 py-2 text-sm" style={{ color: tc.tableCellText, fontFamily: FONT.sans }}>{label}</td>
                      <td className="px-3 py-2">
                        <input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                          value={s.tabela21[key]} onChange={e => setS({ ...s, tabela21: { ...s.tabela21, [key]: e.target.value } })} placeholder={ph} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px]" style={{ color: tc.textMuted, fontFamily: FONT.sans }}>* samo za pravna lica i preduzetnike</p>
          </Card>

          <Card tc={tc}>
            <SectionHeader icon={MapPin} title="Podaci o registrovanom polj. gazdinstvu" table="Tabela 2.2" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              <JDInput label="Adresa gazdinstva" value={s.tabela22.adresaGazdinstva} onChange={v => setS({ ...s, tabela22: { ...s.tabela22, adresaGazdinstva: v } })} placeholder="npr. ul. Cara Lazara 15, Beograd" tc={tc} />
              <JDInput label="BPG" value={s.tabela22.bpg} onChange={v => setS({ ...s, tabela22: { ...s.tabela22, bpg: v } })} tc={tc} />
              <JDInput label="Datum registracije" type="date" value={s.tabela22.datumRegistracije} onChange={v => setS({ ...s, tabela22: { ...s.tabela22, datumRegistracije: v } })} tc={tc} />
              <JDInput label="Broj zaposlenih *" type="number" value={s.tabela22.brojZaposlenih} onChange={v => setS({ ...s, tabela22: { ...s.tabela22, brojZaposlenih: parseInt(v) || 0 } })} tc={tc} />
            </div>
            <p className="mt-4 text-[10px]" style={{ color: tc.textMuted, fontFamily: FONT.sans }}>* само за правна лица и предузетнике</p>
          </Card>

          <Card tc={tc}>
            <SectionHeader icon={Activity} title="Vlasništvo i struktura poseda" table="Tabela 2.3" tc={tc} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ borderBottom: `2px solid ${tc.tableRowBorder}` }}>
                  <th style={thStyle} className="text-left w-8">Br.</th>
                  <th style={thStyle} className="text-left">Osnov po kojem se koristi</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Površina (m²)</th>
                </tr></thead>
                <tbody>
                  {[
                    ["1.", "Vlasništvo", "vlasnistvo_m2"],
                    ["2.", "Zakup", "zakup_m2"],
                    ["3.", "Ustupljeno na korišćenje bez naknade", "ustupljeno_m2"],
                  ].map(([num, label, key]) => (
                    <tr key={key} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                      <td className="px-3 py-2 text-xs" style={{ color: tc.textMuted, fontFamily: FONT.sans }}>{num}</td>
                      <td className="px-3 py-2 text-sm" style={{ color: tc.tableCellText, fontFamily: FONT.sans }}>{label}</td>
                      <td className="px-3 py-2 text-right">
                        <input type="number" min={0} className="w-32 bg-transparent text-sm focus:outline-none text-right"
                          style={{ color: tc.tableNumText, fontFamily: FONT.sans }}
                          value={(s.tabela23 as any)[key] || ""}
                          onChange={e => setS({ ...s, tabela23: { ...s.tabela23, [key]: parseInt(e.target.value) || 0 } })} placeholder="0" />
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: tc.accentBg }}>
                    <td /><td className="px-3 py-2 text-sm font-bold" style={{ color: tc.textPrimary, fontFamily: FONT.sans }}>Ukupno:</td>
                    <td className="px-3 py-2 text-right font-bold" style={{ color: tc.accent, fontFamily: FONT.sans }}>
                      {(s.tabela23.vlasnistvo_m2 + s.tabela23.zakup_m2 + s.tabela23.ustupljeno_m2).toLocaleString("sr-RS")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={Leaf} title="Struktura tekuće proizvodnje" table="Kulture i površine" tc={tc} />

            <div className="space-y-2">
              <div className="grid gap-3 px-2 pb-1" style={{ gridTemplateColumns: "1fr 140px 36px" }}>
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: tc.tableHeaderText, fontFamily: FONT.sans }}>Kultura / vrsta</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-right" style={{ color: tc.tableHeaderText, fontFamily: FONT.sans }}>Površina (ha)</span>
                <span />
              </div>
              <div style={{ borderBottom: `1px solid ${tc.tableRowBorder}`, marginBottom: "8px" }} />

              {s.kulture.map((k, idx) => (
                <div
                  key={k.id}
                  className="grid gap-3 items-center px-4 py-3 rounded-xl transition-all"
                  style={{
                    gridTemplateColumns: "1fr 140px 36px",
                    background: idx % 2 === 0 ? `${tc.accent}08` : "transparent",
                    border: `1px solid ${idx % 2 === 0 ? tc.accent + "20" : tc.cardBorder}`,
                  }}
                >
                  <input
                    className="bg-transparent text-sm font-semibold focus:outline-none w-full"
                    style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                    value={k.naziv}
                    onChange={e => updKultura(k.id, "naziv", e.target.value)}
                    placeholder="Naziv kulture..."
                  />
                  <div className="flex items-center gap-1.5 justify-end">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className="w-24 bg-transparent text-sm font-bold focus:outline-none text-right"
                      style={{ color: tc.accent, fontFamily: FONT.sans }}
                      value={k.povrsina_ha || ""}
                      onChange={e => updKultura(k.id, "povrsina_ha", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                    <span className="text-xs font-bold" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>ha</span>
                  </div>
                  <RemoveBtn onClick={() => remKultura(k.id)} />
                </div>
              ))}

              <AddRowBtn onClick={addKultura} tc={tc} />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div style={{ borderTop: `1px solid ${tc.tableRowBorder}`, flex: 1, marginRight: "24px" }} />
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-xl"
                style={{
                  background: tc.accentBg,
                  border: `1px solid ${tc.accentBorder}`,
                }}
              >
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>Ukupno površina</span>
                <span className="text-2xl font-black" style={{ color: tc.accent, fontFamily: FONT.sans }}>
                  {totalHa.toFixed(4)}
                  <span className="text-sm ml-1" style={{ color: tc.accentDim }}>ha</span>
                </span>
              </div>
            </div>
          </Card>

          <Card tc={tc}>
            <SectionHeader icon={FileText} title="Opis tekućih aktivnosti" table="Kratki pregled" tc={tc} />
            <JDTextarea
              label="Opis delatnosti i trenutnog stanja gazdinstva"
              value={s.opisAktivnosti}
              onChange={v => setS({ ...s, opisAktivnosti: v })}
              hint="Kratko opišite šta gazdinstvo trenutno radi, koji su glavni proizvodi i kanali prodaje"
              tc={tc}
            />
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={Target} title="Osnovno o investiciji" table="Tabela 4.2" tc={tc} />
            <div className="space-y-5">
              <JDTextarea
                label="Namena investicije"
                value={s.namenaInvesticije}
                onChange={v => setS({ ...s, namenaInvesticije: v })}
                placeholder="npr. Kupovina kazana za destilaciju voćnih rakija"
                hint="Npr. Kupovina kazana za destilaciju voćnih rakija"
                tc={tc}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                <JDInput label="Početak investicije (mes/god)" value={s.pocetakInvesticije}
                  onChange={v => setS({ ...s, pocetakInvesticije: v })} hint="Npr. 06/2025" tc={tc} />
                <JDInput label="Završetak investicije (mes/god)" value={s.zavrsetakInvesticije}
                  onChange={v => setS({ ...s, zavrsetakInvesticije: v })} hint="Npr. 12/2025" tc={tc} />
                <JDInput label="Ekonomski vek projekta (god.)" type="number" value={s.ekonomskiVek}
                  onChange={v => setS({ ...s, ekonomskiVek: parseInt(v) || 0 })} tc={tc} />
              </div>
            </div>
          </Card>

          <Card tc={tc}>
            <SectionHeader icon={Layers} title="Ulaganje u osnovna sredstva" table="Tabela 4.3" tc={tc} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${tc.tableRowBorder}` }}>
                    <th style={thStyle} className="text-left">Naziv osnovnog sredstva</th>
                    <th style={{ ...thStyle, textAlign: "center", width: "80px" }}>Kol.</th>
                    <th style={{ ...thStyle, textAlign: "right", width: "160px" }}>Cena sa PDV (RSD)</th>
                    <th style={{ ...thStyle, textAlign: "right", width: "160px" }}>Ukupno (RSD)</th>
                    <th style={{ width: "40px" }} />
                  </tr>
                </thead>
                <tbody>
                  {s.osnSredstva.map((item, idx) => {
                    const rowTotal = item.kolicina * item.cenaSaPDV;
                    return (
                      <tr key={item.id} style={{ borderBottom: `1px solid ${tc.tableRowBorder}`, background: idx % 2 === 0 ? `${tc.accent}05` : "transparent" }}>
                        <td className="px-3 py-3">
                          <input className="w-full bg-transparent text-sm font-medium focus:outline-none"
                            style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                            value={item.naziv} onChange={e => updOsn(item.id, "naziv", e.target.value)} placeholder="Naziv sredstva..." />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input type="number" min={1} className="w-16 bg-transparent text-sm font-bold focus:outline-none text-center"
                            style={{ color: tc.tableNumText, fontFamily: FONT.sans }}
                            value={item.kolicina} onChange={e => updOsn(item.id, "kolicina", parseInt(e.target.value) || 1)} />
                        </td>
                        <td className="px-3 py-3 text-right">
                          <CurrencyCell
                            value={item.cenaSaPDV}
                            onChange={v => updOsn(item.id, "cenaSaPDV", v)}
                            className="w-full bg-transparent text-sm font-semibold focus:outline-none text-right"
                            style={{ color: tc.tableNumText, fontFamily: FONT.sans }} />
                        </td>
                        <td className="px-3 py-3 text-right font-bold" style={{ color: tc.accent, fontFamily: FONT.sans }}>
                          {fmtRSD(rowTotal)}
                        </td>
                        <td className="px-3 py-3"><RemoveBtn onClick={() => remOsn(item.id)} /></td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: `2px solid ${tc.tableRowBorder}`, background: tc.accentBg }}>
                    <td colSpan={3} className="px-3 py-3 text-sm font-bold uppercase tracking-widest" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>
                      Ukupna vrednost investicije
                    </td>
                    <td className="px-3 py-3 text-right text-base font-black" style={{ color: tc.accent, fontFamily: FONT.sans }}>
                      {fmtRSD(calc.totalInvSaPDV)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <AddRowBtn onClick={addOsn} tc={tc} />
          </Card>

          <Card tc={tc}>
            <SectionHeader icon={CreditCard} title="Struktura finansiranja" table="Tabela 4.4" tc={tc} />
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 items-end">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold mb-3"
                    style={{ color: tc.accentDim, fontFamily: FONT.sans }}>
                    Sopstvena sredstva {s.sopstvenaProcenat}%
                  </label>
                  <input
                    type="range" min={0} max={100} value={s.sopstvenaProcenat}
                    onChange={e => setS({ ...s, sopstvenaProcenat: parseInt(e.target.value) })}
                    className="w-full accent-current"
                    style={{ accentColor: tc.accent } as any}
                  />
                </div>
                <JDInput label="Sopstveno (%)" type="number" value={s.sopstvenaProcenat}
                  onChange={v => setS({ ...s, sopstvenaProcenat: Math.min(100, Math.max(0, parseInt(v) || 0)) })} tc={tc} />
              </div>

              <div className="rounded-full overflow-hidden flex" style={{ height: "10px", border: `1px solid ${tc.cardBorder}` }}>
                <div
                  style={{
                    width: `${s.sopstvenaProcenat}%`,
                    background: `linear-gradient(90deg, ${tc.accent}, ${tc.accent}cc)`,
                    transition: "width 0.3s ease",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3)`,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    background: `linear-gradient(90deg, ${tc.highlight}cc, ${tc.highlight})`,
                    transition: "all 0.3s ease",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold" style={{ fontFamily: FONT.sans }}>
                <span style={{ color: tc.accent }}>Sopstveno</span>
                <span style={{ color: tc.highlight }}>Tuđe / Grant</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <LiveBadge label="Ukupna investicija" value={fmtRSD(calc.totalInvSaPDV)} tc={tc} />
                <LiveBadge label={`Sopstveno (${s.sopstvenaProcenat}%)`} value={fmtRSD(calc.sopstvenaSredstva)} tc={tc} />
                <LiveBadge label={`Tuđe (${100 - s.sopstvenaProcenat}%)`} value={fmtRSD(calc.tujaSredstva)} hi tc={tc} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {step === 4 && (
        <Card tc={tc}>
          <SectionHeader icon={TrendingUp} title="Plan prihoda po godinama" table="Tabela 8.1" tc={tc} />

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: "760px" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${tc.tableRowBorder}` }}>
                  <th style={thStyle} className="text-left" >Proizvod / Usluga</th>
                  <th style={{ ...thStyle, width: "70px", textAlign: "center" }}>J.M.</th>
                  <th style={{ ...thStyle, width: "100px", textAlign: "right" }}>Cena (RSD)</th>
                  {["G–I", "G–II", "G–III", "G–IV", "G–V"].map(yr => (
                    <th key={yr} style={{ ...thStyle, width: "100px", textAlign: "right" }}>{yr}</th>
                  ))}
                  <th style={{ width: "36px" }} />
                </tr>
              </thead>
              <tbody>
                {s.proizvodi.map((p, pidx) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${tc.tableRowBorder}`, background: pidx % 2 === 0 ? `${tc.highlight}08` : "transparent" }}>
                    <td className="px-3 py-3">
                      <input className="w-full bg-transparent text-sm font-medium focus:outline-none"
                        style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                        value={p.naziv} onChange={e => updProizvod(p.id, "naziv", e.target.value)} placeholder="Naziv proizvoda..." />
                    </td>
                    <td className="px-3 py-3">
                      <input className="w-full bg-transparent text-xs text-center focus:outline-none"
                        style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                        value={p.jedinicaMere} onChange={e => updProizvod(p.id, "jedinicaMere", e.target.value)} />
                    </td>
                    <td className="px-3 py-3">
                      <CurrencyCell
                        value={p.prodajnaCena}
                        onChange={v => updProizvod(p.id, "prodajnaCena", v)}
                        className="w-full bg-transparent text-sm font-bold text-right focus:outline-none"
                        style={{ color: tc.highlight, fontFamily: FONT.sans }} />
                    </td>
                    {p.kolicinePoGodini.map((q, qi) => (
                      <td key={qi} className="px-3 py-3">
                        <input type="number" min={0} className="w-full bg-transparent text-sm text-right focus:outline-none"
                          style={{ color: tc.tableNumText, fontFamily: FONT.sans }}
                          value={q || ""} onChange={e => {
                            const nq = [...p.kolicinePoGodini] as [number, number, number, number, number];
                            nq[qi] = parseFloat(e.target.value) || 0;
                            updProizvod(p.id, "kolicinePoGodini", nq);
                          }} placeholder="0" />
                      </td>
                    ))}
                    <td className="px-3 py-3"><RemoveBtn onClick={() => remProizvod(p.id)} /></td>
                  </tr>
                ))}

                <tr style={{ borderTop: `2px solid ${tc.tableRowBorder}`, background: tc.accentBg }}>
                  <td colSpan={3} className="px-3 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>
                    Ukupni prihodi po godini
                  </td>
                  {calc.prihodiPoGodini.map((r, i) => (
                    <td key={i} className="px-3 py-3 text-right font-black text-sm"
                      style={{ color: tc.accent, fontFamily: FONT.sans }}>
                      {fmtRSD(r)}
                    </td>
                  ))}
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          <AddRowBtn onClick={addProizvod} tc={tc} />

          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {calc.prihodiPoGodini.map((r, i) => (
              <LiveBadge key={i} label={`Prihod G${i + 1}`} value={fmtRSD(r)} hi={i === 4} tc={tc} />
            ))}
          </div>
        </Card>
      )}

      {step === 5 && (
        <div className="space-y-4">

          <Card tc={tc}>
            <SectionHeader icon={Layers} title="Direktni materijalni troškovi" table="Tabela 8.2.1" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              <JDInput label="Sirovine i materijal" currency value={s.trosak_sirovine}
                onChange={v => setS({ ...s, trosak_sirovine: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
              <JDInput label="Ambalaža (boce, etikete, čepovi)" currency value={s.trosak_ambalaza}
                onChange={v => setS({ ...s, trosak_ambalaza: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
              <JDInput label="Ostali materijal" currency value={s.trosak_ostaliMat}
                onChange={v => setS({ ...s, trosak_ostaliMat: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
            </div>
            <div className="mt-5 flex justify-end">
              <LiveBadge label="Ukupno 8.2.1" value={fmtRSD(calc.trosak82_1)} tc={tc} />
            </div>
          </Card>

          {/* 8.2.2 – Energenti */}
          <Card tc={tc}>
            <SectionHeader icon={Zap} title="Energenti" table="Tabela 8.2.2" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              <JDInput label="Električna energija" currency value={s.trosak_struja}
                onChange={v => setS({ ...s, trosak_struja: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
              <JDInput label="Voda" currency value={s.trosak_voda}
                onChange={v => setS({ ...s, trosak_voda: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
              <JDInput label="Ostali energenti" currency value={s.trosak_ostalaEn}
                onChange={v => setS({ ...s, trosak_ostalaEn: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
            </div>
            <div className="mt-5 flex justify-end">
              <LiveBadge label="Ukupno 8.2.2" value={fmtRSD(calc.trosak82_2)} tc={tc} />
            </div>
          </Card>

          {/* 8.2.3 – Usluge */}
          <Card tc={tc}>
            <SectionHeader icon={Settings} title="Usluge (održavanje i ostale)" table="Tabela 8.2.3" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              <JDInput label="Održavanje opreme i objekata" currency value={s.trosak_odrzavanje}
                onChange={v => setS({ ...s, trosak_odrzavanje: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
              <JDInput label="Ostale usluge (marketing, transport…)" currency value={s.trosak_ostaleUsl}
                onChange={v => setS({ ...s, trosak_ostaleUsl: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
            </div>
            <div className="mt-5 flex justify-end">
              <LiveBadge label="Ukupno 8.2.3" value={fmtRSD(calc.trosak82_3)} tc={tc} />
            </div>
          </Card>

          {/* 8.2.4 – Amortizacija */}
          <Card tc={tc}>
            <SectionHeader icon={Layers} title="Amortizacija" table="Tabela 8.2.4" tc={tc} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${tc.tableRowBorder}` }}>
                    <th style={thStyle} className="text-left">Naziv osnovnog sredstva</th>
                    <th style={{ ...thStyle, textAlign: "right", width: "160px" }}>Nabavna vrednost (RSD)</th>
                    <th style={{ ...thStyle, textAlign: "center", width: "100px" }}>Stopa (%)</th>
                    <th style={{ ...thStyle, textAlign: "right", width: "140px" }}>Godišnji iznos</th>
                    <th style={{ width: "36px" }} />
                  </tr>
                </thead>
                <tbody>
                  {s.amortizacija.map((a, idx) => {
                    const godisnji = a.nabavnaVrednost * a.stopaAmortizacije / 100;
                    return (
                      <tr key={a.id} style={{ borderBottom: `1px solid ${tc.tableRowBorder}`, background: idx % 2 === 0 ? `${tc.accent}05` : "transparent" }}>
                        <td className="px-3 py-3">
                          <input className="w-full bg-transparent text-sm font-medium focus:outline-none"
                            style={{ color: tc.tableCellText, fontFamily: FONT.sans }}
                            value={a.naziv} onChange={e => updAmort(a.id, "naziv", e.target.value)} placeholder="Naziv sredstva..." />
                        </td>
                        <td className="px-3 py-3">
                          <CurrencyCell
                            value={a.nabavnaVrednost}
                            onChange={v => updAmort(a.id, "nabavnaVrednost", v)}
                            className="w-full bg-transparent text-sm text-right font-semibold focus:outline-none"
                            style={{ color: tc.tableNumText, fontFamily: FONT.sans }} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input type="number" min={0} max={100} step={1} className="w-16 bg-transparent text-sm text-center font-bold focus:outline-none"
                            style={{ color: tc.highlight, fontFamily: FONT.sans }}
                            value={a.stopaAmortizacije} onChange={e => updAmort(a.id, "stopaAmortizacije", parseFloat(e.target.value) || 0)} />
                        </td>
                        <td className="px-3 py-3 text-right font-bold" style={{ color: tc.accent, fontFamily: FONT.sans }}>
                          {fmtRSD(godisnji)}
                        </td>
                        <td className="px-3 py-3"><RemoveBtn onClick={() => remAmort(a.id)} /></td>
                      </tr>
                    );
                  })}
                  {s.amortizacija.length > 0 && (
                    <tr style={{ borderTop: `2px solid ${tc.tableRowBorder}`, background: tc.accentBg }}>
                      <td colSpan={3} className="px-3 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>Ukupna godišnja amortizacija</td>
                      <td className="px-3 py-3 text-right font-black text-sm" style={{ color: tc.accent, fontFamily: FONT.sans }}>{fmtRSD(calc.trosak82_4)}</td>
                      <td />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <AddRowBtn onClick={addAmort} tc={tc} />
            <div className="mt-4 flex justify-end">
              <LiveBadge label="Ukupno 8.2.4" value={fmtRSD(calc.trosak82_4)} tc={tc} />
            </div>
          </Card>

          {/* 8.2.5 – Radna snaga */}
          <Card tc={tc}>
            <SectionHeader icon={Users} title="Troškovi radne snage" table="Tabela 8.2.5" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              <JDInput label="Broj zaposlenih" type="number" value={s.radnaSnaga_broj}
                onChange={v => setS({ ...s, radnaSnaga_broj: parseInt(v) || 0 })} tc={tc} />
              <JDInput label="Ukupni trošak radne snage (RSD/god.)" currency value={s.radnaSnaga_godisnjiTrosak}
                onChange={v => setS({ ...s, radnaSnaga_godisnjiTrosak: parseFloat(v) || 0 })}
                hint="Bruto plate + doprinosi, svih zaposlenih godišnje" placeholder="0" tc={tc} />
            </div>
            <div className="mt-5 flex justify-end">
              <LiveBadge label="Ukupno 8.2.5" value={fmtRSD(calc.trosak82_5)} tc={tc} />
            </div>
          </Card>

          {/* 8.2.6 – Ostali troškovi */}
          <Card tc={tc}>
            <SectionHeader icon={CreditCard} title="Ostali troškovi poslovanja" table="Tabela 8.2.6" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              <JDInput label="Bankarski troškovi" currency value={s.trosak_banka}
                onChange={v => setS({ ...s, trosak_banka: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
              <JDInput label="Osiguranje" currency value={s.trosak_osiguranje}
                onChange={v => setS({ ...s, trosak_osiguranje: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
              <JDInput label="Ostali nematerijalni troškovi" currency value={s.trosak_ostaliNemat}
                onChange={v => setS({ ...s, trosak_ostaliNemat: parseFloat(v) || 0 })} hint="RSD godišnje" placeholder="0" tc={tc} />
            </div>
            <div className="mt-5 flex justify-end">
              <LiveBadge label="Ukupno 8.2.6" value={fmtRSD(calc.trosak82_6)} tc={tc} />
            </div>
          </Card>

          {/* Grand total summary */}  
          
          <div
            className="rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              background: `linear-gradient(135deg, ${tc.accentBg}, ${tc.highlightBg})`,
              border: `1px solid ${tc.accentBorder}`,
            }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold mb-1" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>
                Ukupni rashodi (8.2.1 – 8.2.6)
              </p>
              <p className="text-3xl font-black" style={{ color: tc.accent, fontFamily: FONT.sans }}>
                {fmtRSD(calc.ukupniRashodi)}
              </p>
              <p className="text-xs mt-1" style={{ color: tc.textMuted, fontFamily: FONT.sans }}>godišnje, bez PDV</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right">
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>Prosečni prihod</p>
                <p className="text-lg font-black" style={{ color: tc.highlight, fontFamily: FONT.sans }}>{fmtRSD(calc.avgPrihod)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: tc.accentDim, fontFamily: FONT.sans }}>Ekonomičnost</p>
                <p className="text-lg font-black" style={{ color: calc.ekonomicnost >= 1 ? tc.accent : "#f87171", fontFamily: FONT.sans }}>
                  {calc.ekonomicnost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </StepWizard>
  );
}
