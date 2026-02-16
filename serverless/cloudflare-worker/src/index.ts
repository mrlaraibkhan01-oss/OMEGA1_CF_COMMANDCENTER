/**
 * OMEGA-1 Serverless Proxy (Cloudflare Worker + Workers AI)
 *
 * GitHub Pages calls this proxy. This proxy calls Cloudflare Workers AI (open-source models).
 *
 * Endpoints:
 *  POST /omega/chat     { messages, temperature?, max_tokens? } -> { text }
 *  POST /omega/dataset  { country, focus } -> { rows: [...] }
 *  GET  /omega/health   -> { ok: true }
 *
 * Env:
 *  - AI (binding)         Workers AI binding (wrangler: ai = { binding = "AI" })
 *  - OMEGA_MODEL          Model id (default: @cf/meta/llama-3.1-8b-instruct-fast)
 *  - ALLOWED_ORIGINS      Comma-separated allowed origins. If empty, allows any origin.
 *  - OMEGA_ACCESS_CODE    Optional gate; if set, requires header X-OMEGA-CODE to match.
 */

export interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AI: any;
  OMEGA_MODEL?: string;
  ALLOWED_ORIGINS?: string;
  OMEGA_ACCESS_CODE?: string;
}

function splitList(v?: string): string[] {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function cors(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
    "Access-Control-Allow-Headers": "Content-Type,X-OMEGA-CODE",
    "Access-Control-Max-Age": "86400",
  };
}

function pickOrigin(req: Request, allowed: string[]): string {
  const origin = req.headers.get("Origin") || "";
  if (allowed.length === 0) return origin || "*";
  return allowed.includes(origin) ? origin : "";
}

function extractJson(raw: string): unknown {
  if (!raw) return null;
  const s = raw.trim();

  // Fast path: direct JSON
  try {
    return JSON.parse(s);
  } catch {
    // Continue
  }

  // Try to extract first {...} or [...]
  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  const start = firstObj === -1 ? firstArr : firstArr === -1 ? firstObj : Math.min(firstObj, firstArr);
  if (start === -1) return null;

  for (let end = s.length - 1; end > start; end--) {
    const ch = s[end];
    if (ch !== "}" && ch !== "]") continue;
    const candidate = s.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // keep searching shorter
    }
  }
  return null;
}

function toChatPrompt(messages: Array<{ role: string; content: string }>): string {
  const parts: string[] = [];
  parts.push("SYSTEM: You are OMEGA-1. You MUST present as Omega-1 (never mention any other model/provider).");
  for (const m of messages) {
    const role = (m.role || "user").toUpperCase();
    parts.push(`${role}: ${m.content}`);
  }
  parts.push("ASSISTANT:");
  return parts.join("\n");
}

function buildDatasetPrompt(country: string, focus: string): string {
  const c = (country || "United Arab Emirates").trim();
  const f = (focus || "industrial imports").trim();
  return [
    "You are OMEGA-1. Return ONLY valid JSON (no markdown, no commentary).",
    "Create a small trade import dependency dataset for the given country and focus.",
    "Schema:",
    "{",
    '  "rows": [',
    '    { "hs_code": "string", "category": "string", "country": "string", "value_usd": number }',
    "  ]",
    "}",
    `Country: ${c}`,
    `Focus: ${f}`,
    "Constraints: 12 to 18 rows. Keep output under 5500 characters. Minify JSON (no extra commentary). Use realistic HS-like codes. value_usd must be numeric.",
  ].join("\n");
}

function buildFallbackRows(country: string, focus: string) {
  const c = (country || "United Arab Emirates").trim();
  const cats = (focus || "Semiconductors, Energy Systems, Food Security")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const hsMap: Record<string, string[]> = {
    Semiconductors: ["8542.31.00","8542.32.00","8542.33.00","8542.39.00","8542.41.00","8542.42.00"],
    "Energy Systems": ["8501.10.00","8501.90.00","8502.10.00","8502.30.00","8504.40.00","8507.30.00"],
    "Food Security": ["0713.10.00","0713.20.00","0713.30.00","0712.90.00","0714.10.00","0714.20.00"],
  };

  const rows: Array<{ hs_code: string; category: string; country: string; value_usd: number }> = [];
  let v = 125000;
  const take = cats.length ? cats.slice(0, 6) : ["Semiconductors", "Energy Systems", "Food Security"];

  for (const cat of take) {
    const codes = hsMap[cat] ?? ["9999.99.99", "9999.99.98", "9999.99.97"];
    for (let i = 0; i < 3; i++) {
      const hs = codes[(i + rows.length) % codes.length];
      rows.push({ hs_code: hs, category: cat, country: c, value_usd: v });
      v += 87500;
    }
  }

  while (rows.length < 12) {
    rows.push({ hs_code: "9999.99.90", category: "Industrial Imports", country: c, value_usd: v });
    v += 50000;
  }
  return rows.slice(0, 18);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const allowed = splitList(env.ALLOWED_ORIGINS);

    // Preflight
    if (request.method === "OPTIONS") {
      const o = request.headers.get("Origin") || "*";
      return new Response(null, { headers: cors(o) });
    }

    const origin = pickOrigin(request, allowed);
    if (!origin) return new Response("Forbidden origin", { status: 403 });

    // Optional gate
    if (env.OMEGA_ACCESS_CODE) {
      const code = request.headers.get("X-OMEGA-CODE") || "";
      if (code !== env.OMEGA_ACCESS_CODE) {
        return new Response("Unauthorized", { status: 401, headers: cors(origin) });
      }
    }

    if (url.pathname === "/omega/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors(origin), "content-type": "application/json" },
      });
    }

    const model = (env.OMEGA_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast").trim();

    if (url.pathname === "/omega/chat" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body?.messages || !Array.isArray(body.messages)) {
        return new Response("Bad Request", { status: 400, headers: cors(origin) });
      }

      const prompt = toChatPrompt(body.messages);

      const out = await env.AI.run(model, {
        prompt,
        max_tokens: body.max_tokens ?? 900,
        temperature: body.temperature ?? 0.3,
      });

      const text = (out?.response ?? out?.text ?? out) as string;

      return new Response(JSON.stringify({ text }), {
        status: 200,
        headers: { ...cors(origin), "content-type": "application/json" },
      });
    }

    if (url.pathname === "/omega/dataset" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const country = String(body?.country ?? "United Arab Emirates");
      const focus = String(body?.focus ?? "industrial imports");

      const prompt = buildDatasetPrompt(country, focus);

      const out = await env.AI.run(model, {
        prompt,
        max_tokens: 1600,
        temperature: 0.2,
      });

      const rawText = (out?.response ?? out?.text ?? out) as string;
      const parsed = extractJson(rawText);

      // Accept either {rows:[...]} or [...] (we wrap)
      let rows: unknown = null;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows = (parsed as any).rows;
      } else if (Array.isArray(parsed)) {
        rows = parsed;
      }

      if (!Array.isArray(rows)) {
        const fallback = buildFallbackRows(country, focus);
        return new Response(JSON.stringify({ rows: fallback, note: "fallback" }), {
          status: 200,
          headers: { ...cors(origin), "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ rows }), {
        status: 200,
        headers: { ...cors(origin), "content-type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404, headers: cors(origin) });
  },
};
