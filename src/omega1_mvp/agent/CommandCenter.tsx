import { useEffect, useRef, useState } from 'react';
import { Cpu, Download, ShieldCheck, Terminal, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { OmegaState } from '../hooks/useOmegaState';
import type { ExplorerOutput, PlannerOutput, GuardVerdict, PillarType } from '../types';
import { PILLAR_LABELS } from '../types';
import { generateId } from '../lib/utils';
import { webLLMService } from '../lib/webllm';

type ChatRole = 'user' | 'omega' | 'tool' | 'system';

type ChatMsg = {
  id: string;
  ts: number;
  role: ChatRole;
  content: string;
};

type MissionSnapshot = {
  explorer: ExplorerOutput | null;
  planner: PlannerOutput | null;
  guard: GuardVerdict | null;
  wargame: WargameResult | null;
};

type WargameResult = {
  sims: number;
  roi_p10: number;
  roi_p50: number;
  roi_p90: number;
  p_loss: number;
  expected_roi: number;
  expected_payback_months: number;
  stress_notes: string[];
};

const PILLARS: PillarType[] = [
  'capital_markets',
  'macroeconomics',
  'business_genesis',
  'government',
  'instruments',
  'wealth',
  'execution',
];

function fmtPct(x: number) {
  if (!Number.isFinite(x)) return 'â€”';
  return `${x.toFixed(1)}%`;
}

function fmtMoney(x: number) {
  if (!Number.isFinite(x)) return 'â€”';
  if (x >= 1e9) return `$${(x / 1e9).toFixed(2)}B`;
  if (x >= 1e6) return `$${(x / 1e6).toFixed(2)}M`;
  if (x >= 1e3) return `$${(x / 1e3).toFixed(1)}K`;
  return `$${Math.round(x).toLocaleString()}`;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function normalSample(mu: number, sigma: number) {
  // Boxâ€“Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mu + sigma * z;
}

function simulateWargame(explorer: ExplorerOutput | null, planner: PlannerOutput | null): WargameResult | null {
  if (!planner) return null;
  const sims = 2000;

  // Mean ROI is planner.roi_percent. Risk-adjust sigma from #risks and concentration.
  const risks = Array.isArray(planner.risks) ? planner.risks.length : 4;
  const concentration = explorer?.leaks?.[0]?.score ? clamp01(Number(explorer.leaks[0].score) / 10) : 0.5;
  const mu = (Number(planner.roi_percent) || 0) / 100;
  const sigma = 0.10 + 0.015 * Math.min(10, risks) + 0.08 * concentration;

  const rois: number[] = [];
  const paybacks: number[] = [];
  const capex = Number(planner.capex_usd) || 0;
  const opex = Number(planner.opex_usd_per_year) || 0;

  for (let i = 0; i < sims; i++) {
    const r = normalSample(mu, sigma);
    rois.push(r);

    // Simple payback mapping: higher ROI => shorter payback. Keep bounded.
    const basePay = Number(planner.payback_months) || 36;
    const adj = basePay / Math.max(0.25, 1 + r);
    paybacks.push(Math.max(6, Math.min(96, adj)));
  }

  rois.sort((a, b) => a - b);
  paybacks.sort((a, b) => a - b);

  const q = (arr: number[], p: number) => arr[Math.max(0, Math.min(arr.length - 1, Math.floor(p * (arr.length - 1))))];

  const roi_p10 = q(rois, 0.10) * 100;
  const roi_p50 = q(rois, 0.50) * 100;
  const roi_p90 = q(rois, 0.90) * 100;
  const p_loss = rois.filter((x) => x < 0).length / sims;
  const expected_roi = (rois.reduce((a, b) => a + b, 0) / sims) * 100;
  const expected_payback_months = paybacks.reduce((a, b) => a + b, 0) / sims;

  const stress_notes: string[] = [];
  if (p_loss > 0.25) stress_notes.push('High downside tail: >25% scenarios negative ROI.');
  if (capex > 5e8) stress_notes.push('CAPEX-heavy: enforce staged build-out and modular lines.');
  if (opex > 2e8) stress_notes.push('OPEX-heavy: lock energy + feedstock hedges; renegotiate procurement.');

  return { sims, roi_p10, roi_p50, roi_p90, p_loss, expected_roi, expected_payback_months, stress_notes };
}

function roleBadge(role: ChatRole) {
  if (role === 'user') return { label: 'USER', color: 'rgba(255,255,255,0.65)' };
  if (role === 'tool') return { label: 'TOOL', color: 'rgba(233,84,32,0.95)' };
  if (role === 'system') return { label: 'SYS', color: 'rgba(255,255,255,0.45)' };
  return { label: 'OMEGA-1', color: 'var(--gold)' };
}

function nowTs() {
  return Date.now();
}

function sys(text: string) {
  return `> ${text}`;
}

async function interpretCommand(input: string): Promise<{ intent: 'dataset' | 'mission' | 'wargame' | 'audit' | 'export' | 'help'; country?: string; focus?: string; objective?: string }> {
  const s = input.toLowerCase();

  // deterministic heuristics first (fast + reliable)
  if (s.includes('help') || s.includes('commands') || s.includes('?')) return { intent: 'help' };
  if (s.includes('dataset') || s.includes('ministry') || s.includes('imports') || s.includes('load data') || s.includes('fetch data')) return { intent: 'dataset' };
  if (s.includes('audit') || s.includes('hash') || s.includes('validate')) return { intent: 'audit' };
  if (s.includes('wargame') || s.includes('simulate') || s.includes('stress')) return { intent: 'wargame' };
  if (s.includes('export') || s.includes('download')) return { intent: 'export' };

  // optional LLM refinement (kept tight; falls back to mission)
  try {
    const prompt = `You are OMEGA-1. Interpret the operator message and return ONLY JSON with this schema:
{
  "intent": "dataset" | "mission" | "wargame" | "audit" | "export" | "help",
  "country": "optional country",
  "focus": "optional sector focus",
  "objective": "optional objective"
}
Operator message:
${input}`;

    const resp = await webLLMService.generate(prompt, undefined, true);
    const obj = resp.jsonOutput as any;
    if (obj && typeof obj.intent === 'string') {
      const intent = String(obj.intent).trim() as any;
      if (['dataset', 'mission', 'wargame', 'audit', 'export', 'help'].includes(intent)) {
        return {
          intent,
          country: typeof obj.country === 'string' ? obj.country : undefined,
          focus: typeof obj.focus === 'string' ? obj.focus : undefined,
          objective: typeof obj.objective === 'string' ? obj.objective : undefined,
        };
      }
    }
  } catch {
    // ignore
  }

  return { intent: 'mission' };
}

export default function CommandCenter({ omega }: { omega: OmegaState }) {
  const [chat, setChat] = useState<ChatMsg[]>(() => [
    { id: generateId(), ts: nowTs(), role: 'system', content: sys('OMEGA-1 Command Center online. Type a mission objective.') },
    { id: generateId(), ts: nowTs(), role: 'system', content: sys('OMEGA-1 MVP') },
    { id: generateId(), ts: nowTs(), role: 'system', content: sys('Examples: "Fetch ministry dataset for UAE semiconductors" | "Run full 3-Brains cycle and generate 7-pillar pack" | "Run wargame stress test" | "Validate audit chain"') },
  ]);

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const LOADING_STEPS = [
    "LINKING SOVEREIGN NODE...",
    "SPINNING UP EXPLORER...",
    "INGESTING TRADE DEPENDENCIES...",
    "ACCESSING PILLAR 4: INDUSTRIAL BLUEPRINT...",
    "ACCESSING PILLAR 6: CONSTITUTION + COMPLIANCE...",
    "SEALING AUDIT HASH...",
    "RENDERING 7-PILLAR PACK..."
  ];

  const [loadingLine, setLoadingLine] = useState("");

  useEffect(() => {
    if (!busy) { setLoadingLine(""); return; }
    let i = 0;
    setLoadingLine(LOADING_STEPS[0]);
    const t = setInterval(() => {
      i = (i + 1) % LOADING_STEPS.length;
      setLoadingLine(LOADING_STEPS[i]);
    }, 850);
    return () => clearInterval(t);
  }, [busy]);

  const [snapshot, setSnapshot] = useState<MissionSnapshot>({
    explorer: null,
    planner: null,
    guard: null,
    wargame: null,
  });

  const logRef = useRef<HTMLDivElement | null>(null);
  const status = webLLMService.getStatus();
  const proxyUrl = webLLMService.getProxyUrl();
  const remoteOnline = status.mode === 'proxy';

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chat.length]);

  const push = (role: ChatRole, content: string) => {
    setChat((prev) => [...prev, { id: generateId(), ts: nowTs(), role, content }]);
  };

  const downloadJson = (obj: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runDataset = async (country: string, focus: string) => {
    push('tool', `DATASET_FETCH country="${country}" focus="${focus}"`);
    const rows = await webLLMService.fetchMinistryDataset(country, focus);
    omega.uploadData(rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? '')]))));
    push('omega', `Dataset loaded: ${rows.length} rows ingested into Explorer.`);
  };

  const runMission = async (objective: string) => {
    push('tool', `MISSION_START objective="${objective}"`);

    const explorer = await omega.runExplorerTool();
    push('tool', `EXPLORER complete leaks=${explorer.leaks.length} total=${fmtMoney(explorer.totals.total_value_usd)}`);
    setSnapshot((s) => ({ ...s, explorer }));

    const planner = await omega.runPlannerTool(explorer);
    if (!planner) {
      push('omega', 'Planner failed (no output).');
      return;
    }
    push('tool', `PLANNER complete CAPEX=${fmtMoney(planner.capex_usd)} ROI=${fmtPct(planner.roi_percent)} Payback=${planner.payback_months}mo`);
    setSnapshot((s) => ({ ...s, planner }));

    const guard = await omega.runGuardTool(JSON.stringify(planner), planner);
    setSnapshot((s) => ({ ...s, guard }));

    if (guard.verdict !== 'APPROVED') {
      push('omega', `GUARD VETO: `);
      return;
    }
    push('tool', 'GUARD approved. Generating 7-pillar action packâ€¦');

    for (const p of PILLARS) {
      const out = await omega.generatePillar(p, objective);
      if (out) push('tool', `PILLAR ${PILLAR_LABELS[p]} complete`);
    }

    const wg = simulateWargame(explorer, planner);
    setSnapshot((s) => ({ ...s, wargame: wg }));
    if (wg) {
      push('tool', `WARGAME sims=${wg.sims} ROI P10/P50/P90 = ${fmtPct(wg.roi_p10)}/${fmtPct(wg.roi_p50)}/${fmtPct(wg.roi_p90)} | P(loss)=${fmtPct(wg.p_loss * 100)}`);
    }

    // Append an audit checkpoint
    await omega.appendAuditEvent('PUBLISH', 'mission_packet_generated', {
      objective,
      leaks_top: explorer.leaks.slice(0, 3),
      planner,
      wargame: wg,
    });

    push('omega', 'Mission complete. Explorer â†’ Planner â†’ Guard â†’ 7 Pillars â†’ Wargame â†’ Audit appended.');
  };

  const runAudit = async () => {
    push('tool', 'AUDIT_VALIDATE');
    const res = await omega.validateAudit();
    if (res.isValid) push('omega', 'Audit chain VALID.');
    else push('omega', `Audit chain BROKEN at index=${res.brokenAt}`);
  };

  const runWargame = async () => {
    push('tool', 'WARGAME_RUN');
    const wg = simulateWargame(snapshot.explorer, snapshot.planner);
    setSnapshot((s) => ({ ...s, wargame: wg }));
    if (!wg) {
      push('omega', 'Wargame requires a Planner output. Run a mission first.');
      return;
    }
    push('omega', `Wargame complete: ROI P10/P50/P90 = ${fmtPct(wg.roi_p10)}/${fmtPct(wg.roi_p50)}/${fmtPct(wg.roi_p90)}; P(loss)=${fmtPct(wg.p_loss * 100)}.`);
  };

  const runExport = async () => {
    const packet = {
      identity: 'OMEGA-1',
      ts: nowTs(),
      explorer: snapshot.explorer,
      planner: snapshot.planner,
      guard: snapshot.guard,
      pillars: omega.pillarOutputs,
      wargame: snapshot.wargame,
      audit_head: omega.auditHeadHash,
      audit_events: omega.auditEvents.slice(-20),
    };
    downloadJson(packet, `OMEGA1_mission_packet_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`);
    push('omega', 'Exported mission packet JSON.');
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || busy) return;

    setInput('');
    push('user', msg);
    setBusy(true);

    try {
      const cmd = await interpretCommand(msg);

      // Always ensure remote URL is configured (fallback is compiled in).
      if (!proxyUrl) {
        return;
      }

      if (cmd.intent === 'help') {
        push('omega', [
          'Available ops:',
          '- "fetch ministry dataset for <country> <focus>"',
          '- "run mission: <objective>"',
          '- "run wargame stress test"',
          '- "validate audit chain"',
          '- "export mission packet"',
          '',
          'Default: if you type any objective, OMEGA-1 runs Explorerâ†’Plannerâ†’Guardâ†’7 Pillarsâ†’Wargameâ†’Audit.',
        ].join('\n'));
        return;
      }

      if (cmd.intent === 'dataset') {
        const country = cmd.country || 'United Arab Emirates';
        const focus = cmd.focus || 'Semiconductors, Energy Systems, Food Security';
        await runDataset(country, focus);
        return;
      }

      if (cmd.intent === 'audit') {
        await runAudit();
        return;
      }

      if (cmd.intent === 'wargame') {
        await runWargame();
        return;
      }

      if (cmd.intent === 'export') {
        await runExport();
        return;
      }

      // mission
      const objective = cmd.objective || msg;
      await runMission(objective);
    } catch (e: any) {
      push('omega', `ERROR: ${String(e?.message ?? e)}`);
    } finally {
      setBusy(false);
    }
  };

  const remoteBadge = remoteOnline ? (
    <span className="mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(233,84,32,0.12)', border: '1px solid rgba(233,84,32,0.25)', color: 'var(--gold)' }}>
      REMOTE CORE ONLINE
    </span>
  ) : (
    <span className="mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.7)' }}>
      REMOTE CORE OFFLINE
    </span>
  );

  return (
    <div className="grid lg:grid-cols-12 gap-4">
      {/* Terminal / chat */}
      <div className="lg:col-span-7">
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
                  {busy && (
        <div className="mt-2 mono text-[11px]" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
          {loadingLine} <span className="omega-blink">█</span>
        </div>
      )}
      <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              <div className="font-semibold">COMMAND CENTER</div>
            </div>
      {busy && (
        <div className="mt-2 mono text-[11px]" style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
          {loadingLine} <span className="omega-blink">█</span>
        </div>
      )}
      <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              {remoteBadge}
            </div>
          </div>

          <div
            ref={logRef}
            className="rounded-xl p-3 h-[420px] overflow-auto mono text-sm"
            style={{ background: '#000', border: '1px solid var(--border)', lineHeight: 1.35 }}
          >
            {chat.map((m) => {
              const b = roleBadge(m.role);
              return (
                <div key={m.id} className="mb-2">
                  <span className="mr-2 text-[10px] px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--border)', color: b.color }}>
                    {b.label}
                  </span>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder='Type a mission objectiveâ€¦ (e.g., "Localize semiconductors supply chain in UAE with 12-month blueprint")'
              className="flex-1 px-3 py-2 rounded-lg bg-black/40 border mono text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              style={{ background: 'var(--gold)', color: '#0b0b0b' }}
              disabled={busy}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              RUN
            </button>
          </div>
          <div className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>OMEGA-1 MVP</div>
        </div>
      </div>

      {/* Status panels */}
      <div className="lg:col-span-5 space-y-4">
        {/* Explorer */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">EXPLORER</div>
            {snapshot.explorer ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--gold)' }} /> : <AlertTriangle className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />}
          </div>
          {snapshot.explorer ? (
            <div className="text-xs space-y-2">
              <div style={{ color: 'var(--text-muted)' }}>
                Total imports scanned: <span className="mono">{fmtMoney(snapshot.explorer.totals.total_value_usd)}</span>
              </div>
              <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Top leaks</div>
                <div className="mt-1 space-y-1">
                  {snapshot.explorer.leaks.slice(0, 3).map((l, i) => (
                    <div key={i} className="mono text-[12px]">
                      {l.category} â€¢ {l.country} â€¢ {fmtMoney(l.value_usd)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No run yet. Send a mission objective to execute Explorer.
            </div>
          )}
        </div>

        {/* Planner + Guard */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">PLANNER + GUARD</div>
            {snapshot.guard?.verdict === 'APPROVED' ? (
              <span className="mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(233,84,32,0.12)', border: '1px solid rgba(233,84,32,0.25)', color: 'var(--gold)' }}>
                APPROVED
              </span>
            ) : snapshot.guard ? (
              <span className="mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(255, 80, 80, 0.12)', border: '1px solid rgba(255, 80, 80, 0.25)', color: '#ff6b6b' }}>
                VETO
              </span>
            ) : (
              <span className="mono text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'rgba(255,255,255,0.65)' }}>
                IDLE
              </span>
            )}
          </div>

          {snapshot.planner ? (
            <div className="text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>CAPEX</div>
                  <div className="mono text-[12px]">{fmtMoney(snapshot.planner.capex_usd)}</div>
                </div>
                <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>OPEX / yr</div>
                  <div className="mono text-[12px]">{fmtMoney(snapshot.planner.opex_usd_per_year)}</div>
                </div>
                <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>ROI</div>
                  <div className="mono text-[12px]">{fmtPct(snapshot.planner.roi_percent)}</div>
                </div>
                <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Payback</div>
                  <div className="mono text-[12px]">{snapshot.planner.payback_months} mo</div>
                </div>
              </div>

              {snapshot.guard && snapshot.guard.verdict !== 'APPROVED' && (
                <div className="rounded-xl p-2 mono text-[12px]" style={{ background: 'rgba(255, 80, 80, 0.08)', border: '1px solid rgba(255, 80, 80, 0.18)' }}>
                  {(snapshot.guard.reasons && snapshot.guard.reasons.length) ? snapshot.guard.reasons.join(' | ') : 'policy veto'}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Planner output appears after a mission run.
            </div>
          )}
        </div>

        {/* Wargame + Audit + Export */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">WARGAME + AUDIT</div>
            <button
              onClick={() => runExport()}
              className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-2"
              style={{ border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)' }}
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>

          {snapshot.wargame ? (
            <div className="text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>ROI P10/P50/P90</div>
                  <div className="mono text-[12px]">{fmtPct(snapshot.wargame.roi_p10)} / {fmtPct(snapshot.wargame.roi_p50)} / {fmtPct(snapshot.wargame.roi_p90)}</div>
                </div>
                <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>P(loss)</div>
                  <div className="mono text-[12px]">{fmtPct(snapshot.wargame.p_loss * 100)}</div>
                </div>
              </div>
              {snapshot.wargame.stress_notes.length > 0 && (
                <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Stress notes</div>
                  <ul className="mt-1 list-disc pl-5 space-y-1">
                    {snapshot.wargame.stress_notes.map((n, i) => (
                      <li key={i} className="text-[12px]">{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Wargame runs automatically after a mission, or via: â€œrun wargame stress testâ€.
            </div>
          )}

          <div className="mt-3 rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Audit head</div>
              <button
                onClick={() => runAudit()}
                className="text-[11px] px-2 py-1 rounded"
                style={{ border: '1px solid var(--border)', background: 'rgba(0,0,0,0.35)' }}
              >
                Validate
              </button>
            </div>
            <div className="mono text-[12px] mt-1" style={{ opacity: 0.9 }}>{omega.auditHeadHash || 'â€”'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}








