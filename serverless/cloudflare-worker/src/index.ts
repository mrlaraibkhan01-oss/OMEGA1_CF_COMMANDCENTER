/**
 * OMEGA-1 SOVEREIGN DECISION ENGINE (MISSION ORCHESTRATOR V3.2.1)
 * Cloudflare Worker + Workers AI + KV (State + Mission Packets)
 *
 * Deterministic upgrades:
 * - CLI/server calls with NO Origin are allowed (Origin="*"), browser still strict allowlist.
 * - P2 Resource Accounting is server-side (power/land/water pools are authoritative)
 * - P3 Staffing Accounting is server-side (local pool + golden visas are authoritative)
 * - Phase Automaton advances only on user intent + Guard APPROVED (max +1 step)
 * - Guard override enforced if resource exceed or P7 violation
 *
 * Endpoints:
 *  POST /omega/chat     { messages, temperature?, max_tokens?, mission_id?, country?, focus?, reset_state? } -> { text, json, node }
 *  POST /omega/dataset  { country, focus } -> { rows: [...] }
 *  GET  /omega/health   -> { ok: true, node, model }
 *  POST /omega/mission  { country?, set_active?: boolean, packet: MissionPacket } -> { ok, active_mission_id }
 *  GET  /omega/mission  ?country=... -> { active_mission_id, packet }
 */

export interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AI: any;
  OMEGA_DATA: KVNamespace;
  OMEGA_MODEL?: string;
  ALLOWED_ORIGINS?: string;
  OMEGA_ACCESS_CODE?: string;
}

type ChatMsg = { role: string; content: string };

type MissionPhase = { focus: string; action: string; result: string };
type MissionPacket = {
  mission_id: string;
  objective: string;
  status: string;
  phases: Record<string, MissionPhase>;
};

type ResourceRequest = { power_mw: number; land_sqft: number; water_gpd: number };
type StaffingRequest = {
  hires_local: number; hires_golden_visas: number; hires_global: number; time_to_staff_months: number
};

type SovereignState = {
  version: string;
  country: string;

  active_mission_id?: string;
  phase_cursor: string;

  power_mw_total: number;
  power_mw_used: number;

  land_sqft_total: number;
  land_sqft_used: number;

  water_gpd_total: number;
  water_gpd_used: number;

  talent_local_pool: number;
  golden_visas_pool: number;

  last_focus?: string;
  last_updated_ts: number;

  allocations: Array<{
    ts: number;
    mission_id?: string;
    phase?: string;
    type: string;
    power_mw?: number;
    land_sqft?: number;
    water_gpd?: number;
    hires_local?: number;
    hires_golden_visas?: number;
    hires_global?: number;
  }>;
};

const NODE_ID = "MISSION ORCHESTRATOR V3.2.1";
const PHASES = ["PHASE_1_FEASIBILITY","PHASE_2_SANDBOX","PHASE_3_SCALE","PHASE_4_DOMINION"] as const;

const STATE_KEY = (country: string) => `state:${country.toUpperCase()}`;
const ACTIVE_MISSION_KEY = (country: string) => `active_mission:${country.toUpperCase()}`;
const MISSION_KEY = (mission_id: string) => `mission:${mission_id}`;
const LAST_DATASET_KEY = (country: string, focus: string) =>
  `dataset:${country.toUpperCase()}:${focus.toLowerCase()}`;

function splitList(v?: string): string[] {
  return (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

function cors(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
    "Access-Control-Allow-Headers": "Content-Type,X-OMEGA-CODE",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * STRICT BROWSER CORS + SAFE CLI/SERVER MODE
 * - If Origin missing => allow ("*") (security enforced by X-OMEGA-CODE if enabled)
 * - If Origin present => must be allowlisted (when ALLOWED_ORIGINS configured)
 */
function pickOrigin(req: Request, allowed: string[]): string {
  const origin = req.headers.get("Origin") || "";

  // CLI/server calls usually have no Origin
  if (!origin) return "*";

  // Browser: strict allowlist
  if (allowed.length === 0) return origin;
  return allowed.includes(origin) ? origin : "";
}

function json(res: unknown, origin: string, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: { ...cors(origin), "content-type": "application/json; charset=utf-8" },
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

function safeText(x: unknown): string {
  if (typeof x === "string") return x;
  try { return JSON.stringify(x); } catch { return String(x); }
}

function extractJson(raw: string): unknown {
  if (!raw) return null;
  const s = raw.trim();
  try { return JSON.parse(s); } catch {}

  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  const start = firstObj === -1 ? firstArr : firstArr === -1 ? firstObj : Math.min(firstObj, firstArr);
  if (start === -1) return null;

  for (let end = s.length - 1; end > start; end--) {
    const ch = s[end];
    if (ch !== "}" && ch !== "]") continue;
    const candidate = s.slice(start, end + 1);
    try { return JSON.parse(candidate); } catch {}
  }
  return null;
}

function clampInt(x: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function clampNum(x: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.min(max, Math.max(min, n));
}

function nextPhase(cur: string) {
  const i = PHASES.indexOf(cur as any);
  if (i < 0) return PHASES[0];
  return PHASES[Math.min(PHASES.length - 1, i + 1)];
}

function isValidPhase(p: string) {
  return PHASES.includes(p as any);
}

function defaultState(country: string): SovereignState {
  return {
    version: "3.2.1",
    country,
    active_mission_id: undefined,
    phase_cursor: "PHASE_1_FEASIBILITY",
    power_mw_total: 680,
    power_mw_used: 0,
    land_sqft_total: 450_000_000,
    land_sqft_used: 0,
    water_gpd_total: 10_000_000,
    water_gpd_used: 0,
    talent_local_pool: 450_000,
    golden_visas_pool: 200_000,
    last_updated_ts: Date.now(),
    allocations: [],
  };
}

async function loadState(env: Env, country: string): Promise<SovereignState> {
  const raw = await env.OMEGA_DATA.get(STATE_KEY(country));
  if (!raw) return defaultState(country);
  try {
    const parsed = JSON.parse(raw) as SovereignState;
    const merged = { ...defaultState(country), ...parsed };
    if (!merged.phase_cursor) merged.phase_cursor = "PHASE_1_FEASIBILITY";
    if (!isValidPhase(merged.phase_cursor)) merged.phase_cursor = "PHASE_1_FEASIBILITY";
    return merged;
  } catch {
    return defaultState(country);
  }
}

async function saveState(env: Env, st: SovereignState) {
  st.last_updated_ts = Date.now();
  await env.OMEGA_DATA.put(STATE_KEY(st.country), JSON.stringify(st));
}

function remaining(st: SovereignState) {
  return {
    power_mw_remaining: Math.max(0, st.power_mw_total - st.power_mw_used),
    land_sqft_remaining: Math.max(0, st.land_sqft_total - st.land_sqft_used),
    water_gpd_remaining: Math.max(0, st.water_gpd_total - st.water_gpd_used),
  };
}

function validateMissionPacket(p: any): p is MissionPacket {
  return !!p && typeof p === "object"
    && typeof p.mission_id === "string"
    && typeof p.objective === "string"
    && typeof p.status === "string"
    && p.phases && typeof p.phases === "object";
}

function pillarGatewaysText() {
  return `
PILLAR LOGIC GATEWAYS (ENFORCE AS RULES, NOT WORDS):

P1 (CAPITAL / WALLET) - MANDATE WEIGHTING:
- MGX=high-risk frontier AI; Mubadala=long-horizon tech ROI; ADQ=national stability/strategic supply chains.
- If mismatch => flag P1_MANDATE_MISMATCH and re-route.

P2 (INFRA / WORKSHOP) - RESOURCE CONFLICT RESOLUTION:
- Power/Land/Water are finite pools. Proposals must specify resource_request.
- Worker applies accounting; proposals exceeding pools must be vetoed.

P3 (HUMAN / HANDS) - RECRUITMENT VELOCITY:
- staffing_request must specify hires_local / hires_golden_visas / hires_global.
- time_to_staff_months must reflect: 0–2 (local) vs 3–6 (global).

P4 (REG / RULES) - COMPLIANCE SCORE:
- Every initiative returns reg_friction_score (1–10) + regulators.
- If score >= 9 => GUARD MUST VETO.

P5 (GEO / BRIDGE) - MARKET ENTRY MAP:
- Provide priority_markets + corridor/CEPA/tariff advantage.

P6 (ENERGY / GRID) - CLEAN ENERGY FIT:
- Provide CO2_intensity + clean_power_fit. Penalize gas expansion.

P7 (DIGITAL / SHIELD) - INSIDE-THE-FENCE:
- Default hosting: Sovereign Cloud (G42/Core42 or on-prem).
- Any foreign cloud for sovereign data => P7_SECURITY_VIOLATION => VETO.
`.trim();
}

function requiredJsonSchemaText() {
  return `
OUTPUT MUST BE VALID MINIFIED JSON ONLY. NO MARKDOWN. NO EXTRA TEXT.
Schema:
{
 "mission_id": string,
 "objective": string,
 "phase_cursor": string,
 "brain_order": ["EXPLORER","PLANNER","GUARD"],

 "explorer": {
   "leakage_usd": number,
   "hs_codes": string[],
   "facts": string[],
   "dataset_rows_used": number
 },

 "planner": {
   "resource_request": { "power_mw": number, "land_sqft": number, "water_gpd": number },
   "staffing_request": { "hires_local": number, "hires_golden_visas": number, "hires_global": number, "time_to_staff_months": number },

   "seven_pillar_pack": { "p1": object,"p2": object,"p3": object,"p4": object,"p5": object,"p6": object,"p7": object },
   "capex_usd_range": [number, number],
   "timeline_months": number,
   "next_actions": string[],
   "kpis": string[]
 },

 "guard": {
   "verdict": "APPROVED" | "VETOED",
   "reasons": string[],
   "risk_flags": string[]
 },

 "state_update": {
   "power_mw_remaining": number,
   "land_sqft_remaining": number,
   "water_gpd_remaining": number,
   "talent_local_pool": number,
   "golden_visas_pool": number,
   "phase_cursor": string
 }
}
Hard rules:
- Guard MUST VETO if P7_SECURITY_VIOLATION OR pools would go negative OR reg_friction_score>=9.
- Worker will override output if hard rules violated.
- Use injected dataset as numeric anchor when present.
`.trim();
}

function buildPrompt(
  state: SovereignState,
  packet: MissionPacket | null,
  groundTruthDataset: unknown,
  messages: ChatMsg[],
  mission_id: string
) {
  const injectedDataset = groundTruthDataset ? safeText(groundTruthDataset) : "null";
  const injectedPacket = packet ? JSON.stringify(packet) : "null";
  const objective = packet?.objective ?? "Sovereign Execution";
  const phase_cursor = state.phase_cursor ?? "PHASE_1_FEASIBILITY";

  const constitution = `
[SYSTEM STATUS: SOVEREIGN NODE ACTIVE]
[NODE: ${NODE_ID}]
[DOMAIN: ${state.country.toUpperCase()} INDUSTRIAL & AI SOVEREIGNTY]

IDENTITY:
You are OMEGA-1, a Sovereign Decision Engine. Never mention any other model/provider.

MISSION PACKET (AUTHORITATIVE):
MISSION_PACKET_JSON=${injectedPacket}

STATE LEDGER (AUTHORITATIVE):
STATE_JSON=${JSON.stringify(state)}

DATA FEED (GROUND TRUTH):
DATASET_JSON=${injectedDataset}

LOGIC GATEWAYS:
${pillarGatewaysText()}

STRICT OUTPUT CONTRACT:
${requiredJsonSchemaText()}

MISSION_ID="${mission_id}"
OBJECTIVE="${objective}"
PHASE_CURSOR="${phase_cursor}"
`.trim();

  const parts: string[] = [constitution, "CONVERSATION:"];
  for (const m of messages) {
    const role = (m.role || "user").toLowerCase() === "assistant" ? "OMEGA-1" : "USER";
    parts.push(`${role}: ${m.content}`);
  }
  parts.push("OMEGA-1:");
  return { prompt: parts.join("\n"), objective, phase_cursor };
}

function buildDatasetPrompt(country: string, focus: string): string {
  const c = (country || "United Arab Emirates").trim();
  const f = (focus || "industrial imports").trim();
  return [
    "You are OMEGA-1. Return ONLY valid MINIFIED JSON (no markdown, no commentary).",
    "Create a small trade import dependency dataset for the given country and focus.",
    '{ "rows": [ { "hs_code": "string", "category": "string", "country": "string", "value_usd": 123 } ] }',
    `Country: ${c}`,
    `Focus: ${f}`,
    "Constraints: 12 to 18 rows. Keep output under 5500 characters. value_usd must be numeric. Use realistic HS-like codes.",
  ].join("\n");
}

function buildFallbackRows(country: string, focus: string) {
  const c = (country || "United Arab Emirates").trim();
  const cats = (focus || "Semiconductors, Energy Systems, Food Security")
    .split(",").map((s) => s.trim()).filter(Boolean);

  const hsMap: Record<string, string[]> = {
    Semiconductors: ["8542.31.00","8542.32.00","8542.33.00","8542.39.00","8542.41.00","8542.42.00"],
    "Energy Systems": ["8501.10.00","8501.90.00","8502.10.00","8502.30.00","8504.40.00","8507.30.00"],
    "Food Security": ["0713.10.00","0713.20.00","0713.30.00","0712.90.00","0714.10.00","0714.20.00"],
  };

  const rows: Array<{ hs_code: string; category: string; country: string; value_usd: number }> = [];
  let v = 125000;
  const take = cats.length ? cats.slice(0, 6) : ["Semiconductors","Energy Systems","Food Security"];

  for (const cat of take) {
    const codes = hsMap[cat] ?? ["9999.99.99","9999.99.98","9999.99.97"];
    for (let i = 0; i < 3; i++) {
      rows.push({ hs_code: codes[(i + rows.length) % codes.length], category: cat, country: c, value_usd: v });
      v += 87500;
    }
  }

  while (rows.length < 12) {
    rows.push({ hs_code: "9999.99.90", category: "Industrial Imports", country: c, value_usd: v });
    v += 50000;
  }
  return rows.slice(0, 18);
}

async function runAIWithRetry(env: Env, model: string, args: any) {
  const attempts = [0, 1, 2];
  let lastErr: unknown = null;

  for (const i of attempts) {
    try {
      const backoff = i === 0 ? 0 : 450 * i;
      if (backoff) await sleep(backoff);
      const out = await withTimeout(env.AI.run(model, args), 18_000);
      return out;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("AI failure");
}

function coerceJsonOrFallback(rawText: string, fallbackObj: any) {
  const parsed = extractJson(rawText);
  if (parsed && typeof parsed === "object") return parsed;
  return fallbackObj;
}
function buildRepairPrompt(schemaText: string, mission_id: string, objective: string, phase_cursor: string, raw: string) {
  return [
    "You are OMEGA-1 JSON REPAIR MODE.",
    "Return ONLY valid MINIFIED JSON that matches the schema. No markdown. No commentary.",
    "If data missing, fill with best-effort conservative defaults.",
    `mission_id="${mission_id}" objective="${objective}" phase_cursor="${phase_cursor}"`,
    "SCHEMA:",
    schemaText,
    "RAW_TEXT_TO_REPAIR:",
    raw
  ].join("\n");
}

async function repairJsonWithAI(
  env: Env,
  model: string,
  schemaText: string,
  mission_id: string,
  objective: string,
  phase_cursor: string,
  raw: string
) {
  const prompt = buildRepairPrompt(schemaText, mission_id, objective, phase_cursor, raw);
  const out = await runAIWithRetry(env, model, { prompt, max_tokens: 1200, temperature: 0.0 });
  const txt = (out?.response ?? out?.text ?? out) as string;
  return txt;
}


function getLastUserText(messages: ChatMsg[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const r = (messages[i].role || "user").toLowerCase();
    if (r !== "assistant") return String(messages[i].content || "");
  }
  return "";
}

function userWantsAdvance(lastUser: string): boolean {
  const s = lastUser.toLowerCase();
  return (
    s.includes("advance") ||
    s.includes("next phase") ||
    s.includes("proceed") ||
    s.includes("move to") ||
    s.includes("go to phase") ||
    s.includes("phase 2") || s.includes("phase_2") || s.includes("sandbox") ||
    s.includes("phase 3") || s.includes("phase_3") || s.includes("scale") ||
    s.includes("phase 4") || s.includes("phase_4") || s.includes("dominion")
  );
}

function applyDeterministicAccounting(state: SovereignState, parsed: any) {
  const rem0 = remaining(state);

  const rrRaw = parsed?.planner?.resource_request ?? {};
  const srRaw = parsed?.planner?.staffing_request ?? {};

  const rr: ResourceRequest = {
    power_mw: clampNum(rrRaw.power_mw, 0, 1e9),
    land_sqft: clampNum(rrRaw.land_sqft, 0, 1e12),
    water_gpd: clampNum(rrRaw.water_gpd, 0, 1e12),
  };

  const sr: StaffingRequest = {
    hires_local: clampInt(srRaw.hires_local, 0, 1e9),
    hires_golden_visas: clampInt(srRaw.hires_golden_visas, 0, 1e9),
    hires_global: clampInt(srRaw.hires_global, 0, 1e9),
    time_to_staff_months: clampNum(srRaw.time_to_staff_months, 0, 120),
  };

  parsed.planner = parsed.planner || {};
  parsed.planner.resource_request = rr;
  parsed.planner.staffing_request = sr;

  parsed.guard = parsed.guard || { verdict: "VETOED", reasons: ["MISSING_GUARD"], risk_flags: ["FORMAT_FAILURE"] };
  parsed.guard.risk_flags = Array.isArray(parsed.guard.risk_flags) ? parsed.guard.risk_flags : [];
  parsed.guard.reasons = Array.isArray(parsed.guard.reasons) ? parsed.guard.reasons : [];

  const rf = parsed.guard.risk_flags.map((x: any) => String(x));
  const p7 = rf.some((x: string) => x.includes("P7_SECURITY_VIOLATION")) ||
            JSON.stringify(parsed).includes("P7_SECURITY_VIOLATION");

  const wouldExceed =
    rr.power_mw > rem0.power_mw_remaining ||
    rr.land_sqft > rem0.land_sqft_remaining ||
    rr.water_gpd > rem0.water_gpd_remaining;

  if (p7) {
    parsed.guard.verdict = "VETOED";
    parsed.guard.risk_flags = Array.from(new Set([...rf, "P7_SECURITY_VIOLATION", "EDGE_GUARD_OVERRIDE"]));
    parsed.guard.reasons = Array.from(new Set([...parsed.guard.reasons, "P7 inside-the-fence violation (edge override)"]));
  }

  if (wouldExceed) {
    parsed.guard.verdict = "VETOED";
    parsed.guard.risk_flags = Array.from(new Set([...rf, "P2_RESOURCE_EXCEEDED", "EDGE_GUARD_OVERRIDE"]));
    parsed.guard.reasons = Array.from(new Set([...parsed.guard.reasons, "Resource request exceeds sovereign pools (edge override)"]));
  }

  const verdict = String(parsed.guard.verdict || "VETOED").toUpperCase();
  const approved = verdict === "APPROVED";

  if (approved) {
    state.power_mw_used = Math.min(state.power_mw_total, state.power_mw_used + rr.power_mw);
    state.land_sqft_used = Math.min(state.land_sqft_total, state.land_sqft_used + rr.land_sqft);
    state.water_gpd_used = Math.min(state.water_gpd_total, state.water_gpd_used + rr.water_gpd);

    state.talent_local_pool = Math.max(0, state.talent_local_pool - sr.hires_local);
    state.golden_visas_pool = Math.max(0, state.golden_visas_pool - sr.hires_golden_visas);

    state.allocations.push({
      ts: Date.now(),
      mission_id: String(parsed.mission_id || state.active_mission_id || ""),
      phase: state.phase_cursor,
      type: "accounting_apply",
      power_mw: rr.power_mw,
      land_sqft: rr.land_sqft,
      water_gpd: rr.water_gpd,
      hires_local: sr.hires_local,
      hires_golden_visas: sr.hires_golden_visas,
      hires_global: sr.hires_global,
    });
    state.allocations = state.allocations.slice(-60);
  } else {
    state.allocations.push({
      ts: Date.now(),
      mission_id: String(parsed.mission_id || state.active_mission_id || ""),
      phase: state.phase_cursor,
      type: "accounting_blocked",
      power_mw: rr.power_mw,
      land_sqft: rr.land_sqft,
      water_gpd: rr.water_gpd,
      hires_local: sr.hires_local,
      hires_golden_visas: sr.hires_golden_visas,
      hires_global: sr.hires_global,
    });
    state.allocations = state.allocations.slice(-60);
  }

  return approved;
}

function applyPhaseAutomaton(state: SovereignState, parsed: any, lastUserText: string) {
  const verdict = String(parsed?.guard?.verdict || "VETOED").toUpperCase();
  const approved = verdict === "APPROVED";
  if (!approved) return;

  if (userWantsAdvance(lastUserText)) {
    state.phase_cursor = nextPhase(state.phase_cursor);
  }

  const modelPhase = String(parsed?.state_update?.phase_cursor || "");
  if (userWantsAdvance(lastUserText) && isValidPhase(modelPhase)) {
    // accept only if it equals NEXT phase from the pre-advance cursor
    // (state already advanced above; keep it deterministic)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const allowed = splitList(env.ALLOWED_ORIGINS);

    if (request.method === "OPTIONS") {
      const o = request.headers.get("Origin") || "*";
      return new Response(null, { headers: cors(o) });
    }

    const origin = pickOrigin(request, allowed);
    if (!origin) return new Response("Forbidden origin", { status: 403 });

    if (env.OMEGA_ACCESS_CODE) {
      const code = request.headers.get("X-OMEGA-CODE") || "";
      if (code !== env.OMEGA_ACCESS_CODE) {
        return new Response("Unauthorized", { status: 401, headers: cors(origin) });
      }
    }

    const model = (env.OMEGA_MODEL || "@cf/meta/llama-3.1-8b-instruct").trim();

    if (url.pathname === "/omega/health") {
      return json({ ok: true, node: NODE_ID, model }, origin);
    }

    if (url.pathname === "/omega/mission" && request.method === "POST") {
      const body = await request.json().catch(() => null) as any;
      const packet = body?.packet ?? body;
      if (!validateMissionPacket(packet)) return json({ ok: false, error: "Invalid mission packet" }, origin, 400);

      await env.OMEGA_DATA.put(MISSION_KEY(packet.mission_id), JSON.stringify(packet));

      const country = String(body?.country ?? "United Arab Emirates");
      const setActive = body?.set_active !== false;
      if (setActive) {
        await env.OMEGA_DATA.put(ACTIVE_MISSION_KEY(country), packet.mission_id);
        const st = await loadState(env, country);
        st.active_mission_id = packet.mission_id;
        if (!st.phase_cursor) st.phase_cursor = "PHASE_1_FEASIBILITY";
        if (!isValidPhase(st.phase_cursor)) st.phase_cursor = "PHASE_1_FEASIBILITY";
        await saveState(env, st);
      }
      return json({ ok: true, active_mission_id: setActive ? packet.mission_id : null }, origin);
    }

    if (url.pathname === "/omega/mission" && request.method === "GET") {
      const country = url.searchParams.get("country") || "United Arab Emirates";
      const active = await env.OMEGA_DATA.get(ACTIVE_MISSION_KEY(country));
      if (!active) return json({ active_mission_id: null, packet: null }, origin);

      const raw = await env.OMEGA_DATA.get(MISSION_KEY(active));
      const packet = raw ? JSON.parse(raw) : null;
      return json({ active_mission_id: active, packet }, origin);
    }

    if (url.pathname === "/omega/dataset" && request.method === "POST") {
      const body = await request.json().catch(() => ({})) as any;
      const country = String(body?.country ?? "United Arab Emirates");
      const focus = String(body?.focus ?? "industrial imports");

      const prompt = buildDatasetPrompt(country, focus);

      let rawText = "";
      try {
        const out = await runAIWithRetry(env, model, { prompt, max_tokens: 1600, temperature: 0.2 });
        rawText = (out?.response ?? out?.text ?? out) as string;
      } catch { rawText = ""; }

      const parsed = extractJson(rawText);
      let rows: unknown = null;

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows = (parsed as any).rows;
      } else if (Array.isArray(parsed)) {
        rows = parsed;
      }

      if (!Array.isArray(rows)) {
        const fallback = buildFallbackRows(country, focus);
        await env.OMEGA_DATA.put(LAST_DATASET_KEY(country, focus), JSON.stringify({ rows: fallback }));
        return json({ rows: fallback, note: "fallback" }, origin);
      }

      await env.OMEGA_DATA.put(LAST_DATASET_KEY(country, focus), JSON.stringify({ rows }));
      return json({ rows }, origin);
    }

    if (url.pathname === "/omega/chat" && request.method === "POST") {
      const body = await request.json().catch(() => null) as any;
      if (!body?.messages || !Array.isArray(body.messages)) {
        return new Response("Bad Request", { status: 400, headers: cors(origin) });
      }

      const country = String(body?.country ?? "United Arab Emirates");
      const focus = String(body?.focus ?? "Semiconductors, Energy Systems, Food Security");
      const reset = Boolean(body?.reset_state);

      let state = reset ? defaultState(country) : await loadState(env, country);
      state.last_focus = focus;

      const explicitMission = body?.mission_id ? String(body.mission_id) : "";
      const kvActive = await env.OMEGA_DATA.get(ACTIVE_MISSION_KEY(country));
      const mission_id = explicitMission || state.active_mission_id || kvActive || "UAE-SOV-IND-2026-ALPHA";
      state.active_mission_id = mission_id;
      await env.OMEGA_DATA.put(ACTIVE_MISSION_KEY(country), mission_id);

      let packet: MissionPacket | null = null;
      const mpRaw = await env.OMEGA_DATA.get(MISSION_KEY(mission_id));
      if (mpRaw) { try { packet = JSON.parse(mpRaw) as MissionPacket; } catch { packet = null; } }

      let groundTruth: unknown = null;
      const dsRaw = await env.OMEGA_DATA.get(LAST_DATASET_KEY(country, focus));
      if (dsRaw) { try { groundTruth = JSON.parse(dsRaw); } catch { groundTruth = null; } }

      const built = buildPrompt(state, packet, groundTruth, body.messages as ChatMsg[], mission_id);
      const lastUserText = getLastUserText(body.messages as ChatMsg[]);

      const temperature = body.temperature ?? 0.10;
      const max_tokens = body.max_tokens ?? 2400;

      let outText = "";
      try {
        const out = await runAIWithRetry(env, model, { prompt: built.prompt, max_tokens, temperature });
        outText = (out?.response ?? out?.text ?? out) as string;
      } catch (e) {
        const rem = remaining(state);
        const fallback = {
          mission_id,
          objective: built.objective,
          phase_cursor: state.phase_cursor,
          brain_order: ["EXPLORER", "PLANNER", "GUARD"],
          explorer: { leakage_usd: 0, hs_codes: [], facts: ["EDGE_TIMEOUT_OR_AI_FAILURE"], dataset_rows_used: 0 },
          planner: {
            resource_request: { power_mw: 0, land_sqft: 0, water_gpd: 0 },
            staffing_request: { hires_local: 0, hires_golden_visas: 0, hires_global: 0, time_to_staff_months: 0 },
            seven_pillar_pack: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {} },
            capex_usd_range: [0, 0],
            timeline_months: 12,
            next_actions: ["RETRY_REQUEST"],
            kpis: ["RECOVER_EDGE"],
          },
          guard: { verdict: "VETOED", reasons: ["EDGE_TIMEOUT_OR_AI_FAILURE"], risk_flags: ["EDGE_FAILURE"] },
          state_update: {
            ...rem,
            talent_local_pool: state.talent_local_pool,
            golden_visas_pool: state.golden_visas_pool,
            phase_cursor: state.phase_cursor,
          },
        };
        return json({ text: JSON.stringify(fallback), json: fallback, node: NODE_ID, error: String(e) }, origin, 200);
      }

      const rem = remaining(state);

      const fallbackObj = {
        mission_id,
        objective: built.objective,
        phase_cursor: state.phase_cursor,
        brain_order: ["EXPLORER", "PLANNER", "GUARD"],
        explorer: { leakage_usd: 0, hs_codes: [], facts: ["NON_JSON_MODEL_OUTPUT"], dataset_rows_used: 0 },
        planner: {
          resource_request: { power_mw: 0, land_sqft: 0, water_gpd: 0 },
          staffing_request: { hires_local: 0, hires_golden_visas: 0, hires_global: 0, time_to_staff_months: 0 },
          seven_pillar_pack: { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {}, p7: {} },
          capex_usd_range: [0, 0],
          timeline_months: 12,
          next_actions: ["FIX_OUTPUT_FORMAT"],
          kpis: ["FORMAT_COMPLIANCE"],
        },
        guard: { verdict: "VETOED", reasons: ["NON_JSON_OUTPUT"], risk_flags: ["FORMAT_FAILURE"] },
        state_update: {
          ...rem,
          talent_local_pool: state.talent_local_pool,
          golden_visas_pool: state.golden_visas_pool,
          phase_cursor: state.phase_cursor,
        },
      };

      let parsed = coerceJsonOrFallback(outText, fallbackObj) as any;

// If model output is non-JSON or fallback marker, run repair pass (deterministic, short)
const isFallbackObj = parsed === fallbackObj;
const hasNonJsonFact =
  (parsed && typeof parsed === "object" &&
   parsed.explorer && Array.isArray(parsed.explorer.facts) &&
   parsed.explorer.facts.includes("NON_JSON_MODEL_OUTPUT"));

if (isFallbackObj || hasNonJsonFact) {
  try {
    const repairedText = await repairJsonWithAI(
      env,
      model,
      requiredJsonSchemaText(),
      mission_id,
      built.objective,
      state.phase_cursor,
      String(outText || "")
    );
    parsed = coerceJsonOrFallback(repairedText, fallbackObj) as any;
  } catch {
    // keep fallback
  }
}

      parsed.mission_id = mission_id;
      parsed.objective = built.objective;
      parsed.phase_cursor = state.phase_cursor;

      const approvedAfterEdge = applyDeterministicAccounting(state, parsed);
      applyPhaseAutomaton(state, parsed, lastUserText);

      const rem1 = remaining(state);
      parsed.state_update = {
        ...rem1,
        talent_local_pool: state.talent_local_pool,
        golden_visas_pool: state.golden_visas_pool,
        phase_cursor: state.phase_cursor,
      };

      try { await saveState(env, state); } catch {}

      if (!approvedAfterEdge) {
        parsed.guard = parsed.guard || {};
        parsed.guard.verdict = "VETOED";
      }

      const packedText = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
      return json({ text: packedText, json: parsed, node: NODE_ID }, origin);
    }

    return new Response("Not Found", { status: 404, headers: cors(origin) });
  },
};

