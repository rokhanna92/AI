import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, FileText, CheckCircle2, Download, ChevronRight, Calculator, Bot, FileCheck } from "lucide-react";

type Step = "select" | "form" | "loading" | "success";

type FormState = {
  brojKazana: number;
  cenaPoKazanu: number;
  sopstveniIzvori: number;
  tudjiIzvori: number;
  prodajnaCena: number;
  prodajaGodina1: number;
  prodajaGodina2: number;
  prodajaGodina3: number;
  prodajaGodina4: number;
  prodajaGodina5: number;
  sirovina: number;
  ambalaza: number;
  potrosniMaterijal: number;
  ostaliMaterijal: number;
  elektricnaEnergija: number;
  vodaIKanalizacija: number;
  internet: number;
  komunalniTroskovi: number;
  odrzavanjeOpreme: number;
  odrzavanjeObjekta: number;
  reklama: number;
  transport: number;
  proizvodneUsluge: number;
  radnaSnaga: number;
  bankarskeUsluge: number;
  administrativniTroskovi: number;
  konsultantskeUsluge: number;
  stopaAmortizacije: number;
  trzisteNapomene: string;
  planNapomene: string;
};

const TEMPLATES = [
  { id: "rakija", title: "Rakija od šljive", desc: "Aktivan demo obrazac" },
  { id: "template-2", title: "Template 2", desc: "Placeholder za sledeći poslovni plan" },
  { id: "template-3", title: "Template 3", desc: "Placeholder za budući model plana" },
];

const LOADING_STEPS = [
  "Računam tabele i finansijske pokazatelje...",
  "AI generiše opisni deo i tržišnu analizu...",
  "Pripremam dokumente za preuzimanje...",
];

const initialForm: FormState = {
  brojKazana: 2,
  cenaPoKazanu: 1425000,
  sopstveniIzvori: 50,
  tudjiIzvori: 50,
  prodajnaCena: 3000,
  prodajaGodina1: 7000,
  prodajaGodina2: 7800,
  prodajaGodina3: 7800,
  prodajaGodina4: 7800,
  prodajaGodina5: 7800,
  sirovina: 2100000,
  ambalaza: 760000,
  potrosniMaterijal: 180000,
  ostaliMaterijal: 95000,
  elektricnaEnergija: 240000,
  vodaIKanalizacija: 70000,
  internet: 60000,
  komunalniTroskovi: 85000,
  odrzavanjeOpreme: 160000,
  odrzavanjeObjekta: 120000,
  reklama: 220000,
  transport: 300000,
  proizvodneUsluge: 180000,
  radnaSnaga: 2160000,
  bankarskeUsluge: 90000,
  administrativniTroskovi: 140000,
  konsultantskeUsluge: 250000,
  stopaAmortizacije: 10,
  trzisteNapomene: "Prodaja kroz lokalne prodavnice, ugostiteljske objekte, sajmove hrane i direktno kupcima u regionu Vojvodine.",
  planNapomene: "Planirana je nabavka dva kazana, uređenje prostora za fermentaciju i postepeno brendiranje domaće rakije od šljive.",
};

const costFields: Array<{ key: keyof FormState; label: string }> = [
  { key: "sirovina", label: "Sirovina (šljiva)" },
  { key: "ambalaza", label: "Ambalaza (flaše, čepovi, etikete)" },
  { key: "potrosniMaterijal", label: "Potrošni materijal (kvasci, higijena)" },
  { key: "ostaliMaterijal", label: "Ostali materijal" },
  { key: "elektricnaEnergija", label: "Električna energija" },
  { key: "vodaIKanalizacija", label: "Voda i kanalizacija" },
  { key: "internet", label: "Internet i telekomunikacije" },
  { key: "komunalniTroskovi", label: "Ostali komunalni troškovi" },
  { key: "odrzavanjeOpreme", label: "Održavanje opreme" },
  { key: "odrzavanjeObjekta", label: "Održavanje objekta" },
  { key: "reklama", label: "Reklama i marketing" },
  { key: "transport", label: "Transport i distribucija" },
  { key: "proizvodneUsluge", label: "Ostale proizvodne usluge" },
  { key: "radnaSnaga", label: "Radna snaga (3 radnika)" },
  { key: "bankarskeUsluge", label: "Bankarske usluge i provizije" },
  { key: "administrativniTroskovi", label: "Administrativni troškovi" },
  { key: "konsultantskeUsluge", label: "Konsultantske usluge" },
];

const formatRsd = (value: number) => `${Math.round(value).toLocaleString("sr-RS")} RSD`;
const formatNumber = (value: number) => Math.round(value).toLocaleString("sr-RS");

function buildPlanText(form: FormState, totalInvestment: number, annualCosts: number, yearlyRevenue: number, amortization: number) {
  const ownFunds = totalInvestment * (form.sopstveniIzvori / 100);
  const borrowedFunds = totalInvestment * (form.tudjiIzvori / 100);
  const grossProfit = yearlyRevenue - annualCosts - amortization;
  const payback = grossProfit > 0 ? totalInvestment / grossProfit : 0;

  return `Poslovni Plan Generator - Za poljoprivrednike Vojvodine

PREGLED GENERISANOG SADRŽAJA

1. Rezime poslovnog plana
Ovaj poslovni plan prikazuje opravdanost ulaganja u proizvodnju rakije od šljive na porodičnom poljoprivrednom gazdinstvu u Vojvodini. Planirana investicija obuhvata nabavku ${form.brojKazana} kazana, prateće opreme i osnovnih uslova za stabilnu proizvodnju. Ukupna vrednost investicije iznosi ${formatRsd(totalInvestment)}, od čega sopstveni izvori učestvuju sa ${form.sopstveniIzvori}% (${formatRsd(ownFunds)}), a tuđi izvori sa ${form.tudjiIzvori}% (${formatRsd(borrowedFunds)}).

2. Analiza tržišta
Potražnja za kvalitetnim domaćim voćnim rakijama ostaje stabilna, posebno za proizvodima sa jasnim poreklom sirovine, kontrolisanim procesom proizvodnje i profesionalnom ambalažom. Planirani proizvod je namenjen kupcima koji prepoznaju vrednost lokalne proizvodnje, ugostiteljskim objektima, manjim prodavnicama domaće hrane i direktnoj prodaji na gazdinstvu. ${form.trzisteNapomene}

3. Proizvodnja i prodaja
Prodajna cena po litru planirana je na nivou od ${formatRsd(form.prodajnaCena)}. Obim prodaje predviđen je u petogodišnjem periodu: Godina I ${formatNumber(form.prodajaGodina1)} litara, Godina II ${formatNumber(form.prodajaGodina2)} litara, Godina III ${formatNumber(form.prodajaGodina3)} litara, Godina IV ${formatNumber(form.prodajaGodina4)} litara i Godina V ${formatNumber(form.prodajaGodina5)} litara. Očekivani prihod u prvoj godini iznosi ${formatRsd(yearlyRevenue)}.

4. Finansijski pokazatelji
Ukupni godišnji troškovi proizvodnje, rada, ambalaže, održavanja, marketinga, transporta i administracije procenjuju se na ${formatRsd(annualCosts)}. Godišnja amortizacija pri stopi od ${form.stopaAmortizacije}% iznosi ${formatRsd(amortization)}. Očekivani rezultat pre poreza u prvoj godini iznosi približno ${formatRsd(grossProfit)}. Procena roka povraćaja investicije je ${payback > 0 ? payback.toFixed(1) : "nije moguće izračunati"} godina.

5. Plan realizacije investicije
Realizacija investicije planirana je kroz nabavku kazana, pripremu prostora, probnu proizvodnju i organizaciju redovne prodaje. Posebna pažnja biće usmerena na kvalitet sirovine, higijenu proizvodnog procesa, pravilno skladištenje i standardizaciju proizvoda. ${form.planNapomene}

6. Očekivani efekti
Projekat doprinosi povećanju dodate vrednosti sopstvene šljive, stabilizaciji prihoda gazdinstva i stvaranju prepoznatljivog proizvoda za lokalno i regionalno tržište. Ulaganje omogućava bolju iskorišćenost postojećih resursa, povećanje konkurentnosti i dugoročnu održivost porodičnog poljoprivrednog gazdinstva.`;
}

function splitWrappedLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const result: string[] = [];
  text.split("\n").forEach((paragraph) => {
    if (!paragraph.trim()) {
      result.push("");
      return;
    }
    const words = paragraph.split(" ");
    let line = "";
    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      if (context.measureText(testLine).width > maxWidth && line) {
        result.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });
    if (line) result.push(line);
  });
  return result;
}

function binaryStringToBytes(value: string) {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) bytes[i] = value.charCodeAt(i) & 255;
  return bytes;
}

function asciiBytes(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function createPdfFromText(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.font = "30px Arial";
  const lines = splitWrappedLines(context, text, 1080);
  const pages: Uint8Array[] = [];
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#166534";
    context.font = "bold 36px Arial";
    context.fillText("Poslovni Plan Generator", 80, 85);
    context.fillStyle = "#854d0e";
    context.font = "24px Arial";
    context.fillText("Demo poslovni plan za proizvodnju rakije od šljive", 80, 125);
    context.strokeStyle = "#15803d";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(80, 150);
    context.lineTo(1160, 150);
    context.stroke();

    let y = 210;
    while (lineIndex < lines.length && y < 1630) {
      const line = lines[lineIndex];
      const isTitle = /^\d+\./.test(line) || line === "PREGLED GENERISANOG SADRŽAJA";
      context.font = isTitle ? "bold 30px Arial" : "26px Arial";
      context.fillStyle = isTitle ? "#15803d" : "#166534";
      if (line) context.fillText(line, 80, y);
      y += line ? 43 : 24;
      lineIndex += 1;
    }

    const image = canvas.toDataURL("image/jpeg", 0.95).split(",")[1];
    pages.push(binaryStringToBytes(atob(image)));
  }

  const parts: Uint8Array[] = [];
  const offsets: number[] = [0];
  let position = 0;
  const add = (part: Uint8Array) => {
    parts.push(part);
    position += part.length;
  };
  const addObject = (id: number, bodyParts: Uint8Array[]) => {
    offsets[id] = position;
    add(asciiBytes(`${id} 0 obj\n`));
    bodyParts.forEach(add);
    add(asciiBytes("\nendobj\n"));
  };

  add(asciiBytes("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"));
  const pageObjectIds = pages.map((_, index) => 3 + index * 3);
  const imageObjectIds = pages.map((_, index) => 4 + index * 3);
  const contentObjectIds = pages.map((_, index) => 5 + index * 3);
  const objectCount = 2 + pages.length * 3;

  addObject(1, [asciiBytes("<< /Type /Catalog /Pages 2 0 R >>")]);
  addObject(2, [asciiBytes(`<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`)]);

  pages.forEach((imageBytes, index) => {
    const pageId = pageObjectIds[index];
    const imageId = imageObjectIds[index];
    const contentId = contentObjectIds[index];
    const imageName = `Im${index + 1}`;
    const content = `q\n595 0 0 842 0 0 cm\n/${imageName} Do\nQ`;

    addObject(pageId, [asciiBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /${imageName} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`)]);
    addObject(imageId, [
      asciiBytes(`<< /Type /XObject /Subtype /Image /Width 1240 /Height 1754 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`),
      imageBytes,
      asciiBytes("\nendstream"),
    ]);
    addObject(contentId, [asciiBytes(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`)]);
  });

  const xrefOffset = position;
  add(asciiBytes(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`));
  for (let i = 1; i <= objectCount; i += 1) {
    add(asciiBytes(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`));
  }
  add(asciiBytes(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));
  return new Blob([concatBytes(parts)], { type: "application/pdf" });
}

export default function Home() {
  const [step, setStep] = useState<Step>("select");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  const totalInvestment = form.brojKazana * form.cenaPoKazanu;
  const annualCosts = costFields.reduce((sum, field) => sum + Number(form[field.key] || 0), 0);
  const firstYearRevenue = form.prodajaGodina1 * form.prodajnaCena;
  const amortization = totalInvestment * (form.stopaAmortizacije / 100);
  const generatedPlanText = useMemo(
    () => buildPlanText(form, totalInvestment, annualCosts, firstYearRevenue, amortization),
    [form, totalInvestment, annualCosts, firstYearRevenue, amortization],
  );

  useEffect(() => {
    if (step === "loading") {
      const timer1 = setTimeout(() => setLoadingIndex(1), 1500);
      const timer2 = setTimeout(() => setLoadingIndex(2), 3000);
      const timer3 = setTimeout(() => setStep("success"), 4500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  const updateNumber = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: Number(value) || 0 }));
  };

  const updateText = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleTemplateSelect = (id: string) => {
    if (id !== "rakija") {
      alert("Ovaj template je placeholder za demo verziju");
      return;
    }
    setSelectedTemplate(id);
    setStep("form");
  };

  const handleGenerate = (event: FormEvent) => {
    event.preventDefault();
    setStep("loading");
    setLoadingIndex(0);
  };

  const reset = () => {
    setStep("select");
    setSelectedTemplate(null);
  };

  const simulateDownload = () => {
    alert("Simulirano preuzimanje");
  };

  const downloadPdf = () => {
    const pdf = createPdfFromText(generatedPlanText);
    if (!pdf) {
      alert("PDF trenutno nije moguće generisati");
      return;
    }
    const url = URL.createObjectURL(pdf);
    const link = document.createElement("a");
    link.href = url;
    link.download = "poslovni-plan-rakija-od-sljive.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const numberInput = (key: keyof FormState, label: string, readOnly = false) => (
    <div className="space-y-2">
      <Label htmlFor={String(key)}>{label}</Label>
      <Input
        id={String(key)}
        type="number"
        value={readOnly ? totalInvestment : (form[key] as number)}
        onChange={(event) => updateNumber(key, event.target.value)}
        readOnly={readOnly}
        className="h-14 text-lg"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Poslovni Plan Generator - Za poljoprivrednike Vojvodine</h1>
            <p className="text-sm text-foreground/70">Jednostavan demo alat za pripremu poslovnog plana</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="border-accent/20 text-accent hover:bg-accent/10">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Podešavanja AI asistenta</DialogTitle>
                <DialogDescription>Unesite API ključ za kasnije povezivanje sa AI servisom.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="apiKey" className="mb-2 block">AI API ključ</Label>
                <Input id="apiKey" type="password" placeholder="sk-..." value={apiKey} onChange={(event) => setApiKey(event.target.value)} className="h-12 text-base" />
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} className="bg-primary text-primary-foreground hover:bg-primary/90">Sačuvaj</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {step === "select" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mb-4 text-4xl font-bold text-foreground">Odaberite template</h2>
              <p className="text-lg text-foreground/80">Izaberite obrazac za pripremu profesionalnog poslovnog plana za poljoprivredno gazdinstvo.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TEMPLATES.map((template) => (
                <Card key={template.id} className={`cursor-pointer bg-white shadow-sm transition-colors hover:shadow-md ${template.id === "rakija" ? "hover:border-primary/50" : "opacity-80 hover:border-accent/30"}`} onClick={() => handleTemplateSelect(template.id)}>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <FileText className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{template.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">{template.desc}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between text-accent hover:bg-accent/5">
                      {template.id === "rakija" ? "Započni" : "Uskoro"} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === "form" && (
          <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <Button variant="outline" onClick={reset} size="sm">Nazad</Button>
              <h2 className="text-2xl font-bold text-foreground">Unos podataka: {TEMPLATES.find((template) => template.id === selectedTemplate)?.title}</h2>
            </div>

            <form onSubmit={handleGenerate} className="space-y-8 rounded-xl border border-border bg-white p-8 shadow-sm">
              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Podaci o investiciji</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {numberInput("brojKazana", "Broj kazana")}
                  {numberInput("cenaPoKazanu", "Cena po kazanu sa PDV")}
                  {numberInput("brojKazana", "Ukupna vrednost investicije", true)}
                  {numberInput("sopstveniIzvori", "Sopstveni izvori %")}
                  {numberInput("tudjiIzvori", "Tuđi izvori %")}
                </div>
                <div className="rounded-lg bg-primary/5 p-4 text-lg font-semibold text-primary">Ukupna vrednost investicije: {formatRsd(totalInvestment)}</div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Proizvodnja i prodaja</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {numberInput("prodajnaCena", "Prodajna cena po litru (RSD)")}
                  {numberInput("prodajaGodina1", "Godina I - Obim prodaje (litara)")}
                  {numberInput("prodajaGodina2", "Godina II - Obim prodaje (litara)")}
                  {numberInput("prodajaGodina3", "Godina III - Obim prodaje (litara)")}
                  {numberInput("prodajaGodina4", "Godina IV - Obim prodaje (litara)")}
                  {numberInput("prodajaGodina5", "Godina V - Obim prodaje (litara)")}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Troškovi godišnje</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {costFields.map((field) => numberInput(field.key, field.label))}
                </div>
                <div className="rounded-lg bg-accent/5 p-4 text-lg font-semibold text-accent">Ukupni godišnji troškovi: {formatRsd(annualCosts)}</div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Amortizacija</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {numberInput("brojKazana", "Nabavna vrednost kazana", true)}
                  {numberInput("stopaAmortizacije", "Stopa amortizacije (%)")}
                </div>
                <div className="rounded-lg bg-primary/5 p-4 text-lg font-semibold text-primary">Godišnja amortizacija: {formatRsd(amortization)}</div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Tržišna analiza</h3>
                <div className="space-y-2">
                  <Label htmlFor="trzisteNapomene">Napomene za tržišnu analizu</Label>
                  <Textarea id="trzisteNapomene" value={form.trzisteNapomene} onChange={(event) => updateText("trzisteNapomene", event.target.value)} className="min-h-32 text-lg" />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Ostalo</h3>
                <div className="space-y-2">
                  <Label htmlFor="planNapomene">Napomene za plan</Label>
                  <Textarea id="planNapomene" value={form.planNapomene} onChange={(event) => updateText("planNapomene", event.target.value)} className="min-h-32 text-lg" />
                </div>
              </section>

              <div className="pt-6">
                <Button type="submit" className="w-full bg-primary py-6 text-lg text-primary-foreground shadow-sm hover:bg-primary/90">Generiši poslovni plan</Button>
              </div>
            </form>
          </div>
        )}

        {step === "loading" && (
          <div className="mx-auto max-w-lg py-24 text-center animate-in fade-in duration-500">
            <div className="relative mx-auto mb-8 h-24 w-24">
              <div className="absolute inset-0 animate-ping rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                {loadingIndex === 0 && <Calculator className="h-10 w-10 animate-pulse" />}
                {loadingIndex === 1 && <Bot className="h-10 w-10 animate-pulse" />}
                {loadingIndex === 2 && <FileCheck className="h-10 w-10 animate-pulse" />}
              </div>
            </div>
            <h2 className="mb-6 text-3xl font-bold text-foreground">{LOADING_STEPS[loadingIndex]}</h2>
            <div className="mt-8 flex justify-center gap-2">
              {[0, 1, 2].map((index) => (
                <div key={index} className={`h-2 rounded-full transition-all duration-500 ${index <= loadingIndex ? "w-8 bg-primary" : "w-2 bg-primary/20"}`} />
              ))}
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-foreground">Pregled generisanog sadržaja</h2>
              <p className="mb-8 text-lg text-foreground/80">Dokumenti su uspešno pripremljeni za demo preuzimanje.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={simulateDownload} className="h-14 min-w-[200px] bg-accent text-lg text-accent-foreground hover:bg-accent/90"><Download className="mr-2" /> Preuzmi Excel</Button>
                <Button size="lg" onClick={simulateDownload} className="h-14 min-w-[200px] bg-primary text-lg text-primary-foreground hover:bg-primary/90"><Download className="mr-2" /> Preuzmi Word</Button>
                <Button size="lg" onClick={downloadPdf} className="h-14 min-w-[200px] bg-primary text-lg text-primary-foreground hover:bg-primary/90"><Download className="mr-2" /> Preuzmi PDF</Button>
              </div>
            </div>

            <div className="mt-12 rounded-xl border border-border bg-white p-8 shadow-sm">
              <div className="space-y-6 font-serif leading-relaxed text-foreground/90">
                {generatedPlanText.split("\n\n").slice(2).map((section) => {
                  const [title, ...body] = section.split("\n");
                  return (
                    <div key={title}>
                      <h4 className="mb-2 text-lg font-bold text-primary">{title}</h4>
                      <p>{body.join(" ")}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 border-t border-border pt-8 text-center">
                <Button variant="ghost" onClick={reset} className="text-foreground/60 hover:text-foreground">Započni novi plan</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
