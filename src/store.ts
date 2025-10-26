import { create } from 'zustand';
import type { Issue, Sprint, IssueStatus, IssuePriority, SprintStatus, IssueType, UserRef } from '@/types';
import { toIsoString } from '@/utils/domain';
import { supabase } from './lib/supabase';

export type SprintPatch = Partial<Pick<Sprint, "name"|"startDate"|"endDate"|"status">>

// Inline utility functions
const pad3 = (n: number) => n.toString().padStart(3, '0');
const nextIssueId = (counter: number) => `TSK-${pad3(counter)}`;
const nextSprintId = (counter: number) => `SPR-${pad3(counter)}`;

type FCState = {
  issues: Issue[];
  sprints: Sprint[];
  // liczniki do ID
  _issueSeq: number;
  _sprintSeq: number;

  // derived
  getActiveSprint(): Sprint | null;

  // Issue ops
  createIssue(input: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Issue>;
  updateIssue(id: string, patch: Partial<Omit<Issue, 'id' | 'createdAt'>>): void;
  deleteIssue(id: string): void;
  updateIssueStatus(id: string, status: IssueStatus): void;

  // Assignment
  assignIssueToSprint(id: string, sprintId: string | null): void;
  bulkAssignToSprint(ids: string[], sprintId: string | null): void;

  // Sprint ops
  createSprint(input: Omit<Sprint, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'completedAt' | 'createdBy'> & { status?: SprintStatus }): Promise<Sprint>;
  updateSprint(id: string, patch: SprintPatch): void;
  deleteSprint(id: string): void;
  startSprint(id: string): void;
  endSprint(id: string): { returnedToBacklog: number };

  // Drag-drop w obrębie current sprint
  moveInCurrentSprint(issueId: string, toStatus: IssueStatus): void;
};

const now = () => Date.now();

// Helper to get current user reference
async function getCurrentUserRef(): Promise<UserRef | undefined> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return undefined
  
  const profile = await supabase.from("profiles").select("username,email").eq("id", user.id).maybeSingle()
  return { 
    id: user.id, 
    username: profile.data?.username ?? null, 
    email: user.email ?? null 
  }
}

// Walidacje podstawowe
function validateIssue(i: Partial<Issue>) {
  if (!i.title || !i.title.trim()) throw new Error('Title cannot be empty');
  if (!i.status) throw new Error('Status is required');
  const allowedStatus: IssueStatus[] = ['Todo','In Progress','In Review','Done'];
  if (!allowedStatus.includes(i.status as IssueStatus)) throw new Error('Invalid status');

  const allowedPrio: IssuePriority[] = ['Low','Medium','High','Critical'];
  if (!i.priority || !allowedPrio.includes(i.priority as IssuePriority)) throw new Error('Invalid priority');
}

function validateSprintDates(startDate: string, endDate: string) {
  if (!startDate || !endDate) throw new Error('Sprint dates required');
  if (new Date(endDate) <= new Date(startDate)) throw new Error('endDate must be after startDate');
}

export const useFCStore = create<FCState>((set, get) => {
  // --- Seed data ---
  const sprints: Sprint[] = (() => {
    const base = Date.now();
    return [
      { id: nextSprintId(1), name: 'Q4 Kickoff', startDate: '2025-10-01', endDate: '2025-10-14', status: 'Completed', createdAt: toIsoString(base-10), updatedAt: toIsoString(base-10), completedAt: toIsoString(base-5) },
      { id: nextSprintId(2), name: 'October Sprint', startDate: '2025-10-15', endDate: '2025-10-28', status: 'Active', createdAt: toIsoString(base-9), updatedAt: toIsoString(base-1) },
      { id: nextSprintId(3), name: 'November Planning', startDate: '2025-10-29', endDate: '2025-11-11', status: 'Planned', createdAt: toIsoString(base-8), updatedAt: toIsoString(base-8) },
    ];
  })();

  let issueSeq = 0;
  const mk = (title: string, priority: string, status: IssueStatus, sprintId: string | null, extra?: Partial<Issue>): Issue => {
    issueSeq += 1;
    const id = nextIssueId(issueSeq);
    const base = now();
    return {
      id,
      title,
      description: extra?.description ?? '',
      status,
      priority,  // Use P0-P5 directly
      assigneeId: extra?.assigneeId,          // ONLY assigneeId, no assignee
      sprintId,
      createdAt: toIsoString(base),           // CONVERT to string
      updatedAt: toIsoString(base),           // CONVERT to string
      type: extra?.type ?? 'Task',
      parentId: extra?.parentId ?? null,
      createdBy: extra?.createdBy,
    };
  };

  const activeId = sprints.find(s => s.status === 'Active')?.id ?? null;

  const issues: Issue[] = [
    mk('Fix critical auth bug', 'P0', 'In Progress', activeId),
    mk('Payment webhook retries', 'P0', 'Todo', activeId),
    mk('Kanban DnD polish', 'P1', 'In Review', activeId),
    mk('Bulk assign modal', 'P1', 'Todo', activeId),
    mk('Sprint summary dialog', 'P1', 'Todo', activeId),

    mk('Priority badges', 'P2', 'In Progress', activeId),
    mk('Issue edit modal', 'P2', 'Done', activeId),
    mk('Filter by assignee', 'P2', 'Todo', null),
    mk('Sort by priority', 'P2', 'In Review', activeId),

    mk('Backlog empty state', 'P3', 'Todo', null),
    mk('List view columns', 'P3', 'Done', sprints[0].id),
    mk('Sprints view cards', 'P3', 'In Progress', sprints[2].id),

    mk('Avatar stack UI', 'P4', 'Todo', null),
    mk('Keyboard shortcuts', 'P4', 'In Review', activeId),

    mk('Confetti on Done', 'P5', 'Done', sprints[0].id),
  ];

  const state: Omit<FCState, 'getActiveSprint' | 'createIssue' | 'updateIssue' | 'deleteIssue' | 'updateIssueStatus' | 'assignIssueToSprint' | 'bulkAssignToSprint' | 'createSprint' | 'startSprint' | 'endSprint' | 'moveInCurrentSprint'> = {
    issues,
    sprints,
    _issueSeq: issueSeq,
    _sprintSeq: 3,
  } as any;

  return {
    ...state,

    getActiveSprint() {
      return get().sprints.find(s => s.status === 'Active') ?? null;
    },

    async createIssue(input) {
      console.log('Store createIssue called with:', input);
      validateIssue(input);
      const createdBy = await getCurrentUserRef();
      const id = nextIssueId(get()._issueSeq + 1);
      const created: Issue = { 
        ...input, 
        id, 
        createdAt: new Date().toISOString(),    // STRING not number
        updatedAt: new Date().toISOString(),    // ADD updatedAt
        type: input.type ?? 'Task',
        parentId: input.parentId ?? null,
        description: input.description ?? '',
        createdBy,
      };
      set(st => ({ issues: [created, ...st.issues], _issueSeq: st._issueSeq + 1 }));
      console.log('Store createIssue completed, new issue:', created);
      return created;
    },

    updateIssue(id, patch) {
      set(st => ({
        issues: st.issues.map(it => it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it)
      }));
    },

    deleteIssue(id) {
      set(st => ({ issues: st.issues.filter(i => i.id !== id) }));
    },

    updateIssueStatus(id, status) {
      const allowed: IssueStatus[] = ['Todo','In Progress','In Review','Done'];
      if (!allowed.includes(status)) throw new Error('Invalid status');
      set(st => ({
        issues: st.issues.map(i => i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i)
      }));
    },

    assignIssueToSprint(id, sprintId) {
      set(st => ({
        issues: st.issues.map(i => i.id === id ? { ...i, sprintId, updatedAt: new Date().toISOString() } : i)
      }));
    },

    bulkAssignToSprint(ids, sprintId) {
      const setIds = new Set(ids);
      set(st => ({
        issues: st.issues.map(i => setIds.has(i.id) ? { ...i, sprintId, updatedAt: new Date().toISOString() } : i)
      }));
    },

    async createSprint(input) {
      console.log('Store createSprint called with:', input);
      validateSprintDates(input.startDate, input.endDate);
      const createdBy = await getCurrentUserRef();
      const id = nextSprintId(get()._sprintSeq + 1);
      const sprint: Sprint = {
        id,
        name: input.name,
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status ?? 'Planned',
        createdAt: new Date().toISOString(),    // STRING not number
        updatedAt: new Date().toISOString(),    // ADD updatedAt
        createdBy,
      };
      set(st => ({ sprints: [sprint, ...st.sprints], _sprintSeq: st._sprintSeq + 1 }));
      console.log('Store createSprint completed, new sprint:', sprint);
      return sprint;
    },

    startSprint(id) {
      set(st => {
        const currentActive = st.sprints.find(s => s.status === 'Active');
        const next = st.sprints.map(s => {
          if (s.id === id) return { ...s, status: 'Active' as SprintStatus, updatedAt: new Date().toISOString() };
          if (currentActive && s.id === currentActive.id && s.id !== id && s.status === 'Active') {
            return { ...s, status: 'Planned' as SprintStatus, updatedAt: new Date().toISOString() }; // wymuś pojedynczy Active
          }
          return s;
        });
        return { sprints: next };
      });
    },

    endSprint(id) {
      let returned = 0;
      set(st => {
        const nextIssues = st.issues.map(i => {
          if (i.sprintId === id && i.status !== 'Done') {
            returned += 1;
            return { ...i, sprintId: null, updatedAt: new Date().toISOString() };
          }
          return i;
        });
        const nextSprints = st.sprints.map(s => s.id === id ? { ...s, status: 'Completed' as SprintStatus, updatedAt: new Date().toISOString(), completedAt: new Date().toISOString() } : s);
        return { issues: nextIssues, sprints: nextSprints };
      });
      return { returnedToBacklog: returned };
    },

    moveInCurrentSprint(issueId, toStatus) {
      const active = get().getActiveSprint();
      if (!active) throw new Error('No active sprint');
      const issue = get().issues.find(i => i.id === issueId);
      if (!issue) throw new Error('Issue not found');
      if (issue.sprintId !== active.id) throw new Error('Issue not in current sprint');
      get().updateIssueStatus(issueId, toStatus);
    },

    updateSprint(id, patch) {
      set(state => ({
        sprints: state.sprints.map(s =>
          s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
        )
      }));
    },

    deleteSprint(id) {
      set(state => ({
        sprints: state.sprints.filter(s => s.id !== id),
        issues: state.issues.map(i =>
          i.sprintId === id ? { ...i, sprintId: null, updatedAt: new Date().toISOString() } : i
        )
      }));
    },
  };
});
