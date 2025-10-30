import { useMemo, useState } from "react"
import { useFCStore } from "@/store"
import type { Sprint, Issue, IssueStatus } from "@/types"
import { aggregateSprintIssues, sprintRangeLabel } from "@/utils/metrics"

const STATUS_COLORS: Record<IssueStatus, string> = {
  "Todo": "bg-slate-600",
  "In Progress": "bg-blue-600",
  "In Review": "bg-purple-600",
  "Done": "bg-emerald-600",
}

export default function SprintPerformanceReport() {
  const sprints = useFCStore(s => s.sprints)
  const issues = useFCStore(s => s.issues)

  const [selectedId, setSelectedId] = useState<string | "current">("current")

  const currentSprint = useMemo(() => {
    // heurystyka: Active > Planned (najbliższy) > Completed (ostatni)
    const active = sprints.find(s => s.status === "Active")
    if (active) return active
    const planned = [...sprints].filter(s => s.status === "Planned").sort((a,b) => a.startDate.localeCompare(b.startDate))[0]
    if (planned) return planned
    const completed = [...sprints].filter(s => s.status === "Completed").sort((a,b) => b.endDate.localeCompare(a.endDate))[0]
    return completed
  }, [sprints])

  const selectedSprint: Sprint | undefined = selectedId === "current"
    ? currentSprint
    : sprints.find(s => s.id === selectedId)

  const issuesInSprint: Issue[] = useMemo(() =>
    selectedSprint ? issues.filter(i => i.sprintId === selectedSprint.id) : []
  , [issues, selectedSprint])

  const agg = useMemo(() => aggregateSprintIssues(issuesInSprint), [issuesInSprint])

  return (
    <div className="grid gap-4">
      <div className="card rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div>
            <h2 className="text-lg font-medium">Sprint Performance</h2>
            <p className="text-sm text-[var(--muted)]">
              Postęp i rozkład statusów dla wybranego sprintu.
            </p>
          </div>
          <div className="md:ml-auto flex items-center gap-2">
            <label className="text-sm text-[var(--muted)]">Sprint:</label>
            <select
              className="date-input rounded-md px-2 py-1 text-sm"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value as any)}
            >
              <option value="current">Current</option>
              {sprints.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status}) • {sprintRangeLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card rounded-xl p-4">
          <div className="text-sm text-[var(--muted)] mb-1">Total issues</div>
          <div className="text-3xl font-semibold">{agg.total}</div>
          <div className="text-xs text-[var(--muted)] mt-2">{selectedSprint ? selectedSprint.name : "—"}</div>
        </div>

        <div className="card rounded-xl p-4">
          <div className="text-sm text-[var(--muted)] mb-1">% Done</div>
          <div className="text-3xl font-semibold flex items-center gap-2">
            {agg.donePct}%
            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--panel)]/70">
              target ≥ 80%
            </span>
          </div>
          <div className="w-full h-2 mt-3 rounded bg-[var(--panel)] overflow-hidden">
            <div className="h-2 bg-emerald-600" style={{ width: `${agg.donePct}%` }} />
          </div>
        </div>

        <div className="card rounded-xl p-4">
          <div className="text-sm text-[var(--muted)] mb-2">Dates</div>
          <div className="text-base">{selectedSprint ? sprintRangeLabel(selectedSprint) : "—"}</div>
          <div className="text-xs text-[var(--muted)] mt-1">{selectedSprint?.status ?? "—"}</div>
        </div>
      </div>

      <div className="card rounded-xl p-4">
        <div className="text-sm text-[var(--muted)] mb-3">By Status</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["Todo","In Progress","In Review","Done"] as IssueStatus[]).map(st => (
            <div key={st} className="rounded-lg p-3 bg-[var(--panel)]">
              <div className="flex items-center justify-between">
                <div className="text-sm">{st}</div>
                <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[st]}`} />
              </div>
              <div className="text-2xl font-semibold mt-1">{agg.byStatus[st]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card rounded-xl p-4">
        <div className="text-sm text-[var(--muted)] mb-3">Issues list</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="text-left py-2 pr-3">Title</th>
                <th className="text-left py-2 pr-3">Status</th>
                <th className="text-left py-2 pr-3">Priority</th>
                <th className="text-left py-2 pr-3">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {issuesInSprint.map(it => (
                <tr key={it.id} className="border-t border-[var(--panel)]">
                  <td className="py-2 pr-3">{it.title}</td>
                  <td className="py-2 pr-3">{it.status}</td>
                  <td className="py-2 pr-3">{it.priority}</td>
                  <td className="py-2 pr-3">{it.assigneeId ?? "Unassigned"}</td>
                </tr>
              ))}
              {issuesInSprint.length === 0 && (
                <tr><td className="py-4 text-[var(--muted)]" colSpan={4}>No issues in this sprint.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
