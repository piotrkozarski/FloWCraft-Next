import { useMemo, useEffect } from "react"
import { useFCStore } from "../store"
import { useAuth } from "../auth/AuthContext"
import type { Issue, Sprint } from "@/types"
import { logEvent } from "../utils/telemetry"

export default function Dashboard() {
  const issues = useFCStore(s => s.issues)
  const sprints = useFCStore(s => s.sprints)
  const { user } = useAuth()

  // Log dashboard open event
  useEffect(() => {
    logEvent({ t: "dashboard_open", at: Date.now() })
  }, [])

  const active = sprints.filter(s => s.status === "Active")
  const activeSprint = active[0]

  const issuesInActive = useMemo(
    () => activeSprint ? issues.filter(i => i.sprintId === activeSprint.id) : [],
    [issues, activeSprint]
  )

  const donePct = useMemo(() => {
    const total = issuesInActive.length
    if (!total) return 0
    const done = issuesInActive.filter(i => i.status === "Done").length
    return Math.round((done / total) * 100)
  }, [issuesInActive])

  const openAll = issues.filter(i => i.status !== "Done").length
  const openHigh = issues.filter(i => i.status !== "Done" && (i.priority === "P0" || i.priority === "P1")).length
  const myOpen = issues.filter(i => i.assigneeId === user?.id && i.status !== "Done").length

  // ALERTY
  const today = new Date().toISOString().slice(0,10)
  const overdueSprint = sprints.filter(s => s.status !== "Completed" && s.endDate < today)
  const unassigned = issues.filter(i => !i.assigneeId)
  const stale = issues.filter(i => i.status === "In Progress" && i.updatedAt && (Date.now() - new Date(i.updatedAt).getTime()) > 7*24*3600*1000)

  const handleAlertClick = (kind: "overdue" | "unassigned" | "stale") => {
    logEvent({ t: "alert_click", kind, at: Date.now() })
  }

  return (
    <div className="grid gap-4">
      {/* KPI cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm opacity-70">Active sprints</div>
          <div className="text-3xl font-semibold">{active.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm opacity-70">Done% (active)</div>
          <div className="text-3xl font-semibold">{donePct}%</div>
          {donePct < 80 && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-[var(--panel)]/70">
              target ≥ 80%
            </span>
          )}
        </div>
        <div className="card p-4">
          <div className="text-sm opacity-70">Open issues</div>
          <div className="text-3xl font-semibold">{openAll} <span className="text-xs ml-2">Hi/Crit: {openHigh}</span></div>
        </div>
        <div className="card p-4">
          <div className="text-sm opacity-70">My open</div>
          <div className="text-3xl font-semibold">{myOpen}</div>
        </div>
      </div>

      {/* Alerts */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Alerts</h2>
        </div>
        {overdueSprint.length === 0 && unassigned.length === 0 && stale.length === 0 ? (
          <p className="text-sm opacity-70">No alerts 🎉</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {overdueSprint.map(s => (
              <li key={s.id} className="text-amber-400 cursor-pointer hover:underline" onClick={() => handleAlertClick("overdue")}>
                ⚠️ Sprint overdue: {s.name} (ended {s.endDate})
              </li>
            ))}
            {unassigned.length > 0 && (
              <li className="text-rose-400 cursor-pointer hover:underline" onClick={() => handleAlertClick("unassigned")}>
                ⚠️ Unassigned issues: {unassigned.length}
              </li>
            )}
            {stale.length > 0 && (
              <li className="text-yellow-300 cursor-pointer hover:underline" onClick={() => handleAlertClick("stale")}>
                ⚠️ Stale in progress: {stale.length} (7+ days)
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="card p-4">
        <div className="text-sm opacity-70 mb-2">Quick actions</div>
        <div className="flex flex-wrap gap-2">
          <a className="btn" href="/reports/sprint-performance">Open Sprint Performance</a>
          <a className="btn" href="/reports/user-activity">Open User Activity</a>
          <a className="btn" href="/my-issues">My Issues</a>
          <a className="btn" href="/sprints">Sprints</a>
        </div>
      </div>
    </div>
  )
}
