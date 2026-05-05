"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Plus, X, ChevronRight, ChevronLeft, FileDown, Tractor,
  Droplets, Sprout, Globe, MapPin, Building2, Wrench,
  TrendingUp, BarChart3, Cpu, Zap, Shield, Target,
  ArrowLeft, CheckCircle2, Activity, Database, Layers, Sun, Leaf
} from "lucide-react";
import euFlag from './eu.png';
import sprout from './humans.png';
import watering from './trees.png';

// ═══════════════════════════════════════════════════════════════════════════
// THEME SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

type ThemeKey = "white" | "yellow" | "green";

interface ThemeConfig {
  // Backgrounds
  pageBg: string;
  pagePattern: string;
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cardInnerGlow: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  // Accent / Brand
  accent: string;
  accentDim: string;
  accentDimmer: string;
  accentBg: string;
  accentBorder: string;
  // Yellow highlight
  highlight: string;
  highlightDim: string;
  highlightBg: string;
  highlightBorder: string;
  // Step wizard
  stepActive: string;
  stepDone: string;
  stepInactive: string;
  stepActiveBg: string;
  stepDoneBg: string;
  // Input
  inputText: string;
  inputBorder: string;
  inputFocusBorder: string;
  inputFocusShadow: string;
  inputHint: string;
  // Table
  tableHeaderText: string;
  tableRowBorder: string;
  tableCellText: string;
  tableNumText: string;
  // Button
  btnPrimaryBg: string;
  btnPrimaryText: string;
  btnPrimaryBorder: string;
  btnPrimaryHoverBg: string;
  btnSecondaryText: string;
  btnSecondaryBorder: string;
  btnSecondaryHoverBg: string;
  // Path cards
  path1Border: string;
  path1HoverBorder: string;
  path1HoverShadow: string;
  path1Glow: string;
  path1GlowLine: string;
  path2Border: string;
  path2HoverBorder: string;
  path2HoverShadow: string;
  path2Glow: string;
  path3Border: string;
  path3HoverBorder: string;
  path3HoverShadow: string;
  path3Glow: string;
  // Breadcrumb
  breadcrumbBg: string;
  breadcrumbBorder: string;
  breadcrumbNumBg: string;
  breadcrumbNumBorder: string;
  breadcrumbNumText: string;
  breadcrumbMuted: string;
  breadcrumbBackText: string;
  breadcrumbBackBorder: string;
  // Blobs (parallax)
  blob1: string;
  blob2: string;
  blob3: string;
  // Select option bg
  selectOptionBg: string;
  // Section header
  sectionHeaderBorder: string;
  sectionIconBg: string;
  sectionIconBorder: string;
  sectionIconColor: string;
  sectionTitleColor: string;
  sectionTableChipBg: string;
  sectionTableChipBorder: string;
  sectionTableChipText: string;
  // LiveBadge
  liveBadgeBg: string;
  liveBadgeBorder: string;
  liveBadgeLabel: string;
  liveBadgeValue: string;
  liveBadgeHiBg: string;
  liveBadgeHiBorder: string;
  liveBadgeHiShadow: string;
  liveBadgeHiLabel: string;
  liveBadgeHiValue: string;
  liveBadgeHiGlow: string;
  // Wizard nav border
  wizardNavBorder: string;
  // Stat cards (efficiency)
  statPositiveBg: string;
  statNegativeBg: string;
  statMutedText: string;
  // Logo
  logoAccentText: string;
  logoVersionText: string;
  logoIconBg: string;
  logoIconBorder: string;
  // Header accent bar
  headerAccentBar: string;
  headerBorder: string;
  headerStatusColor: string;
  // Footer
  footerText: string;
  // Hero
  heroLabel: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitle3: string;
  // Theme switcher
  themeSwitcherBg: string;
  themeSwitcherBorder: string;
  themeSwitcherActiveBg: string;
  themeSwitcherActiveText: string;
  themeSwitcherInactiveText: string;
  // Add row btn
  addRowText: string;
  addRowBorder: string;
  addRowHoverText: string;
  addRowHoverBorder: string;
  addRowHoverBg: string;
  // Narrative preview
  narrativeBg: string;
  narrativeBorder: string;
  narrativeText: string;
  // Finance line items
  financeLineText: string;
  financeLineBorder: string;
}

const THEME_CONFIG: Record<ThemeKey, ThemeConfig> = {
  white: {
    pageBg: "linear-gradient(160deg, #f8f9fb 0%, #f3f4f6 50%, #eaecf3 100%)",
    pagePattern: "",
    headerBg: "rgba(255,255,255,0.85)",
    cardBg: "rgba(255,255,255,0.92)",
    cardBorder: "rgba(156,163,175,0.4)",
    cardShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
    cardInnerGlow: "inset 0 1px 0 rgba(255,255,255,0.8)",
    textPrimary: "#111827",
    textSecondary: "#374151",
    textMuted: "#6B7280",
    textInverse: "#ffffff",
    accent: "#4B6FD4",
    accentDim: "rgba(75,111,212,0.6)",
    accentDimmer: "rgba(75,111,212,0.3)",
    accentBg: "rgba(75,111,212,0.07)",
    accentBorder: "rgba(75,111,212,0.25)",
    highlight: "#2563EB",
    highlightDim: "rgba(37,99,235,0.6)",
    highlightBg: "rgba(37,99,235,0.06)",
    highlightBorder: "rgba(37,99,235,0.25)",
    stepActive: "#2563EB",
    stepDone: "#16a34a",
    stepInactive: "#9CA3AF",
    stepActiveBg: "rgba(37,99,235,0.1)",
    stepDoneBg: "rgba(22,163,74,0.1)",
    inputText: "#111827",
    inputBorder: "rgba(107,114,128,0.4)",
    inputFocusBorder: "#2563EB",
    inputFocusShadow: "0 2px 0 -1px rgba(37,99,235,0.2)",
    inputHint: "rgba(37,99,235,0.5)",
    tableHeaderText: "rgba(75,111,212,0.8)",
    tableRowBorder: "rgba(156,163,175,0.2)",
    tableCellText: "#1F2937",
    tableNumText: "#1D4ED8",
    btnPrimaryBg: "rgba(75,111,212,0.12)",
    btnPrimaryText: "#2563EB",
    btnPrimaryBorder: "rgba(75,111,212,0.4)",
    btnPrimaryHoverBg: "rgba(75,111,212,0.2)",
    btnSecondaryText: "#6B7280",
    btnSecondaryBorder: "rgba(156,163,175,0.4)",
    btnSecondaryHoverBg: "rgba(156,163,175,0.1)",
    path1Border: "rgba(22,163,74,0.3)",
    path1HoverBorder: "rgba(22,163,74,0.65)",
    path1HoverShadow: "0 0 30px rgba(22,163,74,0.1), 0 4px 16px rgba(0,0,0,0.06)",
    path1Glow: "#16a34a",
    path1GlowLine: "rgba(22,163,74,0.4)",
    path2Border: "rgba(202,138,4,0.3)",
    path2HoverBorder: "rgba(202,138,4,0.65)",
    path2HoverShadow: "0 0 30px rgba(202,138,4,0.1), 0 4px 16px rgba(0,0,0,0.06)",
    path2Glow: "#ca8a04",
    path3Border: "rgba(6,182,212,0.3)",
    path3HoverBorder: "rgba(6,182,212,0.65)",
    path3HoverShadow: "0 0 30px rgba(6,182,212,0.1), 0 4px 16px rgba(0,0,0,0.06)",
    path3Glow: "#0891b2",
    breadcrumbBg: "rgba(255,255,255,0.85)",
    breadcrumbBorder: "rgba(156,163,175,0.35)",
    breadcrumbNumBg: "rgba(75,111,212,0.08)",
    breadcrumbNumBorder: "rgba(75,111,212,0.35)",
    breadcrumbNumText: "#2563EB",
    breadcrumbMuted: "rgba(75,111,212,0.45)",
    breadcrumbBackText: "#6B7280",
    breadcrumbBackBorder: "rgba(156,163,175,0.35)",
    blob1: "rgba(99,155,230,0.55)",
    blob2: "rgba(168,180,210,0.45)",
    blob3: "rgba(134,195,255,0.38)",
    selectOptionBg: "#ffffff",
    sectionHeaderBorder: "rgba(156,163,175,0.3)",
    sectionIconBg: "rgba(75,111,212,0.08)",
    sectionIconBorder: "rgba(75,111,212,0.3)",
    sectionIconColor: "#2563EB",
    sectionTitleColor: "#111827",
    sectionTableChipBg: "rgba(37,99,235,0.07)",
    sectionTableChipBorder: "rgba(37,99,235,0.3)",
    sectionTableChipText: "#1D4ED8",
    liveBadgeBg: "rgba(75,111,212,0.07)",
    liveBadgeBorder: "rgba(75,111,212,0.25)",
    liveBadgeLabel: "rgba(75,111,212,0.6)",
    liveBadgeValue: "#1D4ED8",
    liveBadgeHiBg: "linear-gradient(135deg,rgba(37,99,235,0.1) 0%,rgba(37,99,235,0.04) 100%)",
    liveBadgeHiBorder: "rgba(37,99,235,0.4)",
    liveBadgeHiShadow: "0 0 16px rgba(37,99,235,0.08)",
    liveBadgeHiLabel: "rgba(37,99,235,0.65)",
    liveBadgeHiValue: "#1E40AF",
    liveBadgeHiGlow: "linear-gradient(90deg,transparent,rgba(37,99,235,0.3),transparent)",
    wizardNavBorder: "rgba(156,163,175,0.25)",
    statPositiveBg: "rgba(22,163,74,0.06)",
    statNegativeBg: "rgba(220,38,38,0.05)",
    statMutedText: "#6B7280",
    logoAccentText: "#00BFFF",
    logoVersionText: "rgba(75,111,212,0.5)",
    logoIconBg: "rgba(37,99,235,0.08)",
    logoIconBorder: "rgba(37,99,235,0.25)",
    headerAccentBar: "linear-gradient(90deg,transparent 0%,rgba(37,99,235,0.3) 50%,transparent 100%)",
    headerBorder: "rgba(156,163,175,0.3)",
    headerStatusColor: "rgba(22,163,74,0.75)",
    footerText: "rgba(107,114,128,0.5)",
    heroLabel: "rgba(37,99,235,0.65)",
    heroTitle1: "#111827",
    heroTitle2: "#6B7280",
    heroTitle3: "#00BFFF",
    themeSwitcherBg: "rgba(255,255,255,0.8)",
    themeSwitcherBorder: "rgba(156,163,175,0.4)",
    themeSwitcherActiveBg: "rgba(37,99,235,0.1)",
    themeSwitcherActiveText: "#1D4ED8",
    themeSwitcherInactiveText: "#9CA3AF",
    addRowText: "#2563EB",
    addRowBorder: "rgba(37,99,235,0.3)",
    addRowHoverText: "#1D4ED8",
    addRowHoverBorder: "#1D4ED8",
    addRowHoverBg: "rgba(37,99,235,0.05)",
    narrativeBg: "rgba(37,99,235,0.04)",
    narrativeBorder: "rgba(37,99,235,0.2)",
    narrativeText: "rgba(37,99,235,0.75)",
    financeLineText: "rgba(75,111,212,0.55)",
    financeLineBorder: "rgba(75,111,212,0.15)",
  },

  yellow: {
    pageBg: "radial-gradient(ellipse at 20% 20%, rgba(5, 5, 5, 0.97) 0%, rgb(0, 0, 0) 60%), url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFDE00' fill-opacity='0.025'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    pagePattern: "",
    headerBg: "rgba(5,12,5,0.85)",
    cardBg: "rgba(10,22,10,0.65)",
    cardBorder: "rgba(255,222,0,0.2)",
    cardShadow: "0 0 40px rgba(255,222,0,0.04)",
    cardInnerGlow: "inset 0 1px 0 rgba(255,222,0,0.06)",
    textPrimary: "#ffffff",
    textSecondary: "#f3f4f6",
    textMuted: "rgba(255,255,255,0.72)",
    textInverse: "#0a1e0a",
    accent: "#FFDE00",
    accentDim: "rgba(255,222,0,0.6)",
    accentDimmer: "rgba(255,222,0,0.3)",
    accentBg: "rgba(255,222,0,0.08)",
    accentBorder: "rgba(255,222,0,0.3)",
    highlight: "#FFDE00",
    highlightDim: "rgba(255,222,0,0.5)",
    highlightBg: "rgba(255,222,0,0.1)",
    highlightBorder: "rgba(255,222,0,0.35)",
    stepActive: "#FFDE00",
    stepDone: "#4ade80",
    stepInactive: "rgba(255,255,255,0.2)",
    stepActiveBg: "rgba(255,222,0,0.12)",
    stepDoneBg: "rgba(74,222,128,0.1)",
    inputText: "#f0fdf0",
    inputBorder: "rgba(255,222,0,0.3)",
    inputFocusBorder: "#FFDE00",
    inputFocusShadow: "0 2px 0 -1px rgba(255,222,0,0.2)",
    inputHint: "rgba(255,222,0,0.45)",
    tableHeaderText: "rgba(255,222,0,0.65)",
    tableRowBorder: "rgba(255,222,0,0.1)",
    tableCellText: "#e8f5e3",
    tableNumText: "#FFDE00",
    btnPrimaryBg: "rgba(255,222,0,0.12)",
    btnPrimaryText: "#FFDE00",
    btnPrimaryBorder: "rgba(255,222,0,0.4)",
    btnPrimaryHoverBg: "rgba(255,222,0,0.2)",
    btnSecondaryText: "rgba(255,255,255,0.65)",
    btnSecondaryBorder: "rgba(255,255,255,0.2)",
    btnSecondaryHoverBg: "rgba(255,255,255,0.06)",
    path1Border: "rgba(74,222,128,0.2)",
    path1HoverBorder: "rgba(74,222,128,0.5)",
    path1HoverShadow: "0 0 40px rgba(74,222,128,0.08), inset 0 1px 0 rgba(74,222,128,0.1)",
    path1Glow: "#4ade80",
    path1GlowLine: "rgba(74,222,128,0.4)",
    path2Border: "rgba(255,222,0,0.2)",
    path2HoverBorder: "rgba(255,222,0,0.5)",
    path2HoverShadow: "0 0 40px rgba(255,222,0,0.08), inset 0 1px 0 rgba(255,222,0,0.1)",
    path2Glow: "#FFDE00",
    path3Border: "rgba(34,211,238,0.2)",
    path3HoverBorder: "rgba(34,211,238,0.45)",
    path3HoverShadow: "0 0 40px rgba(34,211,238,0.06), inset 0 1px 0 rgba(34,211,238,0.08)",
    path3Glow: "#22d3ee",
    breadcrumbBg: "rgba(10,22,10,0.7)",
    breadcrumbBorder: "rgba(255,222,0,0.2)",
    breadcrumbNumBg: "rgba(255,222,0,0.1)",
    breadcrumbNumBorder: "rgba(255,222,0,0.4)",
    breadcrumbNumText: "#FFDE00",
    breadcrumbMuted: "rgba(255,222,0,0.4)",
    breadcrumbBackText: "rgba(255,255,255,0.65)",
    breadcrumbBackBorder: "rgba(255,255,255,0.2)",
    blob1: "rgba(255,200,0,0.35)",
    blob2: "rgba(251,146,60,0.28)",
    blob3: "rgba(253,186,116,0.22)",
    selectOptionBg: "#0a160a",
    sectionHeaderBorder: "rgba(255,222,0,0.2)",
    sectionIconBg: "rgba(255,222,0,0.1)",
    sectionIconBorder: "rgba(255,222,0,0.4)",
    sectionIconColor: "#FFDE00",
    sectionTitleColor: "#f0fdf0",
    sectionTableChipBg: "rgba(255,222,0,0.08)",
    sectionTableChipBorder: "rgba(255,222,0,0.35)",
    sectionTableChipText: "#FFDE00",
    liveBadgeBg: "rgba(255,222,0,0.07)",
    liveBadgeBorder: "rgba(255,222,0,0.25)",
    liveBadgeLabel: "rgba(255,222,0,0.5)",
    liveBadgeValue: "#FFDE00",
    liveBadgeHiBg: "linear-gradient(135deg,rgba(255,222,0,0.12) 0%,rgba(255,222,0,0.04) 100%)",
    liveBadgeHiBorder: "rgba(255,222,0,0.45)",
    liveBadgeHiShadow: "0 0 20px rgba(255,222,0,0.08), inset 0 1px 0 rgba(255,222,0,0.1)",
    liveBadgeHiLabel: "rgba(255,222,0,0.6)",
    liveBadgeHiValue: "#FFDE00",
    liveBadgeHiGlow: "linear-gradient(90deg,transparent,rgba(255,222,0,0.5),transparent)",
    wizardNavBorder: "rgba(255,222,0,0.15)",
    statPositiveBg: "rgba(74,222,128,0.07)",
    statNegativeBg: "rgba(239,68,68,0.07)",
    statMutedText: "rgba(255,255,255,0.75)",
    logoAccentText: "#FFDE00",
    logoVersionText: "rgba(255,222,0,0.55)",
    logoIconBg: "rgba(255,222,0,0.1)",
    logoIconBorder: "rgba(255,222,0,0.3)",
    headerAccentBar: "linear-gradient(90deg,transparent 0%,rgba(255,222,0,0.4) 50%,transparent 100%)",
    headerBorder: "rgba(255,222,0,0.2)",
    headerStatusColor: "rgba(74,222,128,0.85)",
    footerText: "rgba(255,222,0,0.45)",
    heroLabel: "rgba(255,222,0,0.8)",
    heroTitle1: "#ffffff",
    heroTitle2: "rgba(255,255,255,0)",
    heroTitle3: "#FFDE00",
    themeSwitcherBg: "rgba(10,22,10,0.7)",
    themeSwitcherBorder: "rgba(255,222,0,0.2)",
    themeSwitcherActiveBg: "rgba(255,222,0,0.15)",
    themeSwitcherActiveText: "#FFDE00",
    themeSwitcherInactiveText: "rgba(255,255,255,0.55)",
    addRowText: "#FFDE00",
    addRowBorder: "rgba(255,222,0,0.35)",
    addRowHoverText: "#FFDE00",
    addRowHoverBorder: "#FFDE00",
    addRowHoverBg: "rgba(255,222,0,0.06)",
    narrativeBg: "rgba(255,222,0,0.06)",
    narrativeBorder: "rgba(255,222,0,0.2)",
    narrativeText: "rgba(255,222,0,0.85)",
    financeLineText: "rgba(255,222,0,0.7)",
    financeLineBorder: "rgba(255,222,0,0.15)",
  },

  green: {
    pageBg: "radial-gradient(ellipse at 20% 20%, rgba(14,40,12,0.97) 0%, rgba(4,10,4,1) 60%), url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2354C43C' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    pagePattern: "",
    headerBg: "rgba(4,10,4,0.82)",
    cardBg: "rgba(8,18,8,0.65)",
    cardBorder: "rgba(54,124,43,0.35)",
    cardShadow: "0 0 40px rgba(54,124,43,0.08)",
    cardInnerGlow: "inset 0 1px 0 rgba(255,222,0,0.05)",
    textPrimary: "#ffffff",
    textSecondary: "#d1fae5",
    textMuted: "rgba(255,255,255,0.72)",
    textInverse: "#0a2206",
    accent: "#4ade80",
    accentDim: "rgba(74,222,128,0.6)",
    accentDimmer: "rgba(74,222,128,0.3)",
    accentBg: "rgba(54,124,43,0.12)",
    accentBorder: "rgba(54,124,43,0.45)",
    highlight: "#a3e635",
    highlightDim: "rgba(163,230,53,0.5)",
    highlightBg: "rgba(163,230,53,0.08)",
    highlightBorder: "rgba(163,230,53,0.3)",
    stepActive: "#FFDE00",
    stepDone: "#4ade80",
    stepInactive: "rgba(255,255,255,0.18)",
    stepActiveBg: "rgba(255,222,0,0.12)",
    stepDoneBg: "rgba(74,222,128,0.12)",
    inputText: "#e8f5e3",
    inputBorder: "rgba(54,124,43,0.4)",
    inputFocusBorder: "#FFDE00",
    inputFocusShadow: "0 2px 0 -1px rgba(255,222,0,0.25)",
    inputHint: "rgba(255,222,0,0.4)",
    tableHeaderText: "rgba(74,222,128,0.7)",
    tableRowBorder: "rgba(54,124,43,0.15)",
    tableCellText: "#e8f5e3",
    tableNumText: "#86efac",
    btnPrimaryBg: "rgba(54,124,43,0.2)",
    btnPrimaryText: "#86efac",
    btnPrimaryBorder: "rgba(54,124,43,0.6)",
    btnPrimaryHoverBg: "rgba(54,124,43,0.4)",
    btnSecondaryText: "rgba(255,255,255,0.65)",
    btnSecondaryBorder: "rgba(255,255,255,0.18)",
    btnSecondaryHoverBg: "rgba(255,255,255,0.06)",
    path1Border: "rgba(54,124,43,0.3)",
    path1HoverBorder: "rgba(54,124,43,0.7)",
    path1HoverShadow: "0 0 40px rgba(54,124,43,0.15), inset 0 1px 0 rgba(54,124,43,0.2)",
    path1Glow: "#4ade80",
    path1GlowLine: "rgba(54,124,43,0.5)",
    path2Border: "rgba(255,222,0,0.2)",
    path2HoverBorder: "rgba(255,222,0,0.5)",
    path2HoverShadow: "0 0 40px rgba(255,222,0,0.08), inset 0 1px 0 rgba(255,222,0,0.1)",
    path2Glow: "#FFDE00",
    path3Border: "rgba(34,211,238,0.2)",
    path3HoverBorder: "rgba(34,211,238,0.45)",
    path3HoverShadow: "0 0 40px rgba(34,211,238,0.07), inset 0 1px 0 rgba(34,211,238,0.08)",
    path3Glow: "#22d3ee",
    breadcrumbBg: "rgba(8,18,8,0.65)",
    breadcrumbBorder: "rgba(54,124,43,0.25)",
    breadcrumbNumBg: "rgba(54,124,43,0.2)",
    breadcrumbNumBorder: "rgba(54,124,43,0.5)",
    breadcrumbNumText: "#4ade80",
    breadcrumbMuted: "rgba(74,200,74,0.4)",
    breadcrumbBackText: "rgba(255,255,255,0.65)",
    breadcrumbBackBorder: "rgba(255,255,255,0.2)",
    blob1: "rgba(34,124,43,0.45)",
    blob2: "rgba(132,220,48,0.28)",
    blob3: "rgba(74,222,128,0.22)",
    selectOptionBg: "#040a04",
    sectionHeaderBorder: "rgba(54,124,43,0.3)",
    sectionIconBg: "rgba(54,124,43,0.2)",
    sectionIconBorder: "rgba(54,124,43,0.5)",
    sectionIconColor: "#4ade80",
    sectionTitleColor: "#d1fae5",
    sectionTableChipBg: "rgba(255,222,0,0.12)",
    sectionTableChipBorder: "rgba(255,222,0,0.35)",
    sectionTableChipText: "#FFDE00",
    liveBadgeBg: "rgba(54,124,43,0.12)",
    liveBadgeBorder: "rgba(54,124,43,0.35)",
    liveBadgeLabel: "rgba(74,200,74,0.6)",
    liveBadgeValue: "#86efac",
    liveBadgeHiBg: "linear-gradient(135deg,rgba(255,222,0,0.12) 0%,rgba(255,222,0,0.04) 100%)",
    liveBadgeHiBorder: "rgba(255,222,0,0.45)",
    liveBadgeHiShadow: "0 0 20px rgba(255,222,0,0.08), inset 0 1px 0 rgba(255,222,0,0.1)",
    liveBadgeHiLabel: "rgba(255,222,0,0.6)",
    liveBadgeHiValue: "#FFDE00",
    liveBadgeHiGlow: "linear-gradient(90deg,transparent,rgba(255,222,0,0.5),transparent)",
    wizardNavBorder: "rgba(54,124,43,0.2)",
    statPositiveBg: "rgba(54,124,43,0.1)",
    statNegativeBg: "rgba(239,68,68,0.07)",
    statMutedText: "rgba(255,255,255,0.75)",
    logoAccentText: "#FFDE00",
    logoVersionText: "rgba(54,200,60,0.7)",
    logoIconBg: "rgba(255,222,0,0.1)",
    logoIconBorder: "rgba(255,222,0,0.3)",
    headerAccentBar: "linear-gradient(90deg,transparent 0%,rgba(255,222,0,0.4) 50%,transparent 100%)",
    headerBorder: "rgba(54,124,43,0.3)",
    headerStatusColor: "rgba(74,200,74,0.9)",
    footerText: "rgba(74,200,74,0.55)",
    heroLabel: "rgba(255,222,0,0.8)",
    heroTitle1: "#ffffff",
    heroTitle2: "rgba(255,255,255,0)",
    heroTitle3: "#4ade80",
    themeSwitcherBg: "rgba(8,18,8,0.7)",
    themeSwitcherBorder: "rgba(54,124,43,0.3)",
    themeSwitcherActiveBg: "rgba(54,124,43,0.25)",
    themeSwitcherActiveText: "#4ade80",
    themeSwitcherInactiveText: "rgba(255,255,255,0.55)",
    addRowText: "#4ade80",
    addRowBorder: "rgba(54,124,43,0.5)",
    addRowHoverText: "#FFDE00",
    addRowHoverBorder: "#FFDE00",
    addRowHoverBg: "rgba(255,222,0,0.05)",
    narrativeBg: "rgba(255,222,0,0.06)",
    narrativeBorder: "rgba(255,222,0,0.2)",
    narrativeText: "rgba(255,222,0,0.85)",
    financeLineText: "rgba(74,200,74,0.75)",
    financeLineBorder: "rgba(54,124,43,0.2)",
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS (kept for PDF generation)
// ═══════════════════════════════════════════════════════════════════════════
const JD = {
  green: "#367C2B", greenDark: "#244F1C", greenLight: "#4A9E3A",
  greenPale: "#EBF5E8", greenMid: "#D4EBD0",
  yellow: "#FFDE00", yellowDark: "#E5C800", yellowPale: "#FFFBCC",
  black: "#1A1A1A", gray900: "#1F2937", gray700: "#374151",
  gray500: "#6B7280", gray300: "#D1D5DB", gray100: "#F3F4F6",
  white: "#FFFFFF", red: "#DC2626", redPale: "#FEF2F2",
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY SYSTEM
// Primary sans  → Inter (with Geist fallback) — headings, body, UI
// Technical mono → JetBrains Mono — labels, metadata, numbers, codes
// ═══════════════════════════════════════════════════════════════════════════

const FONT = {
  sans: "'Inter', 'Geist', 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
} as const;

/** Reusable style objects — spread into `style={{}}` props */
const TYPO = {
  // ── Headings ──────────────────────────────────────────────────────────
  h1: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.05,
  } as React.CSSProperties,

  h2: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.015em",
    lineHeight: 1.15,
  } as React.CSSProperties,

  h3: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
  } as React.CSSProperties,

  // ── Body / UI prose ───────────────────────────────────────────────────
  body: {
    fontFamily: FONT.sans,
    fontWeight: 400,
    letterSpacing: "0em",
    lineHeight: 1.6,
  } as React.CSSProperties,

  bodySm: {
    fontFamily: FONT.sans,
    fontWeight: 400,
    fontSize: "0.75rem",
    letterSpacing: "0em",
    lineHeight: 1.55,
  } as React.CSSProperties,

  // ── Interactive / button text ─────────────────────────────────────────
  ui: {
    fontFamily: FONT.sans,
    fontWeight: 600,
    letterSpacing: "0em",
    lineHeight: 1.4,
  } as React.CSSProperties,

  uiBold: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.005em",
    lineHeight: 1.4,
  } as React.CSSProperties,

  // ── Span / inline accent (brand use) ──────────────────────────────────
  brandAccent: {
    fontFamily: FONT.sans,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.05,
  } as React.CSSProperties,

  // ── Labels & metadata (monospace technical) ────────────────────────────
  label: {
    fontFamily: FONT.mono,
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  labelXs: {
    fontFamily: FONT.mono,
    fontWeight: 600,
    fontSize: "0.625rem",  // 10px
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  labelXxs: {
    fontFamily: FONT.mono,
    fontWeight: 600,
    fontSize: "0.5625rem",  // 9px
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  // ── Monospace numeric / code ───────────────────────────────────────────
  numeric: {
    fontFamily: FONT.mono,
    fontWeight: 700,
    letterSpacing: "0.05em",
    lineHeight: 1.3,
  } as React.CSSProperties,

  numericLg: {
    fontFamily: FONT.mono,
    fontWeight: 900,
    letterSpacing: "0.02em",
    lineHeight: 1.1,
  } as React.CSSProperties,

  // ── Table header ──────────────────────────────────────────────────────
  tableHead: {
    fontFamily: FONT.mono,
    fontWeight: 700,
    fontSize: "0.625rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  // ── Chip / tag ────────────────────────────────────────────────────────
  chip: {
    fontFamily: FONT.mono,
    fontWeight: 700,
    fontSize: "0.5625rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase" as const,
    lineHeight: 1.4,
  } as React.CSSProperties,

  // ── Footer / fine print ───────────────────────────────────────────────
  footer: {
    fontFamily: FONT.mono,
    fontWeight: 600,
    fontSize: "0.5625rem",
    letterSpacing: "0.3em",
    textTransform: "uppercase" as const,
    lineHeight: 1.6,
  } as React.CSSProperties,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type PathId = "home" | "path1" | "path2" | "path3";

interface GlobalProfile {
  gazdinstvoName: string; nosilac: string; jmbgMb: string; bpg: string;
  adresa: string; opstina: string; telefon: string; email: string;
  racun: string; banka: string;
}
interface LandParcel { id: string; katMunicipality: string; parcelNumber: string; area: number; ownership: string; crop: string; }
interface Livestock { id: string; name: string; qty: number; valuePerHead: number; }
interface Building { id: string; name: string; area: number; value: number; }
interface Machinery { id: string; name: string; qty: number; value: number; }
interface InvestmentItem { id: string; name: string; unit: string; qty: number; priceNet: number; }
interface Path1State {
  parcels: LandParcel[]; livestock: Livestock[]; buildings: Building[]; machinery: Machinery[];
  landValue: number; buildingValue: number; livestockValue: number; equipmentValue: number;
  investmentItems: InvestmentItem[]; ownFunds: number;
  revenueYears: [number, number, number, number, number];
}
interface ProductRevenue { name: string; unitPrice: number; qty: [number, number, number, number, number]; }
interface Path2State {
  opisPoslovneIdeje: string; analizaProdajnog: string; analizaNabavnog: string;
  products: [ProductRevenue, ProductRevenue, ProductRevenue];
  materialCosts: { seeds: number; fertilizer: number; chemicals: number; };
  energyCosts: { fuel: number; electricity: number; };
  nonMaterialCosts: { insurance: number; accounting: number; registration: number; };
  workers: number; monthlyWage: number; totalInvestment: number;
}
interface IrrigationItem { id: string; name: string; unit: string; qty: number; price: number; }
interface Path3State {
  katMunicipality: string; hectares: number;
  existingPumps: string; existingTractors: string; existingTools: string;
  items: IrrigationItem[];
  revenueYears: [number, number, number, number, number];
  expenseYears: [number, number, number, number, number];
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL STATES
// ═══════════════════════════════════════════════════════════════════════════

const GLOBAL_INIT: GlobalProfile = {
  gazdinstvoName: "PG Petrović", nosilac: "Milovan Petrović", jmbgMb: "0501975710034",
  bpg: "500212345", adresa: "Braće Radić 7", opstina: "Sombor",
  telefon: "+381 64 123 4567", email: "petrovic@agro.rs", racun: "160-00000001234-56", banka: "Banca Intesa",
};
const PATH1_INIT: Path1State = {
  parcels: [
    { id: "l1", katMunicipality: "Sombor", parcelNumber: "3421/1", area: 8.5, ownership: "Sopstveno", crop: "Kukuruz" },
    { id: "l2", katMunicipality: "Sombor", parcelNumber: "3421/2", area: 4.2, ownership: "Sopstveno", crop: "Soja" },
  ],
  livestock: [
    { id: "lv1", name: "Goveda (tov)", qty: 20, valuePerHead: 150000 },
    { id: "lv2", name: "Svinje", qty: 50, valuePerHead: 35000 },
  ],
  buildings: [
    { id: "b1", name: "Staja za goveda", area: 400, value: 3200000 },
    { id: "b2", name: "Magacin za žitarice", area: 200, value: 1500000 },
  ],
  machinery: [
    { id: "m1", name: "Traktor IMT 577", qty: 1, value: 1800000 },
    { id: "m2", name: "Kombajn CLAAS", qty: 1, value: 4500000 },
  ],
  landValue: 5200000, buildingValue: 4700000, livestockValue: 4750000, equipmentValue: 6300000,
  investmentItems: [
    { id: "i1", name: "Sistem navodnjavanja (pump stanica)", unit: "kom", qty: 1, priceNet: 850000 },
    { id: "i2", name: "PE cevi za navodnjavanje dn110", unit: "m", qty: 600, priceNet: 1200 },
    { id: "i3", name: "Kap-kap laterale sa kapaljkama", unit: "m", qty: 8500, priceNet: 85 },
    { id: "i4", name: "Elektro-ventili i kontroler", unit: "kom", qty: 4, priceNet: 45000 },
  ],
  ownFunds: 800000,
  revenueYears: [1800000, 2100000, 2400000, 2700000, 3000000],
};
const PATH2_INIT: Path2State = {
  opisPoslovneIdeje: "Kupovina opreme i proširenje kapaciteta",
  analizaProdajnog: "Lokalno tržište i izvoz",
  analizaNabavnog: "Domaći dobavljači repromaterijala",
  products: [
    { name: "Pšenica (klasa A)", unitPrice: 32, qty: [320000, 350000, 380000, 400000, 420000] },
    { name: "Suncokret", unitPrice: 95, qty: [80000, 90000, 100000, 110000, 120000] },
    { name: "Kukuruz (krmni)", unitPrice: 28, qty: [200000, 220000, 240000, 260000, 280000] },
  ],
  materialCosts: { seeds: 280000, fertilizer: 420000, chemicals: 150000 },
  energyCosts: { fuel: 180000, electricity: 45000 },
  nonMaterialCosts: { insurance: 85000, accounting: 60000, registration: 12000 },
  workers: 3, monthlyWage: 85000, totalInvestment: 2800000,
};
const PATH3_INIT: Path3State = {
  katMunicipality: "Sombor", hectares: 12.4,
  existingPumps: "1× električna pumpa 5.5 kW", existingTractors: "1× IMT 577 DV",
  existingTools: "Atomizer, prikolica 5t",
  items: [
    { id: "ir1", name: "Pumpa stanica frekventna", unit: "kom", qty: 1, price: 620000 },
    { id: "ir2", name: "Kap-kap laterale (Netafim)", unit: "m", qty: 12400, price: 92 },
    { id: "ir3", name: "Filteri disk (120 mesh)", unit: "kom", qty: 3, price: 28000 },
    { id: "ir4", name: "Montaža i puštanje u rad", unit: "paušal", qty: 1, price: 185000 },
  ],
  revenueYears: [1600000, 1900000, 2200000, 2500000, 2800000],
  expenseYears: [920000, 950000, 980000, 1010000, 1040000],
};

// ═══════════════════════════════════════════════════════════════════════════
// NARRATIVE FORMATTER
// ═══════════════════════════════════════════════════════════════════════════

const NARRATIVE_MAP: [RegExp, string][] = [
  [/kupo?v[a-z]*/gi, "Nabavka i implementacija osnovnih sredstava"],
  [/proš[a-z]*/gi, "Proširenje proizvodnih kapaciteta i povećanje tržišnog udela"],
  [/lokalno?\s+tržišt[a-z]*/gi, "Plasman na regionalno i domaće tržište uz mogućnost izvoza"],
  [/domaći\s+dobavljač[a-z]*/gi, "Nabavka repromaterijala od sertifikovanih domaćih dobavljača"],
  [/izvoz/gi, "Unapređenje izvoznog potencijala i pozicioniranje na EU tržištu"],
  [/zapad[a-z]*/gi, "Plasman na tržišta zapadnih zemalja i EU"],
  [/sezona[a-z]*/gi, "Optimizacija sezonske proizvodnje i kalendarskog plana radova"],
  [/profit[a-z]*/gi, "Povećanje ekonomske efikasnosti i stope akumulacije kapitala"],
];

function formatNarrative(text: string): string {
  let result = text;
  for (const [pattern, replacement] of NARRATIVE_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// MATH ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function calcPath1(s: Path1State) {
  const totalAssets = s.landValue + s.buildingValue + s.livestockValue + s.equipmentValue;
  const totalInvNet = s.investmentItems.reduce((a, i) => a + i.priceNet * i.qty, 0);
  const totalInvGross = totalInvNet * 1.2;
  const grants = totalInvNet * 0.5;
  const loan = totalInvNet - s.ownFunds - grants;
  const annualDep = totalInvNet * 0.10;
  const fixedCosts = annualDep + 420000 + 650000;
  const profits = s.revenueYears.map(r => {
    const grossProfit = r - fixedCosts;
    const tax = Math.max(0, grossProfit * 0.10);
    return { revenue: r, gross: grossProfit, tax, net: grossProfit - tax };
  });
  return { totalAssets, totalInvNet, totalInvGross, grants, loan, annualDep, profits };
}

function calcPath2(s: Path2State) {
  const revenueByYear = [0, 1, 2, 3, 4].map(yr =>
    s.products.reduce((sum, p) => sum + p.unitPrice * p.qty[yr as 0 | 1 | 2 | 3 | 4], 0)
  );
  const totalMaterial = s.materialCosts.seeds + s.materialCosts.fertilizer + s.materialCosts.chemicals;
  const totalEnergy = s.energyCosts.fuel + s.energyCosts.electricity;
  const totalNonMaterial = s.nonMaterialCosts.insurance + s.nonMaterialCosts.accounting + s.nonMaterialCosts.registration;
  const laborAnnual = s.workers * s.monthlyWage * 12;
  const amortizacija = s.totalInvestment * 0.10;
  const totalCosts = totalMaterial + totalEnergy + totalNonMaterial + laborAnnual + amortizacija;
  const results = revenueByYear.map(rev => {
    const gross = rev - totalCosts;
    const tax = Math.max(0, gross * 0.10);
    return { rev, totalCosts, gross, tax, net: gross - tax };
  });
  const avgNet = results.reduce((a, r) => a + r.net, 0) / 5;
  const avgRev = revenueByYear.reduce((a, r) => a + r, 0) / 5;
  const roi = s.totalInvestment > 0 ? (avgNet / s.totalInvestment) * 100 : 0;
  const economicity = totalCosts > 0 ? avgRev / totalCosts : 0;
  const payback = avgNet > 0 ? s.totalInvestment / avgNet : 0;
  return { revenueByYear, totalMaterial, totalEnergy, totalNonMaterial, laborAnnual, amortizacija, totalCosts, results, roi, economicity, payback };
}

function calcPath3(s: Path3State) {
  const totalInv = s.items.reduce((a, i) => a + i.price * i.qty, 0);
  const efficiency = s.revenueYears.map((r, i) => ({
    year: 2026 + i, revenue: r, expense: s.expenseYears[i],
    coeff: s.expenseYears[i] > 0 ? r / s.expenseYears[i] : 0,
    net: r - s.expenseYears[i],
  }));
  const avgCoeff = efficiency.reduce((a, e) => a + e.coeff, 0) / 5;
  return { totalInv, efficiency, avgCoeff };
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════════════════════

function fmtRSD(n: number) { return n.toLocaleString("sr-RS", { minimumFractionDigits: 0 }) + " RSD"; }
function fmtN(n: number, d = 0) { return n.toLocaleString("sr-RS", { minimumFractionDigits: d, maximumFractionDigits: d }); }

// ═══════════════════════════════════════════════════════════════════════════
// PDF HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const PDF_HS = { fillColor: [54, 124, 43] as [number, number, number], textColor: 255, fontStyle: "bold" as const, fontSize: 8 };
const PDF_BASE = { styles: { fontSize: 7.5, cellPadding: 2.5 }, headStyles: PDF_HS, alternateRowStyles: { fillColor: [235, 245, 232] as [number, number, number] }, theme: "grid" as const };
const PDF_FS = { fontStyle: "bold" as const, fillColor: [212, 235, 208] as [number, number, number] };

function addCoverPage(doc: jsPDF, p: GlobalProfile, title: string, sub: string) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(54, 124, 43); doc.rect(0, 0, pw, 55, "F");
  doc.setFillColor(255, 222, 0); doc.rect(0, 52, pw, 5, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(255, 222, 0);
  doc.text("AGRO", 14, 22);
  doc.setTextColor(255, 255, 255); doc.text("PLAN", 14 + doc.getTextWidth("AGRO") + 2, 22);
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text("Ministarstvo poljoprivrede RS · IPARD program", 14, 32);
  doc.setFontSize(8); doc.setTextColor(200, 240, 190); doc.text(sub, 14, 42);
  doc.setTextColor(26, 26, 26); doc.setFont("helvetica", "bold"); doc.setFontSize(15);
  doc.text(title, pw / 2, 74, { align: "center", maxWidth: 175 });
  autoTable(doc, {
    startY: 84,
    body: [
      ["Naziv gazdinstva:", p.gazdinstvoName], ["Nosilac:", p.nosilac], ["JMBG/MB:", p.jmbgMb],
      ["BPG:", p.bpg], ["Opština:", p.opstina], ["Kontakt:", `${p.telefon} | ${p.email}`],
      ["Banka / Račun:", `${p.banka} | ${p.racun}`],
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 }, 1: { cellWidth: 130 } },
    ...PDF_BASE, headStyles: undefined, alternateRowStyles: { fillColor: [248, 252, 248] },
  });
}

function addPageNums(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  const pw = doc.internal.pageSize.getWidth();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i); doc.setFontSize(7); doc.setTextColor(160);
    doc.text(`Str. ${i} od ${total}`, pw - 14, 290, { align: "right" });
  }
}

function tblH(doc: jsPDF, y: number, text: string) {
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(54, 124, 43);
  doc.text(text, 14, y);
}

// ═══════════════════════════════════════════════════════════════════════════
// PDF GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

function generatePath1PDF(profile: GlobalProfile, s: Path1State) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const calc = calcPath1(s);
  addCoverPage(doc, profile, "POSLOVNI PLAN GAZDINSTVA\n(Model Agro Vojvodina – IPARD Mera 1)", "Model poslovnog plana za investicije u fizičku imovinu");
  doc.addPage();
  tblH(doc, 18, "Tabela 1.1 – Zemljišni fond");
  autoTable(doc, {
    startY: 23,
    head: [["Br.", "Katastarska opština", "Broj parcele", "Površina (ha)", "Vlasništvo", "Kultura"]],
    body: s.parcels.map((p, i) => [i + 1, p.katMunicipality, p.parcelNumber, fmtN(p.area, 2), p.ownership, p.crop]),
    foot: [["", "UKUPNO", "", fmtN(s.parcels.reduce((a, p) => a + p.area, 0), 2) + " ha", "", ""]],
    footStyles: PDF_FS, ...PDF_BASE,
  });
  let y = (doc as any).lastAutoTable.finalY + 10;
  tblH(doc, y, "Tabela 1.2 – Stočni fond");
  autoTable(doc, {
    startY: y + 5, head: [["Vrsta stoke", "Broj grla", "Vrednost/grlu (RSD)", "Ukupno (RSD)"]],
    body: s.livestock.map(l => [l.name, l.qty, fmtRSD(l.valuePerHead), fmtRSD(l.qty * l.valuePerHead)]),
    foot: [["UKUPNO", "", "", fmtRSD(s.livestock.reduce((a, l) => a + l.qty * l.valuePerHead, 0))]], footStyles: PDF_FS, ...PDF_BASE
  });
  y = (doc as any).lastAutoTable.finalY + 10;
  tblH(doc, y, "Tabela 1.3 – Objekti");
  autoTable(doc, {
    startY: y + 5, head: [["Naziv objekta", "Površina (m²)", "Vrednost (RSD)"]],
    body: s.buildings.map(b => [b.name, fmtN(b.area), fmtRSD(b.value)]),
    foot: [["UKUPNO", "", fmtRSD(s.buildings.reduce((a, b) => a + b.value, 0))]], footStyles: PDF_FS, ...PDF_BASE
  });
  y = (doc as any).lastAutoTable.finalY + 10;
  tblH(doc, y, "Tabela 1.4 – Mehanizacija");
  autoTable(doc, {
    startY: y + 5, head: [["Naziv", "Kom", "Vrednost (RSD)"]],
    body: s.machinery.map(m => [m.name, m.qty, fmtRSD(m.value)]),
    foot: [["UKUPNO", "", fmtRSD(s.machinery.reduce((a, m) => a + m.value, 0))]], footStyles: PDF_FS, ...PDF_BASE
  });
  doc.addPage();
  tblH(doc, 18, "Tabela 1.5 – Vrednost osnovnih sredstava");
  autoTable(doc, {
    startY: 23,
    body: [
      ["Zemljište", fmtRSD(s.landValue)], ["Objekti", fmtRSD(s.buildingValue)],
      ["Stočni fond", fmtRSD(s.livestockValue)], ["Mehanizacija", fmtRSD(s.equipmentValue)],
    ],
    foot: [["UKUPNA AKTIVA", fmtRSD(calc.totalAssets)]], footStyles: PDF_FS,
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 } }, ...PDF_BASE, headStyles: undefined,
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y, "Tabela 3.2 – Specifikacija investicije");
  autoTable(doc, {
    startY: y + 5, head: [["Stavka", "JM", "Količina", "Cena neto (RSD)", "Ukupno neto (RSD)", "Ukupno sa PDV (RSD)"]],
    body: s.investmentItems.map(i => [i.name, i.unit, i.qty, fmtRSD(i.priceNet), fmtRSD(i.priceNet * i.qty), fmtRSD(i.priceNet * i.qty * 1.2)]),
    foot: [["UKUPNO", "", "", "", fmtRSD(calc.totalInvNet), fmtRSD(calc.totalInvGross)]], footStyles: PDF_FS, ...PDF_BASE,
  });
  doc.addPage();
  tblH(doc, 18, "Tabela 3.3 – Izvori finansiranja");
  autoTable(doc, {
    startY: 23,
    body: [
      ["Sopstvena sredstva", fmtRSD(s.ownFunds)],
      ["IPARD podsticaj (50% neto vrednosti)", fmtRSD(calc.grants)],
      ["Kredit (ostatak)", fmtRSD(Math.max(0, calc.loan))],
      ["UKUPNO ULAGANJE (sa PDV)", fmtRSD(calc.totalInvGross)],
    ],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 100 } }, ...PDF_BASE, headStyles: undefined,
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y, "Tabela 5.1 – Projekcija prihoda i neto dobiti");
  autoTable(doc, {
    startY: y + 5, head: [["Pozicija", "G1 (2026)", "G2 (2027)", "G3 (2028)", "G4 (2029)", "G5 (2030)"]],
    body: [
      ["Prihodi (RSD)", ...calc.profits.map(p => fmtRSD(p.revenue))],
      ["Amortizacija (RSD)", ...calc.profits.map(() => fmtRSD(calc.annualDep))],
      ["Bruto dobit (RSD)", ...calc.profits.map(p => fmtRSD(p.gross))],
      ["Porez 10% (RSD)", ...calc.profits.map(p => fmtRSD(p.tax))],
      ["NETO DOBIT (RSD)", ...calc.profits.map(p => fmtRSD(p.net))],
    ],
    ...PDF_BASE, styles: { fontSize: 7, cellPadding: 2 },
    didParseCell: (d: any) => { if (d.row.index === 4) { d.cell.styles.fontStyle = "bold"; d.cell.styles.fillColor = [212, 235, 208]; } }
  });
  addPageNums(doc);
  doc.save(`PoslovniPlan_IPARD_${profile.gazdinstvoName.replace(/\s/g, "_")}.pdf`);
}

function generatePath2PDF(profile: GlobalProfile, s: Path2State) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const calc = calcPath2(s);
  addCoverPage(doc, profile, "POSLOVNI PLAN\n(Model Mladi Preduzetnik)", "Prilagođeno za start-up podsticaje i ekonomsku ocenu projekta");
  doc.addPage();
  tblH(doc, 18, "Sekcija 3 – Opis poslovne ideje i analiza tržišta");
  const pw = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(50);
  const d1 = doc.splitTextToSize(`Poslovna ideja: ${formatNarrative(s.opisPoslovneIdeje)}`, pw - 28);
  doc.text(d1, 14, 26);
  let y = 26 + d1.length * 5 + 8;
  const d2 = doc.splitTextToSize(`Prodajno: ${formatNarrative(s.analizaProdajnog)}\n\nNabavno: ${formatNarrative(s.analizaNabavnog)}`, pw - 28);
  doc.text(d2, 14, y + 8);
  y = y + 8 + d2.length * 5 + 10;
  if (y > 230) { doc.addPage(); y = 18; }
  tblH(doc, y, "Tabela 8.1 – Plan prihoda (5 godina)");
  autoTable(doc, {
    startY: y + 5,
    head: [["Proizvod", "J. cena (RSD)", "2026", "2027", "2028", "2029", "2030", "Prosek (RSD)"]],
    body: s.products.map(p => [p.name, fmtRSD(p.unitPrice), ...p.qty.map(q => fmtRSD(p.unitPrice * q)), fmtRSD(p.qty.reduce((a, q) => a + p.unitPrice * q, 0) / 5)]),
    foot: [["UKUPNO", "", ...calc.revenueByYear.map(r => fmtRSD(r)), fmtRSD(calc.revenueByYear.reduce((a, r) => a + r, 0) / 5)]],
    footStyles: PDF_FS, ...PDF_BASE, styles: { fontSize: 7, cellPadding: 2 }
  });
  doc.addPage();
  tblH(doc, 18, "Tabele 8.2.1 – 8.2.6 – Pregled troškova");
  autoTable(doc, {
    startY: 23, head: [["Kategorija troška", "Iznos (RSD/god)"]],
    body: [
      ["8.2.1 – Seme i sadni materijal", fmtRSD(s.materialCosts.seeds)],
      ["8.2.1 – Đubrivo", fmtRSD(s.materialCosts.fertilizer)],
      ["8.2.1 – Hemijska zaštita bilja", fmtRSD(s.materialCosts.chemicals)],
      ["8.2.2 – Gorivo", fmtRSD(s.energyCosts.fuel)],
      ["8.2.2 – Električna energija", fmtRSD(s.energyCosts.electricity)],
      ["8.2.4 – Amortizacija (10%)", fmtRSD(calc.amortizacija)],
      ["8.2.5 – Osiguranje", fmtRSD(s.nonMaterialCosts.insurance)],
      ["8.2.5 – Računovodstvo", fmtRSD(s.nonMaterialCosts.accounting)],
      ["8.2.5 – Registracije/takse", fmtRSD(s.nonMaterialCosts.registration)],
      [`8.2.6 – Bruto zarade (${s.workers} radn. x ${fmtRSD(s.monthlyWage)}/mes x 12)`, fmtRSD(calc.laborAnnual)],
    ],
    foot: [["UKUPNI TROŠKOVI (godišnje)", fmtRSD(calc.totalCosts)]], footStyles: PDF_FS, ...PDF_BASE
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y, "Tabela 8.2.8 – Bilans uspeha");
  autoTable(doc, {
    startY: y + 5, head: [["Pozicija", "2026", "2027", "2028", "2029", "2030"]],
    body: [
      ["Ukupni prihodi (RSD)", ...calc.results.map(r => fmtRSD(r.rev))],
      ["Ukupni rashodi (RSD)", ...calc.results.map(r => fmtRSD(r.totalCosts))],
      ["Bruto dobit (RSD)", ...calc.results.map(r => fmtRSD(r.gross))],
      ["Porez (10%) (RSD)", ...calc.results.map(r => fmtRSD(r.tax))],
      ["NETO DOBIT (RSD)", ...calc.results.map(r => fmtRSD(r.net))],
    ],
    ...PDF_BASE, styles: { fontSize: 7, cellPadding: 2 },
    didParseCell: (d: any) => { if (d.row.index === 4) { d.cell.styles.fontStyle = "bold"; d.cell.styles.fillColor = [212, 235, 208]; } }
  });
  y = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y, "Tabela 9 – Ocena efikasnosti projekta");
  autoTable(doc, {
    startY: y + 5, head: [["Pokazatelj", "Formula", "Vrednost", "Ocena"]],
    body: [
      ["ROI – Rentabilnost", "Neto dobit / Ulaganja x 100", `${calc.roi.toFixed(1)}%`, calc.roi > 10 ? "Prihvatljivo" : "Ispod praga"],
      ["Ekonomičnost", "Ukupni prihod / Ukupni rashod", calc.economicity.toFixed(3), calc.economicity >= 1 ? "Projekat je ekonomican" : "Nije ekonomican"],
      ["Vreme povracaja", "Ulaganja / Godišnji neto priliv", `${calc.payback.toFixed(1)} god.`, ""],
    ],
    ...PDF_BASE
  });
  addPageNums(doc);
  doc.save(`PoslovniPlan_MladiPreduzetnik_${profile.gazdinstvoName.replace(/\s/g, "_")}.pdf`);
}

function generatePath3PDF(profile: GlobalProfile, s: Path3State) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const calc = calcPath3(s);
  addCoverPage(doc, profile, "POSLOVNI PLAN – SISTEM ZA NAVODNJAVANJE\n(Tehnička investicija)", "Model poslovnog plana za navodnjavanje – IPARD Mera 1");
  doc.addPage();
  tblH(doc, 18, "Tabela 1.2 – Lokacija investicije");
  autoTable(doc, {
    startY: 23,
    body: [["Katastarska opština", s.katMunicipality], ["Površina pod navodnjavanjem", `${fmtN(s.hectares, 2)} ha`],
    ["Postojeće pumpe", s.existingPumps], ["Postojeći traktori", s.existingTractors], ["Ostala mehanizacija/alati", s.existingTools]],
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 } },
    ...PDF_BASE, headStyles: undefined
  });
  const y33 = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y33, "Tabela 3.3 – Specifikacija investicionih stavki");
  autoTable(doc, {
    startY: y33 + 5, head: [["Br.", "Naziv stavke", "J.M.", "Količina", "Cena (RSD)", "Ukupno (RSD)"]],
    body: s.items.map((i, idx) => [idx + 1, i.name, i.unit, i.qty, fmtRSD(i.price), fmtRSD(i.price * i.qty)]),
    foot: [["", "UKUPNO INVESTICIJA", "", "", "", fmtRSD(calc.totalInv)]], footStyles: PDF_FS, ...PDF_BASE
  });
  const y53 = (doc as any).lastAutoTable.finalY + 12;
  tblH(doc, y53, "Tabela 5.3 – Staticka ocena efikasnosti investicije");
  autoTable(doc, {
    startY: y53 + 5, head: [["Godina", "Prihodi (RSD)", "Rashodi (RSD)", "Neto efekat (RSD)", "Koef. efikasnosti", "Ocena"]],
    body: calc.efficiency.map(e => [e.year, fmtRSD(e.revenue), fmtRSD(e.expense), fmtRSD(e.net), e.coeff.toFixed(3), e.coeff > 1 ? "Prihvatljivo" : "Ispod 1.0"]),
    foot: [["PROSEK", "", "", fmtRSD(calc.efficiency.reduce((a, e) => a + e.net, 0) / 5), calc.avgCoeff.toFixed(3), calc.avgCoeff > 1 ? "PROJEKAT VALIDAN" : "NIJE VALIDAN"]],
    footStyles: { ...PDF_FS, fillColor: calc.avgCoeff > 1 ? [212, 235, 208] : [254, 226, 226] as [number, number, number] },
    ...PDF_BASE
  });
  addPageNums(doc);
  doc.save(`PoslovniPlan_Navodnjavanje_${profile.gazdinstvoName.replace(/\s/g, "_")}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
// PARALLAX BLOBS
// ═══════════════════════════════════════════════════════════════════════════

function ParallaxBlobs({ theme }: { theme: ThemeKey }) {
  const tc = THEME_CONFIG[theme];
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${x * 40 - 20}px, ${y * 30 - 15}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${x * -28 + 14}px, ${y * 20 - 10}px)`;
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate(${x * 18 - 9}px, ${y * -22 + 11}px)`;
      }
    };
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? scrollY / maxScroll : 0;
      if (blob1Ref.current) {
        blob1Ref.current.style.top = `${-10 + ratio * 30}%`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.top = `${30 + ratio * 20}%`;
      }
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
          opacity: theme === "white" ? 0.9 : 0.9,
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

// ═══════════════════════════════════════════════════════════════════════════
// THEME-AWARE UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

function Card({ children, className = "", tc }: { children: React.ReactNode; className?: string; tc: ThemeConfig }) {
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

function JDInput({ label, value, onChange, type = "text", placeholder, hint, className = "", tc }: {
  label?: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; className?: string; tc: ThemeConfig;
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block mb-1 uppercase tracking-[0.18em] text-[10px] font-semibold"
          style={{ color: tc.accentDim, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
          {label}
        </label>
      )}
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "—"}
        className="w-full bg-transparent px-0 py-2 text-sm transition-all focus:outline-none"
        style={{
          color: tc.inputText,
          borderBottom: `1px solid ${tc.inputBorder}`,
          fontFamily: type === "number" ? "'JetBrains Mono', 'Fira Code', monospace" : "inherit",
          letterSpacing: type === "number" ? "0.05em" : undefined,
        }}
        onFocus={e => {
          e.target.style.borderBottomColor = tc.inputFocusBorder;
          e.target.style.boxShadow = tc.inputFocusShadow;
        }}
        onBlur={e => {
          e.target.style.borderBottomColor = tc.inputBorder;
          e.target.style.boxShadow = "none";
        }}
      />
      {hint && <p className="text-xs mt-1" style={{ color: tc.inputHint, fontFamily: "monospace" }}>{hint}</p>}
    </div>
  );
}

function JDTextarea({ label, value, onChange, rows = 3, hint, tc }: {
  label?: string; value: string; onChange: (v: string) => void; rows?: number; hint?: string; tc: ThemeConfig;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 uppercase tracking-[0.18em] text-[10px] font-semibold"
          style={{ color: tc.accentDim, fontFamily: "monospace" }}>
          {label}
        </label>
      )}
      <textarea
        value={value} onChange={e => onChange(e.target.value)} rows={rows}
        className="w-full bg-transparent px-0 py-2 text-sm transition-all focus:outline-none resize-none"
        style={{
          color: tc.inputText,
          borderBottom: `1px solid ${tc.inputBorder}`,
        }}
        onFocus={e => { e.target.style.borderBottomColor = tc.inputFocusBorder; }}
        onBlur={e => { e.target.style.borderBottomColor = tc.inputBorder; }}
      />
      {hint && <p className="text-xs mt-1 italic" style={{ color: tc.inputHint }}>{hint}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, table, tc }: {
  icon: React.ElementType; title: string; table?: string; tc: ThemeConfig;
}) {
  return (
    <div className="flex items-start gap-3 mb-6 pb-4" style={{ borderBottom: `1px solid ${tc.sectionHeaderBorder}` }}>
      <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: tc.sectionIconBg, border: `1px solid ${tc.sectionIconBorder}` }}>
        <Icon size={15} color={tc.sectionIconColor} />
      </div>
      <div>
        {table && (
          <div className="inline-block mb-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-[0.2em] uppercase"
            style={{
              background: tc.sectionTableChipBg,
              border: `1px solid ${tc.sectionTableChipBorder}`,
              color: tc.sectionTableChipText,
              fontFamily: "monospace",
            }}>
            {table}
          </div>
        )}
        <h3 className="font-bold text-sm tracking-wide" style={{ color: tc.sectionTitleColor }}>{title}</h3>
      </div>
    </div>
  );
}

function LiveBadge({ label, value, hi = false, tc }: { label: string; value: string; hi?: boolean; tc: ThemeConfig }) {
  return (
    <div className="rounded-xl px-4 py-3 flex flex-col gap-1 relative overflow-hidden"
      style={{
        background: hi ? tc.liveBadgeHiBg : tc.liveBadgeBg,
        border: `1px solid ${hi ? tc.liveBadgeHiBorder : tc.liveBadgeBorder}`,
        boxShadow: hi ? tc.liveBadgeHiShadow : "none",
      }}>
      {hi && (
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: tc.liveBadgeHiGlow }} />
      )}
      <span className="uppercase tracking-[0.18em] text-[9px] font-semibold"
        style={{ color: hi ? tc.liveBadgeHiLabel : tc.liveBadgeLabel, fontFamily: "monospace" }}>
        {label}
      </span>
      <span className="font-black text-base leading-tight"
        style={{
          color: hi ? tc.liveBadgeHiValue : tc.liveBadgeValue,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          textShadow: hi ? `0 0 12px ${tc.liveBadgeHiGlow}` : `0 0 8px ${tc.liveBadgeValue}40`,
        }}>
        {value}
      </span>
    </div>
  );
}

function THead({ cols, tc }: { cols: string[]; tc: ThemeConfig }) {
  return (
    <thead>
      <tr style={{ borderBottom: `1px solid ${tc.accentBorder}` }}>
        {cols.map(c => (
          <th key={c} className="px-3 py-2.5 text-left text-[10px] font-bold whitespace-nowrap uppercase tracking-[0.15em]"
            style={{ color: tc.tableHeaderText, fontFamily: "monospace" }}>
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function AddRowBtn({ onClick, tc }: { onClick: () => void; tc: ThemeConfig }) {
  return (
    <button onClick={onClick}
      className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all"
      style={{
        color: tc.addRowText,
        border: `1px dashed ${tc.addRowBorder}`,
        background: "transparent",
        fontFamily: "monospace",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = tc.addRowHoverBorder;
        (e.currentTarget as HTMLElement).style.color = tc.addRowHoverText;
        (e.currentTarget as HTMLElement).style.background = tc.addRowHoverBg;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = tc.addRowBorder;
        (e.currentTarget as HTMLElement).style.color = tc.addRowText;
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}>
      <Plus size={12} />
      Dodaj red
    </button>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-7 h-7 rounded flex items-center justify-center transition-all"
      style={{ color: "rgba(239,68,68,0.5)", background: "transparent" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = "#ef4444";
        (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.5)";
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}>
      <X size={13} />
    </button>
  );
}

function GlassSelect({ value, onChange, options, tc }: {
  value: string; onChange: (v: string) => void; options: string[]; tc: ThemeConfig;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="bg-transparent text-sm focus:outline-none w-full py-2"
      style={{
        color: tc.inputText,
        borderBottom: `1px solid ${tc.inputBorder}`,
      }}>
      {options.map(o => <option key={o} value={o} style={{ background: tc.selectOptionBg, color: tc.inputText }}>{o}</option>)}
    </select>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME SWITCHER
// ═══════════════════════════════════════════════════════════════════════════

function ThemeSwitcher({ theme, setTheme, tc }: { theme: ThemeKey; setTheme: (t: ThemeKey) => void; tc: ThemeConfig }) {
  const themes: { key: ThemeKey; label: string; icon: React.ReactNode }[] = [
    { key: "white", label: "", icon: <Sun size={12} style={{ color: tc.heroTitle3 }} /> },
    { key: "yellow", label: "", icon: <Leaf size={12} /> },
  ];
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl"
      style={{ background: tc.themeSwitcherBg, border: `1px solid ${tc.themeSwitcherBorder}` }}>
      {themes.map(t => (
        <button key={t.key} onClick={() => setTheme(t.key)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
          style={{
            background: theme === t.key ? tc.themeSwitcherActiveBg : "transparent",
            color: theme === t.key ? tc.themeSwitcherActiveText : tc.themeSwitcherInactiveText,
            fontFamily: "monospace",
          }}>
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP WIZARD
// ═══════════════════════════════════════════════════════════════════════════

interface StepDef { id: string; label: string; icon: string; tableRef?: string; }

function StepWizard({ steps, currentStep, setCurrentStep, children, onFinish, onBack, tc }: {
  steps: StepDef[]; currentStep: number; setCurrentStep: (n: number) => void;
  children: React.ReactNode; onFinish: () => void; onBack: () => void; tc: ThemeConfig;
}) {
  return (
    <div>
      {/* HUD Timeline */}
      <div 
  className="mb-8 overflow-x-auto pb-2" 
  style={{ paddingTop: "1.2rem" }} // Added margin-top here
>
  <div className="flex items-center min-w-max">
    {steps.map((s, i) => (
      <div key={s.id} className="flex items-center">
        <button onClick={() => setCurrentStep(i)}
          className="flex flex-col items-center gap-1.5 group transition-all"
          style={{ minWidth: 80 }}>
          <div className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              background: i === currentStep ? tc.stepActiveBg : i < currentStep ? tc.stepDoneBg : "rgba(128,128,128,0.06)",
              border: `1.5px solid ${i === currentStep ? tc.stepActive : i < currentStep ? tc.stepDone : tc.stepInactive}`,
              boxShadow: i === currentStep ? `0 0 16px ${tc.stepActive}33` : "none",
            }}>
            {i < currentStep
              ? <CheckCircle2 size={15} color={tc.stepDone} />
              : <span className="text-xs" style={{ color: i === currentStep ? tc.stepActive : tc.stepInactive }}>{s.icon}</span>
            }
            {i === currentStep && (
              <div className="absolute -inset-1 rounded-full animate-ping opacity-20"
                style={{ background: tc.stepActive, animationDuration: "2s" }} />
            )}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-colors"
              style={{
                color: i === currentStep ? tc.stepActive : i < currentStep ? tc.stepDone : tc.stepInactive,
                fontFamily: "monospace",
              }}>
              {s.label}
            </span>
            {s.tableRef && (
              <span className="text-[8px] tracking-wide"
                style={{ color: tc.stepInactive, fontFamily: "monospace" }}>
                {s.tableRef}
              </span>
            )}
          </div>
        </button>
        {i < steps.length - 1 && (
          <div className="mx-2 h-px w-8 flex-shrink-0"
            style={{
              background: i < currentStep
                ? `linear-gradient(90deg, ${tc.stepDone}99, ${tc.stepDone}44)`
                : tc.wizardNavBorder,
              boxShadow: i < currentStep ? `0 0 4px ${tc.stepDone}44` : "none",
            }} />
        )}
      </div>
    ))}
  </div>
</div>

      <div>{children}</div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-5" style={{ borderTop: `1px solid ${tc.wizardNavBorder}` }}>
        <button
          onClick={currentStep === 0 ? onBack : () => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            color: tc.btnPrimaryText,
            border: `1px solid ${tc.btnPrimaryBorder}`,
            background: "transparent",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = tc.btnPrimaryHoverBg;
            (e.currentTarget as HTMLElement).style.borderColor = tc.accent;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.borderColor = tc.btnPrimaryBorder;
          }}>
          <ChevronLeft size={16} />
          {currentStep === 0 ? "Odabir modela" : "Prethodni"}
        </button>

        {currentStep < steps.length - 1 ? (
          <button onClick={() => setCurrentStep(currentStep + 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: tc.btnPrimaryBg,
              border: `1px solid ${tc.btnPrimaryBorder}`,
              color: tc.btnPrimaryText,
              boxShadow: `0 0 20px ${tc.accent}1a`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = tc.btnPrimaryHoverBg;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${tc.accent}33`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = tc.btnPrimaryBg;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${tc.accent}1a`;
            }}>
            Sledeći <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={onFinish}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-black transition-all relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,222,0,0.9), rgba(229,200,0,0.9))",
              color: "#0a2206",
              boxShadow: "0 0 30px rgba(255,222,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,222,0,0.6)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(255,222,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(255,222,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)";
            }}>
            <FileDown size={16} />
            Generiši PDF
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL PROFILE FORM
// ═══════════════════════════════════════════════════════════════════════════

function GlobalProfileForm({ profile, setProfile, tc }: { profile: GlobalProfile; setProfile: (p: GlobalProfile) => void; tc: ThemeConfig }) {
  const upd = (k: keyof GlobalProfile) => (v: string) => setProfile({ ...profile, [k]: v });
  return (
    <Card tc={tc}>
      <SectionHeader icon={Database} title="Opšti podaci o gazdinstvu" tc={tc} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        <JDInput label="Naziv gazdinstva" value={profile.gazdinstvoName} onChange={upd("gazdinstvoName")} tc={tc} />
        <JDInput label="Nosilac gazdinstva" value={profile.nosilac} onChange={upd("nosilac")} tc={tc} />
        <JDInput label="JMBG / MB" value={profile.jmbgMb} onChange={upd("jmbgMb")} tc={tc} />
        <JDInput label="BPG" value={profile.bpg} onChange={upd("bpg")} tc={tc} />
        <JDInput label="Adresa" value={profile.adresa} onChange={upd("adresa")} tc={tc} />
        <JDInput label="Opština" value={profile.opstina} onChange={upd("opstina")} tc={tc} />
        <JDInput label="Telefon" value={profile.telefon} onChange={upd("telefon")} tc={tc} />
        <JDInput label="Email" value={profile.email} onChange={upd("email")} tc={tc} />
        <JDInput label="Banka" value={profile.banka} onChange={upd("banka")} tc={tc} />
        <JDInput label="Tekući račun" value={profile.racun} onChange={upd("racun")} tc={tc} />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PATH 1: IPARD / AGRO VOJVODINA
// ═══════════════════════════════════════════════════════════════════════════

const PATH1_STEPS: StepDef[] = [
  { id: "res", label: "Resursi", icon: "🚜", tableRef: "Tab 1.1–1.4" },
  { id: "val", label: "Vrednost", icon: "💰", tableRef: "Tab 1.5" },
  { id: "inv", label: "Investicija", icon: "🏗", tableRef: "Tab 3.2" },
  { id: "fin", label: "Finansije", icon: "📊", tableRef: "Tab 3.3–5.1" },
];

function Path1Wizard({ profile, onBack, tc }: { profile: GlobalProfile; onBack: () => void; tc: ThemeConfig }) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Path1State>(PATH1_INIT);
  const calc = calcPath1(s);

  const addParcel = () => setS({ ...s, parcels: [...s.parcels, { id: Math.random().toString(), katMunicipality: "", parcelNumber: "", area: 0, ownership: "Sopstveno", crop: "" }] });
  const remParcel = (id: string) => setS({ ...s, parcels: s.parcels.filter(p => p.id !== id) });
  const addInv = () => setS({ ...s, investmentItems: [...s.investmentItems, { id: Math.random().toString(), name: "", unit: "kom", qty: 1, priceNet: 0 }] });
  const remInv = (id: string) => setS({ ...s, investmentItems: s.investmentItems.filter(i => i.id !== id) });

  return (
    <StepWizard steps={PATH1_STEPS} currentStep={step} setCurrentStep={setStep} onBack={onBack} onFinish={() => generatePath1PDF(profile, s)} tc={tc}>

      {step === 0 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={MapPin} title="Zemljišni fond" table="Tabela 1.1" tc={tc} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <THead cols={["K.O.", "Br. parcele", "Površina (ha)", "Vlasništvo", "Kultura", ""]} tc={tc} />
                <tbody>
                  {s.parcels.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                      <td className="px-3 py-1.5"><input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText }} value={p.katMunicipality} onChange={e => { const n = [...s.parcels]; n.find(x => x.id === p.id)!.katMunicipality = e.target.value; setS({ ...s, parcels: n }); }} /></td>
                      <td className="px-3 py-1.5"><input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText }} value={p.parcelNumber} onChange={e => { const n = [...s.parcels]; n.find(x => x.id === p.id)!.parcelNumber = e.target.value; setS({ ...s, parcels: n }); }} /></td>
                      <td className="px-3 py-1.5"><input type="number" className="w-20 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableNumText, fontFamily: "monospace" }} value={p.area} onChange={e => { const n = [...s.parcels]; n.find(x => x.id === p.id)!.area = parseFloat(e.target.value) || 0; setS({ ...s, parcels: n }); }} /></td>
                      <td className="px-3 py-1.5"><GlassSelect value={p.ownership} onChange={v => { const n = [...s.parcels]; n.find(x => x.id === p.id)!.ownership = v; setS({ ...s, parcels: n }); }} options={["Sopstveno", "Zakup"]} tc={tc} /></td>
                      <td className="px-3 py-1.5"><input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText }} value={p.crop} onChange={e => { const n = [...s.parcels]; n.find(x => x.id === p.id)!.crop = e.target.value; setS({ ...s, parcels: n }); }} /></td>
                      <td className="px-3 py-1.5"><RemoveBtn onClick={() => remParcel(p.id)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AddRowBtn onClick={addParcel} tc={tc} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card tc={tc}>
              <SectionHeader icon={Activity} title="Stočni fond" table="Tabela 1.2" tc={tc} />
              <div className="space-y-4">
                {s.livestock.map(l => (
                  <div key={l.id} className="grid grid-cols-3 gap-4">
                    <JDInput label="Vrsta" value={l.name} onChange={v => { const n = [...s.livestock]; n.find(x => x.id === l.id)!.name = v; setS({ ...s, livestock: n }); }} tc={tc} />
                    <JDInput label="Grla" type="number" value={l.qty} onChange={v => { const n = [...s.livestock]; n.find(x => x.id === l.id)!.qty = parseInt(v) || 0; setS({ ...s, livestock: n }); }} tc={tc} />
                    <JDInput label="Vrednost/grlu" type="number" value={l.valuePerHead} onChange={v => { const n = [...s.livestock]; n.find(x => x.id === l.id)!.valuePerHead = parseInt(v) || 0; setS({ ...s, livestock: n }); }} tc={tc} />
                  </div>
                ))}
              </div>
            </Card>

            <Card tc={tc}>
              <SectionHeader icon={Building2} title="Objekti i mehanizacija" table="Tab. 1.3–1.4" tc={tc} />
              <div className="space-y-3">
                {s.buildings.map(b => (
                  <div key={b.id} className="grid grid-cols-2 gap-4">
                    <JDInput label="Naziv objekta" value={b.name} onChange={v => { const n = [...s.buildings]; n.find(x => x.id === b.id)!.name = v; setS({ ...s, buildings: n }); }} tc={tc} />
                    <JDInput label="Vrednost (RSD)" type="number" value={b.value} onChange={v => { const n = [...s.buildings]; n.find(x => x.id === b.id)!.value = parseInt(v) || 0; setS({ ...s, buildings: n }); }} tc={tc} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

{step === 1 && (
  <Card tc={tc}>
    <SectionHeader icon={Layers} title="Vrednost osnovnih sredstava" table="Tabela 1.5" tc={tc} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
      {/* Input Side */}
      <div className="space-y-5">
        <JDInput label="Vrednost zemljišta (RSD)" type="number" value={s.landValue} onChange={v => setS({ ...s, landValue: parseInt(v) || 0 })} tc={tc} />
        <JDInput label="Vrednost objekata (RSD)" type="number" value={s.buildingValue} onChange={v => setS({ ...s, buildingValue: parseInt(v) || 0 })} tc={tc} />
        <JDInput label="Vrednost stočnog fonda (RSD)" type="number" value={s.livestockValue} onChange={v => setS({ ...s, livestockValue: parseInt(v) || 0 })} tc={tc} />
        <JDInput label="Vrednost mehanizacije (RSD)" type="number" value={s.equipmentValue} onChange={v => setS({ ...s, equipmentValue: parseInt(v) || 0 })} tc={tc} />
      </div>

      {/* Display Side */}
      <div className="flex items-center justify-center">
        <div 
          className="text-center p-8 rounded-2xl w-full"
          style={{
            background: '',
            border: `1px solid ${tc.accentBorder}`,
            boxShadow: `0 0 20px ${tc.accent}1a`,
          }}
        >
          <div 
            className="text-[10px] uppercase tracking-[0.25em] mb-2 font-bold" 
            style={{ color: tc.accentDim, fontFamily: "monospace" }}
          >
            Ukupna aktiva
          </div>
          <div 
            className="text-3xl font-black" 
            style={{ color: tc.accent, fontFamily: "monospace", textShadow: `0 0 .1px ${tc.accent}66` }}
          >
            {fmtRSD(calc.totalAssets)}
          </div>
        </div>
      </div>
    </div>
  </Card>
)}

      {step === 2 && (
        <Card tc={tc}>
          <SectionHeader icon={Wrench} title="Nova ulaganja — Specifikacija" table="Tabela 3.2" tc={tc} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Naziv stavke", "JM", "Kol", "Cena Neto (RSD)", "Ukupno Neto (RSD)", ""]} tc={tc} />
              <tbody>
                {s.investmentItems.map(i => (
                  <tr key={i.id} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                    <td className="px-3 py-2"><input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText }} value={i.name} onChange={e => { const n = [...s.investmentItems]; n.find(x => x.id === i.id)!.name = e.target.value; setS({ ...s, investmentItems: n }); }} /></td>
                    <td className="px-3 py-2"><input className="w-20 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText }} value={i.unit} onChange={e => { const n = [...s.investmentItems]; n.find(x => x.id === i.id)!.unit = e.target.value; setS({ ...s, investmentItems: n }); }} /></td>
                    <td className="px-3 py-2"><input type="number" className="w-16 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableNumText, fontFamily: "monospace" }} value={i.qty} onChange={e => { const n = [...s.investmentItems]; n.find(x => x.id === i.id)!.qty = parseFloat(e.target.value) || 0; setS({ ...s, investmentItems: n }); }} /></td>
                    <td className="px-3 py-2"><input type="number" className="w-32 bg-transparent text-sm focus:outline-none font-bold" style={{ color: tc.tableNumText, fontFamily: "monospace" }} value={i.priceNet} onChange={e => { const n = [...s.investmentItems]; n.find(x => x.id === i.id)!.priceNet = parseInt(e.target.value) || 0; setS({ ...s, investmentItems: n }); }} /></td>
                    <td className="px-3 py-2 font-bold text-right" style={{ color: tc.accent, fontFamily: "monospace" }}>{fmtRSD(i.priceNet * i.qty)}</td>
                    <td className="px-3 py-2"><RemoveBtn onClick={() => remInv(i.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddRowBtn onClick={addInv} tc={tc} />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveBadge label="Ukupna investicija (Neto)" value={fmtRSD(calc.totalInvNet)} hi tc={tc} />
            <LiveBadge label="Ukupna investicija (Sa PDV)" value={fmtRSD(calc.totalInvGross)} tc={tc} />
          </div>
        </Card>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={Shield} title="Izvori finansiranja" table="Tabela 3.3" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              <JDInput label="Sopstvena sredstva (RSD)" type="number" value={s.ownFunds} onChange={v => setS({ ...s, ownFunds: parseInt(v) || 0 })} hint="Iznos koji gazdinstvo obezbeđuje iz gotovine" tc={tc} />
              <div className="space-y-4 pt-5">
                <div className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${tc.financeLineBorder}` }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: tc.financeLineText, fontFamily: "monospace" }}>IPARD Podsticaj (50%):</span>
                  <span className="font-bold text-sm" style={{ color: tc.tableNumText, fontFamily: "monospace" }}>{fmtRSD(calc.grants)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs uppercase tracking-widest" style={{ color: tc.financeLineText, fontFamily: "monospace" }}>Potreban kredit:</span>
                  <span className="font-bold text-sm" style={{ color: calc.loan > 0 ? "#f87171" : tc.accent, fontFamily: "monospace" }}>{fmtRSD(Math.max(0, calc.loan))}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card tc={tc}>
            <SectionHeader icon={TrendingUp} title="Projekcija prihoda" table="Tabela 5.1" tc={tc} />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {s.revenueYears.map((rev, i) => (
                <JDInput key={i} label={`Godina ${i + 1}`} type="number" value={rev} onChange={v => {
                  const n = [...s.revenueYears] as [number, number, number, number, number]; n[i] = parseInt(v) || 0; setS({ ...s, revenueYears: n });
                }} tc={tc} />
              ))}
            </div>
            <div className="mt-6 grid grid-cols-5 gap-3">
              {calc.profits.map((p, i) => (
                <LiveBadge key={i} label={`G${i + 1} dobit`} value={fmtRSD(p.net)} hi={i === 4} tc={tc} />
              ))}
            </div>
          </Card>
        </div>
      )}
    </StepWizard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PATH 2: MLADI PREDUZETNIK
// ═══════════════════════════════════════════════════════════════════════════

const PATH2_STEPS: StepDef[] = [
  { id: "idea", label: "Ideja", icon: "💡", tableRef: "Sekcija 3" },
  { id: "rev", label: "Prihodi", icon: "📈", tableRef: "Tabela 8.1" },
  { id: "exp", label: "Rashodi", icon: "📉", tableRef: "Tabela 8.2" },
  { id: "eval", label: "Ocena", icon: "⚖️", tableRef: "Tabela 9" },
];

function Path2Wizard({ profile, onBack, tc }: { profile: GlobalProfile; onBack: () => void; tc: ThemeConfig }) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Path2State>(PATH2_INIT);
  const calc = calcPath2(s);

  const updProd = (idx: number, k: keyof ProductRevenue, v: any) => {
    const n = [...s.products] as [ProductRevenue, ProductRevenue, ProductRevenue];
    // @ts-ignore
    n[idx][k] = v;
    setS({ ...s, products: n });
  };

  return (
    <StepWizard steps={PATH2_STEPS} currentStep={step} setCurrentStep={setStep} onBack={onBack} onFinish={() => generatePath2PDF(profile, s)} tc={tc}>

      {step === 0 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={Cpu} title="Opis i Analiza tržišta" table="Sekcija 3" tc={tc} />
            <div className="space-y-6">
              <JDTextarea label="3.1 Opis poslovne ideje" value={s.opisPoslovneIdeje} onChange={v => setS({ ...s, opisPoslovneIdeje: v })} hint="↳ Sistem automatski prevodi u stručni narativ" tc={tc} />
              {s.opisPoslovneIdeje && (
                <div className="px-4 py-3 rounded-xl text-xs italic"
                  style={{
                    background: tc.narrativeBg,
                    border: `1px solid ${tc.narrativeBorder}`,
                    color: tc.narrativeText,
                    fontFamily: "monospace",
                    borderLeft: `3px solid ${tc.highlight}66`,
                  }}>
                  ▸ {formatNarrative(s.opisPoslovneIdeje)}
                </div>
              )}
              <JDTextarea label="3.2 Analiza prodajnog tržišta" value={s.analizaProdajnog} onChange={v => setS({ ...s, analizaProdajnog: v })} tc={tc} />
              <JDTextarea label="3.2 Analiza nabavnog tržišta" value={s.analizaNabavnog} onChange={v => setS({ ...s, analizaNabavnog: v })} tc={tc} />
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader icon={Activity} title="Ljudski resursi" table="Tabela 8.2.6" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
              <JDInput label="Broj novozaposlenih radnika" type="number" value={s.workers} onChange={v => setS({ ...s, workers: parseInt(v) || 0 })} tc={tc} />
              <JDInput label="Prosečna bruto plata (RSD)" type="number" value={s.monthlyWage} onChange={v => setS({ ...s, monthlyWage: parseInt(v) || 0 })} tc={tc} />
            </div>
          </Card>
        </div>
      )}

      {step === 1 && (
        <Card tc={tc}>
          <SectionHeader icon={TrendingUp} title="Projekcija proizvodnje i prodaje" table="Tabela 8.1" tc={tc} />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <THead cols={["Proizvod", "J. cena", "G1 Kol", "G2 Kol", "G3 Kol", "G4 Kol", "G5 Kol"]} tc={tc} />
              <tbody>
                {s.products.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                    <td className="px-3 py-2"><input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText }} value={p.name} onChange={e => updProd(i, "name", e.target.value)} /></td>
                    <td className="px-3 py-2"><input type="number" className="w-24 bg-transparent text-sm focus:outline-none font-bold" style={{ color: tc.highlight, fontFamily: "monospace" }} value={p.unitPrice} onChange={e => updProd(i, "unitPrice", parseFloat(e.target.value) || 0)} /></td>
                    {p.qty.map((q, qidx) => (
                      <td key={qidx} className="px-3 py-2">
                        <input type="number" className="w-24 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableNumText, fontFamily: "monospace" }} value={q} onChange={e => {
                          const nq = [...p.qty]; nq[qidx] = parseFloat(e.target.value) || 0; updProd(i, "qty", nq);
                        }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {calc.revenueByYear.map((r, i) => <LiveBadge key={i} label={`Prihod G${i + 1}`} value={fmtRSD(r)} hi={i === 4} tc={tc} />)}
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={Zap} title="Materijalni i energetski troškovi" table="Tab. 8.2.1–8.2.2" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
              <JDInput label="Seme i sadni materijal" type="number" value={s.materialCosts.seeds} onChange={v => setS({ ...s, materialCosts: { ...s.materialCosts, seeds: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Mineralno đubrivo" type="number" value={s.materialCosts.fertilizer} onChange={v => setS({ ...s, materialCosts: { ...s.materialCosts, fertilizer: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Sredstva za zaštitu" type="number" value={s.materialCosts.chemicals} onChange={v => setS({ ...s, materialCosts: { ...s.materialCosts, chemicals: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Gorivo i mazivo" type="number" value={s.energyCosts.fuel} onChange={v => setS({ ...s, energyCosts: { ...s.energyCosts, fuel: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Električna energija" type="number" value={s.energyCosts.electricity} onChange={v => setS({ ...s, energyCosts: { ...s.energyCosts, electricity: parseInt(v) || 0 } })} tc={tc} />
            </div>
          </Card>
          <Card tc={tc}>
            <SectionHeader icon={Shield} title="Nematerijalni troškovi i investicija" table="Tab. 8.2.5" tc={tc} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
              <JDInput label="Osiguranje" type="number" value={s.nonMaterialCosts.insurance} onChange={v => setS({ ...s, nonMaterialCosts: { ...s.nonMaterialCosts, insurance: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Knjigovodstvo" type="number" value={s.nonMaterialCosts.accounting} onChange={v => setS({ ...s, nonMaterialCosts: { ...s.nonMaterialCosts, accounting: parseInt(v) || 0 } })} tc={tc} />
              <JDInput label="Ukupna investicija (RSD)" type="number" value={s.totalInvestment} onChange={v => setS({ ...s, totalInvestment: parseInt(v) || 0 })} tc={tc} />
              <div className="flex items-end pb-2">
                <LiveBadge label="Ukupni rashodi" value={fmtRSD(calc.totalCosts)} hi tc={tc} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {step === 3 && (
        <Card tc={tc}>
          <SectionHeader icon={Target} title="Ekonomska efikasnost projekta" table="Tabela 9" tc={tc} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl relative overflow-hidden"
              style={{
                background: tc.statPositiveBg,
                border: `1px solid ${calc.roi > 15 ? tc.accent + "80" : tc.cardBorder}`,
                boxShadow: calc.roi > 15 ? `0 0 30px ${tc.accent}14` : "none",
              }}>
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: tc.accentDimmer, fontFamily: "monospace" }}>
                Rentabilnost (ROI)
              </div>
              <div className="text-4xl font-black mb-2"
                style={{ color: calc.roi > 15 ? tc.accent : tc.textSecondary, fontFamily: "monospace", textShadow: calc.roi > 15 ? `0 0 20px ${tc.accent}66` : "none" }}>
                {calc.roi.toFixed(1)}%
              </div>
              <div className="text-[10px]" style={{ color: tc.statMutedText }}>Prag rentabilnosti za agro-sektor: 10–12%</div>
            </div>

            <div className="p-6 rounded-2xl relative overflow-hidden"
              style={{
                background: calc.economicity > 1 ? tc.statPositiveBg : tc.statNegativeBg,
                border: `1px solid ${calc.economicity > 1 ? tc.accent + "80" : "rgba(239,68,68,0.4)"}`,
                boxShadow: calc.economicity > 1 ? `0 0 30px ${tc.accent}14` : "0 0 30px rgba(239,68,68,0.08)",
              }}>
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: tc.accentDimmer, fontFamily: "monospace" }}>
                Ekonomičnost
              </div>
              <div className="text-4xl font-black mb-2"
                style={{ color: calc.economicity > 1 ? tc.accent : "#f87171", fontFamily: "monospace" }}>
                {calc.economicity.toFixed(2)}
              </div>
              <div className="text-[10px]" style={{ color: tc.statMutedText }}>Mora biti veća od 1.00 za pozitivan rad</div>
            </div>

            <div className="p-6 rounded-2xl"
              style={{
                background: tc.highlightBg,
                border: `1px solid ${tc.highlightBorder}`,
              }}>
              <div className="text-[9px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: tc.highlightDim, fontFamily: "monospace" }}>
                Povraćaj ulaganja
              </div>
              <div className="text-4xl font-black mb-2" style={{ color: tc.highlight, fontFamily: "monospace", textShadow: `0 0 20px ${tc.highlight}4d` }}>
                {calc.payback.toFixed(1)}
                <span className="text-lg ml-1" style={{ color: tc.highlightDim }}>god.</span>
              </div>
              <div className="text-[10px]" style={{ color: tc.statMutedText }}>Vreme potrebno da se vrati osnovni kapital</div>
            </div>
          </div>
        </Card>
      )}
    </StepWizard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PATH 3: NAVODNJAVANJE
// ═══════════════════════════════════════════════════════════════════════════

const PATH3_STEPS: StepDef[] = [
  { id: "loc", label: "Lokacija", icon: "📍", tableRef: "Tabela 1.2" },
  { id: "tech", label: "Tehnika", icon: "💧", tableRef: "Tabela 3.3" },
  { id: "eff", label: "Efikasnost", icon: "📊", tableRef: "Tabela 5.3" },
];

function Path3Wizard({ profile, onBack, tc }: { profile: GlobalProfile; onBack: () => void; tc: ThemeConfig }) {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Path3State>(PATH3_INIT);
  const calc = calcPath3(s);

  const addItem = () => setS({ ...s, items: [...s.items, { id: Math.random().toString(), name: "", unit: "kom", qty: 1, price: 0 }] });
  const remItem = (id: string) => setS({ ...s, items: s.items.filter(i => i.id !== id) });

  return (
    <StepWizard steps={PATH3_STEPS} currentStep={step} setCurrentStep={setStep} onBack={onBack} onFinish={() => generatePath3PDF(profile, s)} tc={tc}>

      {step === 0 && (
        <Card tc={tc}>
          <SectionHeader icon={MapPin} title="Tehnički podaci lokacije" table="Tabela 1.2" tc={tc} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
            <JDInput label="Katastarska opština" value={s.katMunicipality} onChange={v => setS({ ...s, katMunicipality: v })} tc={tc} />
            <JDInput label="Površina pod sistemom (ha)" type="number" value={s.hectares} onChange={v => setS({ ...s, hectares: parseFloat(v) || 0 })} tc={tc} />
            <JDInput label="Postojeće pumpe/agregati" value={s.existingPumps} onChange={v => setS({ ...s, existingPumps: v })} tc={tc} />
            <JDInput label="Postojeći traktori" value={s.existingTractors} onChange={v => setS({ ...s, existingTractors: v })} tc={tc} />
            <JDTextarea label="Ostala oprema i alati" value={s.existingTools} onChange={v => setS({ ...s, existingTools: v })} tc={tc} />
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card tc={tc}>
          <SectionHeader icon={Droplets} title="Specifikacija investicije" table="Tabela 3.3" tc={tc} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <THead cols={["Stavka / Komponenta", "JM", "Kol", "Cena (RSD)", "Ukupno", ""]} tc={tc} />
              <tbody>
                {s.items.map(i => (
                  <tr key={i.id} style={{ borderBottom: `1px solid ${tc.tableRowBorder}` }}>
                    <td className="px-3 py-2"><input className="w-full bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText }} value={i.name} onChange={e => { const n = [...s.items]; n.find(x => x.id === i.id)!.name = e.target.value; setS({ ...s, items: n }); }} /></td>
                    <td className="px-3 py-2"><input className="w-24 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableCellText }} value={i.unit} onChange={e => { const n = [...s.items]; n.find(x => x.id === i.id)!.unit = e.target.value; setS({ ...s, items: n }); }} /></td>
                    <td className="px-3 py-2"><input type="number" className="w-20 bg-transparent text-sm focus:outline-none" style={{ color: tc.tableNumText, fontFamily: "monospace" }} value={i.qty} onChange={e => { const n = [...s.items]; n.find(x => x.id === i.id)!.qty = parseFloat(e.target.value) || 0; setS({ ...s, items: n }); }} /></td>
                    <td className="px-3 py-2"><input type="number" className="w-32 bg-transparent text-sm focus:outline-none font-bold" style={{ color: tc.tableNumText, fontFamily: "monospace" }} value={i.price} onChange={e => { const n = [...s.items]; n.find(x => x.id === i.id)!.price = parseInt(e.target.value) || 0; setS({ ...s, items: n }); }} /></td>
                    <td className="px-3 py-2 font-bold text-right" style={{ color: tc.accent, fontFamily: "monospace" }}>{fmtRSD(i.price * i.qty)}</td>
                    <td className="px-3 py-2"><RemoveBtn onClick={() => remItem(i.id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddRowBtn onClick={addItem} tc={tc} />
          <div className="mt-8 flex justify-end">
            <LiveBadge label="Ukupna investicija" value={fmtRSD(calc.totalInv)} hi tc={tc} />
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card tc={tc}>
            <SectionHeader icon={BarChart3} title="Efikasnost investicije" table="Tabela 5.3" tc={tc} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: tc.accentDim, fontFamily: "monospace" }}>
                  Projektovani prihodi / rashodi
                </p>
                {s.revenueYears.map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <JDInput label={`G${i + 1} Prih`} type="number" value={s.revenueYears[i]} onChange={v => {
                      const n = [...s.revenueYears] as [number, number, number, number, number]; n[i] = parseInt(v) || 0; setS({ ...s, revenueYears: n });
                    }} tc={tc} />
                    <JDInput label={`G${i + 1} Rash`} type="number" value={s.expenseYears[i]} onChange={v => {
                      const n = [...s.expenseYears] as [number, number, number, number, number]; n[i] = parseInt(v) || 0; setS({ ...s, expenseYears: n });
                    }} tc={tc} />
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl p-8"
                style={{
                  background: calc.avgCoeff > 1 ? tc.statPositiveBg : tc.statNegativeBg,
                  border: `1px solid ${calc.avgCoeff > 1 ? tc.accent + "66" : "rgba(239,68,68,0.4)"}`,
                  boxShadow: calc.avgCoeff > 1 ? `0 0 40px ${tc.accent}0f` : "0 0 40px rgba(239,68,68,0.06)",
                }}>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: tc.accentDim, fontFamily: "monospace" }}>
                  Prosečan koef. efikasnosti
                </span>
                <span className="text-6xl font-black"
                  style={{
                    color: calc.avgCoeff > 1 ? tc.accent : "#f87171",
                    fontFamily: "monospace",
                    textShadow: calc.avgCoeff > 1 ? `0 0 30px ${tc.accent}80` : "0 0 30px rgba(248,113,113,0.4)",
                  }}>
                  {calc.avgCoeff.toFixed(3)}
                </span>
                <p className="mt-4 text-xs text-center max-w-[200px]" style={{ color: tc.statMutedText }}>
                  {calc.avgCoeff > 1 ? "✓ Investicija generiše više prihoda nego što košta." : "✗ Prihodi ne pokrivaju troškove investicije."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </StepWizard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AgroPlanApp() {
  const [path, setPath] = useState<PathId>("home");
  const [profile, setProfile] = useState<GlobalProfile>(GLOBAL_INIT);
  const [theme, setTheme] = useState<ThemeKey>("white");
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // Scroll-up at top-of-page reveals the profile panel
  useEffect(() => {
    if (path !== "home") return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 40 && currentY < lastY) {
        setShowProfile(true);
      }
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  // Smooth scroll profile into view when opened
  useEffect(() => {
    if (showProfile && profileRef.current) {
      setTimeout(() => {
        profileRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [showProfile]);

  const tc = THEME_CONFIG[theme];

  const pathMeta = {
    path1: { label: "IPARD / Vojvodina", color: tc.path1Glow },
    path2: { label: "Mladi Preduzetnik", color: tc.path2Glow },
    path3: { label: "Navodnjavanje", color: tc.path3Glow },
  };

  return (
    <div className="min-h-screen pb-20 relative" style={{
      background: tc.pageBg,
      fontFamily: FONT.sans,
      color: tc.textPrimary,
    }}>

      {/* Parallax Blobs (z-0, behind everything) */}
      <ParallaxBlobs theme={theme} />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50"
        style={{
          background: tc.headerBg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${tc.headerBorder}`,
          boxShadow: theme === "white" ? "0 1px 12px rgba(0,0,0,0.06)" : "0 1px 0 rgba(255,222,0,0.05)",
        }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: tc.logoIconBg, border: `1px solid ${tc.logoIconBorder}` }}>
              <Tractor size={16} color={tc.logoAccentText} />
            </div>
            <div>
              <span className="font-black text-base" style={{ ...TYPO.uiBold, color: tc.textPrimary }}>AGRO</span>
              <span className="font-black text-base" style={{ ...TYPO.uiBold, color: tc.heroTitle3 }}>PLAN</span>
              <span className="ml-2 align-middle"
                style={{ ...TYPO.labelXxs, color: tc.logoVersionText }}>
                v3.2
              </span>
            </div>
          </div>

          {/* Center status */}
          {path !== "home" && (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: tc.accent }} />
              <span className="text-xs uppercase tracking-[0.2em] font-semibold"
                style={{ color: tc.headerStatusColor, fontFamily: "monospace" }}>
                {pathMeta[path as keyof typeof pathMeta]?.label}
              </span>
            </div>
          )}

          {/* Right: Theme switcher + IPARD label */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher theme={theme} setTheme={setTheme} tc={tc} />
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: tc.textMuted, fontFamily: "monospace" }}>
              <div className="w-px h-4" style={{ background: tc.cardBorder }} />
              <span>Srbija 2026</span>
            </div>
          </div>
        </div>

        {/* Accent bar */}
        <div className="h-px w-full" style={{ background: tc.headerAccentBar }} />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">

        {/* ── HOME ── */}
        {path === "home" && (
          <div className="space-y-10">

            {/* ── COLLAPSIBLE PROFILE PANEL ── */}
            <div
              ref={profileRef}
              style={{
                overflow: "hidden",
                maxHeight: showProfile ? "600px" : "0px",
                opacity: showProfile ? 1 : 0,
                transform: showProfile ? "translateY(0)" : "translateY(-18px)",
                transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease, transform 0.35s ease",
                pointerEvents: showProfile ? "auto" : "none",
              }}
            >
              {/* Close handle inside the panel */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                  style={{
                    color: tc.textMuted,
                    border: `1px solid ${tc.cardBorder}`,
                    background: tc.cardBg,
                    backdropFilter: "blur(12px)",
                    fontFamily: "monospace",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = tc.textPrimary;
                    (e.currentTarget as HTMLElement).style.borderColor = tc.accentBorder;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = tc.textMuted;
                    (e.currentTarget as HTMLElement).style.borderColor = tc.cardBorder;
                  }}
                >
                  <X size={11} />
                  Zatvori
                </button>
              </div>
              <GlobalProfileForm profile={profile} setProfile={setProfile} tc={tc} />
            </div>

            {/* Hero */}
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: tc.heroTitle3, fontFamily: "monospace" }}>
                  Agricultural Business Intelligence
                </span>
              </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-[1.05]">
            <span style={{ color: tc.heroTitle1, textDecoration: "underline" }}>
              Automatizacija
            </span>{" "}
            <span style={{
              color: "transparent",
              WebkitTextStroke: `1px ${tc.heroTitle2 === "rgba(255,255,255,0)" ? "rgba(255,255,255,0.4)" : tc.textMuted}`,
            }}>
              poslovnih
            </span>{" "}
            <span style={{ color: tc.heroTitle3 }}>
              planova.
            </span>
          </h1>
            </div>

            {/* Path selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Path 1 */}
              <button onClick={() => setPath("path1")}
                className="group text-left rounded-2xl p-7 transition-all relative overflow-hidden"
                style={{
                  background: tc.cardBg,
                  border: `1px solid ${tc.path1Border}`,
                  backdropFilter: "blur(20px)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = tc.path1HoverBorder;
                  (e.currentTarget as HTMLElement).style.boxShadow = tc.path1HoverShadow;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = tc.path1Border;
                  (e.currentTarget as HTMLElement).style.boxShadow = tc.cardShadow;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}>
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${tc.path1GlowLine}, transparent)` }} />
               <img 
                    src={euFlag} 
                    alt="EU Flag" 
                    className="w-auto mb-5 opacity-80 h-[130px] object-contain" 
                      style={{
    display: "block", // Necessary for margin: "auto" to work on an image
    margin: "auto",
    marginBottom: "3rem",
  }} 
                  />
                <h3 className="text-lg font-black mb-1.5" style={{ color: tc.textPrimary }}>IPARD / Vojvodina</h3>
                <div className="text-[9px] uppercase tracking-[0.2em] mb-3 font-bold" style={{ color: `${tc.path1Glow}80`, fontFamily: "monospace" }}>
                  Tab. 1.1 → 1.5 → 3.2 → 5.1
                </div>
                <p className="text-xs leading-relaxed mb-5" style={{ color: tc.textMuted }}>
                  Putanja za velike investicije i ruralni razvoj. Fokusirana na modernizaciju poljoprivredne mehanizacije i infrastrukture kroz fondove EU standarda.
                </p>
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: tc.path1Glow }}>
                  Pokreni <ChevronRight size={13} />
                </span>
              </button>

              {/* Path 2 */}
              <button onClick={() => setPath("path2")}
                className="group text-left rounded-2xl p-7 transition-all relative overflow-hidden"
                style={{
                  background: tc.cardBg,
                  border: `1px solid ${tc.path2Border}`,
                  backdropFilter: "blur(20px)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = tc.path2HoverBorder;
                  (e.currentTarget as HTMLElement).style.boxShadow = tc.path2HoverShadow;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = tc.path2Border;
                  (e.currentTarget as HTMLElement).style.boxShadow = tc.cardShadow;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}>
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${tc.path2Glow}66, transparent)` }} />
                               <img 
  src={sprout} 
  alt="EU Flag" 
  className="w-auto opacity-80 h-[130px] object-contain" // Removed mb-5 to use style instead
  style={{
    display: "block", // Necessary for margin: "auto" to work on an image
    margin: "auto",
    marginBottom: "3rem",
  }} 
/>
                <h3 className="text-lg font-black mb-1.5" style={{ color: tc.textPrimary }}>Mladi Preduzetnik</h3>
                <div className="text-[9px] uppercase tracking-[0.2em] mb-3 font-bold" style={{ color: `${tc.path2Glow}80`, fontFamily: "monospace" }}>
                  Tab. 8.1 → 8.2 → Ocena 9
                </div>
                <p className="text-xs leading-relaxed mb-5" style={{ color: tc.textMuted }}>
                  Specijalizovana ruta za poljoprivrednike do 40 godina koji traže podršku za prvo osnivanje ili proširenje gazdinstva. Naglasak na modernom menadžmentu.
                </p>
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: tc.path2Glow }}>
                  Pokreni <ChevronRight size={13} />
                </span>
              </button>

              {/* Path 3 */}
              <button onClick={() => setPath("path3")}
                className="group text-left rounded-2xl p-7 transition-all relative overflow-hidden"
                style={{
                  background: tc.cardBg,
                  border: `1px solid ${tc.path3Border}`,
                  backdropFilter: "blur(20px)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = tc.path3HoverBorder;
                  (e.currentTarget as HTMLElement).style.boxShadow = tc.path3HoverShadow;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = tc.path3Border;
                  (e.currentTarget as HTMLElement).style.boxShadow = tc.cardShadow;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}>
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${tc.path3Glow}66, transparent)` }} />
                               <img 
                    src={watering} 
                    alt="EU Flag" 
                    className="w-auto mb-5 opacity-80 h-[130px] object-contain" 
                      style={{
    display: "block", // Necessary for margin: "auto" to work on an image
    margin: "auto",
    marginBottom: "3rem",
  }} 
                  />
                <h3 className="text-lg font-black mb-1.5" style={{ color: tc.textPrimary }}>Navodnjavanje</h3>
                <div className="text-[9px] uppercase tracking-[0.2em] mb-3 font-bold" style={{ color: `${tc.heroTitle3}80`, fontFamily: "monospace" }}>
                  Tab. 1.2 → 3.3 → 5.3
                </div>
                <p className="text-xs leading-relaxed mb-5" style={{ color: tc.textMuted }}>
                  Namenska automatizacija za sisteme upravljanja vodom, solarne pumpe i efikasnu infrastrukturu za hidrataciju useva.
                </p>
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: tc.heroTitle3 }}>
                  Pokreni <ChevronRight size={13} />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── WIZARD VIEWS ── */}
        {path !== "home" && (
          <div className="space-y-6">
            {/* Breadcrumb bar */}
            <div className="flex items-center justify-between px-5 py-3 rounded-xl"
              style={{
                background: tc.breadcrumbBg,
                border: `1px solid ${tc.breadcrumbBorder}`,
                backdropFilter: "blur(16px)",
              }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
                  style={{
                    background: tc.breadcrumbNumBg,
                    border: `1px solid ${tc.breadcrumbNumBorder}`,
                    color: tc.breadcrumbNumText,
                    fontFamily: "monospace",
                  }}>
                  {path === "path1" ? "01" : path === "path2" ? "02" : "03"}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: tc.textPrimary }}>
                    {path === "path1" ? "Model Agro Vojvodina / IPARD" : path === "path2" ? "Model Mladi Preduzetnik" : "Sistem Navodnjavanja"}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: tc.breadcrumbMuted, fontFamily: "monospace" }}>
                    {profile.gazdinstvoName} · BPG: {profile.bpg}
                  </div>
                </div>
              </div>
              <button onClick={() => setPath("home")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all"
                style={{ color: tc.breadcrumbBackText, border: `1px solid ${tc.breadcrumbBackBorder}` }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = tc.textPrimary;
                  (e.currentTarget as HTMLElement).style.borderColor = tc.cardBorder;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = tc.breadcrumbBackText;
                  (e.currentTarget as HTMLElement).style.borderColor = tc.breadcrumbBackBorder;
                }}>
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

      {/* ── FLOATING PROFILE TOGGLE (only on home) ── */}
      {path === "home" && (
        <button
          onClick={() => setShowProfile(prev => !prev)}
          className="fixed bottom-8 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
          style={{
            background: showProfile
              ? tc.accentBg
              : tc.cardBg,
            border: `1.5px solid ${showProfile ? tc.accentBorder : tc.cardBorder}`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            color: showProfile ? tc.accent : tc.textMuted,
            boxShadow: showProfile
              ? `0 0 24px ${tc.accent}33, 0 4px 16px rgba(0,0,0,0.12)`
              : "0 4px 24px rgba(0,0,0,0.10)",
            fontFamily: "monospace",
            letterSpacing: "0.12em",
            transform: "translateZ(0)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px ${tc.accent}44, 0 6px 20px rgba(0,0,0,0.15)`;
            (e.currentTarget as HTMLElement).style.borderColor = tc.accentBorder;
            (e.currentTarget as HTMLElement).style.color = tc.accent;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = showProfile
              ? `0 0 24px ${tc.accent}33, 0 4px 16px rgba(0,0,0,0.12)`
              : "0 4px 24px rgba(0,0,0,0.10)";
            (e.currentTarget as HTMLElement).style.borderColor = showProfile ? tc.accentBorder : tc.cardBorder;
            (e.currentTarget as HTMLElement).style.color = showProfile ? tc.accent : tc.textMuted;
          }}
          title={showProfile ? "Sakrij podatke gazdinstva" : "Uredi podatke gazdinstva"}
        >
          <Database size={14} />
          <span className="hidden sm:inline">
            {showProfile ? "Zatvori profil" : "Osnovni Podaci"}
          </span>
          <span className="sm:hidden">
            {showProfile ? <X size={12} /> : <Wrench size={12} />}
          </span>
        </button>
      )}

      {/* Footer */}
      <div className="mt-20 text-center pb-8">
        <div className="text-[9px] uppercase tracking-[0.3em] font-semibold" style={{ color: tc.footerText, fontFamily: "monospace" }}>
          AgroPlan · IPARD III Compliant · Srbija 2026 ·
        </div>
      </div>
    </div>
  );
}