import { useEffect } from "react"

// Auth callback page for email confirmation
export default function AuthCallback() {
  useEffect(() => {
    // supabase-js (detectSessionInUrl: true) przetworzy hash; dajmy mu chwilę i wróćmy do app
    const t = setTimeout(() => { window.location.replace("/") }, 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="card rounded-xl p-6">Finishing sign-in…</div>
    </div>
  )
}
