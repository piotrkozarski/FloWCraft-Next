// src/types.ts

export type IssueStatus   = "Todo" | "In Progress" | "Ready For Review" | "In Review" | "Ready To Test" | "Done"
export type IssuePriority = "P0" | "P1" | "P2" | "P3" | "P4" | "P5"
export type IssueType     = "Bug" | "Task" | "Feature" | "Story"
export type SprintStatus  = "Planned" | "Active" | "Completed"

export type UserRef = { id: string; username?: string | null; email?: string | null }

export type Issue = {
  id: string
  title: string
  type: IssueType
  status: IssueStatus
  priority: IssuePriority
  sprintId?: string | null
  assigneeId?: string | null
  parentId?: string | null
  description?: string
  createdAt: string
  updatedAt?: string           // ADDED - components reference this
  createdBy?: UserRef
}

export type Sprint = {
  id: string
  name: string
  status: SprintStatus
  startDate: string
  endDate: string
  createdAt: string
  updatedAt?: string           // ADDED - for consistency
  completedAt?: string         // ADDED - store references this
  createdBy?: UserRef
}

