import { useEffect, useRef } from "react";
import type { ThemeKey } from "../../types";
import { THEME_CONFIG } from "../../theme/themeConfig";

interface ParallaxBlobsProps {
  theme: ThemeKey;
}

export function ParallaxBlobs({ theme }: ParallaxBlobsProps) {
  const tc = THEME_CONFIG[theme];
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      if (blob1Ref.current) blob1Ref.current.style.transform = `translate(${x * 40 - 20}px, ${y * 30 - 15}px)`;
      if (blob2Ref.current) blob2Ref.current.style.transform = `translate(${x * -28 + 14}px, ${y * 20 - 10}px)`;
      if (blob3Ref.current) blob3Ref.current.style.transform = `translate(${x * 18 - 9}px, ${y * -22 + 11}px)`;
    };
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? scrollY / maxScroll : 0;
      if (blob1Ref.current) blob1Ref.current.style.top = `${-10 + ratio * 30}%`;
      if (blob2Ref.current) blob2Ref.current.style.top = `${30 + ratio * 20}%`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
      <div
        ref={blob1Ref}
        className="absolute rounded-full"
        style={{
          width: "560px", height: "560px",
          top: "-10%", left: "-8%",
          background: `radial-gradient(circle, ${tc.blob1} 0%, transparent 68%)`,
          filter: "blur(55px)",
          transition: "transform 0.18s ease-out",
          opacity: theme === "white" ? 1 : 0.95,
        }}
      />
      <div
        ref={blob2Ref}
        className="absolute rounded-full"
        style={{
          width: "460px", height: "460px",
          top: "30%", right: "-6%",
          background: `radial-gradient(circle, ${tc.blob2} 0%, transparent 68%)`,
          filter: "blur(68px)",
          transition: "transform 0.25s ease-out",
          opacity: 0.9,
        }}
      />
      <div
        ref={blob3Ref}
        className="absolute rounded-full"
        style={{
          width: "400px", height: "400px",
          bottom: "5%", left: "45%",
          background: `radial-gradient(circle, ${tc.blob3} 0%, transparent 68%)`,
          filter: "blur(75px)",
          transition: "transform 0.32s ease-out",
          opacity: theme === "white" ? 0.8 : 0.82,
        }}
      />
    </div>
  );
}
