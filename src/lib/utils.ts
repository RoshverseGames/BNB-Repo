import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert a hex color (#rgb / #rrggbb) to an rgba() string with the given alpha.
export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '')
  const r = parseInt(m.length === 3 ? m[0] + m[0] : m.slice(0, 2), 16)
  const g = parseInt(m.length === 3 ? m[1] + m[1] : m.slice(2, 4), 16)
  const b = parseInt(m.length === 3 ? m[2] + m[2] : m.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
