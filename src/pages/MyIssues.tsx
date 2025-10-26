import { useMemo } from "react"
import { useFCStore } from "@/store"
import { useAuth } from "@/auth/AuthContext"
import type { Issue } from "@/types"
import IssuesTable from "@/components/IssuesTable"

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
          <p className="text-sm text-[var(--muted)]">Zgłoszenia przypisane do Ciebie ({myIssues.length})</p>
        </div>
      </div>

      {myIssues.length === 0 ? (
        <div className="card rounded-xl p-8 text-center">
          <p className="text-[var(--muted)] text-lg">Brak zgłoszeń przypisanych do Ciebie.</p>
          <p className="text-[var(--muted)] text-sm mt-2">Zgłoszenia pojawią się tutaj, gdy zostaną Ci przypisane.</p>
        </div>
      ) : (
        <IssuesTable issues={myIssues} />
      )}
    </div>
  )
}
