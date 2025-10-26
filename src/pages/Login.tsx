import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../store/auth"
import { Shield, Sword } from "lucide-react"

export default function Login() {
  const { signInWithPassword, user, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) {
      navigate("/")
    }
  }, [user, loading, navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    console.log('Login: Starting sign in...')
    
    try {
      const result = await signInWithPassword(email, password)
      console.log('Login result:', result)
      
      if (!result.success) {
        setLocalError(result.error || "Login failed. Please try again.")
      }
      // If successful, the useEffect will handle navigation when user state updates
    } catch (err) {
      console.error('Login error:', err)
      setLocalError("Login failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-image)]">
      <div className="md-card rounded-xl p-6 w-full max-w-md">
        <h1 className="section-title text-2xl mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Sign in
        </h1>


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
          {(error || localError) && <div className="text-red-400 text-sm">{error || localError}</div>}
          <button disabled={loading}
            className="w-full bg-[var(--primary)] text-white rounded-md px-3 py-2 flex items-center justify-center gap-2 hover:bg-[color-mix(in_oklab,var(--primary) 80%,transparent)] disabled:opacity-50">
            <Sword className="w-4 h-4" /> {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-3 text-xs text-[var(--muted)]">
          No account? <a className="underline hover:text-[var(--accent)]" href="/register">Create one</a>
        </div>
      </div>
    </div>
  )
}
