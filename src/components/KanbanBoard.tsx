import { useState, useEffect, useMemo } from 'react'
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
      className={`rounded-lg p-4 cursor-move bg-white shadow-sm border border-[#E6E0E9] ${
        isDragging ? 'shadow-lg rotate-1 scale-105' : ''
      } transition-all duration-200`}
    >
      {/* Issue Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono px-2 py-1 rounded bg-[#F3EDF7] text-slate-600">
          {issue.id}
        </div>
        <Badge className={`priority-${issue.priority.toLowerCase()}`}>
          {issue.priority}
        </Badge>
      </div>

      {/* Issue Title */}
      <h4 className="font-bold mb-3 line-clamp-2 text-sm leading-relaxed text-[#21005E]">
        {issue.title}
      </h4>

      {/* Issue Description */}
      {issue.description && (
        <p className="text-xs mb-4 line-clamp-2 leading-relaxed text-slate-600">
          {issue.description}
        </p>
      )}

      {/* Assignee */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#E6E0E9]">
        <Avatar name={mapName(issue.assigneeId)} />
        <span className="text-xs font-medium text-slate-600">
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

export default function KanbanBoard({ issues, sprintName }: KanbanBoardProps) {
  const { moveIssueStatus, sprints } = useFCStore(s => ({ 
    moveIssueStatus: s.moveIssueStatus,
    sprints: s.sprints
  }))
  const [filters, setFilters] = useState({
    title: '',
    assigneeId: '',
    priority: ''
  })
  
  const [profiles, setProfiles] = useState<{id:string; username:string|null; email:string|null}[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // Get active sprint and calculate progress
  const activeSprint = sprints.find(s => s.status === "Active")
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

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const issueId = active.id as string
    const overCol = over.id as IssueStatus | string

    // Check if dropped on a valid status column
    if (overCol === "Todo" || overCol === "In Progress" || overCol === "In Review" || overCol === "Done") {
      const issue = filteredIssues.find(i => i.id === issueId)
      if (issue) {
        logEvent({ t: "dnd_move", from: issue.status, to: overCol, at: Date.now() })
        try {
          await moveIssueStatus(issueId, overCol)
        } catch (error) {
          console.error('Failed to move issue:', error)
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E6E0E9] p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#EADDFF] flex items-center justify-center">
            <span className="text-[#21005E] text-lg">📋</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#21005E]">Kanban Board</h3>
            <p className="text-sm text-slate-600">{sprintName} • Drag and drop to update status</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search title..."
              value={filters.title}
              onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
              className="border border-[#E6E0E9] rounded-full px-4 py-2 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#D0BCFF]"
            />
            <input
              type="text"
              placeholder="Filter assignee..."
              value={filters.assigneeId}
              onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
              className="border border-[#E6E0E9] rounded-full px-4 py-2 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#D0BCFF]"
            />
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="border border-[#E6E0E9] rounded-full px-4 py-2 text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#D0BCFF]"
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
          <div className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 bg-[#E8DEF8] text-[#1D192B]">
            <span className="w-2 h-2 rounded-full bg-[#625B71]"></span>
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
                className="rounded-lg border-2 border-dashed min-h-[400px] p-4 bg-[#F3EDF7] transition-all duration-300"
                id={status}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                      <span className="text-lg text-slate-600">{getStatusIcon(status)}</span>
                    </div>
                    <div>
                      <span className="font-bold text-lg text-[#21005E]">{status}</span>
                      <div className="text-xs uppercase tracking-wide text-slate-600">
                        {statusIssues.length} {statusIssues.length === 1 ? 'issue' : 'issues'}
                      </div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm font-bold text-[#21005E]">
                      {statusIssues.length}
                    </span>
                  </div>
                </div>

                {/* Sprint Progress Bar (if active sprint) */}
                {activeSprint && status === "Todo" && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-[#E6E0E9]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#21005E]">Sprint Progress</span>
                      <span className="text-xs text-slate-600">{donePct}%</span>
                    </div>
                    <div className="w-full bg-[#F3EDF7] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          donePct >= 80 ? 'bg-green-500' : donePct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(donePct, 100)}%` }}
                      />
                    </div>
                    {donePct < 80 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--panel)]/70 mt-1 inline-block">
                        target ≥ 80%
                      </span>
                    )}
                  </div>
                )}

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
}
