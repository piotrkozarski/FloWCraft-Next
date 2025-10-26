import { useState } from 'react'
import { useFCStore, type Status } from '../store'
import type { Priority } from '../constants/priority'

const priorities: Priority[] = ['P0','P1','P2','P3','P4','P5']
const statuses: Status[] = ['Todo','In Progress','In Review','Done']

export default function IssueForm() {
  const createIssue = useFCStore(s => s.createIssue)
  const sprints = useFCStore(s => s.sprints)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('P3')
  const [status, setStatus] = useState<Status>('Todo')
  const [sprintId, setSprintId] = useState<string | 'backlog'>('backlog')
  const [assignee, setAssignee] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    console.log('IssueForm submit called', { title, priority, status, sprintId, assignee })
    if (!title.trim()) return
    try {
      createIssue({
        title: title.trim(),
        description: '',
        status,
        priority,
        assignee: assignee.trim() || undefined,
        sprintId: sprintId === 'backlog' ? null : sprintId,
        createdAt: 0, // nadpisywane w store
        updatedAt: 0,
        id: ''        // nadpisywane w store
      } as any)
      setTitle('')
      setAssignee('')
      setPriority('P3')
      setStatus('Todo')
      setSprintId('backlog')
      console.log('Issue created successfully')
    } catch (error) {
      console.error('Error creating issue:', error)
    }
  }

  return (
    <div className="md-card p-6">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input 
            value={title} 
            onChange={e=>setTitle(e.target.value)} 
            className="input w-full" 
            placeholder="Issue title..." 
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Priority</label>
            <select 
              value={priority} 
              onChange={e=>setPriority(e.target.value as Priority)} 
              className="select w-full"
            >
              {priorities.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          
          <div>
            <label className="label">Status</label>
            <select 
              value={status} 
              onChange={e=>setStatus(e.target.value as Status)} 
              className="select w-full"
            >
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label className="label">Sprint</label>
            <select 
              value={sprintId} 
              onChange={e=>setSprintId(e.target.value as any)} 
              className="select w-full"
            >
              <option value="backlog">Backlog</option>
              {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
            </select>
          </div>
          
          <div>
            <label className="label">Assignee</label>
            <input 
              value={assignee} 
              onChange={e=>setAssignee(e.target.value)} 
              className="input w-full" 
              placeholder="Assignee" 
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-hordeRed text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-hordeRed/80 shadow-horde-glow-sm border border-hordeBorder disabled:opacity-50"
            disabled={!title.trim()}
          >
            Create Issue
          </button>
        </div>
      </form>
    </div>
  )
}
