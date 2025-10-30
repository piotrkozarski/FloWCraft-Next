import type { IssueStatus as Status } from '../types'

export const STATUS_ORDER: Status[] = ['Todo','In Progress','Ready For Review','In Review','Ready To Test','Done']

export function nextStatus(s: Status): Status {
  const i = STATUS_ORDER.indexOf(s)
  return STATUS_ORDER[Math.min(i + 1, STATUS_ORDER.length - 1)]
}

export function prevStatus(s: Status): Status {
  const i = STATUS_ORDER.indexOf(s)
  return STATUS_ORDER[Math.max(i - 1, 0)]
}
