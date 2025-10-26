import { create } from 'zustand';
import { Issue, Sprint, IssueStatus, IssuePriority, SprintStatus, IssueType, UserRef } from './types';
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

  const allowedPrio: IssuePriority[] = ['P0','P1','P2','P3','P4','P5'];
  if (!i.priority || !allowedPrio.includes(i.priority as IssuePriority)) throw new Error('Invalid priority');
  if (i.assignee && i.assignee.trim().length < 2) throw new Error('Assignee must be at least 2 chars');
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
      { id: nextSprintId(1), name: 'Q4 Kickoff', startDate: '2025-10-01', endDate: '2025-10-14', status: 'Completed', createdAt: base-10, updatedAt: base-10, completedAt: base-5 },
      { id: nextSprintId(2), name: 'October Sprint', startDate: '2025-10-15', endDate: '2025-10-28', status: 'Active', createdAt: base-9, updatedAt: base-1 },
      { id: nextSprintId(3), name: 'November Planning', startDate: '2025-10-29', endDate: '2025-11-11', status: 'Planned', createdAt: base-8, updatedAt: base-8 },
    ];
  })();

  let issueSeq = 0;
  const mk = (title: string, priority: IssuePriority, status: IssueStatus, sprintId: string | null, extra?: Partial<Issue>): Issue => {
    issueSeq += 1;
    const id = nextIssueId(issueSeq);
    const base = now();
    return {
      id,
      title,
      description: extra?.description ?? '',
      status,
      priority,
      assignee: extra?.assignee,
      assigneeId: extra?.assigneeId,
      sprintId,
      createdAt: base,
      updatedAt: base,
      type: extra?.type ?? 'Task',
      parentId: extra?.parentId ?? null,
      createdBy: extra?.createdBy,
    };
  };

  const activeId = sprints.find(s => s.status === 'Active')?.id ?? null;

  const issues: Issue[] = [
    mk('Fix critical auth bug', 'P0', 'In Progress', activeId, { assignee: 'Alex' }),
    mk('Payment webhook retries', 'P0', 'Todo', activeId),
    mk('Kanban DnD polish', 'P1', 'In Review', activeId, { assignee: 'Maya' }),
    mk('Bulk assign modal', 'P1', 'Todo', activeId),
    mk('Sprint summary dialog', 'P1', 'Todo', activeId),

    mk('Priority badges', 'P2', 'In Progress', activeId, { assignee: 'Leo' }),
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
        createdAt: now(), 
        updatedAt: now(),
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
        issues: st.issues.map(it => it.id === id ? { ...it, ...patch, updatedAt: now() } : it)
      }));
    },

    deleteIssue(id) {
      set(st => ({ issues: st.issues.filter(i => i.id !== id) }));
    },

    updateIssueStatus(id, status) {
      const allowed: IssueStatus[] = ['Todo','In Progress','In Review','Done'];
      if (!allowed.includes(status)) throw new Error('Invalid status');
      set(st => ({
        issues: st.issues.map(i => i.id === id ? { ...i, status, updatedAt: now() } : i)
      }));
    },

    assignIssueToSprint(id, sprintId) {
      set(st => ({
        issues: st.issues.map(i => i.id === id ? { ...i, sprintId, updatedAt: now() } : i)
      }));
    },

    bulkAssignToSprint(ids, sprintId) {
      const setIds = new Set(ids);
      set(st => ({
        issues: st.issues.map(i => setIds.has(i.id) ? { ...i, sprintId, updatedAt: now() } : i)
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
        createdAt: now(),
        updatedAt: now(),
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
          if (s.id === id) return { ...s, status: 'Active' as SprintStatus, updatedAt: now() };
          if (currentActive && s.id === currentActive.id && s.id !== id && s.status === 'Active') {
            return { ...s, status: 'Planned' as SprintStatus, updatedAt: now() }; // wymuś pojedynczy Active
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
            return { ...i, sprintId: null, updatedAt: now() };
          }
          return i;
        });
        const nextSprints = st.sprints.map(s => s.id === id ? { ...s, status: 'Completed' as SprintStatus, updatedAt: now(), completedAt: now() } : s);
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
          s.id === id ? { ...s, ...patch, updatedAt: now() } : s
        )
      }));
    },

    deleteSprint(id) {
      set(state => ({
        sprints: state.sprints.filter(s => s.id !== id),
        issues: state.issues.map(i =>
          i.sprintId === id ? { ...i, sprintId: null, updatedAt: now() } : i
        )
      }));
    },
  };
});
