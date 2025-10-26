import { create } from "zustand"
import { supabase } from "../lib/supabase"

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
  signInWithOAuth: (provider: "google" | "github") => Promise<void>
  signOut: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
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
    supabase.auth.onAuthStateChange((_event, sess) => {
      const u = sess?.user
      set({ user: u ? { id: u.id, email: u.email ?? null, avatar_url: u.user_metadata?.avatar_url } : null })
    })
  },

  signInWithPassword: async (email, password) => {
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false, error: error?.message ?? null })
  },

  signUpWithPassword: async (email, password) => {
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signUp({ email, password })
    set({ loading: false, error: error?.message ?? null })
  },

  signInWithOAuth: async (provider) => {
    set({ error: null })
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    })
    if (error) set({ error: error.message })
  },

  signOut: async () => {
    await supabase.auth.signOut()
  }
}))
