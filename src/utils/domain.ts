// src/utils/domain.ts
import type { IssuePriority } from "@/types"

export function mapLegacyPriority(p: string): IssuePriority {
  // Accept P0..P5 and map to new range
  const v = String(p).toUpperCase()
  if (v === "P0" || v === "P1") return "Critical"
  if (v === "P2" || v === "P3") return "High"
  if (v === "P4")               return "Medium"
  if (v === "P5")               return "Low"
  // If already in new format - return as is (safety check)
  if (["LOW","MEDIUM","HIGH","CRITICAL"].includes(v)) {
    return (v[0] + v.slice(1).toLowerCase()) as IssuePriority
  }
  return "Medium"
}

export function toIsoString(d: string | number | Date | undefined): string {
  if (d instanceof Date) return d.toISOString()
  if (typeof d === "number") return new Date(d).toISOString()
  if (typeof d === "string") return d
  return new Date().toISOString()
}
