import { motion } from 'framer-motion'
import { useFCStore } from '../store'
import type { Issue, IssuePriority, IssueStatus } from '@/types'
import Avatar from './ui/Avatar'
import Chip from './ui/Chip'
import { ArrowLeft, ArrowRight, Check, Trash2 } from 'lucide-react'
import { nextStatus, prevStatus } from '../constants/status'

const STATUSES: IssueStatus[] = ['Todo','In Progress','In Review','Done']
const PRIORITY_LABEL: Record<IssuePriority, string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
  Critical: "Critical",
}

export default function IssueCard({ issue }: { issue: Issue }) {
  const update = useFCStore(s => s.updateIssue)
  const updateStatus = useFCStore(s => s.updateIssueStatus)
  const del = useFCStore(s => s.deleteIssue)
  const sprints = useFCStore(s => s.sprints)
  const assign = useFCStore(s => s.assignIssueToSprint)

  const moveLeft  = () => updateStatus(issue.id, prevStatus(issue.status))
  const moveRight = () => updateStatus(issue.id, nextStatus(issue.status))
  const markDone  = () => updateStatus(issue.id, 'Done')

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      className="md-card issue-card" data-prio={issue.priority} data-assignee={issue.assigneeId ?? ''}
    >
      <div className="card-inner">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-500">{issue.id}</span>
          <Chip>{issue.priority}</Chip>
          <span className="ml-auto text-xs text-slate-400">{new Date(issue.updatedAt ?? issue.createdAt).toLocaleDateString()}</span>
          <Avatar name={issue.assigneeId} />
        </div>

        {/* Title */}
        <input
          className="issue-title input w-full"
          value={issue.title}
          onChange={(e) => update(issue.id, { title: e.target.value })}
          placeholder="Issue title…"
        />

        {/* Meta + quick actions */}
        <div className="issue-meta--compact mt-2 items-center">
          <select className="select w-full" value={issue.priority}
                  onChange={(e) => update(issue.id, { priority: e.target.value as Priority })} aria-label="Priority">
            {PRIOS.map(p => <option key={p}>{p}</option>)}
          </select>

          <select className="select w-full" value={issue.status}
                  onChange={(e) => updateStatus(issue.id, e.target.value as Status)} aria-label="Status">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>

          <select className="select w-full" value={issue.sprintId ?? 'backlog'}
                  onChange={(e) => assign(issue.id, e.target.value === 'backlog' ? null : e.target.value)} aria-label="Sprint">
            <option value="backlog">Backlog</option>
            {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
          </select>

          <div className="flex items-center justify-end gap-2">
            <button className="icon-mini" onClick={moveLeft} title="Move left"><ArrowLeft className="w-4 h-4 text-slate-600" /></button>
            <button className="icon-mini" onClick={moveRight} title="Move right"><ArrowRight className="w-4 h-4 text-slate-600" /></button>
            <button className="icon-mini" onClick={markDone} title="Mark as done"><Check className="w-4 h-4 text-green-600" /></button>
            <button className="icon-mini" onClick={() => del(issue.id)} title="Delete"><Trash2 className="w-4 h-4 text-red-600" /></button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}