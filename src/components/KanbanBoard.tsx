import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import { useFCStore, type Status } from '../store'
import type { Issue } from '../store'
import Badge from './ui/Badge'
import Avatar from './ui/Avatar'

const statuses: Status[] = ['Todo','In Progress','In Review','Done']

const getStatusIcon = (status: Status) => {
  const icons = {
    'Todo': 'assignment',
    'In Progress': 'play_arrow',
    'In Review': 'visibility',
    'Done': 'check_circle'
  }
  return icons[status]
}

// Removed unused function: getStatusColor

interface KanbanBoardProps {
  issues: Issue[]
  sprintName: string
}

export default function KanbanBoard({ issues, sprintName }: KanbanBoardProps) {
  console.log('KanbanBoard rendered with:', { issues, sprintName })
  const updateStatus = useFCStore(s => s.updateIssueStatus)
  const [filters, setFilters] = useState({
    title: '',
    assignee: '',
    priority: ''
  })

  const filteredIssues = issues.filter(issue => {
    if (filters.title && !issue.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false
    }
    if (filters.assignee && !(issue.assignee?.toLowerCase().includes(filters.assignee.toLowerCase()) ?? false)) {
      return false
    }
    if (filters.priority && issue.priority !== filters.priority) {
      return false
    }
    return true
  })

  function onDragEnd(result: any) {
    if (!result.destination) return
    const issueId = result.draggableId
    const toStatus = result.destination.droppableId as Status
    updateStatus(issueId, toStatus)
  }

  const getIssuesByStatus = (status: Status) => {
    return filteredIssues.filter(issue => issue.status === status)
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
              value={filters.assignee}
              onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
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
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {statuses.map((status, index) => {
            const statusIssues = getIssuesByStatus(status)
            
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border-2 border-dashed min-h-[400px] p-4 bg-[#F3EDF7] transition-all duration-300"
              >
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`h-full ${snapshot.isDraggingOver ? 'bg-opacity-50 scale-105' : ''} transition-all duration-300`}
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

                      {/* Issues */}
                      <div className="space-y-3">
                        {statusIssues.map((issue, issueIndex) => (
                          <Draggable key={issue.id} draggableId={issue.id} index={issueIndex}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -2, scale: 1.01 }}
                                className={`rounded-lg p-4 cursor-move bg-white shadow-sm border border-[#E6E0E9] ${
                                  snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : ''
                                } transition-all duration-200`}
                                // Remove conflicting drag handlers
                                onDragStart={undefined}
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
                                  <Avatar name={issue.assignee} />
                                  <span className="text-xs font-medium text-slate-600">
                                    {issue.assignee || 'Unassigned'}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </motion.div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
