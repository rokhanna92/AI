import { Plus } from "lucide-react";
import type { ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";

interface AddRowBtnProps {
  onClick: () => void;
  tc: ThemeConfig;
}

export function AddRowBtn({ onClick, tc }: AddRowBtnProps) {
  return (
    <button
      onClick={onClick}
      className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all"
      style={{
        color: tc.addRowText,
        border: `1px dashed ${tc.addRowBorder}`,
        background: "transparent",
        fontFamily: FONT.mono,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = tc.addRowHoverBorder;
        (e.currentTarget as HTMLElement).style.color = tc.addRowHoverText;
        (e.currentTarget as HTMLElement).style.background = tc.addRowHoverBg;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = tc.addRowBorder;
        (e.currentTarget as HTMLElement).style.color = tc.addRowText;
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <Plus size={12} />
      Dodaj red
    </button>
  );
}
