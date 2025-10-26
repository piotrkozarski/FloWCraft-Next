import { useState } from "react"
import { useAuth } from "../store/auth"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"

export default function Register() {
  const { signUpWithPassword, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [ok, setOk] = useState(false)
  const [localErr, setLocalErr] = useState<string | null>(null)
  const navigate = useNavigate()

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const pwValid = password.length >= 8
  const match = password === confirm
  const canSubmit = emailValid && pwValid && match && username.trim().length >= 3 && !loading

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalErr(null)
    if (!emailValid) { setLocalErr("Please enter a valid email address."); return }
    if (!pwValid) { setLocalErr("Password must be at least 8 characters."); return }
    if (!match) { setLocalErr("Passwords do not match."); return }
    if (username.trim().length < 3) { setLocalErr("Username must be at least 3 characters."); return }

    await signUpWithPassword(email, password)
    if (!error) {
      // spróbuj zapisać username do profilu jeśli sesja powstała (po confirm będzie dociśnięte ensureProfile)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("profiles").upsert({ id: user.id, email: user.email, username })
      }
      setOk(true)
      setTimeout(() => navigate("/login", { replace: true }), 1200)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card ornament-corners rounded-xl p-6 w-full max-w-md">
        <h1 className="section-title text-2xl mb-4">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full date-input rounded-md px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              minLength={3} required
              className="w-full date-input rounded-md px-3 py-2 text-sm" placeholder="np. thrall"/>
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Password (min. 8 chars)</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              className="w-full date-input rounded-md px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Confirm password</label>
            <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
              className="w-full date-input rounded-md px-3 py-2 text-sm" required />
          </div>

          {!emailValid && email.length > 0 && (
            <div className="text-red-400 text-xs">Invalid email address.</div>
          )}
          {!pwValid && password.length > 0 && (
            <div className="text-red-400 text-xs">Password must be at least 8 characters.</div>
          )}
          {!match && confirm.length > 0 && (
            <div className="text-red-400 text-xs">Passwords do not match.</div>
          )}
          {localErr && <div className="text-red-400 text-sm">{localErr}</div>}
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {ok && <div className="text-green-400 text-sm">Account created. Check your email to confirm.</div>}

          <button disabled={!canSubmit}
            className="w-full btn-primary rounded-md px-3 py-2 disabled:opacity-50">
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  )
}
