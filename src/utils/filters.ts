import type { Issue, IssuePriority } from '@/types'

export interface FilterOptions {
  title: string
  assigneeId: string
  priority: string
}

/**
 * Apply filters to issues array
 * @param issues Array of issues to filter
 * @param filters Filter options
 * @param mapName Function to map assignee ID to name
 * @returns Filtered issues array
 */
export function applyFilters(
  issues: Issue[], 
  filters: FilterOptions, 
  mapName: (id?: string | null) => string
): Issue[] {
  return issues.filter(issue => {
    // Title filter
    if (filters.title && !issue.title.toLowerCase().includes(filters.title.toLowerCase())) {
      return false
    }
    
    // Assignee filter - match by username/email, not ID
    if (filters.assigneeId) {
      const assigneeName = mapName(issue.assigneeId).toLowerCase()
      if (!assigneeName.includes(filters.assigneeId.toLowerCase())) {
        return false
      }
    }
    
    // Priority filter
    if (filters.priority && issue.priority !== filters.priority) {
      return false
    }
    
    return true
  })
}

/**
 * Get priority options for select
 * @returns Array of priority options
 */
export function getPriorityOptions(): { value: string; label: string }[] {
  return [
    { value: '', label: 'All Priorities' },
    { value: 'P0', label: 'P0 - Critical' },
    { value: 'P1', label: 'P1 - High' },
    { value: 'P2', label: 'P2 - Medium' },
    { value: 'P3', label: 'P3 - Low' },
    { value: 'P4', label: 'P4 - Very Low' },
    { value: 'P5', label: 'P5 - Lowest' }
  ]
}

/**
 * Check if any filters are active
 * @param filters Filter options
 * @returns True if any filter is active
 */
export function hasActiveFilters(filters: FilterOptions): boolean {
  return !!(filters.title || filters.assigneeId || filters.priority)
}

/**
 * Clear all filters
 * @returns Empty filter options
 */
export function clearFilters(): FilterOptions {
  return {
    title: '',
    assigneeId: '',
    priority: ''
  }
}
