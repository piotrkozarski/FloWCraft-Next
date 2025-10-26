import React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-[var(--muted)]">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/" />;
}