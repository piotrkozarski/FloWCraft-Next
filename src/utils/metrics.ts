import type { Issue, IssueStatus, Sprint } from "@/types"

export type SprintAggregate = {
  total: number
  byStatus: Record<IssueStatus, number>
  donePct: number
}

export function aggregateSprintIssues(issues: Issue[]): SprintAggregate {
  const byStatus = {
    "Todo": 0,
    "In Progress": 0,
    "In Review": 0,
    "Done": 0,
  } as Record<IssueStatus, number>

  for (const it of issues) byStatus[it.status]++
  const total = issues.length
  const donePct = total === 0 ? 0 : Math.round((byStatus["Done"] / total) * 100)
  return { total, byStatus, donePct }
}

export function formatDateISO(date?: string) {
  try {
    return date ? new Date(date).toLocaleDateString() : "—"
  } catch { return "—" }
}

export function sprintRangeLabel(s: Sprint) {
  return `${formatDateISO(s.startDate)} — ${formatDateISO(s.endDate)}`
}
