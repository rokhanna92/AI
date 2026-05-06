import type { ThemeConfig } from "../../types";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  tc: ThemeConfig;
}

export function Card({ children, className = "", tc }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: tc.cardBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${tc.cardBorder}`,
        boxShadow: `${tc.cardShadow}, ${tc.cardInnerGlow}`,
      }}
    >
      {children}
    </div>
  );
}
