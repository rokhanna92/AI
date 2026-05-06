import type { ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";

interface JDInputProps {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  className?: string;
  tc: ThemeConfig;
}

export function JDInput({ label, value, onChange, type = "text", placeholder, hint, className = "", tc }: JDInputProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className="block mb-1 uppercase tracking-[0.18em] text-[10px] font-semibold"
          style={{ color: tc.accentDim, fontFamily: FONT.mono }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "—"}
        className="w-full bg-transparent px-0 py-2 text-sm transition-all focus:outline-none"
        style={{
          color: tc.inputText,
          borderBottom: `1px solid ${tc.inputBorder}`,
          fontFamily: type === "number" ? FONT.mono : FONT.sans,
          letterSpacing: type === "number" ? "0.05em" : undefined,
        }}
        onFocus={e => {
          e.target.style.borderBottomColor = tc.inputFocusBorder;
          e.target.style.boxShadow = tc.inputFocusShadow;
        }}
        onBlur={e => {
          e.target.style.borderBottomColor = tc.inputBorder;
          e.target.style.boxShadow = "none";
        }}
      />
      {hint && (
        <p className="text-xs mt-1" style={{ color: tc.inputHint, fontFamily: FONT.mono }}>
          {hint}
        </p>
      )}
    </div>
  );
}
