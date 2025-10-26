// src/utils/domain.ts

export function toIsoString(d: string | number | Date | undefined): string {
  if (d instanceof Date) return d.toISOString()
  if (typeof d === "number") return new Date(d).toISOString()
  if (typeof d === "string") return d
  return new Date().toISOString()
}
