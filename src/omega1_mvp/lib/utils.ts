// OMEGA-1 MVP Utilities

import { MODEL_KEYWORDS } from '../types';

/**
 * Generate SHA256 hash from string
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate canonical JSON string for hashing
 */
export function canonicalJSON(obj: unknown): string {
  return JSON.stringify(obj, Object.keys(obj as object).sort());
}

/**
 * Generate audit event hash
 */
export async function generateAuditHash(
  prevHash: string,
  timestamp: number,
  eventType: string,
  payload: unknown
): Promise<string> {
  const data = `${prevHash}|${timestamp}|${eventType}|${canonicalJSON(payload)}`;
  return sha256(data);
}

/**
 * Validate audit chain integrity
 */
export async function validateAuditChain(events: Array<{
  hash: string;
  prevHash: string;
  timestamp: number;
  stage: string;
  event: string;
  payload: unknown;
}>): Promise<{ isValid: boolean; brokenAt: number | null }> {
  let prevHash = '0'.repeat(64);
  
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    
    // Check prev hash matches
    if (event.prevHash !== prevHash) {
      return { isValid: false, brokenAt: i };
    }
    
    // Verify event hash
    const expectedHash = await generateAuditHash(
      event.prevHash,
      event.timestamp,
      event.stage,
      event.payload
    );
    
    if (event.hash !== expectedHash) {
      return { isValid: false, brokenAt: i };
    }
    
    prevHash = event.hash;
  }
  
  return { isValid: true, brokenAt: null };
}

/**
 * Format hash for display (truncate middle)
 */
export function formatHash(hash: string, start = 8, end = 8): string {
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format currency
 */
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Suppress model identity in text
 */
export function suppressModelIdentity(text: string): string {
  let result = text;
  
  // Replace model keywords
  for (const keyword of MODEL_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    result = result.replace(regex, '[REDACTED]');
  }
  
  // Replace version patterns
  result = result.replace(/\d+\.\d+(\.\d+)?[a-z]?/g, (match) => {
    // Keep numbers that look like years or percentages
    if (match.startsWith('20') || parseFloat(match) > 100) {
      return match;
    }
    return '[V]';
  });
  
  return result;
}

/**
 * Check if text contains model identity
 */
export function containsModelIdentity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return MODEL_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Generate identity response
 */
export function getIdentityResponse(): string {
  return 'I am OMEGA-1.';
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check WebGPU availability
 */
export function checkWebGPU(): boolean {
  if (typeof navigator === 'undefined') return false;
  return 'gpu' in navigator;
}

/**
 * Get WebGPU adapter info
 */
export async function getWebGPUInfo(): Promise<{ available: boolean; adapter?: string }> {
  if (!checkWebGPU()) {
    return { available: false };
  }
  
  try {
    const adapter = await (navigator as unknown as { gpu: { requestAdapter: () => Promise<unknown> } }).gpu.requestAdapter();
    if (adapter) {
      return { available: true, adapter: 'WebGPU Adapter Available' };
    }
  } catch {
    // Ignore errors
  }
  
  return { available: false };
}

/**
 * Parse CSV text to array
 */
export function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const result: Array<Record<string, string>> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    result.push(row);
  }
  
  return result;
}

/**
 * Calculate dependency score for leak detection
 */
export function calculateDependencyScore(
  categoryValue: number,
  totalValue: number,
  countryConcentration: number
): number {
  const valueRatio = categoryValue / totalValue;
  const concentrationRisk = Math.min(countryConcentration / 0.8, 1);
  const score = (valueRatio * 0.5 + concentrationRisk * 0.5) * 100;
  return Math.min(Math.round(score * 100) / 100, 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}


// OMEGA-1: hardwired edge proxy base (prod)
export const OMEGA_PROXY_BASE = 'https://api.rebootix-research.com';

