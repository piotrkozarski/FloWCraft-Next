import { NavLink, Outlet } from "react-router-dom"
import { ClipboardList, LayoutDashboard, ListTodo, PlayCircle, BarChart2, PlusCircle, Sword, Shield, LogOut, UserCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useUI } from "./store/ui"
import { useTheme } from "./store/theme"
import { useAuth } from "./auth/AuthContext"
import { useFCStore } from "./store"
import { AuthModal } from "./auth/AuthModal"
import IssueCreateModal from "./components/modals/IssueCreateModal"
import SprintCreateModal from "./components/modals/SprintCreateModal"
import SprintEditModal from "./components/modals/SprintEditModal"
import IssueEditModal from "./components/modals/IssueEditModal"

export default function App() {
  const openIssue = useUI(s => s.openIssue)
  const openSprint = useUI(s => s.openSprint)
  const { mode, toggle, setMode } = useTheme()
  const { user, signOut } = useAuth()
  const { loadData, loading, error, issues } = useFCStore()
  const [authOpen, setAuthOpen] = useState(false)

  // Count user's assigned issues
  const myIssuesCount = user ? issues.filter(i => i.assigneeId === user.id).length : 0

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadData().catch(console.error)
    }
  }, [user, loadData])

  const handleNewIssue = () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    openIssue()
  }

  const handleCreateSprint = () => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    openSprint()
  }

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
            <NavLink to="/my-issues" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                My Issues
              </div>
              {myIssuesCount > 0 && (
                <span className="ml-auto text-xs bg-[var(--accent)] text-[var(--on-accent)] px-2 py-0.5 rounded-full">
                  {myIssuesCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/current"><PlayCircle className="w-4 h-4" /> Current Sprint</NavLink>
            <NavLink to="/sprints"><LayoutDashboard className="w-4 h-4" /> Sprints</NavLink>
            <NavLink to="/reports"><BarChart2 className="w-4 h-4" /> Reports</NavLink>
          </nav>
          <div className="px-3 py-2 mt-4 space-y-1">
            <button onClick={handleNewIssue} className="w-full text-left px-3 py-2 rounded-md bg-[var(--panel)] hover:bg-[color-mix(in_oklab,var(--primary) 70%,transparent)] text-sm border border-default hover:shadow-[var(--glow)] transition-all">
              + Create Issue
            </button>
            <button onClick={handleCreateSprint} className="w-full text-left px-3 py-2 rounded-md bg-[var(--panel)] hover:bg-[color-mix(in_oklab,var(--primary) 70%,transparent)] text-sm border border-default hover:shadow-[var(--glow)] transition-all">
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

        {user && (
          <div className="p-3 border-t border-default">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[var(--muted)] truncate">{user.email}</span>
            </div>
            <button onClick={signOut} 
              className="w-full px-2 py-1.5 rounded-md border border-default hover:bg-[var(--surface)] flex items-center gap-1 text-sm">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </aside>

      <div className="page">
        <div className="page-header">
          <h1>All Issues</h1>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-80">{user.email}</span>
                <button 
                  className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--panel)] text-sm"
                  onClick={() => signOut()}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button 
                className="px-3 py-1.5 rounded-md bg-[var(--primary)] text-white text-sm hover:bg-[color-mix(in_oklab,var(--primary) 80%,transparent)]"
                onClick={() => setAuthOpen(true)}
              >
                Sign in
              </button>
            )}
            <button 
              onClick={handleNewIssue} 
              className="inline-flex items-center gap-1 bg-[var(--primary)] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[color-mix(in_oklab,var(--primary) 80%,transparent)] border border-default shadow-[var(--glow)] hover:shadow-[var(--glow)] transition-all"
            >
              <PlusCircle className="w-4 h-4" /> New Issue
            </button>
          </div>
        </div>
        <div className="page-content">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
              Error: {error}
            </div>
          )}
          {loading && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-md text-blue-700">
              Loading...
            </div>
          )}
          <Outlet />
        </div>
      </div>

      <IssueCreateModal />
      <SprintCreateModal />
      <SprintEditModal />
      <IssueEditModal />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}