import type { ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";

interface LiveBadgeProps {
  label: string;
  value: string;
  hi?: boolean;
  tc: ThemeConfig;
}

export function LiveBadge({ label, value, hi = false, tc }: LiveBadgeProps) {
  return (
    <div
      className="rounded-xl px-4 py-3 flex flex-col gap-1 relative overflow-hidden"
      style={{
        background: hi ? tc.liveBadgeHiBg : tc.liveBadgeBg,
        border: `1px solid ${hi ? tc.liveBadgeHiBorder : tc.liveBadgeBorder}`,
        boxShadow: "none",
      }}
    >
      {hi && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: tc.liveBadgeHiGlow }}
        />
      )}
      <span
        className="uppercase tracking-[0.18em] text-[9px] font-semibold"
        style={{ color: hi ? tc.liveBadgeHiLabel : tc.liveBadgeLabel, fontFamily: FONT.sans }}
      >
        {label}
      </span>
      <span
        className="font-black text-base leading-tight"
        style={{
          color: hi ? tc.liveBadgeHiValue : tc.liveBadgeValue,
          fontFamily: FONT.sans,
          textShadow: "none",
        }}
      >
        {value}
      </span>
    </div>
  );
}
