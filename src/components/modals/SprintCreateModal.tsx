import { useState, useMemo } from "react"
import Modal from "../ui/Modal"
import { useUI } from "../../store/ui"
import { useFCStore } from "../../store"
import type { SprintStatus } from "../../store"

const STATUSES: SprintStatus[] = ["Planned","Active","Completed"]

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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    addSprint({
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
          <label className="block text-sm mb-1 text-gray-300">Sprint Name</label>
          <input className="w-full rounded-md bg-gray-950 border border-gray-700 px-3 py-2 text-sm"
                 placeholder="np. Q4 Kickoff" value={name} onChange={e=>setName(e.target.value)} autoFocus />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:max-w-[220px]">
            <label className="block text-sm mb-1 text-gray-300">Start Date</label>
            <input type="date" className="w-full min-w-0 rounded-md bg-gray-950 border border-gray-700 px-3 py-2 text-sm"
                   value={startDate} onChange={e=>setStartDate(e.target.value)} />
          </div>
          <div className="sm:max-w-[220px]">
            <label className="block text-sm mb-1 text-gray-300">End Date</label>
            <input type="date" className="w-full min-w-0 rounded-md bg-gray-950 border border-gray-700 px-3 py-2 text-sm"
                   value={endDate} onChange={e=>setEndDate(e.target.value)} />
          </div>
          <div className="sm:max-w-[220px]">
            <label className="block text-sm mb-1 text-gray-300">Status</label>
            <select className="w-full min-w-0 rounded-md bg-gray-950 border border-gray-700 px-2 py-2 text-sm"
                    value={status} onChange={e=>setStatus(e.target.value as SprintStatus)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
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
