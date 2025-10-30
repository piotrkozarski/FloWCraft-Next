import React from 'react'
import { ClipboardList, Play, Eye, CheckCircle, Clock, TestTube } from 'lucide-react'
import type { IssueStatus } from '@/types'

/**
 * Column IDs for droppable areas - must match exactly
 */
export const STATUS_IDS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  IN_REVIEW: 'IN_REVIEW',
  READY_TO_TEST: 'READY_TO_TEST',
  DONE: 'DONE'
} as const

/**
 * Map of column IDs to IssueStatus enum
 */
export const STATUS_MAP: Record<string, IssueStatus> = {
  'TODO': 'Todo',
  'IN_PROGRESS': 'In Progress',
  'READY_FOR_REVIEW': 'Ready For Review',
  'IN_REVIEW': 'In Review',
  'READY_TO_TEST': 'Ready To Test',
  'DONE': 'Done'
}

/**
 * Map of IssueStatus to column IDs
 */
export const STATUS_TO_ID: Record<IssueStatus, string> = {
  'Todo': 'TODO',
  'In Progress': 'IN_PROGRESS',
  'Ready For Review': 'READY_FOR_REVIEW',
  'In Review': 'IN_REVIEW',
  'Ready To Test': 'READY_TO_TEST',
  'Done': 'DONE'
}

/**
 * Get icon component for status
 * @param status Issue status
 * @returns React SVG icon component
 */
export function getStatusIcon(status: IssueStatus): React.ReactNode {
  const icons: Record<IssueStatus, React.ReactNode> = {
    'Todo': <ClipboardList className="size-4" />,
    'In Progress': <Play className="size-4" />,
    'Ready For Review': <Clock className="size-4" />,
    'In Review': <Eye className="size-4" />,
    'Ready To Test': <TestTube className="size-4" />,
    'Done': <CheckCircle className="size-4" />
  }
  return icons[status]
}

/**
 * Get status color class
 * @param status Issue status
 * @returns Tailwind color class
 */
export function getStatusColor(status: IssueStatus): string {
  const colors: Record<IssueStatus, string> = {
    'Todo': 'text-gray-500',
    'In Progress': 'text-blue-500',
    'Ready For Review': 'text-orange-500',
    'In Review': 'text-yellow-500',
    'Ready To Test': 'text-purple-500',
    'Done': 'text-green-500'
  }
  return colors[status]
}

/**
 * Get status background color class
 * @param status Issue status
 * @returns Tailwind background color class
 */
export function getStatusBgColor(status: IssueStatus): string {
  const colors: Record<IssueStatus, string> = {
    'Todo': 'bg-gray-100',
    'In Progress': 'bg-blue-100',
    'Ready For Review': 'bg-orange-100',
    'In Review': 'bg-yellow-100',
    'Ready To Test': 'bg-purple-100',
    'Done': 'bg-green-100'
  }
  return colors[status]
}

/**
 * Check if status is valid
 * @param status Status string to validate
 * @returns True if valid IssueStatus
 */
export function isValidStatus(status: string): status is IssueStatus {
  return status in STATUS_MAP
}
