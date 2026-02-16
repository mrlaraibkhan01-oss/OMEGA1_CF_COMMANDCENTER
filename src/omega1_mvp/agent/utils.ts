export function now(): number { return Date.now(); }

export function id(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/** Extract the first JSON object from model output (best-effort). */
export function extractFirstJSONObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{');
  if (start < 0) return null;

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) {
      const candidate = text.slice(start, i + 1);
      try {
        const obj = JSON.parse(candidate);
        if (obj && typeof obj === 'object') return obj as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function safeString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}
