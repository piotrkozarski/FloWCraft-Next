import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { useFCStore } from '../store'
import type { Issue, IssueStatus } from '@/types'
import Badge from './ui/Badge'
import Avatar from './ui/Avatar'
import { fetchProfiles } from '../services/users'
import { logEvent } from '../utils/telemetry'

const statuses: IssueStatus[] = ['Todo','In Progress','In Review','Done']

const getStatusIcon = (status: IssueStatus) => {
  const icons: Record<IssueStatus, string> = {
    'Todo': 'assignment',
    'In Progress': 'play_arrow',
    'In Review': 'visibility',
    'Done': 'check_circle'
  }
  return icons[status]
}

// Draggable Card Component
function DraggableCard({ issue, mapName }: { issue: Issue; mapName: (id?: string | null) => string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: issue.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={`rounded-lg p-4 cursor-move bg-[var(--background)] shadow-sm border border-[var(--border)] ${
        isDragging ? 'shadow-lg rotate-1 scale-105' : ''
      } transition-all duration-200`}
    >
      {/* Issue Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono px-2 py-1 rounded bg-[var(--panel)] text-[var(--muted)]">
          {issue.id}
        </div>
        <Badge className={`priority ${issue.priority}`}>
          {issue.priority}
        </Badge>
      </div>

      {/* Issue Title */}
      <h4 className="font-bold mb-3 line-clamp-2 text-sm leading-relaxed text-[var(--text)]">
        {issue.title}
      </h4>

      {/* Issue Description */}
      {issue.description && (
        <p className="text-xs mb-4 line-clamp-2 leading-relaxed text-[var(--muted)]">
          {issue.description}
        </p>
      )}

      {/* Assignee */}
      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
        <Avatar name={mapName(issue.assigneeId)} />
        <span className="text-xs font-medium text-[var(--muted)]">
          {mapName(issue.assigneeId)}
        </span>
      </div>
    </motion.div>
  )
}

interface KanbanBoardProps {
  issues: Issue[]
  sprintName: string
}

const KanbanBoard = memo(function KanbanBoard({ issues, sprintName }: KanbanBoardProps) {
  const moveIssueStatus = useFCStore(s => s.moveIssueStatus)
  const sprints = useFCStore(s => s.sprints)
  
  const [filters, setFilters] = useState({
    title: '',
    assigneeId: '',
    priority: ''
  })

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])
  
  const [profiles, setProfiles] = useState<{id:string; username:string|null; email:string|null}[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // Get active sprint and calculate progress - memoized
  const activeSprint = useMemo(() => sprints.find(s => s.status === "Active"), [sprints])
  const issuesInActive = useMemo(
    () => activeSprint ? issues.filter(i => i.sprintId === activeSprint.id) : [],
    [issues, activeSprint]
  )
  const donePct = useMemo(() => {
    const total = issuesInActive.length
    if (!total) return 0
    const done = issuesInActive.filter(i => i.status === "Done").length
    return Math.round((done / total) * 100)
  }, [issuesInActive])

  // Load profiles on mount
  useEffect(() => {
    fetchProfiles().then(setProfiles)
  }, [])

  // Helper to map assignee ID to name
  const mapName = useMemo(() => {
    return (id?: string | null) => {
      const p = profiles.find(x => x.id === id)
      return p?.username || p?.email || "Unassigned"
    }
  }, [profiles])

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filters.title && !issue.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false
      }
      if (filters.assigneeId && !(issue.assigneeId?.toLowerCase().includes(filters.assigneeId.toLowerCase()) ?? false)) {
        return false
      }
      if (filters.priority && issue.priority !== filters.priority) {
        return false
      }
      return true
    })
  }, [issues, filters.title, filters.assigneeId, filters.priority])

  // Group issues by status
  const columns: Record<IssueStatus, Issue[]> = useMemo(() => ({
    "Todo": filteredIssues.filter(i => i.status === "Todo"),
    "In Progress": filteredIssues.filter(i => i.status === "In Progress"),
    "In Review": filteredIssues.filter(i => i.status === "In Review"),
    "Done": filteredIssues.filter(i => i.status === "Done"),
  }), [filteredIssues])

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const onDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) {
      console.log('No drop target')
      return
    }

    const issueId = active.id as string
    const overCol = over.id as IssueStatus | string
    
    console.log('Drag end:', { issueId, overCol, overData: over.data })

    // Check if dropped on a valid status column
    if (overCol === "Todo" || overCol === "In Progress" || overCol === "In Review" || overCol === "Done") {
      const issue = filteredIssues.find(i => i.id === issueId)
      if (issue) {
        console.log('Moving issue:', { from: issue.status, to: overCol })
        try {
          logEvent({ t: "dnd_move", from: issue.status, to: overCol, at: Date.now() })
        } catch (error) {
          console.warn('Failed to log event:', error)
        }
        try {
          await moveIssueStatus(issueId, overCol)
          console.log('Issue moved successfully')
        } catch (error) {
          console.error('Failed to move issue:', error)
        }
      } else {
        console.log('Issue not found:', issueId)
      }
    } else {
      console.log('Invalid drop target:', overCol)
    }
  }, [filteredIssues, moveIssueStatus])

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <span className="text-[var(--background)] text-lg">📋</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text)]">Kanban Board</h3>
            <p className="text-sm text-[var(--muted)]">{sprintName} • Drag and drop to update status</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search title..."
              value={filters.title}
              onChange={(e) => updateFilters({ title: e.target.value })}
              className="input"
              list="title-suggestions"
            />
            <datalist id="title-suggestions">
              {filteredIssues.map(issue => (
                <option key={issue.id} value={issue.title} />
              ))}
            </datalist>
            <input
              type="text"
              placeholder="Filter assignee..."
              value={filters.assigneeId}
              onChange={(e) => updateFilters({ assigneeId: e.target.value })}
              className="input"
              list="assignee-suggestions"
            />
            <datalist id="assignee-suggestions">
              {profiles.map(profile => (
                <option key={profile.id} value={profile.username || profile.email || 'Unassigned'} />
              ))}
            </datalist>
            <select
              value={filters.priority}
              onChange={(e) => updateFilters({ priority: e.target.value })}
              className="input theme-select"
            >
              <option value="">All Priorities</option>
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
              <option value="P5">P5</option>
            </select>
          </div>
          <div className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 bg-[var(--panel)] text-[var(--text)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
            {filteredIssues.length} issues
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {(Object.keys(columns) as IssueStatus[]).map((status, index) => {
            const statusIssues = columns[status]
            
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border-2 border-dashed min-h-[400px] p-4 bg-[var(--panel)] transition-all duration-300"
                id={status}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center">
                      <span className="text-lg text-[var(--text)]">{getStatusIcon(status)}</span>
                    </div>
                    <div>
                      <span className="font-bold text-lg text-[var(--text)]">{status}</span>
                      <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
                        {statusIssues.length} {statusIssues.length === 1 ? 'issue' : 'issues'}
                      </div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[var(--background)] flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--text)]">
                      {statusIssues.length}
                    </span>
                  </div>
                </div>


                {/* Issues */}
                <SortableContext items={statusIssues.map(i => i.id)}>
                  <div className="space-y-3">
                    {statusIssues.map((issue) => (
                      <DraggableCard key={issue.id} issue={issue} mapName={mapName} />
                    ))}
                  </div>
                </SortableContext>
              </motion.div>
            )
          })}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <DraggableCard 
              issue={filteredIssues.find(i => i.id === activeId)!} 
              mapName={mapName} 
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
})

export default KanbanBoard
