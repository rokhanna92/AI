import type { ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";

interface FooterProps {
  tc: ThemeConfig;
}

export function Footer({ tc }: FooterProps) {
  return (
    <div className="mt-20 text-center pb-8">
      <div
        className="text-[9px] uppercase tracking-[0.3em] font-semibold"
        style={{ color: tc.footerText, fontFamily: FONT.mono }}
      >
        AgroPlan · IPARD III Compliant · Srbija 2026 ·
      </div>
    </div>
  );
}
