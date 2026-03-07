/**
 * Usage Tracker — per-user daily token cost tracking
 * Stores usage in Firestore: usage/{userId}/daily/{date}
 * Free tier cap: $1.00/day (~165 exchanges at blended rate)
 */

// Pricing (March 2026)
const PRICING = {
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4.00 },   // per MTok
  'claude-sonnet-4-5-20250514': { input: 3.00, output: 15.00 }, // per MTok
} as const;

const FREE_TIER_CAP_CENTS = 100; // $1.00/day
const PAID_TIER_MSG_CAP = 100;  // soft cap: 100 messages/day for abuse prevention

export interface UsageRecord {
  inputTokens: number;
  outputTokens: number;
  estimatedCostCents: number;
  messageCount: number;
  lastUpdated: string;
}

export function calculateCostCents(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = Object.entries(PRICING).find(([key]) => model.includes(key));
  if (!pricing) return 0;
  const [, rates] = pricing;
  const inputCost = (inputTokens / 1_000_000) * rates.input * 100;
  const outputCost = (outputTokens / 1_000_000) * rates.output * 100;
  return Math.round((inputCost + outputCost) * 100) / 100;
}

export function isOverDailyCap(usage: UsageRecord | null, tier: string): boolean {
  if (!usage) return false;
  if (tier === 'verified') return false;
  if (tier === 'paid') return usage.messageCount >= PAID_TIER_MSG_CAP;
  return usage.estimatedCostCents >= FREE_TIER_CAP_CENTS;
}

export function getDateKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
