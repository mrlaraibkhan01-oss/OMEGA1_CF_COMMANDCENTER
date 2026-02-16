export type AgentRole = 'user' | 'omega' | 'tool' | 'system';

export interface AgentMessage {
  id: string;
  role: AgentRole;
  ts: number;
  content: string;
}

export interface ToolCall {
  tool: string;
  args?: Record<string, unknown>;
}

export interface AgentStep {
  id: string;
  ts: number;
  tool: string;
  status: 'queued' | 'running' | 'done' | 'error';
  note?: string;
  result?: unknown;
  error?: string;
}

export interface ApiConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}
