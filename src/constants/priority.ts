export type Priority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
export type { Issue } from '../types'

export const PRIORITY_ORDER: Priority[] = ['P0','P1','P2','P3','P4','P5']

export const PRIORITY_BADGE: Record<Priority,string> = {
  P0: 'bg-red-600',
  P1: 'bg-red-500',
  P2: 'bg-orange-500',
  P3: 'bg-blue-500',
  P4: 'bg-slate-400',
  P5: 'bg-slate-300',
}


