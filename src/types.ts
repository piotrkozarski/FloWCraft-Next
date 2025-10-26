// src/types.ts
export type IssueStatus = 'Todo' | 'In Progress' | 'In Review' | 'Done';
export type IssuePriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
export type SprintStatus = 'Planned' | 'Active' | 'Completed';
export type IssueType = 'Bug' | 'Task' | 'Feature' | 'Story';

export type UserRef = { id: string; username?: string | null; email?: string | null }

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: string;
  assigneeId?: string | null;
  sprintId: string | null;
  createdAt: number;
  updatedAt: number;
  type: IssueType;
  parentId?: string | null;
  createdBy?: UserRef;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  createdBy?: UserRef;
}

