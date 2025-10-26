import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useFCStore } from '../store'
import type { Sprint, SprintStatus } from '../types'

const statuses: SprintStatus[] = ['Planned', 'Active', 'Completed']

const getStatusIcon = (status: SprintStatus) => {
  const icons = {
    'Planned': '📅',
    'Active': '🏃',
    'Completed': '✅'
  }
  return icons[status]
}

const getStatusColor = (status: SprintStatus) => {
  const colors = {
    'Planned': 'bg-blue-100 text-blue-800 border-blue-200',
    'Active': 'bg-green-100 text-green-800 border-green-200',
    'Completed': 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[status]
}

interface FilterState {
  name: string
  status: string
  startDate: string
  endDate: string
}

export default function SprintsTable({ sprints }: { sprints: Sprint[] }) {
  const startSprint = useFCStore(s => s.startSprint)
  const endSprint = useFCStore(s => s.endSprint)
  const issues = useFCStore(s => s.issues)

  const [filters, setFilters] = useState<FilterState>({
    name: '',
    status: '',
    startDate: '',
    endDate: ''
  })

  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const filteredSprints = useMemo(() => {
    return sprints.filter(sprint => {
      // Filtrowanie po nazwie (minimum 3 znaki)
      if (filters.name.length >= 3 && !sprint.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false
      }
      
      // Filtrowanie po statusie
      if (filters.status && sprint.status !== filters.status) {
        return false
      }
      
      // Filtrowanie po dacie rozpoczęcia
      if (filters.startDate && sprint.startDate !== filters.startDate) {
        return false
      }
      
      // Filtrowanie po dacie zakończenia
      if (filters.endDate && sprint.endDate !== filters.endDate) {
        return false
      }
      
      return true
    })
  }, [sprints, filters])

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  // const clearFilter = (field: keyof FilterState) => { // Removed unused function
  //   setFilters(prev => ({ ...prev, [field]: '' }))
  //   setActiveFilter(null)
  // }

  const getSprintStats = (sprintId: string) => {
    const sprintIssues = issues.filter(issue => issue.sprintId === sprintId)
    const done = sprintIssues.filter(issue => issue.status === 'Done').length
    return { total: sprintIssues.length, done }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL')
  }

  // const isDateInRange = (dateString: string, startDate: string, endDate: string) => { // Removed unused function
  //   const date = new Date(dateString)
  //   const start = new Date(startDate)
  //   const end = new Date(endDate)
  //   return date >= start && date <= end
  // }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {/* Name Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Name</span>
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'name' ? null : 'name')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    🔍
                  </button>
                </div>
                {activeFilter === 'name' && (
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    placeholder="Search sprint name..."
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
              
              {/* Start Date Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Start Date</span>
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'startDate' ? null : 'startDate')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    🔍
                  </button>
                </div>
                {activeFilter === 'startDate' && (
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="mt-2 w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                )}
              </th>
              
              {/* End Date Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>End Date</span>
                  <button
                    onClick={() => setActiveFilter(activeFilter === 'endDate' ? null : 'endDate')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    🔍
                  </button>
                </div>
                {activeFilter === 'endDate' && (
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="mt-2 w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                )}
              </th>
              
              {/* Progress Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Progress
              </th>
              
              {/* Actions Column */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredSprints.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <div className="text-lg font-medium">No sprints found</div>
                  <div className="text-sm">Try adjusting your filters</div>
                </td>
              </tr>
            ) : (
              filteredSprints.map((sprint, index) => {
                const stats = getSprintStats(sprint.id)
                const progress = stats.total > 0 ? (stats.done / stats.total) * 100 : 0
                
                return (
                  <motion.tr
                    key={sprint.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🏃</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{sprint.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{sprint.id}</div>
                          {sprint.createdBy && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Created by {sprint.createdBy.username || sprint.createdBy.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sprint.status)}`}>
                        <span className="mr-1">{getStatusIcon(sprint.status)}</span>
                        {sprint.status}
                      </span>
                    </td>
                    
                    {/* Start Date */}
                    <td className="px-4 py-4 text-sm text-slate-900">
                      {formatDate(sprint.startDate)}
                    </td>
                    
                    {/* End Date */}
                    <td className="px-4 py-4 text-sm text-slate-900">
                      {formatDate(sprint.endDate)}
                    </td>
                    
                    {/* Progress */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 font-medium min-w-[3rem]">
                          {stats.done}/{stats.total}
                        </span>
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startSprint(sprint.id)}
                          disabled={sprint.status === 'Active'}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => endSprint(sprint.id)}
                          disabled={sprint.status === 'Completed'}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          End
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Filter Summary */}
      {Object.values(filters).some(filter => filter.length > 0) && (
        <div className="px-4 py-3 bg-slate-100 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Active filters:</span>
            {filters.name && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Name: "{filters.name}"
              </span>
            )}
            {filters.status && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Status: {filters.status}
              </span>
            )}
            {filters.startDate && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                Start: {formatDate(filters.startDate)}
              </span>
            )}
            {filters.endDate && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                End: {formatDate(filters.endDate)}
              </span>
            )}
            <button
              onClick={() => setFilters({ name: '', status: '', startDate: '', endDate: '' })}
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

