import type { Issue } from '@/types'

/**
 * Calculate sprint progress as percentage of completed issues
 * @param issues Array of issues in the sprint
 * @returns Progress percentage (0-100)
 */
export function calcProgress(issues: Issue[]): number {
  if (!issues.length) return 0
  const doneCount = issues.filter(i => i.status === 'Done').length
  return Math.round((doneCount / issues.length) * 100)
}

/**
 * Get sprint progress color based on completion percentage
 * @param progress Progress percentage (0-100)
 * @returns Tailwind color class
 */
export function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * Check if sprint is on track (≥80% completion)
 * @param progress Progress percentage (0-100)
 * @returns True if sprint is on track
 */
export function isSprintOnTrack(progress: number): boolean {
  return progress >= 80
}
