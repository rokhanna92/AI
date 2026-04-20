import { useEffect, useMemo, useState, type FormEvent } from "react";
import { jsPDF } from "jspdf";
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
  "Generišem profesionalni opisni deo...",
  "Pripremam Excel, Word i PDF dokumente...",
];

const initialForm: FormState = {
  brojKazana: 2,
  cenaPoKazanu: 3029108,
  sopstveniIzvori: 50,
  tudjiIzvori: 50,
  prodajnaCena: 3000,
  prodajaGodina1: 7000,
  prodajaGodina2: 7800,
  prodajaGodina3: 7800,
  prodajaGodina4: 7800,
  prodajaGodina5: 7800,
  sirovina: 5100000,
  ambalaza: 1560000,
  potrosniMaterijal: 320000,
  ostaliMaterijal: 180000,
  elektricnaEnergija: 420000,
  vodaIKanalizacija: 96000,
  internet: 72000,
  komunalniTroskovi: 110000,
  odrzavanjeOpreme: 260000,
  odrzavanjeObjekta: 180000,
  reklama: 360000,
  transport: 540000,
  proizvodneUsluge: 280000,
  radnaSnaga: 3240000,
  bankarskeUsluge: 120000,
  administrativniTroskovi: 210000,
  konsultantskeUsluge: 300000,
  stopaAmortizacije: 10,
  trzisteNapomene: "Kupci su lokalne prodavnice, restorani, ugostiteljski objekti, specijalizovane radnje domaće hrane i krajnji kupci koji traže kvalitetnu rakiju poznatog porekla. Planira se postepen ulazak u prodajne kanale u Vojvodini i Beogradu.",
  planNapomene: "Investicija obuhvata dva kazana, prateću opremu, pripremu prostora, standardizaciju procesa i osnovno brendiranje proizvoda. Plan je da se proizvodnja vodi kontrolisano, uz jasno označeno poreklo šljive i stabilan kvalitet gotovog proizvoda.",
};

const costFields: Array<{ key: keyof FormState; label: string }> = [
  { key: "sirovina", label: "Sirovina (šljiva)" },
  { key: "ambalaza", label: "Ambalaza" },
  { key: "potrosniMaterijal", label: "Potrošni materijal" },
  { key: "ostaliMaterijal", label: "Ostali materijal" },
  { key: "elektricnaEnergija", label: "Električna energija" },
  { key: "vodaIKanalizacija", label: "Voda i kanalizacija" },
  { key: "internet", label: "Internet i telekomunikacije" },
  { key: "komunalniTroskovi", label: "Ostali komunalni" },
  { key: "odrzavanjeOpreme", label: "Održavanje opreme" },
  { key: "odrzavanjeObjekta", label: "Održavanje objekta" },
  { key: "reklama", label: "Reklama i marketing" },
  { key: "transport", label: "Transport i distribucija" },
  { key: "proizvodneUsluge", label: "Ostale usluge" },
  { key: "radnaSnaga", label: "Radna snaga (3 radnika)" },
  { key: "bankarskeUsluge", label: "Bankarske usluge" },
  { key: "administrativniTroskovi", label: "Administrativni troškovi" },
  { key: "konsultantskeUsluge", label: "Konsultantske usluge" },
];

const formatRsd = (value: number) => `${Math.round(value).toLocaleString("sr-RS")} RSD`;
const formatNumber = (value: number) => Math.round(value).toLocaleString("sr-RS");

function buildPlanText(form: FormState, totalInvestment: number, annualCosts: number, yearlyRevenue: number, amortization: number) {
  const ownFunds = totalInvestment * (form.sopstveniIzvori / 100);
  const borrowedFunds = totalInvestment * (form.tudjiIzvori / 100);
  const grossProfit = yearlyRevenue - annualCosts - amortization;
  const fiveYearSales = form.prodajaGodina1 + form.prodajaGodina2 + form.prodajaGodina3 + form.prodajaGodina4 + form.prodajaGodina5;
  const fiveYearRevenue = fiveYearSales * form.prodajnaCena;
  const payback = grossProfit > 0 ? totalInvestment / grossProfit : 0;

  return `Poslovni Plan Generator - Za poljoprivrednike Vojvodine

PREGLED GENERISANOG SADRŽAJA

1. Rezime poslovnog plana
Predmet ovog poslovnog plana je procena ekonomske opravdanosti ulaganja u proizvodnju rakije od šljive na porodičnom poljoprivrednom gazdinstvu u Vojvodini. Projekat se zasniva na nabavci ${form.brojKazana} kazana za destilaciju i organizovanju stabilnog procesa prerade kvalitetne šljive u finalni proizvod više dodate vrednosti. Ukupna vrednost investicije iznosi ${formatRsd(totalInvestment)}, što obuhvata osnovnu proizvodnu opremu, prateće elemente procesa, pripremu prostora i troškove pokretanja proizvodnje.

Planirani model finansiranja predviđa učešće sopstvenih sredstava od ${form.sopstveniIzvori}% ili ${formatRsd(ownFunds)}, dok se preostali deo od ${form.tudjiIzvori}% ili ${formatRsd(borrowedFunds)} finansira iz tuđih izvora. U prvoj godini planirana je prodaja ${formatNumber(form.prodajaGodina1)} litara, dok se od druge godine očekuje stabilizacija na nivou od ${formatNumber(form.prodajaGodina2)} litara godišnje. Prodajna cena je projektovana na ${formatRsd(form.prodajnaCena)} po litru, što stvara osnov za pozitivne finansijske efekte i održiv razvoj gazdinstva.

2. Osnovni podaci
Gazdinstvo posluje u sektoru prerade voća i proizvodnje alkoholnih pića tradicionalnog karaktera. Osnovna delatnost projekta jeste proizvodnja rakije od šljive namenjene domaćem tržištu, sa naglaskom na kontrolisano poreklo sirovine, standardizovan kvalitet i profesionalno pakovanje. Projekat je koncipiran kao realan razvojni korak za poljoprivredno gazdinstvo koje želi da poveća vrednost primarne proizvodnje i smanji zavisnost od prodaje sirovog voća.

Lokacija proizvodnje nalazi se u poljoprivrednom području pogodnom za nabavku šljive i angažovanje lokalne radne snage. Prednost ovakve lokacije ogleda se u dostupnosti sirovine, nižim logističkim troškovima, poznavanju lokalnog tržišta i mogućnosti direktne saradnje sa voćarima. Planirano je da se proizvodnja razvija postepeno, uz poštovanje svih zakonskih i sanitarnih uslova relevantnih za ovu vrstu delatnosti.

3. Opis sadašnjeg stanja
U postojećem stanju gazdinstvo raspolaže osnovnim iskustvom u poljoprivrednoj proizvodnji i pristupom sirovinskoj bazi, ali nema dovoljno savremene opreme za ozbiljniju i tržišno konkurentnu proizvodnju rakije. Prodaja sirove šljive često zavisi od sezonskih cena i otkupnih uslova, što ograničava mogućnost stabilnog planiranja prihoda. Zbog toga se ulaganje u preradu posmatra kao način da se poveća dodata vrednost proizvoda i obezbedi veća kontrola nad plasmanom.

Postojeće stanje karakteriše potreba za jasnijom organizacijom procesa, definisanjem troškova, unapređenjem kapaciteta i uspostavljanjem profesionalnijeg nastupa prema tržištu. Nabavkom kazana i prateće opreme gazdinstvo dobija osnov za organizovanu proizvodnju, bolju iskorišćenost sirovine i stvaranje proizvoda koji se može prodavati pod sopstvenim identitetom.

4. Podaci o investiciji
Investicija obuhvata nabavku ${form.brojKazana} kazana po ceni od ${formatRsd(form.cenaPoKazanu)} sa PDV-om, odnosno ukupnu vrednost nabavke od ${formatRsd(totalInvestment)}. Nabavna vrednost kazana koristi se kao osnovica za obračun amortizacije, a planirana stopa amortizacije iznosi ${form.stopaAmortizacije}% godišnje. Godišnji iznos amortizacije procenjen je na ${formatRsd(amortization)}, što je uključeno u ukupnu ocenu finansijskih efekata.

Investicija je usmerena na povećanje proizvodnog kapaciteta, unapređenje kvaliteta i stvaranje uslova za redovan plasman proizvoda. Nabavka opreme predstavlja ključni preduslov za stabilan proces destilacije, bolju kontrolu kvaliteta i ponovljivost proizvodnje iz godine u godinu. Očekuje se da će oprema biti korišćena u dužem periodu, uz redovno održavanje i plansko korišćenje kapaciteta.

5. Potrebna radna snaga
Za realizaciju projekta predviđeno je angažovanje tri radnika u okviru proizvodnog procesa. Radna snaga je potrebna za prijem i pripremu sirovine, kontrolu fermentacije, destilaciju, skladištenje, pakovanje i osnovne aktivnosti distribucije. Godišnji trošak radne snage procenjen je na ${formatRsd(form.radnaSnaga)}, što uključuje planirani nivo angažovanja potreban za redovno funkcionisanje proizvodnje.

Pored direktnog rada u proizvodnji, deo aktivnosti odnosi se na administraciju, komunikaciju sa kupcima, pripremu dokumentacije i praćenje prodaje. U početnoj fazi očekuje se veće angažovanje nosioca gazdinstva u organizaciji i nadzoru procesa, dok se u kasnijim godinama može planirati jasnija podela zaduženja i dodatna obuka zaposlenih.

6. Distribucija i promocija
Prodaja će se organizovati kroz više kanala kako bi se smanjio rizik zavisnosti od jednog kupca ili jednog tržišnog pravca. Planirani kanali prodaje obuhvataju direktnu prodaju na gazdinstvu, saradnju sa lokalnim prodavnicama, ugostiteljskim objektima, specijalizovanim radnjama domaće hrane i nastup na sajmovima. Poseban značaj ima izgradnja poverenja kod kupaca kroz stabilan kvalitet, jasnu deklaraciju i dosledan vizuelni identitet proizvoda.

Promotivne aktivnosti uključuju izradu etikete, osnovni vizuelni identitet, prisustvo na lokalnim manifestacijama, preporuke postojećih kupaca i ciljanu komunikaciju sa ugostiteljima. Godišnji trošak reklame i marketinga projektovan je na ${formatRsd(form.reklama)}, dok je za transport i distribuciju predviđeno ${formatRsd(form.transport)}. ${form.trzisteNapomene}

7. Očekivani efekti
Očekivani efekti investicije ogledaju se u rastu prihoda gazdinstva, većoj dodatoj vrednosti primarne proizvodnje i stabilnijem poslovanju u odnosu na prodaju sirovine. Projekat omogućava da se deo poljoprivredne proizvodnje pretvori u finalni proizvod sa prepoznatljivim poreklom i višom tržišnom vrednošću. Time se povećava otpornost gazdinstva na promene otkupnih cena i sezonske poremećaje.

Pored finansijskih efekata, investicija doprinosi očuvanju lokalne proizvodnje, angažovanju radne snage i razvoju ruralne ekonomije. Proizvodnja rakije od šljive ima snažan tradicionalni karakter, ali se kroz profesionalniji pristup može pozicionirati kao kvalitetan komercijalni proizvod. ${form.planNapomene}

8. Finansijski plan
U prvoj godini planirana prodaja iznosi ${formatNumber(form.prodajaGodina1)} litara, uz prodajnu cenu od ${formatRsd(form.prodajnaCena)} po litru, što daje očekivani prihod od ${formatRsd(yearlyRevenue)}. Ukupna projektovana prodaja za pet godina iznosi ${formatNumber(fiveYearSales)} litara, dok ukupni prihodi za isti period iznose približno ${formatRsd(fiveYearRevenue)}. Godišnji troškovi proizvodnje i poslovanja procenjeni su na ${formatRsd(annualCosts)}.

Najveće troškovne stavke čine sirovina u iznosu od ${formatRsd(form.sirovina)}, radna snaga u iznosu od ${formatRsd(form.radnaSnaga)}, ambalaža u iznosu od ${formatRsd(form.ambalaza)}, kao i transport, marketing, održavanje i administrativni troškovi. Nakon uključivanja amortizacije od ${formatRsd(amortization)}, procenjeni rezultat prve godine iznosi ${formatRsd(grossProfit)}. Ovakva struktura pokazuje da je projekat osetljiv na prodajnu cenu, obim prodaje i cenu sirovine, ali ima prostor za pozitivan poslovni rezultat uz planirani plasman.

9. Ocena efekata
Finansijska ocena ukazuje da projekat ima potencijal da obezbedi održiv prihod ukoliko se ostvari planirani obim prodaje i kontrola troškova. Rok povraćaja investicije procenjuje se na ${payback > 0 ? `${payback.toFixed(1)} godina` : "period koji zavisi od povećanja prodaje i smanjenja troškova"}. Posebno je značajno što se investicija odnosi na opremu dugoročnog karaktera, koja može stvarati koristi tokom više proizvodnih ciklusa.

Ekonomski efekti nisu ograničeni samo na direktnu dobit, već uključuju povećanje tržišne vrednosti gazdinstva, razvoj sopstvenog proizvoda i mogućnost širenja asortimana. Projekat se ocenjuje kao realan i razvojno opravdan, pod uslovom da se obezbedi dosledan kvalitet proizvoda, uredna dokumentacija i aktivan pristup tržištu.

10. Potencijalni rizici
Ključni rizici projekta odnose se na promene cena sirovine, variranje kvaliteta roda šljive, promene tražnje, konkurenciju i moguće kašnjenje u razvoju prodajnih kanala. Dodatni rizik predstavlja potreba za poštovanjem propisa u oblasti proizvodnje i prometa alkoholnih pića, zbog čega je neophodno blagovremeno obezbediti svu potrebnu dokumentaciju i stručnu podršku.

Mere za smanjenje rizika uključuju ugovaranje nabavke sirovine sa više dobavljača, kontrolu kvaliteta u svim fazama proizvodnje, plansko održavanje opreme, postepenu izgradnju brenda i diverzifikaciju prodaje. Važno je da gazdinstvo ne zavisi samo od jednog kanala plasmana, već da razvija kombinaciju direktne prodaje, maloprodaje, ugostiteljstva i sajamskog nastupa.

11. Zaključna ocena
Na osnovu prikazanih ulaznih podataka, projektovanih prihoda, troškova i očekivanih efekata, investicija u proizvodnju rakije od šljive ocenjuje se kao profesionalno utemeljen i ekonomski opravdan razvojni projekat. Ukupna vrednost ulaganja od ${formatRsd(totalInvestment)} je značajna, ali je povezana sa opremom koja omogućava dugoročnu proizvodnju i stvaranje proizvoda veće dodate vrednosti.

Projekat je posebno pogodan za poljoprivredno gazdinstvo koje želi da smanji zavisnost od prodaje sirovine i izgradi sopstveni tržišni proizvod. Uz odgovorno upravljanje, kontrolu troškova i aktivan rad na prodaji, poslovni plan pokazuje realnu osnovu za stabilan prihod, razvoj gazdinstva i jačanje pozicije na tržištu domaćih poljoprivredno-prehrambenih proizvoda.`;
}

function wrapCanvasLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  text.split("\n").forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push("");
      return;
    }
    const words = paragraph.split(" ");
    let line = "";
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
  });
  return lines;
}

function createPdfFromText(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.font = "28px Arial";
  const lines = wrapCanvasLines(context, text, 1080);
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  let lineIndex = 0;
  let page = 0;

  while (lineIndex < lines.length) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#166534";
    context.font = "bold 38px Arial";
    context.fillText("Poslovni Plan Generator", 80, 85);
    context.fillStyle = "#854d0e";
    context.font = "25px Arial";
    context.fillText("Demo poslovni plan za proizvodnju rakije od šljive", 80, 125);
    context.strokeStyle = "#15803d";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(80, 150);
    context.lineTo(1160, 150);
    context.stroke();

    let y = 205;
    while (lineIndex < lines.length && y < 1640) {
      const line = lines[lineIndex];
      const title = /^\d+\./.test(line) || line === "PREGLED GENERISANOG SADRŽAJA";
      context.font = title ? "bold 29px Arial" : "25px Arial";
      context.fillStyle = title ? "#15803d" : "#166534";
      if (line) context.fillText(line, 80, y);
      y += line ? 40 : 22;
      lineIndex += 1;
    }

    if (page > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, 595.28, 841.89);
    page += 1;
  }

  return pdf;
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

  const simulateDownload = (type: string) => {
    console.log(`Simulirano preuzimanje: ${type}`);
    alert("Simulirano preuzimanje");
  };

  const downloadPdf = () => {
    const pdf = createPdfFromText(generatedPlanText);
    if (!pdf) {
      alert("PDF trenutno nije moguće generisati");
      return;
    }
    pdf.save("poslovni-plan-rakija-od-sljive.pdf");
  };

  const numberInput = (key: keyof FormState, label: string) => (
    <div className="space-y-2">
      <Label htmlFor={String(key)}>{label}</Label>
      <Input id={String(key)} type="number" value={form[key] as number} onChange={(event) => updateNumber(key, event.target.value)} className="h-14 text-lg" />
    </div>
  );

  const readOnlyInput = (id: string, label: string, value: number) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" value={Math.round(value)} readOnly className="h-14 bg-primary/5 text-lg font-semibold text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Poslovni Plan Generator - Za poljoprivrednike Vojvodine</h1>
            <p className="text-sm text-foreground/70">Realističan demo za pripremu poslovnog plana iz Excel i Word podataka</p>
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
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
              <h2 className="text-2xl font-bold text-foreground">Unos podataka: Rakija od šljive</h2>
            </div>

            <form onSubmit={handleGenerate} className="space-y-8 rounded-xl border border-border bg-white p-8 shadow-sm">
              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Podaci o investiciji</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {numberInput("brojKazana", "Broj kazana")}
                  {numberInput("cenaPoKazanu", "Cena po kazanu sa PDV")}
                  {readOnlyInput("ukupnaInvesticija", "Ukupna vrednost investicije", totalInvestment)}
                  {numberInput("sopstveniIzvori", "Sopstveni izvori (%)")}
                  {numberInput("tudjiIzvori", "Tuđi izvori (%)")}
                </div>
                <div className="rounded-lg bg-primary/5 p-4 text-lg font-semibold text-primary">Ukupna vrednost investicije: {formatRsd(totalInvestment)}</div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Proizvodnja i prodaja</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {numberInput("prodajnaCena", "Prodajna cena po litru")}
                  {numberInput("prodajaGodina1", "Godina I obim prodaje")}
                  {numberInput("prodajaGodina2", "Godina II obim prodaje")}
                  {numberInput("prodajaGodina3", "Godina III obim prodaje")}
                  {numberInput("prodajaGodina4", "Godina IV obim prodaje")}
                  {numberInput("prodajaGodina5", "Godina V obim prodaje")}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Troškovi godišnje</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {costFields.map((field) => (
                    <div key={String(field.key)}>{numberInput(field.key, field.label)}</div>
                  ))}
                </div>
                <div className="rounded-lg bg-accent/5 p-4 text-lg font-semibold text-accent">Ukupni godišnji troškovi: {formatRsd(annualCosts)}</div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Amortizacija</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {readOnlyInput("nabavnaVrednostKazana", "Nabavna vrednost kazana", totalInvestment)}
                  {numberInput("stopaAmortizacije", "Stopa amortizacije (%)")}
                </div>
                <div className="rounded-lg bg-primary/5 p-4 text-lg font-semibold text-primary">Godišnja amortizacija: {formatRsd(amortization)}</div>
              </section>

              <section className="space-y-4">
                <h3 className="border-b border-border pb-2 text-xl font-semibold text-primary">Tržišna analiza i napomene</h3>
                <div className="space-y-2">
                  <Label htmlFor="trzisteNapomene">Napomene za tržišnu analizu</Label>
                  <Textarea id="trzisteNapomene" value={form.trzisteNapomene} onChange={(event) => updateText("trzisteNapomene", event.target.value)} className="min-h-32 text-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planNapomene">Opšte napomene za plan</Label>
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
              <p className="mb-8 text-lg text-foreground/80">Dokumenti su pripremljeni za demo preuzimanje.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={() => simulateDownload("Excel")} className="h-14 min-w-[200px] bg-accent text-lg text-accent-foreground hover:bg-accent/90"><Download className="mr-2" /> Preuzmi Excel</Button>
                <Button size="lg" onClick={() => simulateDownload("Word")} className="h-14 min-w-[200px] bg-primary text-lg text-primary-foreground hover:bg-primary/90"><Download className="mr-2" /> Preuzmi Word</Button>
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
