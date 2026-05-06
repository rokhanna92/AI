import { Database } from "lucide-react";
import type { GlobalProfile, ThemeConfig } from "../../types";
import { Card } from "../shared/Card";
import { JDInput } from "../shared/JDInput";
import { SectionHeader } from "../shared/SectionHeader";

interface GlobalProfileFormProps {
  profile: GlobalProfile;
  setProfile: (p: GlobalProfile) => void;
  tc: ThemeConfig;
}

export function GlobalProfileForm({ profile, setProfile, tc }: GlobalProfileFormProps) {
  const upd = (k: keyof GlobalProfile) => (v: string) => setProfile({ ...profile, [k]: v });

  return (
    <Card tc={tc}>
      <SectionHeader icon={Database} title="Opšti podaci o gazdinstvu" tc={tc} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        <JDInput label="Naziv gazdinstva" value={profile.gazdinstvoName} onChange={upd("gazdinstvoName")} tc={tc} />
        <JDInput label="Nosilac gazdinstva" value={profile.nosilac} onChange={upd("nosilac")} tc={tc} />
        <JDInput label="JMBG / MB" value={profile.jmbgMb} onChange={upd("jmbgMb")} tc={tc} />
        <JDInput label="BPG" value={profile.bpg} onChange={upd("bpg")} tc={tc} />
        <JDInput label="Adresa" value={profile.adresa} onChange={upd("adresa")} tc={tc} />
        <JDInput label="Opština" value={profile.opstina} onChange={upd("opstina")} tc={tc} />
        <JDInput label="Telefon" value={profile.telefon} onChange={upd("telefon")} tc={tc} />
        <JDInput label="Email" value={profile.email} onChange={upd("email")} tc={tc} />
        <JDInput label="Banka" value={profile.banka} onChange={upd("banka")} tc={tc} />
        <JDInput label="Tekući račun" value={profile.racun} onChange={upd("racun")} tc={tc} />
      </div>
    </Card>
  );
}
