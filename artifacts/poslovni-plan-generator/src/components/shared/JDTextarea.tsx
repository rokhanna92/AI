import type { ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";

interface JDTextareaProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  tc: ThemeConfig;
}

export function JDTextarea({ label, value, onChange, rows = 3, hint, tc }: JDTextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          className="block mb-1 uppercase tracking-[0.18em] text-[10px] font-semibold"
          style={{ color: tc.accentDim, fontFamily: FONT.mono }}
        >
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-transparent px-0 py-2 text-sm transition-all focus:outline-none resize-none"
        style={{
          color: tc.inputText,
          borderBottom: `1px solid ${tc.inputBorder}`,
          fontFamily: FONT.sans,
        }}
        onFocus={e => { e.target.style.borderBottomColor = tc.inputFocusBorder; }}
        onBlur={e => { e.target.style.borderBottomColor = tc.inputBorder; }}
      />
      {hint && (
        <p className="text-xs mt-1 italic" style={{ color: tc.inputHint }}>
          {hint}
        </p>
      )}
    </div>
  );
}
