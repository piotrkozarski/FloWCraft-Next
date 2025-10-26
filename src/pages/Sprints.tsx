import { useFCStore } from '../store'
import { useUI } from '../store/ui'
import Section from '../components/ui/Section'
import SprintForm from '../components/SprintForm'
import Chip from '../components/ui/Chip'
import { Button } from '../components/ui/Button'
import { Pencil, Trash2 } from 'lucide-react'

export default function Sprints(){
  const sprints=useFCStore(s=>s.sprints)
  const start=useFCStore(s=>s.startSprint)
  const end=useFCStore(s=>s.endSprint)
  const deleteSprint = useFCStore(s => s.deleteSprint)
  const issues=useFCStore(s=>s.issues)
  const ui = useUI()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Section title="Create New Sprint"><SprintForm/></Section>
      <Section title="Sprints">
        <div className="grid gap-4">
          {sprints.map(s=>{
            const inSprint=issues.filter(i=>i.sprintId===s.id)
            const done=inSprint.filter(i=>i.status==='Done').length
            const pct=inSprint.length?Math.round(done/inSprint.length*100):0
            return (
              <div key={s.id} className="md-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold">{s.name}</div>
                  <Chip>{s.status}</Chip>
                  <div className="text-sm text-[var(--muted)]">[{s.startDate} → {s.endDate}]</div>
                  <div className="ml-auto flex gap-2">
                    {s.status === "Planned" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => ui.openSprintEdit(s.id)}
                          className="p-2 rounded-md hover:bg-[color-mix(in_oklab,var(--panel) 85%,black 15%)] text-[var(--text)]"
                          title="Edit sprint"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => ui.openConfirm({
                            title: `Delete sprint "${s.name}"?`,
                            message: "This action cannot be undone.",
                            onConfirm: () => { deleteSprint(s.id); ui.closeConfirm() }
                          })}
                          className="p-2 rounded-md hover:bg-[color-mix(in_oklab,var(--panel) 85%,black 15%)] text-red-400"
                          title="Delete sprint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <Button variant="secondary" onClick={()=>start(s.id)} disabled={s.status==='Active'}>Start</Button>
                    <Button variant="outline" onClick={()=>end(s.id)} disabled={s.status==='Completed'}>End</Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="progress"><i style={{ width: `${pct}%` }} /></div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{done}/{inSprint.length} completed • {pct}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}