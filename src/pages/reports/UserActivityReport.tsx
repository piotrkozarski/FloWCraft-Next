import { useMemo, useState, useEffect } from "react"
import { useFCStore } from "@/store"
import type { Issue, IssueStatus, UserRef } from "@/types"
import { fetchProfiles } from "@/services/users"

type UserAgg = {
  userId: string
  username?: string | null
  email?: string | null
  assigned: number
  done: number
  inProgress: number
  inReview: number
  todo: number
}

export default function UserActivityReport() {
  const issues = useFCStore(s => s.issues)
  const [profiles, setProfiles] = useState<{id: string; username: string | null; email: string | null}[]>([])
  const [query, setQuery] = useState("")

  // Load profiles on component mount
  useEffect(() => {
    fetchProfiles().then(setProfiles).catch(console.error)
  }, [])

  const users: UserAgg[] = useMemo(() => {
    const by: Record<string, UserAgg> = {}
    for (const it of issues) {
      const uid = it.assigneeId ?? "unassigned"
      if (!by[uid]) {
        const prof = profiles.find(p => p.id === uid)
        by[uid] = {
          userId: uid,
          username: prof?.username,
          email: prof?.email,
          assigned: 0, done: 0, inProgress: 0, inReview: 0, todo: 0
        }
      }
      by[uid].assigned++
      if (it.status === "Done") by[uid].done++
      if (it.status === "In Progress") by[uid].inProgress++
      if (it.status === "In Review") by[uid].inReview++
      if (it.status === "Todo") by[uid].todo++
    }
    let list = Object.values(by)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(u =>
        (u.username ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q)
      )
    }
    // sort: najwięcej ukończonych zadań
    return list.sort((a,b) => b.done - a.done)
  }, [issues, profiles, query])

  return (
    <div className="grid gap-4">
      <div className="card rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div>
          <h2 className="text-lg font-medium">User Activity</h2>
          <p className="text-sm text-[var(--muted)]">Aktywność i obciążenie użytkowników w aktualnych zadaniach.</p>
        </div>
        <div className="md:ml-auto">
          <input
            className="date-input rounded-md px-3 py-2 text-sm min-w-[240px]"
            placeholder="Filter by username / email..."
            value={query}
            onChange={e=>setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card rounded-xl p-4 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-[var(--muted)]">
            <tr>
              <th className="text-left py-2 pr-3">User</th>
              <th className="text-left py-2 pr-3">Assigned</th>
              <th className="text-left py-2 pr-3">Done</th>
              <th className="text-left py-2 pr-3">In Progress</th>
              <th className="text-left py-2 pr-3">In Review</th>
              <th className="text-left py-2 pr-3">Todo</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.userId} className="border-t border-[var(--panel)]">
                <td className="py-2 pr-3">
                  {u.username || u.email || (u.userId === "unassigned" ? "Unassigned" : u.userId)}
                </td>
                <td className="py-2 pr-3">{u.assigned}</td>
                <td className="py-2 pr-3">{u.done}</td>
                <td className="py-2 pr-3">{u.inProgress}</td>
                <td className="py-2 pr-3">{u.inReview}</td>
                <td className="py-2 pr-3">{u.todo}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td className="py-4 text-[var(--muted)]" colSpan={6}>No users / issues to report.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
