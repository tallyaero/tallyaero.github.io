/**
 * A/B Testing Store
 * Assigns users to test variants and persists assignments in localStorage.
 * Variants are deterministic per user session — once assigned, they stick.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ABTest {
  id: string;
  variants: string[];
}

// Active A/B tests
export const AB_TESTS: ABTest[] = [
  {
    id: 'welcome_starters',
    variants: ['default', 'question_focused', 'scenario_based'],
  },
  {
    id: 'upgrade_prompt',
    variants: ['default', 'value_focused', 'social_proof'],
  },
];

interface ABState {
  assignments: Record<string, string>; // testId -> variant
  getVariant: (testId: string) => string;
  recordEvent: (testId: string, event: string) => void;
  events: Array<{ testId: string; variant: string; event: string; timestamp: number }>;
}

export const useABStore = create<ABState>()(
  persist(
    (set, get) => ({
      assignments: {},
      events: [],

      getVariant: (testId: string) => {
        const { assignments } = get();
        if (assignments[testId]) return assignments[testId];

        // Assign randomly
        const test = AB_TESTS.find(t => t.id === testId);
        if (!test) return 'default';

        const variant = test.variants[Math.floor(Math.random() * test.variants.length)];
        set({ assignments: { ...assignments, [testId]: variant } });
        return variant;
      },

      recordEvent: (testId: string, event: string) => {
        const { assignments, events } = get();
        const variant = assignments[testId] || 'default';
        set({
          events: [...events.slice(-200), { testId, variant, event, timestamp: Date.now() }],
        });
      },
    }),
    {
      name: 'dashtwo-ab-tests',
    }
  )
);
