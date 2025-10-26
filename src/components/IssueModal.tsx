import { useState } from 'react'
import { useFCStore, type Status } from '../store'
import type { Priority } from '../constants/priority'

const priorities: Priority[] = ['P0','P1','P2','P3','P4','P5']
const statuses: Status[] = ['Todo','In Progress','In Review','Done']

interface IssueModalProps {
  open: boolean
  onClose: () => void
}

export default function IssueModal({ open, onClose }: IssueModalProps) {
  console.log('IssueModal rendered, open:', open)
  const createIssue = useFCStore(s => s.createIssue)
  const sprints = useFCStore(s => s.sprints)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('P3')
  const [status, setStatus] = useState<Status>('Todo')
  const [sprintId, setSprintId] = useState<string | 'backlog'>('backlog')
  const [assignee, setAssignee] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    console.log('IssueModal submit called', { title, priority, status, sprintId, assignee })
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
      onClose()
      console.log('Issue created successfully')
    } catch (error) {
      console.error('Error creating issue:', error)
    }
  }

  if (!open) return null

  console.log('IssueModal rendering modal with open:', open)

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4" 
      style={{
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)'
      }}
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full"
        style={{
          backgroundColor: 'white',
          border: '4px solid red',
          position: 'relative',
          zIndex: 10000
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">➕</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create New Issue</h2>
            <p className="text-sm text-slate-600">Add a new task to your project</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>
          
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📝 Issue Title
                </label>
                <input 
                  value={title} 
                  onChange={e=>setTitle(e.target.value)} 
                  className="input-modern text-lg" 
                  placeholder="e.g. Add bulk assign modal" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ⚡ Priority
                </label>
                <select 
                  value={priority} 
                  onChange={e=>setPriority(e.target.value as Priority)} 
                  className="select-modern"
                >
                  {priorities.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📋 Status
                </label>
                <select 
                  value={status} 
                  onChange={e=>setStatus(e.target.value as Status)} 
                  className="select-modern"
                >
                  {statuses.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  🏃 Sprint
                </label>
                <select 
                  value={sprintId} 
                  onChange={e=>setSprintId(e.target.value as any)} 
                  className="select-modern"
                >
                  <option value="backlog">📦 Backlog</option>
                  {sprints.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  👤 Assignee
                </label>
                <input 
                  value={assignee} 
                  onChange={e=>setAssignee(e.target.value)} 
                  className="input-modern" 
                  placeholder="Team member name" 
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary flex items-center gap-2"
                disabled={!title.trim()}
              >
                <span>✨</span>
                Create Issue
              </button>
            </div>
          </form>
      </div>
    </div>
  )
}
