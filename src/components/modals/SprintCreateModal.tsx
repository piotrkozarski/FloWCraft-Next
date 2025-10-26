import { useState, useMemo } from "react"
import Modal from "../ui/Modal"
import { useUI } from "../../store/ui"
import { useFCStore } from "../../store"
import type { SprintStatus } from "../../types"
import Select, { type Option } from "../ui/Select"

// const STATUSES: SprintStatus[] = ["Planned","Active","Completed"] // Removed unused constant

const STATUS_OPTS: Option<SprintStatus>[] = [
  { label: "Planned", value: "Planned" },
  { label: "Active", value: "Active" },
  { label: "Completed", value: "Completed" },
]

export default function SprintCreateModal() {
  const open = useUI(s => s.newSprintOpen)
  const close = useUI(s => s.closeSprint)
  const addSprint = useFCStore(s => s.createSprint)
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<SprintStatus>("Planned")

  const canSave = useMemo(() => name.trim().length >= 3 && startDate && endDate, [name, startDate, endDate])

  function reset() {
    setName(""); setStartDate(""); setEndDate(""); setStatus("Planned")
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    await addSprint({
      name: name.trim(),
      startDate, endDate, status
    })
    reset()
    close()
  }

  return (
    <Modal open={open} onClose={close} title="Create Sprint" width="max-w-xl">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-[var(--muted)]">Sprint Name</label>
          <input className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] px-3 py-2 text-sm"
                 placeholder="np. Q4 Kickoff" value={name} onChange={e=>setName(e.target.value)} autoFocus />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:max-w-[220px]">
            <label className="block text-sm mb-1 text-[var(--muted)]">Start Date</label>
            <input type="date" className="date-input w-full min-w-0 rounded-md px-3 py-2 text-sm"
                   value={startDate} onChange={e=>setStartDate(e.target.value)} />
          </div>
          <div className="sm:max-w-[220px]">
            <label className="block text-sm mb-1 text-[var(--muted)]">End Date</label>
            <input type="date" className="date-input w-full min-w-0 rounded-md px-3 py-2 text-sm"
                   value={endDate} onChange={e=>setEndDate(e.target.value)} />
          </div>
          <div className="sm:max-w-[220px]">
            <label className="block text-sm mb-1 text-[var(--muted)]">Status</label>
            <Select
              value={status}
              onChange={setStatus}
              options={STATUS_OPTS}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
          <button type="button" onClick={close}
                  className="px-3 py-2 text-sm rounded-md border border-gray-700 bg-gray-900 hover:bg-gray-800">Cancel</button>
          <button type="submit" disabled={!canSave}
                  className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50">Create Sprint</button>
        </div>
      </form>
    </Modal>
  )
}
