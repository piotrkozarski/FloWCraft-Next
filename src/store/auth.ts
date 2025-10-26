import { create } from "zustand"
import { supabase } from "../lib/supabase"

async function ensureProfile() {
  try {
    console.log('ensureProfile: Starting...')
    const authUser = (await supabase.auth.getUser()).data.user
    if (!authUser) {
      console.log('ensureProfile: No auth user found')
      return
    }
    const { id, email } = authUser
    console.log('ensureProfile: Creating/updating profile for user:', id)
    // jeśli brak rekordu, utwórz pusty z samym email; username uzupełnimy przy rejestracji
    await supabase.from("profiles").upsert({ id, email }, { onConflict: "id" })
    console.log('ensureProfile: Profile ensured successfully')
  } catch (error) {
    console.error('Error ensuring profile:', error)
  }
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
  signInWithPassword: (email: string, password: string) => Promise<{
    success: boolean
    error?: string
    user?: User | null
  }>
  signUpWithPassword: (email: string, password: string) => Promise<{
    success: boolean
    error?: string
    requiresConfirmation?: boolean
    user?: User | null
  }>
  signOut: () => Promise<void>
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  init: async () => {
    try {
      console.log('Auth store: Initializing...')
      set({ loading: true })
      
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('Auth store: Session check result:', { session: !!session, error })
      
      const sUser = session?.user
      set({
        user: sUser ? { id: sUser.id, email: sUser.email ?? null, avatar_url: sUser.user_metadata?.avatar_url } : null,
        loading: false,
        error: null
      })
      
      // Ensure profile exists after setting user (don't await to prevent blocking)
      ensureProfile().catch(error => {
        console.error('Error in init ensureProfile:', error)
      })
      
      supabase.auth.onAuthStateChange((_event, sess) => {
        console.log('Auth store: Auth state changed:', { event: _event, hasUser: !!sess?.user })
        const u = sess?.user
        set({ user: u ? { id: u.id, email: u.email ?? null, avatar_url: u.user_metadata?.avatar_url } : null })
        // Ensure profile exists after auth state change with timeout
        if (u) {
          Promise.race([
            ensureProfile(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('ensureProfile timeout')), 5000))
          ]).catch(error => {
            console.error('Error in auth state change ensureProfile:', error)
          })
        }
      })
      
      console.log('Auth store: Initialization complete')
    } catch (error) {
      console.error('Auth store: Initialization error:', error)
      set({ loading: false, error: 'Failed to initialize authentication' })
    }
  },

  signInWithPassword: async (email, password) => {
    set({ loading: true, error: null })
    console.log('Auth store: Starting signInWithPassword...')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log('Auth store: SignIn result:', { data, error })
      
      if (error) {
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }
      
      set({ loading: false, error: null })
      return { success: true, user: data.user }
    } catch (err) {
      console.error('Auth store: SignIn error:', err)
      set({ loading: false, error: 'Login failed. Please try again.' })
      return { success: false, error: 'Login failed. Please try again.' }
    }
  },

  signUpWithPassword: async (email, password) => {
    set({ loading: true, error: null })
    console.log('Auth store: Starting signUpWithPassword...')
    
    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      console.log('Auth store: Redirect URL:', redirectTo)
      
      const { data, error } = await supabase.auth.signUp(
        { email, password, options: { emailRedirectTo: redirectTo } }
      )
      
      console.log('Auth store: SignUp result:', { data, error })
      
      if (error) {
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('Auth store: Email confirmation required')
        set({ loading: false, error: null })
        return { success: true, requiresConfirmation: true, user: data.user }
      }
      
      set({ loading: false, error: null })
      return { success: true, requiresConfirmation: false, user: data.user }
    } catch (err) {
      console.error('Auth store: SignUp error:', err)
      set({ loading: false, error: 'Registration failed. Please try again.' })
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  },


  signOut: async () => {
    await supabase.auth.signOut()
  }
}))

