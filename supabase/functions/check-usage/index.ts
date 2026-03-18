import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/** Plan-based monthly call limits. -1 = unlimited */
const PLAN_LIMITS: Record<string, { ml_calls: number; camera_calls: number }> = {
  Free:  { ml_calls: 50,   camera_calls: 10 },
  Plus:  { ml_calls: 500,  camera_calls: 100 },
  Pro:   { ml_calls: -1,   camera_calls: -1 },
}

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

  // ── Auth: extract JWT from Authorization header ──────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: cors,
    })
  }

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: cors,
    })
  }

  // ── Parse request body ───────────────────────────────────────────────────
  let body: { action_type?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: cors,
    })
  }

  const actionType = body.action_type
  if (actionType !== 'ml_calls' && actionType !== 'camera_calls') {
    return new Response(
      JSON.stringify({ error: "action_type must be 'ml_calls' or 'camera_calls'" }),
      { status: 400, headers: cors }
    )
  }

  // ── Fetch user plan ──────────────────────────────────────────────────────
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  const plan: string = profile?.plan ?? 'Free'
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS['Free']
  const limit = limits[actionType as keyof typeof limits]

  // ── Current month key ────────────────────────────────────────────────────
  const month = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  // ── Atomic quota check-and-increment via RPC ──────────────────────────────
  // Uses a SECURITY DEFINER PostgreSQL function that does INSERT ... ON CONFLICT
  // DO UPDATE WHERE count < limit — prevents race conditions on concurrent requests.
  const { data: result, error: rpcError } = await supabaseAdmin.rpc(
    'check_and_increment_usage',
    {
      p_user_id: user.id,
      p_month: month,
      p_action_type: actionType,
      p_limit: limit,
    }
  )

  if (rpcError) {
    console.error('check-usage: RPC failed', rpcError)
    return new Response(JSON.stringify({ error: 'Usage check failed' }), { status: 500, headers: cors })
  }

  const { allowed, current } = result as { allowed: boolean; current: number }

  if (!allowed) {
    return new Response(
      JSON.stringify({
        allowed: false,
        current,
        limit,
        plan,
        message: `이번 달 ${actionType === 'camera_calls' ? 'Camera AI' : 'ML API'} 사용 한도(${limit}회)를 초과했습니다. 플랜을 업그레이드해 주세요.`,
      }),
      { status: 429, headers: cors }
    )
  }

  return new Response(
    JSON.stringify({ allowed: true, current, limit, plan }),
    { headers: cors }
  )
})
