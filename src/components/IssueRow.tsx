import { useFCStore } from '../store'
import type { Issue, IssueStatus } from '@/types'
import type { IssuePriority } from '@/types'

const statuses: IssueStatus[] = ['Todo','In Progress','In Review','Done']
const priorities: IssuePriority[] = ['P0','P1','P2','P3','P4','P5']

export default function IssueRow({ issue }: { issue: Issue }) {
  const updateIssue = useFCStore(s => s.updateIssue)
  const updateStatus = useFCStore(s => s.updateIssueStatus)
  const deleteIssue = useFCStore(s => s.deleteIssue)
  const sprints = useFCStore(s => s.sprints)
  const assign = useFCStore(s => s.assignIssueToSprint)

  return (
    <div className="bg-white border rounded-lg p-3 flex flex-wrap items-center gap-3">
      <div className="font-medium">{issue.id}</div>
      <input
        className="border rounded-md px-2 py-1 flex-1 min-w-[240px]"
        value={issue.title}
        onChange={(e)=>updateIssue(issue.id, { title: e.target.value })}
      />
      <select
        className="border rounded-md px-2 py-1"
        value={issue.priority}
        onChange={(e)=>updateIssue(issue.id, { priority: e.target.value as IssuePriority })}
      >
        {priorities.map(p => <option key={p}>{p}</option>)}
      </select>
      <select
        className="border rounded-md px-2 py-1"
        value={issue.status}
        onChange={(e)=>updateStatus(issue.id, e.target.value as IssueStatus)}
      >
        {statuses.map(s => <option key={s}>{s}</option>)}
      </select>
      <select
        className="border rounded-md px-2 py-1"
        value={issue.sprintId ?? 'backlog'}
        onChange={(e)=>assign(issue.id, e.target.value === 'backlog' ? null : e.target.value)}
      >
        <option value="backlog">Backlog</option>
        {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
      </select>
      <input
        className="border rounded-md px-2 py-1 w-36"
        value={issue.assigneeId ?? ''}
        placeholder="assignee"
        onChange={(e)=>updateIssue(issue.id, { assigneeId: e.target.value || undefined })}
      />
      <button onClick={()=>deleteIssue(issue.id)} className="ml-auto px-3 py-1.5 rounded-md bg-red-600 text-white">Delete</button>
    </div>
  )
}
