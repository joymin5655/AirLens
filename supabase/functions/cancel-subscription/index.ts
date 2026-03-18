import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const rawAllowedOrigin = Deno.env.get('ALLOWED_ORIGIN')
if (!rawAllowedOrigin) console.warn('ALLOWED_ORIGIN not set, using fallback')
const ALLOWED_ORIGINS = (rawAllowedOrigin ?? 'https://airlens.pages.dev,http://localhost:5173')
  .split(',').map((o) => o.trim()).filter(Boolean)

function makeCors(reqOrigin: string) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }
}

Deno.serve(async (req: Request) => {
  const cors = makeCors(req.headers.get('Origin') ?? '')
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: cors })
  }

  // ── Auth: extract and verify JWT ────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: cors })
  }

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: cors })
  }

  // ── Downgrade to Free using service role (bypasses column-level privilege) ──
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.plan === 'Free') {
    return new Response(JSON.stringify({ message: 'Already on Free plan' }), { headers: cors })
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ plan: 'Free' })
    .eq('id', user.id)

  if (error) {
    console.error('cancel-subscription: DB update failed', error)
    return new Response(JSON.stringify({ error: 'Failed to cancel subscription' }), { status: 500, headers: cors })
  }

  console.log(`cancel-subscription: ${user.id} → Free`)
  return new Response(JSON.stringify({ success: true, plan: 'Free' }), { headers: cors })
})
