import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { requireAuth } from "../_shared/auth.ts"

const rawAllowedOrigin = Deno.env.get("ALLOWED_ORIGIN")
if (!rawAllowedOrigin) console.warn("ALLOWED_ORIGIN not set, using fallback")
const ALLOWED_ORIGINS = (rawAllowedOrigin ?? "https://airlens.pages.dev,http://localhost:5173")
  .split(",").map((o) => o.trim()).filter(Boolean)

function makeCorsHeaders(reqOrigin: string) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }
}

/**
 * NASA POWER REST API — TOTEXTTAU (Total Aerosol Optical Depth, MERRA-2 based)
 * No authentication required. Returns daily AOD at 550nm approx for the given coordinates.
 * Replaces the CMR/OPeNDAP placeholder that returned random values.
 */
serve(async (req) => {
  const corsHeaders = makeCorsHeaders(req.headers.get("Origin") ?? "")
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ── Auth ───────────────────────────────────────────────────────────────
  const authResult = await requireAuth(req, corsHeaders)
  if (authResult instanceof Response) return authResult

  try {
    const { lat, lon, date } = await req.json()

    if (lat == null || lon == null) {
      throw new Error('Missing coordinates (lat, lon)')
    }

    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return new Response(
        JSON.stringify({ error: 'lat must be -90..90, lon must be -180..180' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const searchDate = date || new Date().toISOString().split('T')[0]
    // NASA POWER requires YYYYMMDD format
    const dateStr = searchDate.replace(/-/g, '')

    // NASA POWER Daily Point API — no auth required
    const powerUrl =
      `https://power.larc.nasa.gov/api/temporal/daily/point` +
      `?parameters=TOTEXTTAU,CLRSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DWN` +
      `&community=AG` +
      `&longitude=${lonNum}&latitude=${latNum}` +
      `&start=${dateStr}&end=${dateStr}` +
      `&format=JSON`

    const powerRes = await fetch(powerUrl, { signal: AbortSignal.timeout(8000) })
    if (!powerRes.ok) {
      throw new Error(`NASA POWER API returned ${powerRes.status}`)
    }
    const powerData = await powerRes.json()

    const params = powerData?.properties?.parameter
    if (!params) {
      throw new Error('Unexpected NASA POWER response structure')
    }

    // TOTEXTTAU: Total Aerosol Optical Depth (550nm proxy, MERRA-2)
    const aod: number = params.TOTEXTTAU?.[dateStr] ?? -999
    const clrSky: number = params.CLRSKY_SFC_SW_DWN?.[dateStr] ?? -999
    const allSky: number = params.ALLSKY_SFC_SW_DWN?.[dateStr] ?? -999

    if (aod === -999 || aod == null) {
      throw new Error('No TOTEXTTAU data for the requested date/location')
    }

    // Transmittance-based confidence: ratio of actual vs clear-sky solar irradiance
    // Higher transmittance (clearer sky) → higher confidence in AOD measurement
    const transmittance = clrSky > 0 && allSky >= 0 ? Math.min(1, allSky / clrSky) : 0.7
    const confidence = Math.round(transmittance * 85 + 10) // 10~95%

    const result = {
      lat: latNum,
      lon: lonNum,
      date: searchDate,
      product: "NASA POWER TOTEXTTAU (MERRA-2)",
      resolution: "0.5° × 0.625°",
      aod_value: Math.max(0, Math.round(aod * 1000) / 1000),
      confidence,
      transmittance: Math.round(transmittance * 100) / 100,
      clrsky_sw: clrSky !== -999 ? Math.round(clrSky * 10) / 10 : null,
      allsky_sw: allSky !== -999 ? Math.round(allSky * 10) / 10 : null,
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
