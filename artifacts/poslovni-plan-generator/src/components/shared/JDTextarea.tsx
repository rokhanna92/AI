import { useState } from "react";
import type { ThemeConfig } from "../../types";

interface JDTextareaProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  placeholder?: string;
  tc: ThemeConfig;
}

const VD = "Verdana, 'Trebuchet MS', Geneva, sans-serif";

export function JDTextarea({
  label,
  value,
  onChange,
  rows = 4,
  hint,
  placeholder,
  tc,
}: JDTextareaProps) {
  const [focused, setFocused] = useState(false);

  const ph = placeholder ?? (label
    ? `Unesite ${label.charAt(0).toLowerCase()}${label.slice(1)}...`
    : "");

  return (
    <div className="w-full">
      {label && (
        <label
          className="block mb-2 text-[11px] font-bold"
          style={{
            color: focused ? tc.inputFocusBorder : tc.textSecondary,
            fontFamily: VD,
            letterSpacing: "0.02em",
            transition: "color 0.15s",
          }}
        >
          {label}
        </label>
      )}

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={ph}
        rows={rows}
        className="w-full bg-transparent py-2 text-[13px] font-bold focus:outline-none resize-none transition-all"
        style={{
          color: tc.inputText,
          fontFamily: VD,
          border: "none",
          caretColor: tc.inputFocusBorder,
          borderBottom: focused
            ? `2px solid ${tc.inputFocusBorder}`
            : `2px solid transparent`,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {!value && !focused && (
        <div
          className="h-px w-full"
          style={{ background: tc.inputBorder, opacity: 0.3, marginTop: "-2px" }}
        />
      )}

      {hint && (
        <p
          className="mt-1.5 text-[11px]"
          style={{ color: tc.inputHint, fontFamily: VD }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
