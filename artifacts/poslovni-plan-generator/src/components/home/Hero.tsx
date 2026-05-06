import type { ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";

interface HeroProps {
  tc: ThemeConfig;
}

export function Hero({ tc }: HeroProps) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-[10px] uppercase tracking-[0.3em] font-bold"
          style={{ color: tc.heroTitle3, fontFamily: FONT.mono }}
        >
          Agricultural Business Intelligence
        </span>
      </div>
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.05]"
        style={{ fontFamily: FONT.sans }}
      >
        <span style={{ color: tc.heroTitle1, textDecoration: "underline" }}>
          Automatizacija
        </span>{" "}
        <span
          style={{
            color: "transparent",
            WebkitTextStroke: `1px ${tc.heroTitle2 === "rgba(255,255,255,0)" ? "rgba(255,255,255,0.4)" : tc.textMuted}`,
          }}
        >
          poslovnih
        </span>{" "}
        <span style={{ color: tc.heroTitle3 }}>
          planova.
        </span>
      </h1>
    </div>
  );
}
