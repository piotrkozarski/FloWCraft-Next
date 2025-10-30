import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DndContext, DragOverlay, useDroppable, closestCorners } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { useFCStore } from '../store'
import type { Issue, IssueStatus } from '@/types'
import Badge from './ui/Badge'
import Avatar from './ui/Avatar'
import { fetchProfiles } from '../services/users'
import { logEvent } from '../utils/telemetry'
import { useDebounce } from '../utils/debounce'
import { STATUS_MAP, STATUS_TO_ID, getStatusIcon } from '../utils/status'
import { applyFilters, hasActiveFilters, clearFilters } from '../utils/filters'
import { getDropColumnId, getDropIndex } from '../utils/dnd-utils'

const statuses: IssueStatus[] = ['Todo','In Progress','In Review','Done']

// Droppable Column Component
function DroppableColumn({ 
  status, 
  issues, 
  mapName, 
  dragging 
}: { 
  status: IssueStatus
  issues: Issue[]
  mapName: (id?: string | null) => string
  dragging: {id: string, saving: boolean} | null
}) {
  const columnId = STATUS_TO_ID[status]
  const { setNodeRef: setDropRef, isOver } = useDroppable({ 
    id: columnId, 
    data: { type: 'column', status: columnId } 
  })

  const isActive = Boolean(isOver)

  const baseClasses = "rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm p-3 md:p-4 transition-colors hover:border-[var(--accent)] min-h-[220px]"

  const activeClasses = isActive ? 'ring-2 ring-[var(--accent)] ring-offset-1' : ''

  return (
    <motion.div
      ref={setDropRef}
      data-column-id={columnId}
      data-testid={`column-${columnId}`}
      className={`${baseClasses} ${activeClasses}`}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 truncate mb-4">
        <div className="shrink-0" aria-hidden="true">
          {getStatusIcon(status)}
        </div>
        <span className="font-semibold truncate text-[var(--text)]">{status}</span>
        <span className="ml-auto text-sm text-[var(--muted)] shrink-0" data-testid="column-count">
          {issues.length}
        </span>
      </div>

      {/* Issues */}
      <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <DraggableCard 
              key={issue.id} 
              issue={issue} 
              mapName={mapName} 
              saving={dragging?.id === issue.id && dragging?.saving}
              columnId={columnId}
              index={index}
            />
          ))}
        </div>
      </SortableContext>
    </motion.div>
  )
}

// Draggable Card Component
function DraggableCard({ issue, mapName, saving = false, columnId, index }: { issue: Issue; mapName: (id?: string | null) => string; saving?: boolean; columnId: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: issue.id,
    data: { type: 'item', columnId, index }
  })
  
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
      className={`rounded-lg p-4 cursor-move bg-[var(--background)] shadow-sm border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] focus:outline-none ${
        isDragging ? 'shadow-lg rotate-1 scale-105' : ''
      } transition-all duration-200`}
      data-testid={`issue-${issue.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Issue ${issue.id}: ${issue.title}. Status: ${issue.status}. Priority: ${issue.priority}. Drag to change status.`}
    >
      {/* Issue Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono px-2 py-1 rounded bg-[var(--panel)] text-[var(--muted)]">
          {issue.id}
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-600 border border-yellow-500/30" data-testid="saving-badge">
              Saving...
            </span>
          )}
          <Badge className={`priority ${issue.priority}`}>
            {issue.priority}
          </Badge>
        </div>
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
  
  const [searchParams, setSearchParams] = useSearchParams()
  
  const filters = useMemo(() => ({
    title: searchParams.get('q') || '',
    assigneeId: searchParams.get('assignee') || '',
    priority: searchParams.get('prio') || ''
  }), [searchParams])

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(newFilters).forEach(([key, value]) => {
      const paramKey = key === 'title' ? 'q' : key
      if (value) {
        params.set(paramKey, value)
      } else {
        params.delete(paramKey)
      }
    })
    setSearchParams(params)
  }, [searchParams, setSearchParams])
  
  const [profiles, setProfiles] = useState<{id:string; username:string|null; email:string|null}[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{id: string, saving: boolean} | null>(null)
  const [overColumn, setOverColumn] = useState<string | null>(null)

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  // Debounce title filter
  const debouncedTitle = useDebounce(filters.title, 300)

  const filteredIssues = useMemo(() => {
    const filterOptions = {
      title: debouncedTitle,
      assigneeId: filters.assigneeId,
      priority: filters.priority
    }
    return applyFilters(issues, filterOptions, mapName)
  }, [issues, debouncedTitle, filters.assigneeId, filters.priority, mapName])

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

  const onDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) {
      setOverColumn(null)
      return
    }

    // Get the target column ID using the utility function
    const targetColumnId = getDropColumnId(over)
    if (targetColumnId && targetColumnId in STATUS_MAP) {
      setOverColumn(targetColumnId)
    } else {
      setOverColumn(null)
    }
  }, [])

  const onDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverColumn(null)

    if (!over) {
      console.log('No drop target - aborting drag')
      return
    }

    const issueId = active.id as string
    const targetColumnId = getDropColumnId(over)
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.log('Drag end:', { 
        activeId: active.id, 
        overId: over.id, 
        overData: over.data.current,
        targetColumnId
      })
    }

    // Check if dropped on a valid status column
    const newStatus = targetColumnId ? STATUS_MAP[targetColumnId] : null
    if (!newStatus) {
      console.log('Invalid drop target:', targetColumnId)
      return
    }

    const issue = filteredIssues.find(i => i.id === issueId)
    if (!issue) {
      console.log('Issue not found:', issueId)
      return
    }

    // Don't move if already in the same status
    if (issue.status === newStatus) {
      console.log('Already in same status - no change needed')
      return
    }

    // Calculate target index for insertion
    const targetColumnIssues = columns[newStatus] || []
    const newIndex = getDropIndex(over, targetColumnIssues)

    // Set optimistic UI state
    setDragging({ id: issueId, saving: true })

    try {
      // Log telemetry
      logEvent({ t: "dnd_move", from: issue.status, to: newStatus, at: Date.now() })
      
      // Move issue
      await moveIssueStatus(issueId, newStatus)
      
      // Clear optimistic state on success
      setDragging(null)
    } catch (error) {
      console.error('Failed to move issue:', error)
      // Clear optimistic state on error (the store will handle rollback)
      setDragging(null)
    }
  }, [filteredIssues, moveIssueStatus, columns])

  return (
    <div className="card p-6" data-testid="kanban-board">
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
              className="input focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
              list="title-suggestions"
              aria-label="Search issues by title"
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
              className="input focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
              list="assignee-suggestions"
              aria-label="Filter issues by assignee"
            />
            <datalist id="assignee-suggestions">
              {profiles.map(profile => (
                <option key={profile.id} value={profile.username || profile.email || 'Unassigned'} />
              ))}
            </datalist>
            <select
              value={filters.priority}
              onChange={(e) => updateFilters({ priority: e.target.value })}
              className="input theme-select focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
              aria-label="Filter issues by priority"
            >
              <option value="">All Priorities</option>
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
              <option value="P5">P5</option>
            </select>
            {hasActiveFilters(filters) && (
              <button
                onClick={() => updateFilters(clearFilters())}
                className="px-3 py-1 text-xs rounded-full bg-[var(--accent)] text-[var(--background)] hover:opacity-80 transition-opacity focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
                aria-label="Clear all filters"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 bg-[var(--panel)] text-[var(--text)]" data-testid="issue-count">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
            {filteredIssues.length} issues
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {(Object.keys(columns) as IssueStatus[]).map((status, index) => {
            const statusIssues = columns[status]
            
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DroppableColumn
                  status={status}
                  issues={statusIssues}
                  mapName={mapName}
                  dragging={dragging}
                />
              </motion.div>
            )
          })}
        </div>
        
        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <div className="pointer-events-none">
              <DraggableCard 
                issue={filteredIssues.find(i => i.id === activeId)!} 
                mapName={mapName}
                saving={false}
                columnId="TODO" // Default for overlay
                index={0} // Default for overlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
})

export default KanbanBoard
