import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PRODUCT_PLAN_MAP: Record<string, string> = {
  [Deno.env.get('POLAR_PRODUCT_ID_PLUS') ?? '']: 'Plus',
  [Deno.env.get('POLAR_PRODUCT_ID_PRO') ?? '']: 'Pro',
}

/** Maximum age (seconds) for a webhook to be accepted — prevents replay attacks */
const MAX_WEBHOOK_AGE_SECONDS = 300 // 5 minutes

/**
 * Verifies HMAC-SHA256 signature and timestamp freshness.
 *
 * Polar follows the Svix standard:
 *   webhook-id:        unique delivery ID (idempotency key)
 *   webhook-timestamp: Unix timestamp (seconds)
 *   webhook-signature: "v1,<base64-encoded-hmac>" (may also be "sha256=<hex>")
 *
 * The signed content is: "<webhook-id>.<webhook-timestamp>.<body>"
 */
async function verifySignature(req: Request, body: string): Promise<boolean> {
  const secret = Deno.env.get('POLAR_WEBHOOK_SECRET')
  if (!secret) return false

  // ── Timestamp check (replay attack prevention) ──────────────────────────
  const tsHeader = req.headers.get('webhook-timestamp')
  if (tsHeader) {
    const ts = parseInt(tsHeader, 10)
    if (isNaN(ts)) return false
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - ts) > MAX_WEBHOOK_AGE_SECONDS) {
      console.warn(`polar-webhook: stale timestamp rejected (age=${now - ts}s)`)
      return false
    }
  }

  // ── HMAC-SHA256 signature check ─────────────────────────────────────────
  const sig = req.headers.get('webhook-signature') ?? req.headers.get('x-polar-signature')
  if (!sig) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  // Svix-style: signed payload is "<id>.<timestamp>.<body>"
  const webhookId = req.headers.get('webhook-id') ?? ''
  const signedContent = tsHeader
    ? `${webhookId}.${tsHeader}.${body}`
    : body

  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent))
  const computedHex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  // Accept multiple signature formats
  for (const part of sig.split(' ')) {
    const received = part.startsWith('v1,')
      ? part.slice(3)          // base64 → compare differently below
      : part.startsWith('sha256=')
      ? part.slice(7)          // hex
      : part                   // raw hex

    // Try hex comparison
    if (received === computedHex) return true

    // Try base64 comparison (Svix encodes HMAC as base64)
    try {
      const macBase64 = btoa(String.fromCharCode(...new Uint8Array(mac)))
      if (received === macBase64) return true
    } catch {
      // ignore
    }
  }

  // Fallback: legacy simple format (body-only HMAC, original implementation)
  const macLegacy = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const legacyHex = Array.from(new Uint8Array(macLegacy))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const received = sig.startsWith('sha256=') ? sig.slice(7) : sig
  return received === legacyHex
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const body = await req.text()

  const valid = await verifySignature(req, body)
  if (!valid) {
    return new Response('Unauthorized', { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // ── Idempotency: INSERT-first pattern ────────────────────────────────────
  // INSERT before processing so concurrent requests hit the PRIMARY KEY constraint
  // atomically — eliminates the SELECT→check→INSERT race window.
  const eventId =
    req.headers.get('webhook-id') ??
    (event.id as string | undefined) ??
    `${event.type}-${Date.now()}`

  const type = event.type as string

  const { error: insertErr } = await supabaseAdmin
    .from('webhook_events')
    .insert({ id: eventId, event_type: type })

  if (insertErr?.code === '23505') {
    // unique_violation → already processed
    console.log(`polar-webhook: duplicate event ignored (id=${eventId})`)
    return new Response('Already processed', { status: 200 })
  }
  if (insertErr) {
    console.error('polar-webhook: failed to record event', insertErr)
    return new Response('DB error', { status: 500 })
  }

  // ── Event handling ────────────────────────────────────────────────────────
  const data = event.data as Record<string, unknown> | undefined

  if (type === 'order.paid' || type === 'subscription.created' || type === 'subscription.active') {
    const productId =
      (data?.product_id as string) ??
      ((data?.items as Array<Record<string, unknown>>)?.[0]?.product_id as string)

    if (!productId) {
      console.error('polar-webhook: missing productId in payload', event)
      return new Response('Bad payload: missing productId', { status: 400 })
    }

    const userId = (data?.metadata as Record<string, string> | undefined)?.user_id

    if (!userId) {
      console.error('polar-webhook: missing metadata.user_id', event)
      return new Response('Missing user_id in metadata', { status: 422 })
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_RE.test(userId)) {
      console.error('polar-webhook: invalid user_id format', userId)
      return new Response('Invalid user_id format', { status: 422 })
    }

    const plan = PRODUCT_PLAN_MAP[productId]
    if (!plan) {
      console.warn(`polar-webhook: unknown productId received: ${productId}`)
      return new Response('Unknown product', { status: 422 })
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ plan })
      .eq('id', userId)

    if (error) {
      console.error('polar-webhook: DB update failed', error)
      return new Response('DB error', { status: 500 })
    }

    console.log(`polar-webhook: ${userId} → ${plan}`)
  } else if (type === 'subscription.canceled' || type === 'subscription.revoked') {
    const userId = (data?.metadata as Record<string, string> | undefined)?.user_id

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (userId && UUID_RE.test(userId)) {
      await supabaseAdmin
        .from('profiles')
        .update({ plan: 'Free' })
        .eq('id', userId)

      console.log(`polar-webhook: ${userId} → Free (canceled)`)
    }
  } else {
    console.log(`polar-webhook: unhandled event type "${type}"`)
  }

  return new Response('OK', { status: 200 })
})
