import { useState, useMemo, useEffect } from "react"
import Modal from "../ui/Modal"
import { useUI } from "../../store/ui"
import { useFCStore } from "../../store"
import type { SprintStatus } from "../../store"

const STATUSES: SprintStatus[] = ["Planned","Active","Completed"]

export default function SprintEditModal() {
  const open = useUI(s => s.editSprintId !== null)
  const close = useUI(s => s.closeSprintEdit)
  const editSprintId = useUI(s => s.editSprintId)
  const updateSprint = useFCStore(s => s.updateSprint)
  const sprints = useFCStore(s => s.sprints)

  const sprint = sprints.find(s => s.id === editSprintId)
  
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<SprintStatus>("Planned")

  // Pre-fill form when sprint changes
  useEffect(() => {
    if (sprint) {
      setName(sprint.name)
      setStartDate(sprint.startDate)
      setEndDate(sprint.endDate)
      setStatus(sprint.status)
    }
  }, [sprint])

  const canSave = useMemo(() => {
    if (!name.trim() || !startDate || !endDate) return false
    if (name.trim().length < 3) return false
    if (new Date(endDate) <= new Date(startDate)) return false
    return true
  }, [name, startDate, endDate])

  function reset() {
    setName("")
    setStartDate("")
    setEndDate("")
    setStatus("Planned")
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave || !sprint) return
    
    updateSprint(sprint.id, {
      name: name.trim(),
      startDate,
      endDate,
      status
    })
    reset()
    close()
  }

  if (!sprint) return null

  return (
    <Modal open={open} onClose={close} title="Edit Sprint" width="max-w-xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-[var(--muted)]">Sprint Name</label>
          <input 
            className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] px-3 py-2 text-sm"
            placeholder="np. Q4 Kickoff" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            autoFocus 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:max-w-[220px]">
            <label className="block text-sm mb-1 text-[var(--muted)]">Start Date</label>
            <input 
              type="date" 
              className="date-input w-full min-w-0 rounded-md px-3 py-2 text-sm"
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
          </div>
          <div className="sm:max-w-[220px]">
            <label className="block text-sm mb-1 text-[var(--muted)]">End Date</label>
            <input 
              type="date" 
              className="date-input w-full min-w-0 rounded-md px-3 py-2 text-sm"
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>
          <div className="sm:max-w-[220px]">
            <label className="block text-sm mb-1 text-[var(--muted)]">Status</label>
            <select 
              className="theme-select w-full min-w-0 rounded-md px-2 py-2 text-sm"
              value={status} 
              onChange={e => setStatus(e.target.value as SprintStatus)}
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
          <button 
            type="button" 
            onClick={close}
            className="px-3 py-2 text-sm rounded-md border border-gray-700 bg-gray-900 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={!canSave}
            className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}




