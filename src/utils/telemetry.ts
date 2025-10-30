export type FCEvent =
  | { t: "dashboard_open"; at: number }
  | { t: "alert_click"; kind: "overdue" | "unassigned" | "stale"; at: number }
  | { t: "dnd_move"; from: string; to: string; at: number }
  | { t: "my_issues_open"; at: number }

const KEY = "fc_events"

export function logEvent(ev: FCEvent) {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) as FCEvent[] : []
    arr.push(ev)
    localStorage.setItem(KEY, JSON.stringify(arr.slice(-500))) // rolling buffer
  } catch {}
}

export function getEvents(): FCEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) as FCEvent[] : []
  } catch {
    return []
  }
}

export function clearEvents() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}
