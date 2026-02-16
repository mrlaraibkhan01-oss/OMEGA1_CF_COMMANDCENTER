import type { AgentMessage, AgentStep, ToolCall } from './types';
import { extractFirstJSONObject, id, now, safeString } from './utils';
import { systemPrompt, nextActionPrompt } from './prompt';
import webLLMService from '../lib/webllm';

export type ToolRunner = (args?: Record<string, unknown>) => Promise<unknown>;

export interface RunAgentParams {
  goal: string;
  maxSteps?: number;
  tools: Record<string, ToolRunner>;
  onMessage?: (m: AgentMessage) => void;
  onStep?: (s: AgentStep) => void;
}

export async function runOmegaAgent(params: RunAgentParams): Promise<{
  messages: AgentMessage[];
  steps: AgentStep[];
  finalAnswer: string;
  missionPacket: Record<string, unknown> | null;
}> {
  const goal = params.goal.trim();
  const maxSteps = params.maxSteps ?? 12;

  const messages: AgentMessage[] = [];
  const steps: AgentStep[] = [];
  const toolResults: Array<{ tool: string; result: unknown }> = [];

  const pushMsg = (role: AgentMessage['role'], content: string) => {
    const m: AgentMessage = { id: id('msg'), role, ts: now(), content };
    messages.push(m);
    params.onMessage?.(m);
  };

  const pushStep = (tool: string, status: AgentStep['status'], extra?: Partial<AgentStep>) => {
    const s: AgentStep = { id: id('step'), ts: now(), tool, status, ...extra };
    steps.push(s);
    params.onStep?.(s);
    return s;
  };

  pushMsg('system', systemPrompt());
  pushMsg('user', goal);

  let lastTool = '';
  let lastError = '';

  for (let i = 0; i < maxSteps; i++) {
    // Ask model for next tool call
    const prompt = nextActionPrompt(goal, { toolResults, lastTool, lastError });

    let modelText = '';
    try {
      const resp = await webLLMService.generateAgentAction(prompt);
      modelText = resp.text;
    } catch (e) {
      lastError = `LLM error: ${String(e)}`;
      pushMsg('omega', lastError);
      break;
    }

    const obj = extractFirstJSONObject(modelText);
    if (!obj) {
      lastError = 'Invalid tool call JSON. Ask again.';
      pushMsg('omega', lastError);
      continue;
    }

    const call: ToolCall = {
      tool: safeString(obj.tool),
      args: (obj.args as Record<string, unknown>) || {},
    };

    if (!call.tool) {
      lastError = 'Tool call missing tool field.';
      pushMsg('omega', lastError);
      continue;
    }

    if (call.tool === 'final') {
      const answer = safeString((call.args || {}).answer, '');
      const packet = ((call.args || {}).mission_packet as Record<string, unknown>) || null;
      pushMsg('omega', answer || 'Mission complete.');
      return { messages, steps, finalAnswer: answer, missionPacket: packet };
    }

    const runner = params.tools[call.tool];
    if (!runner) {
      lastError = `Unknown tool: ${call.tool}`;
      pushMsg('omega', lastError);
      continue;
    }

    const step = pushStep(call.tool, 'running', { note: `Step ${i + 1}` });
    try {
      const result = await runner(call.args);
      step.status = 'done';
      step.result = result;
      params.onStep?.(step);

      toolResults.push({ tool: call.tool, result });
      lastTool = call.tool;
      lastError = '';
      pushMsg('tool', JSON.stringify({ tool: call.tool, result }, null, 2));
    } catch (e) {
      step.status = 'error';
      step.error = String(e);
      params.onStep?.(step);

      lastError = `Tool error: ${call.tool}: ${String(e)}`;
      lastTool = call.tool;
      pushMsg('omega', lastError);
    }
  }

  return { messages, steps, finalAnswer: '', missionPacket: null };
}
