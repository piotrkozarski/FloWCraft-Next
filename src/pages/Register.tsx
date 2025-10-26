import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import { supabase } from "../lib/supabase"

export default function Register() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) {
      navigate("/")
    }
  }, [user, loading, navigate])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-image)]">
      <div className="md-card rounded-xl p-6 w-full max-w-md">
        <h1 className="section-title text-2xl mb-4">Create account</h1>
        <form onSubmit={handleSignUp} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full date-input rounded-md px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              className="w-full date-input rounded-md px-3 py-2 text-sm" required minLength={6} />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && <div className="text-green-400 text-sm">Account created. You can sign in now.</div>}
          <button disabled={isLoading} 
            className="w-full bg-[var(--primary)] text-white rounded-md px-3 py-2 hover:bg-[color-mix(in_oklab,var(--primary) 80%,transparent)] disabled:opacity-50">
            {isLoading ? "Creating…" : "Create account"}
          </button>
          <div className="text-xs text-[var(--muted)]">
            You may need to confirm email depending on Supabase settings.
          </div>
        </form>
        <div className="mt-3 text-xs text-[var(--muted)]">
          Already have an account? <a className="underline hover:text-[var(--accent)]" href="/login">Sign in</a>
        </div>
      </div>
    </div>
  )
}
