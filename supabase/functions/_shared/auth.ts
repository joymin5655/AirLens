import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/** Shared JWT verification helper for Edge Functions.
 *  Returns { user } on success, or a ready-to-return 401 Response on failure.
 *
 *  Pass `corsHeaders` so that 401 responses include CORS headers — without them
 *  the browser sees a CORS error instead of the actual 401, making debugging
 *  very difficult.
 */
export async function requireAuth(
  req: Request,
  corsHeaders: Record<string, string> = {},
): Promise<{ user: { id: string } } | Response> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  return { user }
}
