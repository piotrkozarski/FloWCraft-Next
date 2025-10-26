import { useFCStore } from "../store"
import { useUI } from "../store/ui"
import { useState, useMemo, useEffect } from "react"
import { fetchProfiles } from "../services/users"

export default function Issues() {
  const issues = useFCStore(s => s.issues)
  const ui = useUI()
  const [q, setQ] = useState("")
  const filtered = useMemo(() => issues.filter(i => i.title.toLowerCase().includes(q.toLowerCase())), [issues, q])
  
  const [profiles, setProfiles] = useState<{id:string; username:string|null; email:string|null}[]>([])

  // Load profiles on mount
  useEffect(() => {
    fetchProfiles().then(setProfiles)
  }, [])

  // Helper to map assignee ID to name
  const mapName = (id?: string | null) => {
    const p = profiles.find(x => x.id === id)
    return p?.username || p?.email || "Unassigned"
  }

  return (
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
  )
}