import type { ThemeConfig } from "../../types";
import head from "../../pages/head.png";

interface FloatingProfileButtonProps {
  active: boolean;
  onClick: () => void;
  tc: ThemeConfig;
}

export function FloatingProfileButton({ active, onClick, tc }: FloatingProfileButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-6 z-50 flex items-center justify-center rounded-2xl transition-all"
      style={{
        width: "44px",
        height: "44px",
        background: active ? tc.accentBg : tc.cardBg,
        border: `1.5px solid ${active ? tc.accentBorder : tc.cardBorder}`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: active
          ? `0 0 24px ${tc.accent}33, 0 4px 16px rgba(0,0,0,0.12)`
          : "0 4px 24px rgba(0,0,0,0.10)",
        transform: "translateZ(0)",
        padding: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${tc.accent}44, 0 6px 20px rgba(0,0,0,0.15)`;
        (e.currentTarget as HTMLElement).style.borderColor = tc.accentBorder;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = active
          ? `0 0 24px ${tc.accent}33, 0 4px 16px rgba(0,0,0,0.12)`
          : "0 4px 24px rgba(0,0,0,0.10)";
        (e.currentTarget as HTMLElement).style.borderColor = active ? tc.accentBorder : tc.cardBorder;
      }}
      title={active ? "Sakrij podatke gazdinstva" : "Uredi podatke gazdinstva"}
    >
      <img
        src={head}
        alt="Profile"
        style={{
          width: "38px",
          height: "38px",
          objectFit: "cover",
          borderRadius: "10px",
          transition: "all 0.2s ease",
          filter: active ? "brightness(1.2) saturate(1.15)" : "none",
        }}
      />
    </button>
  );
}
