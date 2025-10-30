import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED = [
  'https://flo-w-craft-next.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // opcjonalnie Vercel preview (użyj dokładnych domen lub własnego matchera):
  // 'https://flo-w-craft-next-git-main-<org>.vercel.app',
]

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED.includes(origin) ? origin : 'https://flo-w-craft-next.vercel.app'
  
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

interface UpdateIssueStatusRequest {
  issueId: string
  toStatus: 'Todo' | 'In Progress' | 'Ready For Review' | 'In Review' | 'Ready To Test' | 'Done'
  sprintId?: string
  newIndex?: number
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = { 'Content-Type': 'application/json', ...corsHeaders(origin) }

  // Preflight + HEAD muszą ZAWSZE zwrócić 200
  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return new Response('ok', { status: 200, headers })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers }
      )
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers }
      )
    }

    // Parse request body
    const body: UpdateIssueStatusRequest = await req.json()
    const { issueId, toStatus, sprintId, newIndex = 0 } = body

    // Validate input
    if (!issueId || !toStatus) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: issueId, toStatus' }),
        { status: 400, headers }
      )
    }

    // Validate status
    const validStatuses = ['Todo', 'In Progress', 'Ready For Review', 'In Review', 'Ready To Test', 'Done']
    if (!validStatuses.includes(toStatus)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status value' }),
        { status: 400, headers }
      )
    }

    // Check if user has permission to update this issue
    const { data: issue, error: issueError } = await supabaseClient
      .from('issues')
      .select('*, sprints!inner(created_by)')
      .eq('id', issueId)
      .single()

    if (issueError || !issue) {
      return new Response(
        JSON.stringify({ error: 'Issue not found' }),
        { status: 404, headers }
      )
    }

    // Check if user has permission (is the creator of the sprint or has admin role)
    if (issue.sprints.created_by !== user.id) {
      // You might want to add additional permission checks here
      // For now, we'll allow any authenticated user to update issues
    }

    // Start a transaction to update the issue and reorder positions
    const { data: updatedIssue, error: updateError } = await supabaseClient
      .from('issues')
      .update({
        status: toStatus,
        updated_at: new Date().toISOString(),
        // If newIndex is provided, we might want to update position
        // This would require a position column in the issues table
      })
      .eq('id', issueId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating issue:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update issue status' }),
        { status: 500, headers }
      )
    }

    // If we need to reorder positions within the same status, we could do that here
    // For now, we'll just return the updated issue

    return new Response(
      JSON.stringify({ 
        ok: true, 
        issue: updatedIssue 
      }),
      { status: 200, headers }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers }
    )
  }
})
