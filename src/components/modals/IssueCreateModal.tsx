import { useEffect, useMemo, useState } from "react"
import Modal from "../ui/Modal"
import { useUI } from "../../store/ui"
import { useFCStore } from "../../store"
import type { IssuePriority, IssueStatus, Issue, IssueType } from "@/types"
import { Search, ChevronDown, X } from "lucide-react"
import Select from "../ui/Select"
import type { Option } from "../ui/Select"
import { fetchProfiles } from "../../services/users"

const PRIORITIES: IssuePriority[] = ["P0","P1","P2","P3","P4","P5"]
const STATUSES: IssueStatus[] = ["Todo","In Progress","In Review","Done"]
const TYPES: IssueType[] = ["Bug","Task","Feature","Story"]

export default function IssueCreateModal() {
  const open = useUI(s => s.newIssueOpen)
  const close = useUI(s => s.closeIssue)

  const addIssue = useFCStore(s => s.createIssue)
  const issues = useFCStore(s => s.issues)
  const sprints = useFCStore(s => s.sprints)
  const active = useFCStore(s => s.getActiveSprint?.())

  // form state
  const [title, setTitle] = useState("")
  const [type, setType] = useState<IssueType>("Task")
  const [priority, setPriority] = useState<IssuePriority>("P3")
  const [status, setStatus] = useState<IssueStatus>("Todo")
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [sprintId, setSprintId] = useState<string | "backlog">(active?.id ?? "backlog")
  const [description, setDescription] = useState("")
  const [parentQuery, setParentQuery] = useState("")
  const [parent, setParent] = useState<Issue | null>(null)
  const [showParentOptions, setShowParentOptions] = useState(false)
  const [profiles, setProfiles] = useState<{id:string; username:string|null; email:string|null}[]>([])

  // Load profiles on mount
  useEffect(() => {
    fetchProfiles().then(setProfiles)
  }, [])

  // reset na otwarciu
  useEffect(() => {
    if (open) {
      setTitle(""); setType("Task"); setPriority("P3"); setStatus("Todo")
      setAssigneeId(null); setSprintId(active?.id ?? "backlog"); setDescription("")
      setParentQuery(""); setParent(null); setShowParentOptions(false)
    }
  }, [open, active?.id])

  const canSave = title.trim().length >= 3

  // Assignee options
  const assigneeOptions: Option<string>[] = useMemo(() =>
    [{label:"Unassigned", value:""}, ...profiles.map(p => ({
      label: p.username || p.email || "Unknown User",
      value: p.id
    }))], [profiles])

  // źródło podpowiedzi dla „Zadanie nadrzędne"
  const parentOptions = useMemo(() => {
    const q = parentQuery.trim().toLowerCase()
    const base = issues
    if (!q) return base.slice(0, 20)
    return base.filter(i =>
      i.id.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [issues, parentQuery])

  function selectParent(issue: Issue) {
    setParent(issue)
    setParentQuery(`${issue.id} • ${issue.title}`)
    setShowParentOptions(false)
  }

  function clearParent() {
    setParent(null)
    setParentQuery("")
    setShowParentOptions(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    await addIssue({
      title: title.trim(),
      type,
      priority,
      status,
      assigneeId: assigneeId,
      sprintId: sprintId === "backlog" ? null : sprintId,
      description: description.trim(),
      parentId: parent?.id ?? null,
    })
    close()
  }

  return (
    <Modal open={open} onClose={close} title="Create Issue" width="max-w-3xl">
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm mb-1 text-[var(--muted)]">Title</label>
          <input
            className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]"
            placeholder="Short, action-oriented title…"
            value={title}
            onChange={e=>setTitle(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-[var(--muted)] mt-1">Min. 3 znaki.</p>
        </div>

        {/* Row: Type / Priority / Status / Sprint */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Type</label>
            <select className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] px-2 py-2 text-sm text-[var(--text)]"
                    value={type} onChange={e=>setType(e.target.value as IssueType)}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Priority</label>
            <select className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] px-2 py-2 text-sm text-[var(--text)]"
                    value={priority} onChange={e=>setPriority(e.target.value as IssuePriority)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Status</label>
            <select className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] px-2 py-2 text-sm text-[var(--text)]"
                    value={status} onChange={e=>setStatus(e.target.value as IssueStatus)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Sprint</label>
            <select className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] px-2 py-2 text-sm text-[var(--text)]"
                    value={sprintId} onChange={e=>setSprintId(e.target.value as any)}>
              <option value="backlog">Backlog</option>
              {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
            </select>
          </div>
        </div>

        {/* Row: Assignee / Parent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Assignee</label>
            <Select
              value={assigneeId ?? ""}
              onChange={(v)=> setAssigneeId(v || null)}
              options={assigneeOptions}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Parent Issue (optional)</label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="pointer-events-none absolute left-2 top-2.5 text-[var(--muted)]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] pl-8 pr-8 py-2 text-sm text-[var(--text)]"
                  placeholder="Wpisz ID lub tytuł…"
                  value={parentQuery}
                  onChange={(e) => {
                    setParentQuery(e.target.value)
                    setShowParentOptions(true)
                  }}
                  onFocus={() => setShowParentOptions(true)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5 text-[var(--muted)]"
                  onClick={() => setShowParentOptions(!showParentOptions)}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {showParentOptions && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-[var(--border)] bg-[var(--panel)] shadow-lg">
                  {parentOptions.length === 0 && (
                    <div className="px-3 py-2 text-sm text-[var(--muted)]">Brak wyników</div>
                  )}
                  {parentOptions.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-start gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-[var(--surface)] text-[var(--text)]"
                      onClick={() => selectParent(i)}
                    >
                      <span className="font-mono text-xs text-[var(--muted)] w-16">{i.id}</span>
                      <span className="flex-1 truncate">{i.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {parent && (
              <button
                type="button"
                className="mt-1 text-xs text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1"
                onClick={clearParent}
              >
                <X className="w-3 h-3" />
                Wyczyść nadrzędne
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm mb-1 text-[var(--muted)]">Description</label>
          <textarea
            className="w-full min-h-[120px] rounded-md bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]"
            placeholder="Opisz problem, kroki odtworzenia, oczekiwane zachowanie, załączniki…"
            value={description}
            onChange={e=>setDescription(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
          <button type="button" onClick={close}
                  className="px-3 py-2 text-sm rounded-md border border-[var(--border)] bg-[var(--panel)] hover:bg-[color-mix(in_oklab,var(--primary) 20%,transparent)] text-[var(--text)]">
            Cancel
          </button>
          <button type="submit" disabled={!canSave}
                  className="px-3 py-2 text-sm rounded-md bg-[var(--primary)] text-white hover:bg-[color-mix(in_oklab,var(--primary) 80%,transparent)] disabled:opacity-50 border border-[var(--border)] shadow-[var(--glow)]">
            Create Issue
          </button>
        </div>
      </form>
    </Modal>
  )
}