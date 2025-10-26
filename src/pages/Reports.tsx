import { Outlet, NavLink } from "react-router-dom"

export default function Reports() {
  return (
    <div className="space-y-4">
      <div className="card rounded-xl p-4 flex items-center gap-3">
        <h1 className="section-title text-xl">Reports</h1>
        <nav className="ml-auto flex items-center gap-2 text-sm">
          <NavLink
            to="/reports/sprint-performance"
            className={({isActive}) => `px-3 py-1.5 rounded-md ${isActive ? "bg-[var(--accent)] text-[var(--on-accent)]" : "hover:bg-[var(--panel)]"}`}
          >
            Sprint Performance
          </NavLink>
          <NavLink
            to="/reports/user-activity"
            className={({isActive}) => `px-3 py-1.5 rounded-md ${isActive ? "bg-[var(--accent)] text-[var(--on-accent)]" : "hover:bg-[var(--panel)]"}`}
          >
            User Activity
          </NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
