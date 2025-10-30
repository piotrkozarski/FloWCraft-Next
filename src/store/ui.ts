import { create } from "zustand"
import type { Toast } from "../utils/toast"

type UIState = {
  newIssueOpen: boolean
  newSprintOpen: boolean
  selectedIssueId: string | null
  editSprintId: string | null
  confirm: { open: boolean; title?: string; message?: string; onConfirm?: (() => void) | null }
  toasts: Toast[]

  openIssue: () => void
  closeIssue: () => void
  openSprint: () => void
  closeSprint: () => void

  openIssueDetail: (id: string) => void
  closeIssueDetail: () => void

  openSprintEdit: (id: string) => void
  closeSprintEdit: () => void

  openConfirm: (args: { title: string; message?: string; onConfirm: () => void }) => void
  closeConfirm: () => void

  showToast: (toast: Toast) => void
  hideToast: (id: string) => void
  clearToasts: () => void
}

export const useUI = create<UIState>((set) => ({
  newIssueOpen: false,
  newSprintOpen: false,
  selectedIssueId: null,
  editSprintId: null,
  confirm: { open: false, title: '', message: '', onConfirm: null },
  toasts: [],

  openIssue: () => set({ newIssueOpen: true }),
  closeIssue: () => set({ newIssueOpen: false }),
  openSprint: () => set({ newSprintOpen: true }),
  closeSprint: () => set({ newSprintOpen: false }),

  openIssueDetail: (id) => set({ selectedIssueId: id }),
  closeIssueDetail: () => set({ selectedIssueId: null }),

  openSprintEdit: (id) => set({ editSprintId: id }),
  closeSprintEdit: () => set({ editSprintId: null }),

  openConfirm: (args) => set({ confirm: { open: true, ...args } }),
  closeConfirm: () => set({ confirm: { open: false, onConfirm: null } }),

  showToast: (toast) => set(state => ({ 
    toasts: [...state.toasts, toast] 
  })),
  hideToast: (id) => set(state => ({ 
    toasts: state.toasts.filter(t => t.id !== id) 
  })),
  clearToasts: () => set({ toasts: [] }),
}))
