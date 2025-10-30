import { useState } from 'react'
import { useFCStore } from '../store'

export default function BulkAssignModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const issues = useFCStore(s => s.issues)
  const sprints = useFCStore(s => s.sprints)
  const bulkAssign = useFCStore(s => s.bulkAssignToSprint)

  const [selectedIds, setSelected] = useState<string[]>([])
  const [targetSprint, setTargetSprint] = useState<string | 'backlog'>('backlog')

  if (!open) return null

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function apply() {
    bulkAssign(selectedIds, targetSprint === 'backlog' ? null : targetSprint)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="md-card w-[600px] max-h-[80vh] overflow-auto p-6">
        <h2 className="text-lg font-semibold mb-3">Bulk Assign Issues</h2>
        <div className="text-sm text-slate-600 mb-3">
          Select issues and assign them to a sprint or backlog.
        </div>

        <div className="border border-[var(--border)] rounded-lg divide-y max-h-[300px] overflow-y-auto mb-4">
          {issues.map(i => (
            <label key={i.id} className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selectedIds.includes(i.id)}
                onChange={() => toggle(i.id)}
              />
              <span className="font-medium">{i.id}</span>
              <span className="flex-1 truncate">{i.title}</span>
              <span className="text-xs text-slate-500">{i.status} / {i.priority}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="label">Assign to:</label>
          <select
            value={targetSprint}
            onChange={e => setTargetSprint(e.target.value as any)}
            className="select"
          >
            <option value="backlog">Backlog</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-full border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--panel)]">Cancel</button>
          <button
            disabled={selectedIds.length === 0}
            onClick={apply}
            className="px-4 py-2 rounded-full bg-[var(--accent)] text-[var(--background)] disabled:opacity-40 hover:brightness-95"
          >
            Assign ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  )
}







