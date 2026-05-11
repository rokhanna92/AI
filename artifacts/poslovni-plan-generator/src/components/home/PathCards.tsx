import { ChevronRight } from "lucide-react";
import type { PathId, ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";
import euFlag from "../../pages/eu.png";
import sprout from "../../pages/humans.png";
import watering from "../../pages/trees.png";

interface PathCardsProps {
  tc: ThemeConfig;
  onSelect: (path: PathId) => void;
}

export function PathCards({ tc, onSelect }: PathCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Path 1 – IPARD */}
      <button
        onClick={() => onSelect("path1")}
        className="group text-left rounded-2xl p-7 transition-all relative overflow-hidden"
        style={{
          background: tc.cardBg,
          border: `1px solid ${tc.path1Border}`,
          backdropFilter: "blur(20px)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = tc.path1HoverBorder;
          (e.currentTarget as HTMLElement).style.boxShadow = tc.path1HoverShadow;
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = tc.path1Border;
          (e.currentTarget as HTMLElement).style.boxShadow = tc.cardShadow;
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${tc.path1GlowLine}, transparent)` }}
        />
        <img
          src={euFlag}
          alt="EU Flag"
          className="w-auto opacity-80 h-[130px] object-contain"
          style={{ display: "block", margin: "auto", marginBottom: "3rem" }}
        />
        <h3 className="text-lg font-black mb-1.5" style={{ color: tc.textPrimary, fontFamily: FONT.sans }}>
          IPARD / Vojvodina
        </h3>
        <div
          className="text-[9px] uppercase tracking-[0.2em] mb-3 font-bold"
          style={{ color: `${tc.path1Glow}80`, fontFamily: FONT.mono }}
        >
          Tab. 1.1 → 1.5 → 3.2 → 5.1
        </div>
        <p className="text-xs leading-relaxed mb-5" style={{ color: tc.textMuted, fontFamily: FONT.sans }}>
          Putanja za velike investicije i ruralni razvoj. Fokusirana na modernizaciju poljoprivredne mehanizacije i infrastrukture kroz fondove EU standarda.
        </p>
        <span
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ color: tc.path1Glow, fontFamily: FONT.mono }}
        >
          Pokreni <ChevronRight size={13} />
        </span>
      </button>

      {/* Path 2 – Mladi Preduzetnik */}
      <button
        onClick={() => onSelect("path2")}
        className="group text-left rounded-2xl p-7 transition-all relative overflow-hidden"
        style={{
          background: tc.cardBg,
          border: `1px solid ${tc.path2Border}`,
          backdropFilter: "blur(20px)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = tc.path2HoverBorder;
          (e.currentTarget as HTMLElement).style.boxShadow = tc.path2HoverShadow;
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = tc.path2Border;
          (e.currentTarget as HTMLElement).style.boxShadow = tc.cardShadow;
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${tc.path2Glow}66, transparent)` }}
        />
        <img
          src={sprout}
          alt="Mladi Preduzetnik"
          className="w-auto opacity-80 h-[130px] object-contain"
          style={{ display: "block", margin: "auto", marginBottom: "3rem" }}
        />
        <h3 className="text-lg font-black mb-1.5" style={{ color: tc.textPrimary, fontFamily: FONT.sans }}>
          Mladi Preduzetnik
        </h3>
        <div
          className="text-[9px] uppercase tracking-[0.2em] mb-3 font-bold"
          style={{ color: `${tc.path2Glow}80`, fontFamily: FONT.mono }}
        >
          Tab. 8.1 → 8.2 → Ocena 9
        </div>
        <p className="text-xs leading-relaxed mb-5" style={{ color: tc.textMuted, fontFamily: FONT.sans }}>
          Specijalizovana ruta za poljoprivrednike do 40 godina koji traže podršku za prvo osnivanje ili proširenje gazdinstva. Naglasak na modernom menadžmentu.
        </p>
        <span
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ color: tc.path2Glow, fontFamily: FONT.mono }}
        >
          Pokreni <ChevronRight size={13} />
        </span>
      </button>

      {/* Path 3 – Navodnjavanje */}
      <button
        onClick={() => onSelect("path3")}
        className="group text-left rounded-2xl p-7 transition-all relative overflow-hidden"
        style={{
          background: tc.cardBg,
          border: `1px solid ${tc.path3Border}`,
          backdropFilter: "blur(20px)",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = tc.path3HoverBorder;
          (e.currentTarget as HTMLElement).style.boxShadow = tc.path3HoverShadow;
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = tc.path3Border;
          (e.currentTarget as HTMLElement).style.boxShadow = tc.cardShadow;
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${tc.path3Glow}66, transparent)` }}
        />
        <img
          src={watering}
          alt="Navodnjavanje"
          className="w-auto opacity-80 h-[130px] object-contain"
          style={{ display: "block", margin: "auto", marginBottom: "3rem" }}
        />
        <h3 className="text-lg font-black mb-1.5" style={{ color: tc.textPrimary, fontFamily: FONT.sans }}>
          Navodnjavanje
        </h3>
        <div
          className="text-[9px] uppercase tracking-[0.2em] mb-3 font-bold"
          style={{ color: `${tc.path3Glow}80`, fontFamily: FONT.mono }}
        >
          Tab. 1.2 → 3.3 → 5.3
        </div>
        <p className="text-xs leading-relaxed mb-5" style={{ color: tc.textMuted, fontFamily: FONT.sans }}>
          Namenska automatizacija za sisteme upravljanja vodom, solarne pumpe i efikasnu infrastrukturu za hidrataciju useva.
        </p>
        <span
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
          style={{ color: tc.path3Glow, fontFamily: FONT.mono }}
        >
          Pokreni <ChevronRight size={13} />
        </span>
      </button>
    </div>
  );
}
