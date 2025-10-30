import React from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Play, Eye, CheckCircle, Clock, TestTube } from 'lucide-react'
import type { Issue, IssueStatus } from '@/types'

const statuses: IssueStatus[] = ['Todo','In Progress','Ready For Review','In Review','Ready To Test','Done']

const getStatusIcon = (status: IssueStatus) => {
  const icons: Record<IssueStatus, React.ReactNode> = {
    'Todo': <ClipboardList className="size-6" />,
    'In Progress': <Play className="size-6" />,
    'Ready For Review': <Clock className="size-6" />,
    'In Review': <Eye className="size-6" />,
    'Ready To Test': <TestTube className="size-6" />,
    'Done': <CheckCircle className="size-6" />
  }
  return icons[status]
}

// Removed unused function: getStatusColor

interface StatusCardsProps {
  issues: Issue[]
}

export default function StatusCards({ issues }: StatusCardsProps) {
  console.log('StatusCards rendered with:', { issues })
  const getStatusCount = (status: IssueStatus) => {
    return issues.filter(issue => issue.status === status).length
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      {statuses.map((status, index) => {
        const count = getStatusCount(status)
        
        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[var(--background)] rounded-2xl shadow-sm border border-[var(--border)] p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-3xl font-bold mb-1 text-[var(--text)]">{count}</div>
                <div className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">{status}</div>
                <div className="text-xs mt-1 text-[var(--muted)]">
                  {count === 1 ? 'issue' : 'issues'}
                </div>
              </div>
              <div className="ml-4">
                <span className="text-2xl text-[var(--muted)]">
                  {getStatusIcon(status)}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
