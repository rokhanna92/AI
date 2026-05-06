import { useState } from "react";
import { Cpu, Activity, TrendingUp, Zap, Shield, Target } from "lucide-react";
import type { GlobalProfile, ThemeConfig, Path2State, ProductRevenue } from "../../types";
import { PATH2_INIT, PATH2_STEPS, FONT } from "../../lib/constants";
import { calcPath2 } from "../../lib/math";
import { fmtRSD, formatNarrative } from "../../lib/formatters";
import { generatePath2PDF } from "../../lib/pdf";
import { StepWizard } from "./StepWizard";
import { Card } from "../shared/Card";
import { SectionHeader } from "../shared/SectionHeader";
import { JDInput } from "../shared/JDInput";
import { JDTextarea } from "../shared/JDTextarea";
import { LiveBadge } from "../shared/LiveBadge";
import { THead } from "../shared/THead";

interface Path2WizardProps {
  profile: GlobalProfile;
  onBack: () => void;
  tc: ThemeConfig;
}

export function Path2Wizard({ profile, onBack, tc }: Path2WizardProps) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Path2State>(PATH2_INIT);
  const calc = calcPath2(s);

  const updProd = (idx: number, k: keyof ProductRevenue, v: any) => {
    const n = [...s.products] as [ProductRevenue, ProductRevenue, ProductRevenue];
    // @ts-ignore
    n[idx][k] = v;
    setS({ ...s, products: n });
  };

  return (
    <StepWizard steps={PATH2_STEPS} currentStep={step} setCurrentStep={setStep} onBack={onBack} onFinish={() => generatePath2PDF(profile, s)} tc={tc}>

      {step === 0 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={Cpu} title="Opis i Analiza tržišta" table="Sekcija 3" tc={tc} />
            <div className="space-y-6">
              <JDTextarea label="3.1 Opis poslovne ideje" value={s.opisPoslovneIdeje} onChange={v => setS({ ...s, opisPoslovneIdeje: v })} hint="↳ Sistem automatski prevodi u stručni narativ" tc={tc} />
              {s.opisPoslovneIdeje && (
                <div
                  className="px-4 py-3 rounded-xl text-xs italic"
                  style={{
                    background: tc.narrativeBg,
                    border: `1px solid ${tc.narrativeBorder}`,
                    color: tc.narrativeText,
                    fontFamily: FONT.mono,
                    borderLeft: `3px solid ${tc.highlight}66`,
                  }}
                >
                  ▸ {formatNarrative(s.opisPoslovneIdeje)}
                </div>
              )}
              <JDTextarea label="3.2 Analiza prodajnog tržišta" value={s.analizaProdajnog} onChange={v => setS({ ...s, analizaProdajnog: v })} tc={tc} />
              <JDTextarea label="3.2 Analiza nabavnog tržišta" value={s.analizaNabavnog} onChange={v => setS({ ...s, analizaNabavnog: v })} tc={tc} />
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader icon={Activity} title="Ljudski resursi" table="Tabela 8.2.6" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              <JDInput label="Broj novozaposlenih radnika" type="number" value={s.workers} onChange={v => setS({ ...s, workers: parseInt(v) || 0 })} tc={tc} />
              <JDInput label="Prosečna bruto plata (RSD)" type="number" value={s.monthlyWage} onChange={v => setS({ ...s, monthlyWage: parseInt(v) || 0 })} tc={tc} />
            </div>
          </Card>
        </div>
      )}

      {step === 1 && (
        <Card tc={tc}>
          <SectionHeader icon={TrendingUp} title="Projekcija proizvodnje i prodaje" table="Tabela 8.1" tc={tc} />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <THead cols={["Proizvod", "J. cena", "G1 Kol", "G2 Kol", "G3 Kol", "G4 Kol", "G5 Kol"]} tc={tc} />
              <tbody>
                {s.products.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                    <td className="px-3 py-2">
                      <input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText, fontFamily: FONT.sans }} value={p.name} onChange={e => updProd(i, "name", e.target.value)} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" className="w-24 bg-transparent text-sm focus:outline-none font-bold" style={{ color: tc.highlight, fontFamily: FONT.mono }} value={p.unitPrice} onChange={e => updProd(i, "unitPrice", parseFloat(e.target.value) || 0)} />
                    </td>
                    {p.qty.map((q, qidx) => (
                      <td key={qidx} className="px-3 py-2">
                        <input type="number" className="w-24 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableNumText, fontFamily: FONT.mono }} value={q} onChange={e => {
                          const nq = [...p.qty]; nq[qidx] = parseFloat(e.target.value) || 0; updProd(i, "qty", nq);
                        }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {calc.revenueByYear.map((r, i) => (
              <LiveBadge key={i} label={`Prihod G${i + 1}`} value={fmtRSD(r)} hi={i === 4} tc={tc} />
            ))}
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={Zap} title="Materijalni i energetski troškovi" table="Tab. 8.2.1–8.2.2" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              <JDInput label="Seme i sadni materijal" type="number" value={s.materialCosts.seeds} onChange={v => setS({ ...s, materialCosts: { ...s.materialCosts, seeds: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Mineralno đubrivo" type="number" value={s.materialCosts.fertilizer} onChange={v => setS({ ...s, materialCosts: { ...s.materialCosts, fertilizer: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Sredstva za zaštitu" type="number" value={s.materialCosts.chemicals} onChange={v => setS({ ...s, materialCosts: { ...s.materialCosts, chemicals: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Gorivo i mazivo" type="number" value={s.energyCosts.fuel} onChange={v => setS({ ...s, energyCosts: { ...s.energyCosts, fuel: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Električna energija" type="number" value={s.energyCosts.electricity} onChange={v => setS({ ...s, energyCosts: { ...s.energyCosts, electricity: parseInt(v) || 0 } })} tc={tc} />
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader icon={Shield} title="Nematerijalni troškovi i investicija" table="Tab. 8.2.5" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
              <JDInput label="Osiguranje" type="number" value={s.nonMaterialCosts.insurance} onChange={v => setS({ ...s, nonMaterialCosts: { ...s.nonMaterialCosts, insurance: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Knjigovodstvo" type="number" value={s.nonMaterialCosts.accounting} onChange={v => setS({ ...s, nonMaterialCosts: { ...s.nonMaterialCosts, accounting: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Ukupna investicija (RSD)" type="number" value={s.totalInvestment} onChange={v => setS({ ...s, totalInvestment: parseInt(v) || 0 })} tc={tc} />
              <div className="flex items-end pb-2">
                <LiveBadge label="Ukupni rashodi" value={fmtRSD(calc.totalCosts)} hi tc={tc} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {step === 3 && (
        <Card tc={tc}>
          <SectionHeader icon={Target} title="Ekonomska efikasnost projekta" table="Tabela 9" tc={tc} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              className="p-6 rounded-2xl relative overflow-hidden"
              style={{
                background: tc.statPositiveBg,
                border: `1px solid ${calc.roi > 15 ? tc.accent + "80" : tc.cardBorder}`,
                boxShadow: calc.roi > 15 ? `0 0 30px ${tc.accent}14` : "none",
              }}
            >
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: tc.accentDimmer, fontFamily: FONT.mono }}>
                Rentabilnost (ROI)
              </div>
              <div
                className="text-4xl font-black mb-2"
                style={{ color: calc.roi > 15 ? tc.accent : tc.textSecondary, fontFamily: FONT.mono, textShadow: calc.roi > 15 ? `0 0 20px ${tc.accent}66` : "none" }}
              >
                {calc.roi.toFixed(1)}%
              </div>
              <div className="text-[10px]" style={{ color: tc.statMutedText, fontFamily: FONT.sans }}>Prag rentabilnosti za agro-sektor: 10–12%</div>
            </div>

            <div
              className="p-6 rounded-2xl relative overflow-hidden"
              style={{
                background: calc.economicity > 1 ? tc.statPositiveBg : tc.statNegativeBg,
                border: `1px solid ${calc.economicity > 1 ? tc.accent + "80" : "rgba(239,68,68,0.4)"}`,
                boxShadow: calc.economicity > 1 ? `0 0 30px ${tc.accent}14` : "0 0 30px rgba(239,68,68,0.08)",
              }}
            >
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: tc.accentDimmer, fontFamily: FONT.mono }}>
                Ekonomičnost
              </div>
              <div
                className="text-4xl font-black mb-2"
                style={{ color: calc.economicity > 1 ? tc.accent : "#f87171", fontFamily: FONT.mono }}
              >
                {calc.economicity.toFixed(2)}
              </div>
              <div className="text-[10px]" style={{ color: tc.statMutedText, fontFamily: FONT.sans }}>Mora biti veća od 1.00 za pozitivan rad</div>
            </div>

            <div
              className="p-6 rounded-2xl"
              style={{ background: tc.highlightBg, border: `1px solid ${tc.highlightBorder}` }}
            >
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: tc.highlightDim, fontFamily: FONT.mono }}>
                Povraćaj ulaganja
              </div>
              <div
                className="text-4xl font-black mb-2"
                style={{ color: tc.highlight, fontFamily: FONT.mono, textShadow: `0 0 20px ${tc.highlight}4d` }}
              >
                {calc.payback.toFixed(1)}
                <span className="text-lg ml-1" style={{ color: tc.highlightDim }}>god.</span>
              </div>
              <div className="text-[10px]" style={{ color: tc.statMutedText, fontFamily: FONT.sans }}>Vreme potrebno da se vrati osnovni kapital</div>
            </div>
          </div>
        </Card>
      )}
    </StepWizard>
  );
}
