// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats numbers to Serbian Latin standards (e.g., 1.234.567 RSD)
 * This prevents errors when the PDF tries to render currency strings.
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("sr-RS", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + " RSD";
}