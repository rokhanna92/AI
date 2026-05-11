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
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes fastDrift {
        0% { transform: translate(0%, 0%) scale(1); }
        50% { transform: translate(10%, 15%) scale(1.1); }
        100% { transform: translate(0%, 0%) scale(1); }
      }
      .blob-active { 
        animation: fastDrift var(--duration) infinite alternate ease-in-out;
        will-change: transform;
      }
    `;
    document.head.appendChild(styleSheet);

    const handleMouseMove = (e: MouseEvent) => {
      // High Multipliers: Small mouse movement (0.1) creates large pixel offset (250px)
      const x = (e.clientX / window.innerWidth - 0.5) * 250; 
      const y = (e.clientY / window.innerHeight - 0.5) * 200;
      
      requestAnimationFrame(() => {
        if (blob1Ref.current) blob1Ref.current.style.transform = `translate(${x}px, ${y}px)`;
        if (blob2Ref.current) blob2Ref.current.style.transform = `translate(${x * -1.5}px, ${y * -1.2}px)`;
        if (blob3Ref.current) blob3Ref.current.style.transform = `translate(${x * 1.2}px, ${y * -1.8}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden style={{ zIndex: 0 }}>
      {/* Blob 1 - Top Left */}
      <div
        ref={blob1Ref}
        className="absolute transition-transform duration-300 ease-out" // Fast snap (300ms)
        style={{ width: "65vw", height: "65vw", top: "-15%", left: "-10%" }}
      >
        <div 
          className="blob-active w-full h-full rounded-full"
          style={{
            ["--duration" as any]: "8s", // Significantly faster cycle
            background: `radial-gradient(circle, ${tc.blob1} 0%, transparent 70%)`,
            filter: "blur(70px)",
            opacity: theme === "white" ? 0.5 : 0.3,
          }}
        />
      </div>

      {/* Blob 2 - Center Right */}
      <div
        ref={blob2Ref}
        className="absolute transition-transform duration-400 ease-out"
        style={{ width: "55vw", height: "55vw", top: "20%", right: "-15%" }}
      >
        <div 
          className="blob-active w-full h-full rounded-full"
          style={{
            ["--duration" as any]: "10s",
            background: `radial-gradient(circle, ${tc.blob2} 0%, transparent 70%)`,
            filter: "blur(80px)",
            opacity: 0.3,
          }}
        />
      </div>

      {/* Blob 3 - Bottom Left */}
      <div
        ref={blob3Ref}
        className="absolute transition-transform duration-500 ease-out"
        style={{ width: "50vw", height: "50vw", bottom: "-5%", left: "20%" }}
      >
        <div 
          className="blob-active w-full h-full rounded-full"
          style={{
            ["--duration" as any]: "7s",
            background: `radial-gradient(circle, ${tc.blob3} 0%, transparent 70%)`,
            filter: "blur(90px)",
            opacity: theme === "white" ? 0.4 : 0.25,
          }}
        />
      </div>
    </div>
  );
}