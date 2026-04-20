import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, FileText, CheckCircle2, Download, ChevronRight, Calculator, Bot, FileCheck } from "lucide-react";

type Step = 'select' | 'form' | 'loading' | 'success';

const TEMPLATES = [
  { id: 'rakija', title: 'Rakija od šljive', desc: 'Kompletan plan za destileriju' },
  { id: 'template-2', title: 'Template 2', desc: 'Placeholder za sledeći poslovni plan' },
  { id: 'template-3', title: 'Template 3', desc: 'Placeholder za budući model plana' },
];

const LOADING_STEPS = [
  "Računam tabele...",
  "AI generiše opis...",
  "Pripremam dokumente..."
];

export default function Home() {
  const [step, setStep] = useState<Step>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (step === 'loading') {
      const timer1 = setTimeout(() => setLoadingIndex(1), 1500);
      const timer2 = setTimeout(() => setLoadingIndex(2), 3000);
      const timer3 = setTimeout(() => setStep('success'), 4500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step]);

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplate(id);
    setStep('form');
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setLoadingIndex(0);
  };

  const reset = () => {
    setStep('select');
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">Poslovni Plan Generator</h1>
            <p className="text-sm text-foreground/70">Za poljoprivrednike Vojvodine</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-accent border-accent/20 hover:bg-accent/10">
                <Settings className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Podešavanja AI Asistenta</DialogTitle>
                <DialogDescription>
                  Unesite vaš API ključ za generisanje teksta.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="apiKey" className="mb-2 block">OpenAI API Ključ</Label>
                    <Input 
                  id="apiKey" 
                  type="password"
                  placeholder="sk-..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                      className="h-12 text-base"
                />
              </div>
              <DialogFooter>
                <Button onClick={() => setDialogOpen(false)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sačuvaj
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {step === 'select' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Odaberite tip proizvodnje</h2>
              <p className="text-lg text-foreground/80">
                Naš sistem će vam pomoći da brzo kreirate profesionalan poslovni plan spreman za konkurse.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {TEMPLATES.map((t) => (
                <Card key={t.id} className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm hover:shadow-md bg-white group" onClick={() => handleTemplateSelect(t.id)}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">{t.title}</CardTitle>
                    <CardDescription className="text-base mt-2">{t.desc}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-between text-accent group-hover:bg-accent/5">
                      Započni <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center gap-4">
              <Button variant="outline" onClick={reset} size="sm">Nazad</Button>
              <h2 className="text-2xl font-bold text-foreground">
                Unos podataka: {TEMPLATES.find(t => t.id === selectedTemplate)?.title}
              </h2>
            </div>

            <form onSubmit={handleGenerate} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-border">
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">Podaci o investiciji</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="investitor">Nosilac gazdinstva</Label>
                    <Input id="investitor" placeholder="Ime i prezime" required className="h-14 text-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lokacija">Mesto</Label>
                    <Input id="lokacija" placeholder="Npr. Subotica" required className="h-14 text-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iznos">Iznos investicije (RSD)</Label>
                    <Input id="iznos" type="number" placeholder="0" required className="h-14 text-lg" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">Proizvodnja i prodaja</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kolicina">Godišnja proizvodnja</Label>
                    <Input id="kolicina" placeholder="Npr. 5000 litara" required className="h-14 text-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cena">Procenjena prodajna cena</Label>
                    <Input id="cena" placeholder="RSD po jedinici" required className="h-14 text-lg" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">Troškovi</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sirovine">Troškovi sirovina (godišnje)</Label>
                    <Input id="sirovine" type="number" placeholder="0" className="h-14 text-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rad">Troškovi rada (godišnje)</Label>
                    <Input id="rad" type="number" placeholder="0" className="h-14 text-lg" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-primary border-b border-border pb-2">Ostalo</h3>
                <div className="space-y-2">
                  <Label htmlFor="napomene">Napomene za plan</Label>
                  <Textarea id="napomene" placeholder="Npr. planirana kupovina kazana, saradnja sa lokalnim voćarima, prodaja na kućnom pragu..." className="min-h-32 text-lg" />
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  Generiši poslovni plan
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 'loading' && (
          <div className="max-w-md mx-auto text-center py-24 animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                {loadingIndex === 0 && <Calculator className="w-10 h-10 animate-pulse" />}
                {loadingIndex === 1 && <Bot className="w-10 h-10 animate-pulse" />}
                {loadingIndex === 2 && <FileCheck className="w-10 h-10 animate-pulse" />}
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {LOADING_STEPS[loadingIndex]}
            </h2>
            
            <div className="flex gap-2 justify-center mt-8">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i <= loadingIndex ? 'w-8 bg-primary' : 'w-2 bg-primary/20'
                  }`} 
                />
              ))}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Vaš poslovni plan je spreman</h2>
              <p className="text-lg text-foreground/80 mb-8">
                Dokumenti su uspešno generisani i spremni za preuzimanje.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground min-w-[200px] h-14 text-lg">
                  <Download className="mr-2" /> Preuzmi Excel
                </Button>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[200px] h-14 text-lg">
                  <Download className="mr-2" /> Preuzmi Word
                </Button>
                <Button size="lg" variant="outline" className="min-w-[200px] h-14 text-lg border-primary text-primary hover:bg-primary/5">
                  <Download className="mr-2" /> Preuzmi PDF
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-border mt-12">
              <h3 className="text-xl font-bold text-primary mb-6 pb-2 border-b border-border">Pregled generisanog sadržaja</h3>
              <div className="space-y-6 text-foreground/90 font-serif leading-relaxed">
                <div>
                  <h4 className="font-bold text-lg mb-2">1. Rezime poslovnog plana</h4>
                  <p>Ovaj poslovni plan predstavlja detaljnu analizu opravdanosti investicije u unapređenje poljoprivredne proizvodnje. Cilj investicije je povećanje obima i kvaliteta finalnog proizvoda, uz smanjenje jediničnih troškova. Očekuje se da će predložena ulaganja značajno doprineti konkurentnosti gazdinstva na domaćem tržištu.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">2. Analiza tržišta</h4>
                  <p>Tržište poljoprivrednih proizvoda u regionu Vojvodine beleži stabilan rast potražnje za kvalitetnim, lokalno proizvedenim proizvodima. Konkurencija je prisutna, ali fokus na viši nivo obrade i pouzdan plasman omogućava stabilan tržišni udeo.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">5. Očekivani efekti</h4>
                  <p>Na osnovu projektovanih prihoda i troškova, investicija pokazuje visoku stopu rentabilnosti. Rok povraćaja uloženih sredstava procenjen je na 3.5 godine. Projekat direktno doprinosi stabilnosti prihoda gazdinstva i otvara mogućnosti za dalje proširenje kapaciteta.</p>
                </div>
              </div>
              
              <div className="mt-8 text-center pt-8 border-t border-border">
                <Button variant="ghost" onClick={reset} className="text-foreground/60 hover:text-foreground">
                  Započni novi plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
