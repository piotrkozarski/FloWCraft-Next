import { useFCStore } from "../store"
import { useUI } from "../store/ui"
import { useMemo } from "react"

const COLUMNS = ["Todo","In Progress","In Review","Done"]

export default function CurrentSprint() {
  const sprint = useFCStore(s => s.getActiveSprint())
  const issues = useFCStore(s => s.issues)
  const ui = useUI()

  const inSprint = useMemo(() => issues.filter(i => i.sprintId === sprint?.id), [issues, sprint])
  const grouped = COLUMNS.map(col => ({ status: col, items: inSprint.filter(i => i.status === col) }))

  if (!sprint) return <div className="text-gray-400">No active sprint.</div>

  return (
    <div className="space-y-6">
      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-primary">Sprint: "{sprint.name}"</div>
          <div className="text-sm text-gray-400">{sprint.startDate} → {sprint.endDate}</div>
        </div>
        {sprint.status === 'Active' && (
          <button 
            onClick={() => {
              const endSprint = useFCStore.getState().endSprint
              endSprint(sprint.id)
            }}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-700 border border-gray-600 hover:bg-gray-600"
          >
            End Sprint
          </button>
        )}
      </div>

      <div className="board">
        {grouped.map(col => (
          <div key={col.status} className="board-col">
            <div className="board-col-header">
              <span>{col.status}</span>
              <span className="text-xs text-gray-400">{col.items.length}</span>
            </div>
            <div className="board-col-body">
              {col.items.map(i => (
                <div key={i.id} className="task-card cursor-pointer" onClick={() => ui.openIssueDetail(i.id)}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-gray-400">{i.id}</div>
                    <span className={`badge type ${i.type.toLowerCase()}`}>{i.type}</span>
                  </div>
                  <div className="font-medium text-gray-100">{i.title}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`badge priority ${i.priority}`}>{i.priority}</span>
                    <span className={`badge ${i.status.toLowerCase().replace(" ","")}`}>{i.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}