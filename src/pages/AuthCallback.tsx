import { useEffect } from "react"
import { supabase } from "../lib/supabase"

export default function AuthCallback() {
  useEffect(() => {
    // detectSessionInUrl w supabase-js zrobi swoje; damy chwilę i przekierujemy
    const t = setTimeout(() => { window.location.replace("/") }, 400)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="card rounded-xl p-6">Finishing sign-in…</div>
    </div>
  )
}
