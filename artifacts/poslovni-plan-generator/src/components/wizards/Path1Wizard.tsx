import { useState } from "react";
import { MapPin, Activity, Building2, Layers, Wrench, Shield, TrendingUp } from "lucide-react";
import type { GlobalProfile, ThemeConfig, Path1State } from "../../types";
import { PATH1_INIT, PATH1_STEPS, FONT } from "../../lib/constants";
import { calcPath1 } from "../../lib/math";
import { fmtRSD } from "../../lib/formatters";
import { generatePath1PDF } from "../../lib/pdf";
import { StepWizard } from "./StepWizard";
import { Card } from "../shared/Card";
import { SectionHeader } from "../shared/SectionHeader";
import { JDInput } from "../shared/JDInput";
import { LiveBadge } from "../shared/LiveBadge";
import { THead } from "../shared/THead";
import { AddRowBtn } from "../shared/AddRowBtn";
import { RemoveBtn } from "../shared/RemoveBtn";
import { GlassSelect } from "../shared/GlassSelect";

interface Path1WizardProps {
  profile: GlobalProfile;
  onBack: () => void;
  tc: ThemeConfig;
}

export function Path1Wizard({ profile, onBack, tc }: Path1WizardProps) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Path1State>(PATH1_INIT);
  const calc = calcPath1(s);

  const addParcel = () => setS({ ...s, parcels: [...s.parcels, { id: Math.random().toString(), katMunicipality: "", parcelNumber: "", area: 0, ownership: "Sopstveno", crop: "" }] });
  const remParcel = (id: string) => setS({ ...s, parcels: s.parcels.filter(p => p.id !== id) });
  const addInv = () => setS({ ...s, investmentItems: [...s.investmentItems, { id: Math.random().toString(), name: "", unit: "kom", qty: 1, priceNet: 0 }] });
  const remInv = (id: string) => setS({ ...s, investmentItems: s.investmentItems.filter(i => i.id !== id) });

  const updParcel = (id: string, key: string, val: any) => {
    const n = [...s.parcels];
    (n.find(x => x.id === id) as any)[key] = val;
    setS({ ...s, parcels: n });
  };

  const updInv = (id: string, key: string, val: any) => {
    const n = [...s.investmentItems];
    (n.find(x => x.id === id) as any)[key] = val;
    setS({ ...s, investmentItems: n });
  };

  return (
    <StepWizard steps={PATH1_STEPS} currentStep={step} setCurrentStep={setStep} onBack={onBack} onFinish={() => generatePath1PDF(profile, s)} tc={tc}>

      {step === 0 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={MapPin} title="Zemljišni fond" table="Tabela 1.1" tc={tc} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <THead cols={["K.O.", "Br. parcele", "Površina (ha)", "Vlasništvo", "Kultura", ""]} tc={tc} />
                <tbody>
                  {s.parcels.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                      <td className="px-3 py-1.5">
                        <input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText, fontFamily: FONT.sans }} value={p.katMunicipality} onChange={e => updParcel(p.id, "katMunicipality", e.target.value)} />
                      </td>
                      <td className="px-3 py-1.5">
                        <input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText, fontFamily: FONT.sans }} value={p.parcelNumber} onChange={e => updParcel(p.id, "parcelNumber", e.target.value)} />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" className="w-20 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableNumText, fontFamily: FONT.mono }} value={p.area} onChange={e => updParcel(p.id, "area", parseFloat(e.target.value) || 0)} />
                      </td>
                      <td className="px-3 py-1.5">
                        <GlassSelect value={p.ownership} onChange={v => updParcel(p.id, "ownership", v)} options={["Sopstveno", "Zakup"]} tc={tc} />
                      </td>
                      <td className="px-3 py-1.5">
                        <input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText, fontFamily: FONT.sans }} value={p.crop} onChange={e => updParcel(p.id, "crop", e.target.value)} />
                      </td>
                      <td className="px-3 py-1.5"><RemoveBtn onClick={() => remParcel(p.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AddRowBtn onClick={addParcel} tc={tc} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card tc={tc}>
              <SectionHeader icon={Activity} title="Stočni fond" table="Tabela 1.2" tc={tc} />
              <div className="space-y-4">
                {s.livestock.map(l => (
                  <div key={l.id} className="grid grid-cols-3 gap-4">
                    <JDInput label="Vrsta" value={l.name} onChange={v => { const n = [...s.livestock]; n.find(x => x.id === l.id)!.name = v; setS({ ...s, livestock: n }); }} tc={tc} />
                    <JDInput label="Grla" type="number" value={l.qty} onChange={v => { const n = [...s.livestock]; n.find(x => x.id === l.id)!.qty = parseInt(v) || 0; setS({ ...s, livestock: n }); }} tc={tc} />
                    <JDInput label="Vrednost/grlu" type="number" value={l.valuePerHead} onChange={v => { const n = [...s.livestock]; n.find(x => x.id === l.id)!.valuePerHead = parseInt(v) || 0; setS({ ...s, livestock: n }); }} tc={tc} />
                  </div>
                ))}
              </div>
            </Card>

            <Card tc={tc}>
              <SectionHeader icon={Building2} title="Objekti i mehanizacija" table="Tab. 1.3–1.4" tc={tc} />
              <div className="space-y-3">
                {s.buildings.map(b => (
                  <div key={b.id} className="grid grid-cols-2 gap-4">
                    <JDInput label="Naziv objekta" value={b.name} onChange={v => { const n = [...s.buildings]; n.find(x => x.id === b.id)!.name = v; setS({ ...s, buildings: n }); }} tc={tc} />
                    <JDInput label="Vrednost (RSD)" type="number" value={b.value} onChange={v => { const n = [...s.buildings]; n.find(x => x.id === b.id)!.value = parseInt(v) || 0; setS({ ...s, buildings: n }); }} tc={tc} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {step === 1 && (
        <Card tc={tc}>
          <SectionHeader icon={Layers} title="Vrednost osnovnih sredstava" table="Tabela 1.5" tc={tc} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-5">
              <JDInput label="Vrednost zemljišta (RSD)" type="number" value={s.landValue} onChange={v => setS({ ...s, landValue: parseInt(v) || 0 })} tc={tc} />
              <JDInput label="Vrednost objekata (RSD)" type="number" value={s.buildingValue} onChange={v => setS({ ...s, buildingValue: parseInt(v) || 0 })} tc={tc} />
              <JDInput label="Vrednost stočnog fonda (RSD)" type="number" value={s.livestockValue} onChange={v => setS({ ...s, livestockValue: parseInt(v) || 0 })} tc={tc} />
              <JDInput label="Vrednost mehanizacije (RSD)" type="number" value={s.equipmentValue} onChange={v => setS({ ...s, equipmentValue: parseInt(v) || 0 })} tc={tc} />
            </div>
            <div className="flex items-center justify-center">
              <div
                className="text-center p-8 rounded-2xl w-full"
                style={{ border: `1px solid ${tc.accentBorder}`, boxShadow: `0 0 20px ${tc.accent}1a` }}
              >
                <div className="text-[10px] uppercase tracking-[0.25em] mb-2 font-bold" style={{ color: tc.accentDim, fontFamily: FONT.mono }}>
                  Ukupna aktiva
                </div>
                <div className="text-3xl font-black" style={{ color: tc.accent, fontFamily: FONT.mono, textShadow: `0 0 .1px ${tc.accent}66` }}>
                  {fmtRSD(calc.totalAssets)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card tc={tc}>
          <SectionHeader icon={Wrench} title="Nova ulaganja — Specifikacija" table="Tabela 3.2" tc={tc} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Naziv stavke", "JM", "Kol", "Cena Neto (RSD)", "Ukupno Neto (RSD)", ""]} tc={tc} />
              <tbody>
                {s.investmentItems.map(i => (
                  <tr key={i.id} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                    <td className="px-3 py-2"><input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText, fontFamily: FONT.sans }} value={i.name} onChange={e => updInv(i.id, "name", e.target.value)} /></td>
                    <td className="px-3 py-2"><input className="w-20 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText, fontFamily: FONT.sans }} value={i.unit} onChange={e => updInv(i.id, "unit", e.target.value)} /></td>
                    <td className="px-3 py-2"><input type="number" className="w-16 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableNumText, fontFamily: FONT.mono }} value={i.qty} onChange={e => updInv(i.id, "qty", parseFloat(e.target.value) || 0)} /></td>
                    <td className="px-3 py-2"><input type="number" className="w-32 bg-transparent text-sm focus:outline-none font-bold" style={{ color: tc.tableNumText, fontFamily: FONT.mono }} value={i.priceNet} onChange={e => updInv(i.id, "priceNet", parseInt(e.target.value) || 0)} /></td>
                    <td className="px-3 py-2 font-bold text-right" style={{ color: tc.accent, fontFamily: FONT.mono }}>{fmtRSD(i.priceNet * i.qty)}</td>
                    <td className="px-3 py-2"><RemoveBtn onClick={() => remInv(i.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddRowBtn onClick={addInv} tc={tc} />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveBadge label="Ukupna investicija (Neto)" value={fmtRSD(calc.totalInvNet)} hi tc={tc} />
            <LiveBadge label="Ukupna investicija (Sa PDV)" value={fmtRSD(calc.totalInvGross)} tc={tc} />
          </div>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={Shield} title="Izvori finansiranja" table="Tabela 3.3" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              <JDInput label="Sopstvena sredstva (RSD)" type="number" value={s.ownFunds} onChange={v => setS({ ...s, ownFunds: parseInt(v) || 0 })} hint="Iznos koji gazdinstvo obezbeđuje iz gotovine" tc={tc} />
              <div className="space-y-4 pt-5">
                <div className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${tc.financeLineBorder}` }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: tc.financeLineText, fontFamily: FONT.mono }}>IPARD Podsticaj (50%):</span>
                  <span className="font-bold text-sm" style={{ color: tc.tableNumText, fontFamily: FONT.mono }}>{fmtRSD(calc.grants)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs uppercase tracking-widest" style={{ color: tc.financeLineText, fontFamily: FONT.mono }}>Potreban kredit:</span>
                  <span className="font-bold text-sm" style={{ color: calc.loan > 0 ? "#f87171" : tc.accent, fontFamily: FONT.mono }}>{fmtRSD(Math.max(0, calc.loan))}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card tc={tc}>
            <SectionHeader icon={TrendingUp} title="Projekcija prihoda" table="Tabela 5.1" tc={tc} />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {s.revenueYears.map((rev, i) => (
                <JDInput key={i} label={`Godina ${i + 1}`} type="number" value={rev} onChange={v => {
                  const n = [...s.revenueYears] as [number, number, number, number, number];
                  n[i] = parseInt(v) || 0;
                  setS({ ...s, revenueYears: n });
                }} tc={tc} />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-5 gap-3">
              {calc.profits.map((p, i) => (
                <LiveBadge key={i} label={`G${i + 1} dobit`} value={fmtRSD(p.net)} hi={i === 4} tc={tc} />
              ))}
            </div>
          </Card>
        </div>
      )}
    </StepWizard>
  );
}
