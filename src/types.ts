// src/types.ts

// Issue domain
export type IssueStatus = "Todo" | "In Progress" | "In Review" | "Done"
export type IssuePriority = "Low" | "Medium" | "High" | "Critical"
export type IssueType = "Bug" | "Task" | "Feature" | "Story"

// Sprint domain
export type SprintStatus = "Planned" | "Active" | "Completed"

// Users
export type UserRef = { id: string; username?: string | null; email?: string | null }

// Entities
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
  createdBy?: UserRef
}

export type Sprint = {
  id: string
  name: string
  status: SprintStatus
  startDate: string
  endDate: string
  createdAt: string
  createdBy?: UserRef
}

