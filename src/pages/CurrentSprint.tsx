import { useFCStore } from "../store"
import { useUI } from "../store/ui"
import { useMemo } from "react"
import KanbanBoard from "../components/KanbanBoard"

export default function CurrentSprint() {
  const sprint = useFCStore(s => s.getActiveSprint())
  const issues = useFCStore(s => s.issues)
  const ui = useUI()

  const inSprint = useMemo(() => issues.filter(i => i.sprintId === sprint?.id), [issues, sprint])
  
  // Calculate sprint progress
  const sprintProgress = useMemo(() => {
    if (!inSprint.length) return 0
    const doneCount = inSprint.filter(i => i.status === 'Done').length
    return Math.round((doneCount / inSprint.length) * 100)
  }, [inSprint])

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

      {/* Sprint Progress Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Sprint Progress</h3>
          <div className="text-sm text-[var(--muted)]">
            {inSprint.filter(i => i.status === 'Done').length} / {inSprint.length} completed
          </div>
        </div>
        <div className="w-full bg-[var(--panel)] rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ease-out"
            style={{ width: `${sprintProgress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-[var(--muted)]">0%</span>
          <span className="text-lg font-semibold text-[var(--accent)]">{sprintProgress}%</span>
          <span className="text-sm text-[var(--muted)]">100%</span>
        </div>
      </div>

      {/* Kanban Board with Drag & Drop */}
      <KanbanBoard issues={inSprint} sprintName={sprint.name} />
    </div>
  )
}