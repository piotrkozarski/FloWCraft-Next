import { useState } from "react"
import { useAuth } from "../store/auth"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { testSupabaseConnection, testAuth } from "../utils/testSupabase"

export default function Register() {
  const { signUpWithPassword, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [username, setUsername] = useState("")
  const [ok, setOk] = useState(false)
  const [localErr, setLocalErr] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<string>("")
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

    console.log('Starting registration process...')

    try {
      const result = await signUpWithPassword(email, password)
      console.log('Registration result:', result)
      
      if (!result.success) {
        setLocalErr(result.error || "Registration failed. Please try again.")
        return
      }
      
      if (result.requiresConfirmation) {
        // Email confirmation required
        setOk(true)
        setLocalErr(null)
        setTimeout(() => navigate("/login", { replace: true }), 3000)
        return
      }
      
      // User is immediately signed in (no email confirmation required)
      if (result.user) {
        try {
          await supabase.from("profiles").upsert({ 
            id: result.user.id, 
            email: result.user.email, 
            username 
          })
        } catch (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't fail the registration if profile creation fails
        }
      }
      
      setOk(true)
      setTimeout(() => navigate("/login", { replace: true }), 1200)
    } catch (err) {
      console.error('Registration error:', err)
      setLocalErr("Registration failed. Please try again.")
    }
  }

  const runTests = async () => {
    setTestResults("Running tests...")
    const connectionTest = await testSupabaseConnection()
    const authTest = await testAuth()
    setTestResults(`Connection: ${connectionTest.success ? 'OK' : 'FAIL'} | Auth: ${authTest.success ? 'OK' : 'FAIL'}`)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card ornament-corners rounded-xl p-6 w-full max-w-md">
        <h1 className="section-title text-2xl mb-4">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Username</label>
            <input value={username} onChange={e=>setUsername(e.target.value)}
              className="w-full date-input rounded-md px-3 py-2 text-sm" minLength={3} required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full date-input rounded-md px-3 py-2 text-sm" required />
          </div>
          {!emailValid && email.length > 0 && (
            <div className="text-red-400 text-xs">Invalid email address.</div>
          )}
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

          {(!pwValid && password.length > 0) && (
            <div className="text-red-400 text-xs">Password must be at least 8 characters.</div>
          )}
          {(!match && confirm.length > 0) && (
            <div className="text-red-400 text-xs">Passwords do not match.</div>
          )}
          {localErr && <div className="text-red-400 text-sm">{localErr}</div>}
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {ok && <div className="text-green-400 text-sm">
            Account created successfully! {error ? "Check your email to confirm your account." : "You can now log in."}
          </div>}

          <button disabled={!canSubmit}
            className="w-full btn-primary rounded-md px-3 py-2 disabled:opacity-50">
            {loading ? "Creating…" : "Create account"}
          </button>
          
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <button type="button" onClick={runTests} className="text-sm text-blue-600 mb-2">
              Test Supabase Connection
            </button>
            {testResults && <div className="text-xs text-gray-600">{testResults}</div>}
          </div>
        </form>
      </div>
    </div>
  )
}
