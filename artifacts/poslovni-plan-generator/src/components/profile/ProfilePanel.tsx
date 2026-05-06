import { useRef } from "react";
import { X } from "lucide-react";
import type { GlobalProfile, ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";
import { GlobalProfileForm } from "./GlobalProfileForm";

interface ProfilePanelProps {
  visible: boolean;
  onClose: () => void;
  profile: GlobalProfile;
  setProfile: (p: GlobalProfile) => void;
  tc: ThemeConfig;
}

export function ProfilePanel({ visible, onClose, profile, setProfile, tc }: ProfilePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={panelRef}
      style={{
        overflow: "hidden",
        maxHeight: visible ? "600px" : "0px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-18px)",
        transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease, transform 0.35s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="flex justify-end mb-3">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
          style={{
            color: tc.textMuted,
            border: `1px solid ${tc.cardBorder}`,
            background: tc.cardBg,
            backdropFilter: "blur(12px)",
            fontFamily: FONT.mono,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = tc.textPrimary;
            (e.currentTarget as HTMLElement).style.borderColor = tc.accentBorder;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = tc.textMuted;
            (e.currentTarget as HTMLElement).style.borderColor = tc.cardBorder;
          }}
        >
          <X size={11} />
          Zatvori
        </button>
      </div>
      <GlobalProfileForm profile={profile} setProfile={setProfile} tc={tc} />
    </div>
  );
}
