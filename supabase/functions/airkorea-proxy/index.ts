import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/auth.ts";

const AIRKOREA_BASE = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc";

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

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const apiKey = Deno.env.get("AIRKOREA_API_KEY") ?? "";

  try {
    let endpoint = "";
    const params = new URLSearchParams({ serviceKey: apiKey, returnType: "json" });

    if (type === "nearby") {
      const tmXRaw = url.searchParams.get("tmX") ?? "";
      const tmYRaw = url.searchParams.get("tmY") ?? "";
      if (!tmXRaw || !tmYRaw) {
        return new Response(JSON.stringify({ error: "tmX and tmY are required for type=nearby" }), { status: 400, headers: cors });
      }
      const tmX = parseFloat(tmXRaw);
      const tmY = parseFloat(tmYRaw);
      if (isNaN(tmX) || isNaN(tmY) || tmX < 50000 || tmX > 600000 || tmY < 1100000 || tmY > 2200000) {
        return new Response(JSON.stringify({ error: "tmX must be 50000..600000, tmY must be 1100000..2200000" }), { status: 400, headers: cors });
      }
      endpoint = "/getNearbyMsrstnList";
      params.set("tmX", String(tmX));
      params.set("tmY", String(tmY));
      params.set("ver", "1.1");
    } else if (type === "realtime") {
      const stationName = url.searchParams.get("stationName") ?? "";
      if (!stationName) {
        return new Response(JSON.stringify({ error: "stationName is required for type=realtime" }), { status: 400, headers: cors });
      }
      endpoint = "/getMsrstnAcctoRltmMesureDnsty";
      params.set("stationName", stationName);
      params.set("dataTerm", "DAILY");
      params.set("pageNo", "1");
      params.set("numOfRows", "24");
      params.set("ver", "1.0");
    } else {
      return new Response(JSON.stringify({ error: "invalid type" }), { status: 400, headers: cors });
    }

    const res = await fetch(`${AIRKOREA_BASE}${endpoint}?${params}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Air Korea API error: ${res.status}` }), { status: 502, headers: cors });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
});
