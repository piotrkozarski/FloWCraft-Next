import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useFCStore } from '../store'
import type { Issue, Status } from '../store'
import type { Priority } from '../constants/priority'
import Badge from './ui/Badge'
import Avatar from './ui/Avatar'

const statuses: Status[] = ['Todo','In Progress','In Review','Done']
const priorities: Priority[] = ['P0','P1','P2','P3','P4','P5']

// Removed unused functions: getStatusIcon, getStatusColor

interface FilterState {
  title: string
  status: string
  priority: string
  assignee: string
  sprint: string
}

export default function IssuesTable({ issues }: { issues: Issue[] }) {
  const updateIssue = useFCStore(s => s.updateIssue)
  const updateStatus = useFCStore(s => s.updateIssueStatus)
  const deleteIssue = useFCStore(s => s.deleteIssue)
  const sprints = useFCStore(s => s.sprints)
  const assign = useFCStore(s => s.assignIssueToSprint)

  const [filters, setFilters] = useState<FilterState>({
    title: '',
    status: '',
    priority: '',
    assignee: '',
    sprint: ''
  })

  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Filtrowanie po tytule (minimum 3 znaki)
      if (filters.title.length >= 3 && !issue.title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false
      }
      
      // Filtrowanie po statusie
      if (filters.status && issue.status !== filters.status) {
        return false
      }
      
      // Filtrowanie po priorytecie
      if (filters.priority && issue.priority !== filters.priority) {
        return false
      }
      
      // Filtrowanie po assignee (minimum 3 znaki)
      if (filters.assignee.length >= 3 && !(issue.assignee?.toLowerCase().includes(filters.assignee.toLowerCase()) ?? false)) {
        return false
      }
      
      // Filtrowanie po sprincie
      if (filters.sprint) {
        if (filters.sprint === 'backlog' && issue.sprintId !== null) {
          return false
        }
        if (filters.sprint !== 'backlog' && issue.sprintId !== filters.sprint) {
          return false
        }
      }
      
      return true
    })
  }, [issues, filters])

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  // const clearFilter = (field: keyof FilterState) => { // Removed unused function
  //   setFilters(prev => ({ ...prev, [field]: '' }))
  //   setActiveFilter(null)
  // }

  const getSprintName = (sprintId: string | null) => {
    if (!sprintId) return 'Backlog'
    const sprint = sprints.find(s => s.id === sprintId)
    return sprint?.name || 'Unknown'
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {/* ID Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                ID
              </th>
              
              {/* Title Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Title</span>
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'title' ? null : 'title')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    🔍
                  </button>
                </div>
                {activeFilter === 'title' && (
                  <input
                    type="text"
                    value={filters.title}
                    onChange={(e) => handleFilterChange('title', e.target.value)}
                    placeholder="Search title..."
                    className="mt-2 w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                )}
              </th>
              
              {/* Status Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'status' ? null : 'status')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    🔍
                  </button>
                </div>
                {activeFilter === 'status' && (
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="mt-2 w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                )}
              </th>
              
              {/* Priority Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Priority</span>
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'priority' ? null : 'priority')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    🔍
                  </button>
                </div>
                {activeFilter === 'priority' && (
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="mt-2 w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  >
                    <option value="">All Priorities</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                )}
              </th>
              
              {/* Assignee Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Assignee</span>
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'assignee' ? null : 'assignee')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    🔍
                  </button>
                </div>
                {activeFilter === 'assignee' && (
                  <input
                    type="text"
                    value={filters.assignee}
                    onChange={(e) => handleFilterChange('assignee', e.target.value)}
                    placeholder="Search assignee..."
                    className="mt-2 w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                )}
              </th>
              
              {/* Sprint Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Sprint</span>
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'sprint' ? null : 'sprint')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    🔍
                  </button>
                </div>
                {activeFilter === 'sprint' && (
                  <select
                    value={filters.sprint}
                    onChange={(e) => handleFilterChange('sprint', e.target.value)}
                    className="mt-2 w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  >
                    <option value="">All Sprints</option>
                    <option value="backlog">Backlog</option>
                    {sprints.map(sprint => (
                      <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                    ))}
                  </select>
                )}
              </th>
              
              {/* Actions Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <div className="text-lg font-medium">No issues found</div>
                  <div className="text-sm">Try adjusting your filters</div>
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue, index) => (
                <motion.tr
                  key={issue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {/* ID */}
                  <td className="px-4 py-4 text-sm font-mono text-slate-500">
                    {issue.id}
                  </td>
                  
                  {/* Title */}
                  <td className="px-4 py-4">
                    <input
                      className="w-full text-sm font-medium text-slate-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 -mx-2 -my-1 hover:bg-slate-100 transition-colors"
                      value={issue.title}
                      onChange={(e) => updateIssue(issue.id, { title: e.target.value })}
                      placeholder="Issue title..."
                    />
                  </td>
                  
                  {/* Status */}
                  <td className="px-4 py-4">
                    <select
                      className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={issue.status}
                      onChange={(e) => updateStatus(issue.id, e.target.value as Status)}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  
                  {/* Priority */}
                  <td className="px-4 py-4">
                    <Badge className={`priority-${issue.priority.toLowerCase()}`}>
                      {issue.priority}
                    </Badge>
                  </td>
                  
                  {/* Assignee */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={issue.assignee} />
                      <input
                        className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={issue.assignee || ''}
                        placeholder="Assignee"
                        onChange={(e) => updateIssue(issue.id, { assignee: e.target.value || undefined })}
                      />
                    </div>
                  </td>
                  
                  {/* Sprint */}
                  <td className="px-4 py-4">
                    <select
                      className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={issue.sprintId || 'backlog'}
                      onChange={(e) => assign(issue.id, e.target.value === 'backlog' ? null : e.target.value)}
                    >
                      <option value="backlog">Backlog</option>
                      {sprints.map(sprint => (
                        <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                      ))}
                    </select>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-4">
                    <button
                      onClick={() => deleteIssue(issue.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Filter Summary */}
      {Object.values(filters).some(filter => filter.length > 0) && (
        <div className="px-4 py-3 bg-slate-100 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Active filters:</span>
            {filters.title && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Title: "{filters.title}"
              </span>
            )}
            {filters.status && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Status: {filters.status}
              </span>
            )}
            {filters.priority && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                Priority: {filters.priority}
              </span>
            )}
            {filters.assignee && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                Assignee: "{filters.assignee}"
              </span>
            )}
            {filters.sprint && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                Sprint: {filters.sprint === 'backlog' ? 'Backlog' : getSprintName(filters.sprint)}
              </span>
            )}
            <button
              onClick={() => setFilters({ title: '', status: '', priority: '', assignee: '', sprint: '' })}
              className="ml-2 text-red-500 hover:text-red-700 text-xs font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

