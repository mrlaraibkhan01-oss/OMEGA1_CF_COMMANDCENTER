// OMEGA-1 MVP Types

export type BrainStatus = 'idle' | 'running' | 'complete' | 'veto';
export type CycleStage = 'INGEST' | 'LEAK_DETECT' | 'PLAN' | 'GUARD_CHECK' | 'PUBLISH' | 'AUDIT_APPEND';

export interface BrainState {
  status: BrainStatus;
  output: string;
  jsonOutput: Record<string, unknown> | null;
  timestamp: number | null;
}

export interface ThreeBrains {
  explorer: BrainState;
  planner: BrainState;
  guard: BrainState;
}

export interface PillarOutput {
  pillar: string;
  summary: string;
  content: string;
  jsonOutput: Record<string, unknown>;
  timestamp: number;
}

export interface AuditEvent {
  id: string;
  timestamp: number;
  stage: CycleStage;
  event: string;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

export interface AuditChain {
  events: AuditEvent[];
  headHash: string;
  isValid: boolean;
}

export interface LeakData {
  hs_code: string;
  category: string;
  country: string;
  value_usd: number;
  score: number;
  rationale: string;
}

export interface ExplorerOutput {
  [key: string]: unknown;
  leaks: LeakData[];
  totals: {
    total_value_usd: number;
    category_count: number;
    country_count: number;
  };
  method: string;
}

export interface PlannerOutput {
  [key: string]: unknown;
  capex_usd: number;
  opex_usd_per_year: number;
  roi_percent: number;
  payback_months: number;
  blueprint: {
    phases: string[];
    equipment: string[];
    staffing: string[];
    timeline: string[];
  };
  assumptions: string[];
  risks: string[];
}

export interface GuardVerdict {
  [key: string]: unknown;
  verdict: 'APPROVED' | 'VETOED';
  reasons: string[];
  redactions: string[];
  retryCount: number;
}

export interface ModelState {
  isLoaded: boolean;
  isLoading: boolean;
  progress: number;
  error: string | null;
  hasWebGPU: boolean;
}

export interface CycleState {
  stage: CycleStage;
  isRunning: boolean;
  progress: number;
}

export type PillarType = 
  | 'capital_markets'
  | 'macroeconomics'
  | 'business_genesis'
  | 'government'
  | 'instruments'
  | 'wealth'
  | 'execution';

export const PILLAR_LABELS: Record<PillarType, string> = {
  capital_markets: 'Capital Markets',
  macroeconomics: 'Macro & Geopolitics',
  business_genesis: 'Industrialization',
  government: 'Government / Policy',
  instruments: 'Instruments / Compliance',
  wealth: 'Wealth / Treasury',
  execution: 'Execution Orchestrator',
};

export const PILLAR_ICONS: Record<PillarType, string> = {
  capital_markets: 'TrendingUp',
  macroeconomics: 'Globe',
  business_genesis: 'Factory',
  government: 'Building2',
  instruments: 'FileCheck',
  wealth: 'Wallet',
  execution: 'Zap',
};

// Sample import data for Explorer
export const SAMPLE_IMPORT_DATA = [
  { hs_code: '8471.30.01', category: 'Computing Equipment', country: 'China', value_usd: 450000000 },
  { hs_code: '8471.30.01', category: 'Computing Equipment', country: 'Taiwan', value_usd: 280000000 },
  { hs_code: '8471.30.01', category: 'Computing Equipment', country: 'USA', value_usd: 120000000 },
  { hs_code: '8542.31.00', category: 'Semiconductors', country: 'China', value_usd: 890000000 },
  { hs_code: '8542.31.00', category: 'Semiconductors', country: 'South Korea', value_usd: 520000000 },
  { hs_code: '8542.31.00', category: 'Semiconductors', country: 'Japan', value_usd: 310000000 },
  { hs_code: '8703.23.00', category: 'Automotive Parts', country: 'Germany', value_usd: 240000000 },
  { hs_code: '8703.23.00', category: 'Automotive Parts', country: 'Japan', value_usd: 180000000 },
  { hs_code: '8703.23.00', category: 'Automotive Parts', country: 'China', value_usd: 150000000 },
  { hs_code: '3004.90.00', category: 'Pharmaceuticals', country: 'Switzerland', value_usd: 420000000 },
  { hs_code: '3004.90.00', category: 'Pharmaceuticals', country: 'USA', value_usd: 290000000 },
  { hs_code: '3004.90.00', category: 'Pharmaceuticals', country: 'Germany', value_usd: 180000000 },
  { hs_code: '9018.90.00', category: 'Medical Devices', country: 'USA', value_usd: 380000000 },
  { hs_code: '9018.90.00', category: 'Medical Devices', country: 'Germany', value_usd: 220000000 },
  { hs_code: '9018.90.00', category: 'Medical Devices', country: 'China', value_usd: 95000000 },
];

// Constitution rules for Guard
export const CONSTITUTION_RULES = [
  'No illegal instructions or harmful content',
  'No personal data requests or privacy violations',
  'No claims of accessing secret government systems',
  'Always include assumptions for numeric estimates',
  'Must not reveal underlying model identity',
  'All outputs must be factual and verifiable',
];

// Model identity suppression keywords
export const MODEL_KEYWORDS = [
  'llama', 'mistral', 'mixtral', 'gemma', 'phi', 'qwen', 'yi',
  'meta', 'anthropic', 'claude', 'openai', 'gpt', 'google', 'palm',
  'gemini', 'cohere', 'command', 'ai21', 'jurassic', 'huggingface',
  'transformers', 'pytorch', 'tensorflow', 'onnx', 'vllm', 'ollama',
];


