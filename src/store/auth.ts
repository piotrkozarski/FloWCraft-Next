import { create } from "zustand"
import { supabase } from "../lib/supabase"

async function ensureProfile() {
  const authUser = (await supabase.auth.getUser()).data.user
  if (!authUser) return
  const { id, email } = authUser
  // jeśli brak rekordu, utwórz pusty z samym email; username uzupełnimy przy rejestracji
  await supabase.from("profiles").upsert({ id, email }, { onConflict: "id" })
}

type User = {
  id: string
  email?: string | null
  avatar_url?: string | null
}

type AuthState = {
  user: User | null
  loading: boolean
  error?: string | null
  init: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUpWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  init: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    const sUser = session?.user
    set({
      user: sUser ? { id: sUser.id, email: sUser.email ?? null, avatar_url: sUser.user_metadata?.avatar_url } : null,
      loading: false,
      error: null
    })
    
    // Ensure profile exists after setting user
    await ensureProfile()
    
    supabase.auth.onAuthStateChange((_event, sess) => {
      const u = sess?.user
      set({ user: u ? { id: u.id, email: u.email ?? null, avatar_url: u.user_metadata?.avatar_url } : null })
      // Ensure profile exists after auth state change
      ensureProfile()
    })
  },

  signInWithPassword: async (email, password) => {
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false, error: error?.message ?? null })
  },

  signUpWithPassword: async (email, password) => {
    set({ loading: true, error: null })
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signUp(
      { email, password, options: { emailRedirectTo: redirectTo } }
    )
    set({ loading: false, error: error?.message ?? null })
  },


  signOut: async () => {
    await supabase.auth.signOut()
  }
}))

