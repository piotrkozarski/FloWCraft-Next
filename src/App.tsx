import { NavLink, Outlet } from "react-router-dom"
import { ClipboardList, LayoutDashboard, ListTodo, PlayCircle, Share2, BarChart2, PlusCircle, Sword, Shield } from "lucide-react"
import { useUI } from "./store/ui"
import { useTheme } from "./store/theme"
import IssueCreateModal from "./components/modals/IssueCreateModal"
import SprintCreateModal from "./components/modals/SprintCreateModal"
import SprintEditModal from "./components/modals/SprintEditModal"
import IssueEditModal from "./components/modals/IssueEditModal"

export default function App() {
  const openIssue = useUI(s => s.openIssue)
  const openSprint = useUI(s => s.openSprint)
  const { mode, toggle, setMode } = useTheme()

  return (
    <div className="layout">
      <aside className="sidebar">
        <div>
          <div className="px-4 py-4 font-semibold text-lg flex items-center gap-2 horde-title">
            <ClipboardList className="w-5 h-5 text-hordeAccent" />
            FlowCraft
          </div>
          <nav>
            <NavLink to="/" end><ListTodo className="w-4 h-4" /> Issues</NavLink>
            <NavLink to="/current"><PlayCircle className="w-4 h-4" /> Current Sprint</NavLink>
            <NavLink to="/sprints"><LayoutDashboard className="w-4 h-4" /> Sprints</NavLink>
            <NavLink to="/dependencies"><Share2 className="w-4 h-4" /> Dependency Map</NavLink>
            <NavLink to="/reports"><BarChart2 className="w-4 h-4" /> Reports</NavLink>
          </nav>
          <div className="px-3 py-2 mt-4 space-y-1">
            <button onClick={openIssue} className="w-full text-left px-3 py-2 rounded-md bg-[var(--panel)] hover:bg-[color-mix(in_oklab,var(--primary) 70%,transparent)] text-sm border border-default hover:shadow-[var(--glow)] transition-all">
              + Create Issue
            </button>
            <button onClick={openSprint} className="w-full text-left px-3 py-2 rounded-md bg-[var(--panel)] hover:bg-[color-mix(in_oklab,var(--primary) 70%,transparent)] text-sm border border-default hover:shadow-[var(--glow)] transition-all">
              + Create Sprint
            </button>
          </div>
        </div>
        {/* Theme switcher */}
        <div className="p-3 border-t border-default text-xs" >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--muted)]">Theme</span>
            <div className="flex gap-1">
              <button
                onClick={()=>setMode("horde")}
                className={`px-2 py-1 rounded-md border border-default ${mode==="horde" ? "bg-[var(--primary)]" : "bg-transparent"} flex items-center gap-1`}
                title="Horde"
              >
                <Sword className="w-3.5 h-3.5" /> Horde
              </button>
              <button
                onClick={()=>setMode("alliance")}
                className={`px-2 py-1 rounded-md border border-default ${mode==="alliance" ? "bg-[var(--primary)]" : "bg-transparent"} flex items-center gap-1`}
                title="Alliance"
              >
                <Shield className="w-3.5 h-3.5" /> Alliance
              </button>
            </div>
          </div>

          {/* Jednoprzyciskowy toggle (opcjonalnie) */}
          <button
            onClick={toggle}
            className="w-full mt-2 px-3 py-2 rounded-md border border-default hover:bg-[color-mix(in_oklab,var(--panel) 80%,black 20%)]"
            title="Toggle Horde/Alliance"
          >
            Switch to {mode === "horde" ? "Alliance" : "Horde"}
          </button>
        </div>
      </aside>

      <div className="page">
        <div className="page-header">
          <h1>All Issues</h1>
          <button onClick={openIssue} className="inline-flex items-center gap-1 bg-[var(--primary)] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[color-mix(in_oklab,var(--primary) 80%,transparent)] border border-default shadow-[var(--glow)] hover:shadow-[var(--glow)] transition-all">
            <PlusCircle className="w-4 h-4" /> New Issue
          </button>
        </div>
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      <IssueCreateModal />
      <SprintCreateModal />
      <SprintEditModal />
      <IssueEditModal />
    </div>
  )
}