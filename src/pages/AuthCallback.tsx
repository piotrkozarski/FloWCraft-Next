import { useEffect } from "react"

export default function AuthCallback() {
  useEffect(() => {
    // supabase-js (detectSessionInUrl: true) ustawi sesję z hash-a
    const t = setTimeout(() => { window.location.replace("/") }, 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="card rounded-xl p-6">Finishing sign-in…</div>
    </div>
  )
}
