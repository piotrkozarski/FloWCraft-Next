import { create } from 'zustand';
import type { Issue, Sprint, IssueStatus, IssuePriority, SprintStatus, IssueType, UserRef } from '@/types';
import { supabase } from './lib/supabase';

export type SprintPatch = Partial<Pick<Sprint, "name"|"startDate"|"endDate"|"status"|"completedAt">>

// Utility functions
const pad3 = (n: number) => n.toString().padStart(3, '0');
const nextIssueId = (counter: number) => `TSK-${pad3(counter)}`;
const nextSprintId = (counter: number) => `SPR-${pad3(counter)}`;

type FCState = {
  issues: Issue[];
  sprints: Sprint[];
  loading: boolean;
  error: string | null;

  // derived
  getActiveSprint(): Sprint | null;

  // Issue ops
  createIssue(input: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Issue>;
  updateIssue(id: string, patch: Partial<Omit<Issue, 'id' | 'createdAt'>>): Promise<void>;
  deleteIssue(id: string): Promise<void>;
  updateIssueStatus(id: string, status: IssueStatus): Promise<void>;
  moveIssueStatus(id: string, status: IssueStatus, newIndex?: number): Promise<void>;

  // Assignment
  assignIssueToSprint(id: string, sprintId: string | null): Promise<void>;
  bulkAssignToSprint(issueIds: string[], sprintId: string | null): Promise<void>;

  // Sprint ops
  createSprint(input: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Sprint>;
  updateSprint(id: string, patch: SprintPatch): Promise<void>;
  deleteSprint(id: string): Promise<void>;
  startSprint(id: string): Promise<void>;
  endSprint(id: string): Promise<void>;

  // Data loading
  loadIssues(): Promise<void>;
  loadSprints(): Promise<void>;
  loadData(): Promise<void>;
}

export const useFCStore = create<FCState>((set, get) => ({
  issues: [],
  sprints: [],
  loading: false,
  error: null,

  getActiveSprint: () => {
    const { sprints } = get();
    return sprints.find(s => s.status === 'Active') || null;
  },

  // Data loading
  loadIssues: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our types
      const issues: Issue[] = data?.map(row => ({
        id: row.id,
        title: row.title,
        type: row.type as IssueType,
        status: row.status as IssueStatus,
        priority: row.priority as IssuePriority,
        sprintId: row.sprint_id,
        assigneeId: row.assignee_id,
        parentId: row.parent_id,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        createdBy: row.created_by ? { id: row.created_by } : undefined
      })) || [];

      set({ issues, loading: false });
    } catch (error) {
      console.error('Error loading issues:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load issues', loading: false });
    }
  },

  loadSprints: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our types
      const sprints: Sprint[] = data?.map(row => ({
        id: row.id,
        name: row.name,
        status: row.status as SprintStatus,
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        completedAt: row.completed_at,
        createdBy: row.created_by ? { id: row.created_by } : undefined
      })) || [];

      set({ sprints, loading: false });
    } catch (error) {
      console.error('Error loading sprints:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load sprints', loading: false });
    }
  },

  loadData: async () => {
    const { loadIssues, loadSprints } = get();
    await Promise.all([loadIssues(), loadSprints()]);
  },

  // Issue operations
  createIssue: async (input) => {
    set({ loading: true, error: null });
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate unique ID
      let issueId: string;
      let attempts = 0;
      do {
        const { data: countData } = await supabase
          .from('issues')
          .select('id', { count: 'exact', head: true });
        
        issueId = nextIssueId((countData?.length || 0) + attempts + 1);
        
        // Check if ID already exists
        const { data: existing, error: checkError } = await supabase
          .from('issues')
          .select('id')
          .eq('id', issueId)
          .maybeSingle();
        
        if (checkError) {
          console.error('Error checking existing ID:', checkError);
          break;
        }
        
        if (!existing) break;
        attempts++;
      } while (attempts < 100); // Safety limit
      
      const issueData = {
        id: issueId,
        title: input.title,
        type: input.type,
        status: input.status,
        priority: input.priority,
        sprint_id: input.sprintId,
        assignee_id: input.assigneeId,
        parent_id: input.parentId,
        description: input.description,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating issue with data:', issueData);
      
      const { data, error } = await supabase
        .from('issues')
        .insert(issueData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      const newIssue: Issue = {
        id: data.id,
        title: data.title,
        type: data.type as IssueType,
        status: data.status as IssueStatus,
        priority: data.priority as IssuePriority,
        sprintId: data.sprint_id,
        assigneeId: data.assignee_id,
        parentId: data.parent_id,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by ? { id: data.created_by } : undefined
      };

      set(state => ({ 
        issues: [newIssue, ...state.issues],
        loading: false 
      }));

      return newIssue;
    } catch (error) {
      console.error('Error creating issue:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create issue', loading: false });
      throw error;
    }
  },

  updateIssue: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = {};
      if (patch.title !== undefined) updateData.title = patch.title;
      if (patch.type !== undefined) updateData.type = patch.type;
      if (patch.status !== undefined) updateData.status = patch.status;
      if (patch.priority !== undefined) updateData.priority = patch.priority;
      if (patch.sprintId !== undefined) updateData.sprint_id = patch.sprintId;
      if (patch.assigneeId !== undefined) updateData.assignee_id = patch.assigneeId;
      if (patch.parentId !== undefined) updateData.parent_id = patch.parentId;
      if (patch.description !== undefined) updateData.description = patch.description;

      const { error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        issues: state.issues.map(issue => 
          issue.id === id 
            ? { ...issue, ...patch, updatedAt: new Date().toISOString() }
            : issue
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating issue:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update issue', loading: false });
      throw error;
    }
  },

  deleteIssue: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        issues: state.issues.filter(issue => issue.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting issue:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete issue', loading: false });
      throw error;
    }
  },

  updateIssueStatus: async (id, status) => {
    const { updateIssue } = get();
    await updateIssue(id, { status });
  },

  moveIssueStatus: async (id, status, newIndex = 0) => {
    // Store original status for potential rollback
    const originalIssue = get().issues.find(issue => issue.id === id);
    if (!originalIssue) {
      throw new Error(`Issue with id ${id} not found`);
    }
    const originalStatus = originalIssue.status;
    const originalUpdatedAt = originalIssue.updatedAt;

    // Update local state immediately for responsive UI
    set(state => ({
      issues: state.issues.map(issue =>
        issue.id === id ? { ...issue, status, updatedAt: new Date().toISOString() } : issue
      )
    }));

    // Update via Edge Function
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update_issue_status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          issueId: id,
          toStatus: status,
          sprintId: originalIssue.sprintId,
          newIndex
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update issue status');
      }

      const result = await response.json();
      if (!result.ok) {
        throw new Error('Edge function returned error');
      }

      // Update local state with the returned issue data
      set(state => ({
        issues: state.issues.map(issue =>
          issue.id === id ? { ...issue, ...result.issue } : issue
        )
      }));

    } catch (error) {
      console.error('Failed to update issue status via Edge Function:', error);
      // Revert local state on error using original values
      set(state => ({
        issues: state.issues.map(issue =>
          issue.id === id ? { ...issue, status: originalStatus, updatedAt: originalUpdatedAt } : issue
        )
      }));
      throw error;
    }
  },

  assignIssueToSprint: async (id, sprintId) => {
    const { updateIssue } = get();
    await updateIssue(id, { sprintId });
  },

  bulkAssignToSprint: async (issueIds, sprintId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('issues')
        .update({ sprint_id: sprintId })
        .in('id', issueIds);

      if (error) throw error;

      set(state => ({
        issues: state.issues.map(issue => 
          issueIds.includes(issue.id)
            ? { ...issue, sprintId, updatedAt: new Date().toISOString() }
            : issue
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error bulk assigning issues:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to bulk assign issues', loading: false });
      throw error;
    }
  },

  // Sprint operations
  createSprint: async (input) => {
    set({ loading: true, error: null });
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('User authentication status:', { user: user?.id, userError });
      
      if (userError) {
        console.error('Error getting user:', userError);
        throw new Error('Authentication error: ' + userError.message);
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Generate unique ID
      let sprintId: string;
      let attempts = 0;
      do {
        const { data: countData } = await supabase
          .from('sprints')
          .select('id', { count: 'exact', head: true });
        
        sprintId = nextSprintId((countData?.length || 0) + attempts + 1);
        
        // Check if ID already exists
        const { data: existing, error: checkError } = await supabase
          .from('sprints')
          .select('id')
          .eq('id', sprintId)
          .maybeSingle();
        
        if (checkError) {
          console.error('Error checking existing ID:', checkError);
          break;
        }
        
        if (!existing) break;
        attempts++;
      } while (attempts < 100); // Safety limit
      
      // Check if profile exists and create if needed
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError || !profile) {
        console.log('Profile not found, creating new profile for user:', user.id);
        // Create profile
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            username: user.email?.split('@')[0] || 'user'
          });
        
        if (createProfileError) {
          console.error('Could not create profile:', createProfileError);
          throw new Error('Failed to create user profile: ' + createProfileError.message);
        }
        console.log('Profile created successfully');
      } else {
        console.log('Profile found for user:', user.id);
      }

      const sprintData = {
        id: sprintId,
        name: input.name,
        status: input.status,
        start_date: input.startDate,
        end_date: input.endDate,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Attempting to insert sprint data:', sprintData);

      const { data, error } = await supabase
        .from('sprints')
        .insert(sprintData)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      const newSprint: Sprint = {
        id: data.id,
        name: data.name,
        status: data.status as SprintStatus,
        startDate: data.start_date,
        endDate: data.end_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        completedAt: data.completed_at,
        createdBy: data.created_by ? { id: data.created_by } : undefined
      };

      set(state => ({ 
        sprints: [newSprint, ...state.sprints],
        loading: false 
      }));

      return newSprint;
    } catch (error) {
      console.error('Error creating sprint:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create sprint', loading: false });
      throw error;
    }
  },

  updateSprint: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = {};
      if (patch.name !== undefined) updateData.name = patch.name;
      if (patch.status !== undefined) updateData.status = patch.status;
      if (patch.startDate !== undefined) updateData.start_date = patch.startDate;
      if (patch.endDate !== undefined) updateData.end_date = patch.endDate;

      const { error } = await supabase
        .from('sprints')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        sprints: state.sprints.map(sprint => 
          sprint.id === id 
            ? { ...sprint, ...patch, updatedAt: new Date().toISOString() }
            : sprint
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating sprint:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update sprint', loading: false });
      throw error;
    }
  },

  deleteSprint: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        sprints: state.sprints.filter(sprint => sprint.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting sprint:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete sprint', loading: false });
      throw error;
    }
  },

  startSprint: async (id) => {
    const { updateSprint } = get();
    await updateSprint(id, { status: 'Active' });
  },

  endSprint: async (id) => {
    const { updateSprint } = get();
    await updateSprint(id, { 
      status: 'Completed',
      completedAt: new Date().toISOString()
    });
  }
}));
