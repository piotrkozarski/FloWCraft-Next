import { useMemo } from "react"
import { useFCStore } from "@/store"
import { useAuth } from "@/auth/AuthContext"
import type { Issue } from "@/types"

export default function MyIssues() {
  const issues = useFCStore(s => s.issues)
  const { user } = useAuth()

  const myIssues: Issue[] = useMemo(() => {
    if (!user) return []
    return issues.filter(i => i.assigneeId === user.id)
  }, [issues, user])

  return (
    <div className="space-y-4">
      <div className="card rounded-xl p-4 flex items-center justify-between">
        <div>
          <h1 className="section-title text-xl font-medium">My Issues</h1>
          <p className="text-sm text-[var(--muted)]">Zgłoszenia przypisane do Ciebie</p>
        </div>
      </div>

      <div className="card rounded-xl p-4 overflow-auto">
        {myIssues.length === 0 ? (
          <p className="text-[var(--muted)] text-sm">Brak zgłoszeń przypisanych do Ciebie.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="text-left py-2 pr-3">Title</th>
                <th className="text-left py-2 pr-3">Status</th>
                <th className="text-left py-2 pr-3">Priority</th>
                <th className="text-left py-2 pr-3">Sprint</th>
                <th className="text-left py-2 pr-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {myIssues.map(it => (
                <tr key={it.id} className="border-t border-[var(--panel)] hover:bg-[var(--panel)]/40">
                  <td className="py-2 pr-3">{it.title}</td>
                  <td className="py-2 pr-3">{it.status}</td>
                  <td className="py-2 pr-3">{it.priority}</td>
                  <td className="py-2 pr-3">{it.sprintId ?? "—"}</td>
                  <td className="py-2 pr-3">{it.updatedAt ? new Date(it.updatedAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
