import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import { supabase } from "../lib/supabase"
import { Github, Shield, Sword } from "lucide-react"

export default function Login() {
  const { signInWithEmail, user, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) {
      navigate("/")
    }
  }, [user, loading, navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const { error } = await signInWithEmail(email, password)
    if (error) {
      setError(error)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-image)]">
      <div className="md-card rounded-xl p-6 w-full max-w-md">
        <h1 className="section-title text-2xl mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Sign in
        </h1>

        <div className="space-y-3">
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}
            className="w-full bg-[var(--primary)] text-white rounded-md px-3 py-2 flex items-center justify-center gap-2 hover:bg-[color-mix(in_oklab,var(--primary) 80%,transparent)]">
            <Github className="w-4 h-4" /> Continue with GitHub
          </button>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="w-full rounded-md px-3 py-2 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--panel)]">
            Continue with Google
          </button>
        </div>

        <div className="my-4 text-center text-[var(--muted)] text-xs">or</div>

        <form onSubmit={handleSignIn} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full date-input rounded-md px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              className="w-full date-input rounded-md px-3 py-2 text-sm" required />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button disabled={isLoading}
            className="w-full bg-[var(--primary)] text-white rounded-md px-3 py-2 flex items-center justify-center gap-2 hover:bg-[color-mix(in_oklab,var(--primary) 80%,transparent)] disabled:opacity-50">
            <Sword className="w-4 h-4" /> {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-3 text-xs text-[var(--muted)]">
          No account? <a className="underline hover:text-[var(--accent)]" href="/register">Create one</a>
        </div>
      </div>
    </div>
  )
}
