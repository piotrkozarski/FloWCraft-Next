import { motion } from 'framer-motion'
import type { Issue, IssueStatus } from '@/types'

const statuses: IssueStatus[] = ['Todo','In Progress','In Review','Done']

const getStatusIcon = (status: IssueStatus) => {
  const icons: Record<IssueStatus, string> = {
    'Todo': 'assignment',
    'In Progress': 'play_arrow',
    'In Review': 'visibility',
    'Done': 'check_circle'
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statuses.map((status, index) => {
        const count = getStatusCount(status)
        
        return (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-[#E6E0E9] p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-3xl font-bold mb-1 text-[#21005E]">{count}</div>
                <div className="text-sm font-medium uppercase tracking-wide text-slate-600">{status}</div>
                <div className="text-xs mt-1 text-slate-500">
                  {count === 1 ? 'issue' : 'issues'}
                </div>
              </div>
              <div className="ml-4">
                <span className="text-2xl text-slate-400">
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
