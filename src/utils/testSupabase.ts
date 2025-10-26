import { supabase } from '../lib/supabase'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Supabase connection successful:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Supabase test error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export async function testAuth() {
  try {
    console.log('Testing Supabase auth...')
    
    // Test auth state
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth test error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('Auth test successful:', { session: !!session })
    return { success: true, hasSession: !!session }
  } catch (err) {
    console.error('Auth test error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
