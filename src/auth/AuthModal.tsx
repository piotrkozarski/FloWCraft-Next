import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'login'|'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      if (tab === 'login') {
        const { error } = await signInWithEmail(email, password);
        if (error) setError(error); else onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else onClose(); // opcjonalnie pokaz info "sprawdź mail"
      }
    } finally { setBusy(false); }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl p-6 shadow-xl
                      bg-[var(--panel)] text-[var(--text)] border border-[var(--border)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{tab === 'login' ? 'Sign in' : 'Sign up'}</h3>
          <button onClick={onClose} aria-label="Close" className="opacity-70 hover:opacity-100">✕</button>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'login' 
                ? 'bg-[var(--primary)] text-white' 
                : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--panel)]'
            }`} 
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button 
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'signup' 
                ? 'bg-[var(--primary)] text-white' 
                : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--panel)]'
            }`} 
            onClick={() => setTab('signup')}
          >
            Create account
          </button>
        </div>
        

        <form onSubmit={submit} className="space-y-3">
          <input 
            type="email" 
            required 
            placeholder="Email"
            className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] px-3 py-2 text-sm placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            required 
            placeholder="Password"
            className="w-full rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] px-3 py-2 text-sm placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button 
            disabled={busy} 
            className="w-full bg-[var(--primary)] text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-[color-mix(in_oklab,var(--primary) 80%,transparent)] disabled:opacity-50 transition-colors"
          >
            {busy ? 'Working…' : (tab === 'login' ? 'Sign in' : 'Sign up')}
          </button>
        </form>
      </div>
    </div>
  );
}
