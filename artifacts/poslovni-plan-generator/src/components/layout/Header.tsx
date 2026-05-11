import { Tractor } from "lucide-react";
import type { ThemeKey, ThemeConfig, PathId } from "../../types";
import { TYPO, FONT } from "../../lib/constants";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";

interface HeaderProps {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  tc: ThemeConfig;
  path: PathId;
}

const PATH_LABELS: Record<string, string> = {
  path1: "IPARD / Vojvodina",
  path2: "Mladi Preduzetnik",
  path3: "Navodnjavanje",
};

export function Header({ theme, setTheme, tc, path }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: tc.headerBg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${tc.headerBorder}`,
        boxShadow:
          theme === "white"
            ? "0 1px 12px rgba(0,0,0,0.06)"
            : "0 1px 0 rgba(255,222,0,0.05)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: tc.logoIconBg,
              border: `1px solid ${tc.logoIconBorder}`,
            }}
          >
            <Tractor size={16} color={tc.logoAccentText} />
          </div>
          <div>
            <span
              className="font-black text-base"
              style={{ ...TYPO.uiBold, color: tc.textPrimary }}
            >
              AGRO
            </span>
            <span
              className="font-black text-base"
              style={{ ...TYPO.uiBold, color: tc.heroTitle3 }}
            >
              PLAN
            </span>
            <span
              className="ml-2 align-middle"
              style={{ ...TYPO.labelXxs, color: tc.logoVersionText }}
            >
              v3.9
            </span>
          </div>
        </div>

        {/* Center status */}
        {path !== "home" && (
          <div className="hidden md:flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: tc.accent }}
            />
            <span
              className="text-xs uppercase tracking-[0.2em] font-semibold"
              style={{ color: tc.headerStatusColor, fontFamily: FONT.mono }}
            >
              {PATH_LABELS[path]}
            </span>
          </div>
        )}

        {/* Right: theme switcher + label */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher theme={theme} setTheme={setTheme} tc={tc} />
          <div
            className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: tc.textMuted, fontFamily: FONT.mono }}
          ></div>
        </div>
      </div>
    </header>
  );
}
