import { useMemo, useState, useEffect } from "react"
import { useFCStore } from "@/store"
import { useUI } from "@/store/ui"
import { useAuth } from "@/auth/AuthContext"
import type { Issue } from "@/types"
import { fetchProfiles } from "@/services/users"
import { logEvent } from "@/utils/telemetry"

export default function MyIssues() {
  const issues = useFCStore(s => s.issues)
  const { user } = useAuth()
  const ui = useUI()
  const [q, setQ] = useState("")
  
  const myIssues: Issue[] = useMemo(() => {
    if (!user) return []
    return issues.filter(i => i.assigneeId === user.id)
  }, [issues, user])

  const filtered = useMemo(() => 
    myIssues
      .filter(i => i.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return dateB - dateA
      }), 
    [myIssues, q]
  )
  
  const [profiles, setProfiles] = useState<{id:string; username:string|null; email:string|null}[]>([])

  // Load profiles on mount
  useEffect(() => {
    fetchProfiles().then(setProfiles)
  }, [])

  // Log My Issues open event
  useEffect(() => {
    logEvent({ t: "my_issues_open", at: Date.now() })
  }, [])

  // Helper to map assignee ID to name
  const mapName = (id?: string | null) => {
    const p = profiles.find(x => x.id === id)
    return p?.username || p?.email || "Unassigned"
  }

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
        <div className="card">
          <div className="border-b border-gray-800 p-3 flex items-center gap-3">
            <input
              placeholder="Search issues..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-primary focus:border-primary"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>

          <div className="table-header">
            <div>ID</div><div>Title</div><div>Type</div><div>Priority</div><div>Status</div><div>Assignee</div><div>Updated</div><div></div>
          </div>

          {filtered.map(i => (
            <div key={i.id} className="table-row cursor-pointer" onClick={() => ui.openIssueDetail(i.id)}>
              <div>{i.id}</div>
              <div className="truncate">{i.title}</div>
              <div><span className={`badge type ${i.type.toLowerCase()}`}>{i.type}</span></div>
              <div><span className={`badge priority ${i.priority}`}>{i.priority}</span></div>
              <div><span className={`badge ${i.status.toLowerCase().replace(" ", "")}`}>{i.status}</span></div>
              <div>{mapName(i.assigneeId)}</div>
              <div>{new Date(i.updatedAt ?? i.createdAt).toLocaleDateString()}</div>
              <div className="text-gray-500" onClick={(e) => { e.stopPropagation(); ui.openIssueDetail(i.id) }}>⋮</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
