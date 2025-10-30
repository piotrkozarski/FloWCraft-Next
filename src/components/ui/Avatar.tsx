function initials(name?: string) {
  if (!name) return '–'
  const p = name.trim().split(/\s+/)
  const a = p[0]?.[0] ?? ''
  const b = p[1]?.[0] ?? (p[0]?.[1] ?? '')
  return (a + b).toUpperCase()
}
export default function Avatar({ name }: { name?: string }) {
  return (
    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--background)] text-[11px] font-bold">
      {initials(name)}
    </div>
  )
}