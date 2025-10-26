import { useState } from 'react'
import { useFCStore, type SprintStatus } from '../store'

interface SprintModalProps {
  open: boolean
  onClose: () => void
}

export default function SprintModal({ open, onClose }: SprintModalProps) {
  console.log('SprintModal rendered, open:', open)
  const create = useFCStore(s => s.createSprint)
  const [name, setName] = useState('')
  const [startDate, setStart] = useState('')
  const [endDate, setEnd] = useState('')
  const [status, setStatus] = useState<SprintStatus>('Planned')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    console.log('SprintModal submit called', { name, startDate, endDate, status })
    if (!name || !startDate || !endDate) return
    try {
      create({ name, startDate, endDate, status })
      setName(''); setStart(''); setEnd(''); setStatus('Planned')
      onClose()
      console.log('Sprint created successfully')
    } catch (error) {
      console.error('Error creating sprint:', error)
    }
  }

  if (!open) return null

  console.log('SprintModal rendering modal with open:', open)

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
          border: '4px solid green',
          position: 'relative',
          zIndex: 10000
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🏃</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create New Sprint</h2>
            <p className="text-sm text-slate-600">Plan your next development cycle</p>
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
                  🏷️ Sprint Name
                </label>
                <input 
                  className="input-modern text-lg" 
                  value={name} 
                  onChange={e=>setName(e.target.value)} 
                  placeholder="e.g. Q1 2024 Sprint 1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📅 Start Date
                </label>
                <input 
                  type="date" 
                  className="input-modern" 
                  value={startDate} 
                  onChange={e=>setStart(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📅 End Date
                </label>
                <input 
                  type="date" 
                  className="input-modern" 
                  value={endDate} 
                  onChange={e=>setEnd(e.target.value)} 
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  📊 Status
                </label>
                <select 
                  className="select-modern" 
                  value={status} 
                  onChange={e=>setStatus(e.target.value as SprintStatus)}
                >
                  {['Planned','Active','Completed'].map(s => <option key={s}>{s}</option>)}
                </select>
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
                className="btn-primary flex items-center gap-2" 
                type="submit"
                disabled={!name || !startDate || !endDate}
              >
                <span>🚀</span>
                Create Sprint
              </button>
            </div>
          </form>
      </div>
    </div>
  )
}
