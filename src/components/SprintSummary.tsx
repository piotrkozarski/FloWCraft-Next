// import { useFCStore } from '../store' // Removed unused import
import type { Sprint } from '../store'

interface SprintSummaryProps {
  sprint: Sprint
  totalIssues: number
  completedIssues: number
}

export default function SprintSummary({ sprint, totalIssues, completedIssues }: SprintSummaryProps) {
  console.log('SprintSummary rendered with:', { sprint, totalIssues, completedIssues })
  const progress = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTimeRemaining = () => {
    const endDate = new Date(sprint.endDate)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return "Sprint ended"
    if (diffDays === 0) return "Sprint ends today"
    if (diffDays === 1) return "1 day remaining"
    return `${diffDays} days remaining`
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E6E0E9] p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center gap-4 mb-4 lg:mb-0">
          <div className="w-12 h-12 rounded-full bg-[#EADDFF] flex items-center justify-center">
            <span className="text-[#21005E] font-bold text-lg">🏃</span>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1 text-[#21005E]">{sprint.name}</h2>
            <p className="text-sm text-slate-600">Sprint {sprint.id} • Active sprint management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 bg-green-100 text-green-800">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Active Sprint
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sprint Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[#F3EDF7]">
            <div className="w-10 h-10 rounded-lg bg-[#EADDFF] flex items-center justify-center">
              <span className="text-[#21005E] text-lg">🎯</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg text-[#21005E]">{sprint.name}</div>
              <div className="text-sm text-slate-600">Sprint {sprint.id}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-[#F3EDF7]">
            <div className="w-10 h-10 rounded-lg bg-[#E8DEF8] flex items-center justify-center">
              <span className="text-[#1D192B] text-lg">📅</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#21005E]">
                {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
              </div>
              <div className="text-sm text-slate-600">Sprint timeline</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-[#F3EDF7]">
            <div className="w-10 h-10 rounded-lg bg-[#E8DEF8] flex items-center justify-center">
              <span className="text-[#1D192B] text-lg">👥</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#21005E]">
                {completedIssues} of {totalIssues} issues completed
              </div>
              <div className="text-sm text-slate-600">Task completion status</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-[#F3EDF7]">
            <div className="w-10 h-10 rounded-lg bg-[#E8DEF8] flex items-center justify-center">
              <span className="text-[#1D192B] text-lg">⏰</span>
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#21005E]">
                {getTimeRemaining()}
              </div>
              <div className="text-sm text-slate-600">Sprint deadline</div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-[#21005E]">Sprint Progress</span>
              <span className="text-2xl font-bold text-[#21005E]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full rounded-full h-4 bg-[#E7E0EC]">
              <div 
                className="h-4 rounded-full transition-all duration-700 ease-out bg-[#6750A4]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg p-4 text-center bg-[#F3EDF7]">
              <div className="text-2xl font-bold mb-1 text-[#21005E]">{totalIssues}</div>
              <div className="text-sm font-medium text-slate-600">Total Issues</div>
            </div>
            <div className="rounded-lg p-4 text-center bg-green-100">
              <div className="text-2xl font-bold mb-1 text-green-800">{completedIssues}</div>
              <div className="text-sm font-medium text-slate-600">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
