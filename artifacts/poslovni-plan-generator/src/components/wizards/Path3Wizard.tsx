import { useState } from "react";
import { MapPin, Droplets, BarChart3 } from "lucide-react";
import type { GlobalProfile, ThemeConfig, Path3State } from "../../types";
import { PATH3_INIT, PATH3_STEPS, FONT } from "../../lib/constants";
import { calcPath3 } from "../../lib/math";
import { fmtRSD } from "../../lib/formatters";
import { generatePath3PDF } from "../../lib/pdf";
import { StepWizard } from "./StepWizard";
import { Card } from "../shared/Card";
import { SectionHeader } from "../shared/SectionHeader";
import { JDInput } from "../shared/JDInput";
import { JDTextarea } from "../shared/JDTextarea";
import { LiveBadge } from "../shared/LiveBadge";
import { THead } from "../shared/THead";
import { AddRowBtn } from "../shared/AddRowBtn";
import { RemoveBtn } from "../shared/RemoveBtn";

interface Path3WizardProps {
  profile: GlobalProfile;
  onBack: () => void;
  tc: ThemeConfig;
}

export function Path3Wizard({ profile, onBack, tc }: Path3WizardProps) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Path3State>(PATH3_INIT);
  const calc = calcPath3(s);

  const addItem = () => setS({ ...s, items: [...s.items, { id: Math.random().toString(), name: "", unit: "kom", qty: 1, price: 0 }] });
  const remItem = (id: string) => setS({ ...s, items: s.items.filter(i => i.id !== id) });

  const updItem = (id: string, key: string, val: any) => {
    const n = [...s.items];
    (n.find(x => x.id === id) as any)[key] = val;
    setS({ ...s, items: n });
  };

  return (
    <StepWizard steps={PATH3_STEPS} currentStep={step} setCurrentStep={setStep} onBack={onBack} onFinish={() => generatePath3PDF(profile, s)} tc={tc}>

      {step === 0 && (
        <Card tc={tc}>
          <SectionHeader icon={MapPin} title="Tehnički podaci lokacije" table="Tabela 1.2" tc={tc} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
            <JDInput label="Katastarska opština" value={s.katMunicipality} onChange={v => setS({ ...s, katMunicipality: v })} tc={tc} />
            <JDInput label="Površina pod sistemom (ha)" type="number" value={s.hectares} onChange={v => setS({ ...s, hectares: parseFloat(v) || 0 })} tc={tc} />
            <JDInput label="Postojeće pumpe/agregati" value={s.existingPumps} onChange={v => setS({ ...s, existingPumps: v })} tc={tc} />
            <JDInput label="Postojeći traktori" value={s.existingTractors} onChange={v => setS({ ...s, existingTractors: v })} tc={tc} />
            <JDTextarea label="Ostala oprema i alati" value={s.existingTools} onChange={v => setS({ ...s, existingTools: v })} tc={tc} />
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card tc={tc}>
          <SectionHeader icon={Droplets} title="Specifikacija investicije" table="Tabela 3.3" tc={tc} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Stavka / Komponenta", "JM", "Kol", "Cena (RSD)", "Ukupno", ""]} tc={tc} />
              <tbody>
                {s.items.map(i => (
                  <tr key={i.id} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                    <td className="px-3 py-2"><input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText, fontFamily: FONT.sans }} value={i.name} onChange={e => updItem(i.id, "name", e.target.value)} /></td>
                    <td className="px-3 py-2"><input className="w-24 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText, fontFamily: FONT.sans }} value={i.unit} onChange={e => updItem(i.id, "unit", e.target.value)} /></td>
                    <td className="px-3 py-2"><input type="number" className="w-20 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableNumText, fontFamily: FONT.mono }} value={i.qty} onChange={e => updItem(i.id, "qty", parseFloat(e.target.value) || 0)} /></td>
                    <td className="px-3 py-2"><input type="number" className="w-32 bg-transparent text-sm focus:outline-none font-bold" style={{ color: tc.tableNumText, fontFamily: FONT.mono }} value={i.price} onChange={e => updItem(i.id, "price", parseInt(e.target.value) || 0)} /></td>
                    <td className="px-3 py-2 font-bold text-right" style={{ color: tc.accent, fontFamily: FONT.mono }}>{fmtRSD(i.price * i.qty)}</td>
                    <td className="px-3 py-2"><RemoveBtn onClick={() => remItem(i.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddRowBtn onClick={addItem} tc={tc} />
          <div className="mt-8 flex justify-end">
            <LiveBadge label="Ukupna investicija" value={fmtRSD(calc.totalInv)} hi tc={tc} />
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={BarChart3} title="Efikasnost investicije" table="Tabela 5.3" tc={tc} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: tc.accentDim, fontFamily: FONT.mono }}>
                  Projektovani prihodi / rashodi
                </p>
                {s.revenueYears.map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <JDInput
                      label={`G${i + 1} Prih`}
                      type="number"
                      value={s.revenueYears[i]}
                      onChange={v => {
                        const n = [...s.revenueYears] as [number, number, number, number, number];
                        n[i] = parseInt(v) || 0;
                        setS({ ...s, revenueYears: n });
                      }}
                      tc={tc}
                    />
                    <JDInput
                      label={`G${i + 1} Rash`}
                      type="number"
                      value={s.expenseYears[i]}
                      onChange={v => {
                        const n = [...s.expenseYears] as [number, number, number, number, number];
                        n[i] = parseInt(v) || 0;
                        setS({ ...s, expenseYears: n });
                      }}
                      tc={tc}
                    />
                  </div>
                ))}
              </div>

              <div
                className="flex flex-col items-center justify-center rounded-2xl p-8"
                style={{
                  background: calc.avgCoeff > 1 ? tc.statPositiveBg : tc.statNegativeBg,
                  border: `1px solid ${calc.avgCoeff > 1 ? tc.accent + "66" : "rgba(239,68,68,0.4)"}`,
                  boxShadow: calc.avgCoeff > 1 ? `0 0 40px ${tc.accent}0f` : "0 0 40px rgba(239,68,68,0.06)",
                }}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: tc.accentDim, fontFamily: FONT.mono }}>
                  Prosečan koef. efikasnosti
                </span>
                <span
                  className="text-6xl font-black"
                  style={{
                    color: calc.avgCoeff > 1 ? tc.accent : "#f87171",
                    fontFamily: FONT.mono,
                    textShadow: calc.avgCoeff > 1 ? `0 0 30px ${tc.accent}80` : "0 0 30px rgba(248,113,113,0.4)",
                  }}
                >
                  {calc.avgCoeff.toFixed(3)}
                </span>
                <p className="mt-4 text-xs text-center max-w-[200px]" style={{ color: tc.statMutedText, fontFamily: FONT.sans }}>
                  {calc.avgCoeff > 1
                    ? "✓ Investicija generiše više prihoda nego što košta."
                    : "✗ Prihodi ne pokrivaju troškove investicije."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </StepWizard>
  );
}
