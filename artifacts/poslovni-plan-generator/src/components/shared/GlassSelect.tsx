import type { ThemeConfig } from "../../types";

interface GlassSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  tc: ThemeConfig;
}

export function GlassSelect({ value, onChange, options, tc }: GlassSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-transparent text-sm focus:outline-none w-full py-2"
      style={{
        color: tc.inputText,
        borderBottom: `1px solid ${tc.inputBorder}`,
      }}
    >
      {options.map(o => (
        <option key={o} value={o} style={{ background: tc.selectOptionBg, color: tc.inputText }}>
          {o}
        </option>
      ))}
    </select>
  );
}
