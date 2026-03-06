/**
 * Model Router — from @aeroedge/dashtwo
 * Routes ~87% of queries to Haiku 4.5 and ~13% to Sonnet 4.5
 */

export type DashTwoModel = 'haiku' | 'sonnet';
export type DashTwoMode = 'general' | 'checkride' | 'support' | 'interview' | 'training' | 'debrief';

export const MODEL_IDS: Record<DashTwoModel, string> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-5-20250929',
};

const COMPLEX_PATTERNS = [
  /can i .+ if/i,
  /what .+ do i need .+ and .+/i,
  /am i (?:legal|allowed|permitted) to/i,
  /compare .+ (?:with|to|vs|versus)/i,
  /what(?:'s| is) the difference between/i,
  /how (?:does|do) .+ interact with/i,
  /explain .+ (?:and|including) .+ (?:and|including)/i,
  /walk me through/i,
  /step.by.step/i,
  /scenario/i,
];

const MULTI_REG_KEYWORDS = [
  'currency and medical', 'currency and flight review', 'all requirements',
  'everything i need', 'complete list', 'what do i need to fly',
  'am i legal to fly', 'can i fly',
];

export function routeToModel(query: string, mode: DashTwoMode): DashTwoModel {
  if (mode === 'checkride' || mode === 'support' || mode === 'interview' || mode === 'debrief') {
    return 'sonnet';
  }

  if (mode === 'training') {
    const lowerQuery = query.toLowerCase();
    const isQuickRouting = lowerQuery.includes('recommend') || lowerQuery.includes('drill') ||
      lowerQuery.includes('practice') || lowerQuery.length < 60;
    return isQuickRouting ? 'haiku' : 'sonnet';
  }

  if (query.length > 200) return 'sonnet';

  for (const pattern of COMPLEX_PATTERNS) {
    if (pattern.test(query)) return 'sonnet';
  }

  const lowerQuery = query.toLowerCase();
  for (const keyword of MULTI_REG_KEYWORDS) {
    if (lowerQuery.includes(keyword)) return 'sonnet';
  }

  return 'haiku';
}
