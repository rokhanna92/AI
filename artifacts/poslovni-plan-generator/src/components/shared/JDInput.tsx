import { useState } from "react";
import type { ThemeConfig } from "../../types";

interface JDInputProps {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  currency?: boolean;
  placeholder?: string;
  hint?: string;
  className?: string;
  tc: ThemeConfig;
}

const VD = "Verdana, 'Trebuchet MS', Geneva, sans-serif";

function fmtSrb(n: number): string {
  return n !== 0
    ? n.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "";
}

export function JDInput({
  label,
  value,
  onChange,
  type = "text",
  currency = false,
  placeholder,
  hint,
  className = "",
  tc,
}: JDInputProps) {
  const [focused, setFocused] = useState(false);
  const [localRaw, setLocalRaw] = useState("");

  const numVal = typeof value === "number" ? value : parseFloat(String(value)) || 0;

  const ph =
    placeholder ??
    (label ? `Unesite ${label.charAt(0).toLowerCase()}${label.slice(1)}` : "");

  const inputValue = currency ? (focused ? localRaw : fmtSrb(numVal)) : value;
  const hasValue = currency ? numVal !== 0 : value !== "" && value !== 0;

  const handleFocus = () => {
    if (currency) setLocalRaw(numVal !== 0 ? String(numVal) : "");
    setFocused(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currency) {
      setLocalRaw(e.target.value.replace(/[^0-9.,]/g, ""));
    } else {
      onChange(e.target.value);
    }
  };

  const handleBlur = () => {
    if (currency) {
      const parsed = parseFloat(localRaw.replace(/\./g, "").replace(",", ".")) || 0;
      onChange(String(parsed));
      setLocalRaw("");
    }
    setFocused(false);
  };

  return (
    <div className={`w-full ${className}`}>
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

      <input
        type={currency ? "text" : type}
        inputMode={currency ? "decimal" : undefined}
        value={inputValue}
        onChange={handleChange}
        placeholder={focused && currency ? "" : ph}
        className="w-full bg-transparent py-2 text-[13px] font-bold focus:outline-none transition-all"
        style={{
          color: tc.inputText,
          fontFamily: VD,
          border: "none",
          caretColor: tc.inputFocusBorder,
          borderBottom: focused
            ? `2px solid ${tc.inputFocusBorder}`
            : `2px solid transparent`,
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {!hasValue && !focused && (
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
