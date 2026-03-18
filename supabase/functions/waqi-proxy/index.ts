import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/auth.ts";

const WAQI_BASE = "https://api.waqi.info/feed";

const rawAllowedOrigin = Deno.env.get("ALLOWED_ORIGIN")
if (!rawAllowedOrigin) console.warn("ALLOWED_ORIGIN not set, using fallback")
const ALLOWED_ORIGINS = (rawAllowedOrigin ?? "https://airlens.pages.dev,http://localhost:5173")
  .split(",").map((o) => o.trim()).filter(Boolean)

serve(async (req) => {
  const reqOrigin = req.headers.get("Origin") ?? ""
  const allowedOrigin = ALLOWED_ORIGINS.includes(reqOrigin) ? reqOrigin : ALLOWED_ORIGINS[0]
  const cors = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  const authResult = await requireAuth(req, cors);
  if (authResult instanceof Response) return authResult;

  const token = Deno.env.get("WAQI_TOKEN") ?? "";
  if (!token) {
    return new Response(JSON.stringify({ error: "WAQI_TOKEN not configured" }), {
      status: 503,
      headers: cors,
    });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    let waqiUrl: string;

    if (type === "geo") {
      const latRaw = url.searchParams.get("lat");
      const lonRaw = url.searchParams.get("lon");
      if (!latRaw || !lonRaw) {
        return new Response(JSON.stringify({ error: "lat and lon required" }), {
          status: 400,
          headers: cors,
        });
      }
      const lat = parseFloat(latRaw);
      const lon = parseFloat(lonRaw);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return new Response(JSON.stringify({ error: "lat must be -90..90, lon must be -180..180" }), {
          status: 400,
          headers: cors,
        });
      }
      waqiUrl = `${WAQI_BASE}/geo:${lat};${lon}/?token=${token}`;
    } else if (type === "station") {
      const uid = url.searchParams.get("uid");
      if (!uid) {
        return new Response(JSON.stringify({ error: "uid required" }), {
          status: 400,
          headers: cors,
        });
      }
      waqiUrl = `${WAQI_BASE}/@${uid}/?token=${token}`;
    } else {
      return new Response(
        JSON.stringify({ error: "invalid type, use 'geo' or 'station'" }),
        { status: 400, headers: cors }
      );
    }

    const res = await fetch(waqiUrl, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: cors,
    });
  }
});
