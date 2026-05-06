"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import type { PathId, ThemeKey } from "../types";
import { THEME_CONFIG } from "../theme/themeConfig";
import { GLOBAL_INIT, FONT } from "../lib/constants";
import { ParallaxBlobs } from "../components/parallax/ParallaxBlobs";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Hero } from "../components/home/Hero";
import { PathCards } from "../components/home/PathCards";
import { ProfilePanel } from "../components/profile/ProfilePanel";
import { FloatingProfileButton } from "../components/floating/FloatingProfileButton";
import { Path1Wizard } from "../components/wizards/Path1Wizard";
import { Path2Wizard } from "../components/wizards/Path2Wizard";
import { Path3Wizard } from "../components/wizards/Path3Wizard";

export default function AgroPlanApp() {
  const [path, setPath] = useState<PathId>("home");
  const [profile, setProfile] = useState(GLOBAL_INIT);
  const [theme, setTheme] = useState<ThemeKey>("white");
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const tc = THEME_CONFIG[theme];

  // Scroll-up at top-of-page reveals the profile panel
  useEffect(() => {
    if (path !== "home") return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 40 && currentY < lastY) setShowProfile(true);
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  // Smooth scroll profile into view when opened
  useEffect(() => {
    if (showProfile && profileRef.current) {
      setTimeout(() => profileRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
    }
  }, [showProfile]);

  return (
    <div
      className="min-h-screen pb-20 relative"
      style={{ background: tc.pageBg, fontFamily: FONT.sans, color: tc.textPrimary, overflowX: "hidden" }}
    >
      <ParallaxBlobs theme={theme} />

      <Header theme={theme} setTheme={setTheme} tc={tc} path={path} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">

        {/* ── HOME ── */}
        {path === "home" && (
          <div className="space-y-10">
            <div ref={profileRef}>
              <ProfilePanel
                visible={showProfile}
                onClose={() => setShowProfile(false)}
                profile={profile}
                setProfile={setProfile}
                tc={tc}
              />
            </div>
            <Hero tc={tc} />
            <PathCards tc={tc} onSelect={setPath} />
          </div>
        )}

        {/* ── WIZARD VIEWS ── */}
        {path !== "home" && (
          <div className="space-y-6">
            {/* Breadcrumb bar */}
            <div
              className="flex items-center justify-between px-5 py-3 rounded-xl"
              style={{
                background: tc.breadcrumbBg,
                border: `1px solid ${tc.breadcrumbBorder}`,
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
                  style={{
                    background: tc.breadcrumbNumBg,
                    border: `1px solid ${tc.breadcrumbNumBorder}`,
                    color: tc.breadcrumbNumText,
                    fontFamily: FONT.mono,
                  }}
                >
                  {path === "path1" ? "01" : path === "path2" ? "02" : "03"}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: tc.textPrimary, fontFamily: FONT.sans }}>
                    {path === "path1" ? "Model Agro Vojvodina / IPARD" : path === "path2" ? "Model Mladi Preduzetnik" : "Sistem Navodnjavanja"}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: tc.breadcrumbMuted, fontFamily: FONT.mono }}
                  >
                    {profile.gazdinstvoName} · BPG: {profile.bpg}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPath("home")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all"
                style={{
                  color: tc.breadcrumbBackText,
                  border: `1px solid ${tc.breadcrumbBackBorder}`,
                  fontFamily: FONT.mono,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = tc.textPrimary;
                  (e.currentTarget as HTMLElement).style.borderColor = tc.cardBorder;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = tc.breadcrumbBackText;
                  (e.currentTarget as HTMLElement).style.borderColor = tc.breadcrumbBackBorder;
                }}
              >
                <ArrowLeft size={12} />
                Nazad
              </button>
            </div>

            {path === "path1" && <Path1Wizard profile={profile} onBack={() => setPath("home")} tc={tc} />}
            {path === "path2" && <Path2Wizard profile={profile} onBack={() => setPath("home")} tc={tc} />}
            {path === "path3" && <Path3Wizard profile={profile} onBack={() => setPath("home")} tc={tc} />}
          </div>
        )}
      </main>

      {/* Floating profile toggle (home only) */}
      {path === "home" && (
        <FloatingProfileButton
          active={showProfile}
          onClick={() => setShowProfile(prev => !prev)}
          tc={tc}
        />
      )}

      <Footer tc={tc} />
    </div>
  );
}
