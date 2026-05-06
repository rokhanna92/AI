import { Sun, Leaf } from "lucide-react";
import type { ThemeKey, ThemeConfig } from "../../types";
import { FONT } from "../../lib/constants";

interface ThemeSwitcherProps {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  tc: ThemeConfig;
}

export function ThemeSwitcher({ theme, setTheme, tc }: ThemeSwitcherProps) {
  const themes: { key: ThemeKey; label: string; icon: React.ReactNode }[] = [
    { key: "white", label: "", icon: <Sun size={12} style={{ color: tc.heroTitle3 }} /> },
    { key: "yellow", label: "", icon: <Leaf size={12} /> },
  ];

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl"
      style={{ background: tc.themeSwitcherBg, border: `1px solid ${tc.themeSwitcherBorder}` }}
    >
      {themes.map(t => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
          style={{
            background: theme === t.key ? tc.themeSwitcherActiveBg : "transparent",
            color: theme === t.key ? tc.themeSwitcherActiveText : tc.themeSwitcherInactiveText,
            fontFamily: FONT.mono,
          }}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
