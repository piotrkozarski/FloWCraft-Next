import { useState } from 'react'
import { useFCStore, type SprintStatus } from '../store'

export default function SprintForm() {
  const create = useFCStore(s => s.createSprint)
  const [name, setName] = useState('')
  const [startDate, setStart] = useState('')
  const [endDate, setEnd] = useState('')
  const [status, setStatus] = useState<SprintStatus>('Planned')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    console.log('SprintForm submit called', { name, startDate, endDate, status })
    if (!name || !startDate || !endDate) return
    try {
      create({ name, startDate, endDate, status })
      setName(''); setStart(''); setEnd(''); setStatus('Planned')
      console.log('Sprint created successfully')
    } catch (error) {
      console.error('Error creating sprint:', error)
    }
  }

  return (
    <div className="md-card p-6">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Sprint Name</label>
          <input 
            className="input w-full" 
            value={name} 
            onChange={e=>setName(e.target.value)} 
            placeholder="Sprint name..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="label">Start Date</label>
            <input 
              type="date" 
              className="input w-full" 
              value={startDate} 
              onChange={e=>setStart(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="label">End Date</label>
            <input 
              type="date" 
              className="input w-full" 
              value={endDate} 
              onChange={e=>setEnd(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="label">Status</label>
            <select 
              className="select w-full" 
              value={status} 
              onChange={e=>setStatus(e.target.value as SprintStatus)}
            >
              {['Planned','Active','Completed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            className="bg-[#6750A4] text-white px-4 py-2 rounded-full text-sm font-semibold hover:brightness-95 shadow-sm disabled:opacity-50" 
            type="submit"
            disabled={!name || !startDate || !endDate}
          >
            Create Sprint
          </button>
        </div>
      </form>
    </div>
  )
}
