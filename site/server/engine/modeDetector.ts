/**
 * Mode Detector — auto-detect DashTwo mode from query content
 * Returns null if no strong match (keep current mode)
 */

import type { DashTwoMode } from './modelRouter';

interface ModePattern {
  mode: DashTwoMode;
  patterns: RegExp[];
}

const MODE_PATTERNS: ModePattern[] = [
  {
    mode: 'checkride',
    patterns: [
      /\b(?:checkride|check ride|practical test|DPE|oral exam|oral test)\b/i,
      /\b(?:quiz me|test me|examine me|ask me about)\b/i,
      /\bACS\s+(?:standard|task|area)\b/i,
    ],
  },
  {
    mode: 'interview',
    patterns: [
      /\b(?:airline\s+)?interview\b/i,
      /\b(?:TMAAT|tell me about a time)\b/i,
      /\b(?:regional|major|lcc)\s+(?:airline|carrier)\s+(?:interview|hiring|application)\b/i,
      /\bSTAR\s+(?:method|format|response)\b/i,
    ],
  },
  {
    mode: 'debrief',
    patterns: [
      /\bdebrief\b/i,
      /\b(?:how did|how was)\s+(?:my|the)\s+(?:flight|lesson|landing|approach)\b/i,
      /\b(?:what (?:did|should|could) I (?:do|have done) (?:better|different))\b/i,
    ],
  },
  {
    mode: 'support',
    patterns: [
      /\b(?:how|what)\s+(?:do|should|can)\s+I\s+log\b/i,
      /\blog(?:ging|book)\s+(?:question|help|issue)\b/i,
      /\b(?:PIC|SIC|dual|solo|cross.country)\s+time\b/i,
      /\bendorsement\s+(?:requirement|question)\b/i,
    ],
  },
  {
    mode: 'training',
    patterns: [
      /\b(?:teach|explain|learn|study|understand)\s+(?:me|how|about|the)\b/i,
      /\b(?:what is|what are|define|concept of)\b/i,
      /\b(?:practice|drill|exercise)\b/i,
    ],
  },
];

export function detectMode(query: string, currentMode: DashTwoMode): DashTwoMode | null {
  let bestMatch: DashTwoMode | null = null;
  let bestScore = 0;

  for (const { mode, patterns } of MODE_PATTERNS) {
    let score = 0;
    for (const p of patterns) {
      if (p.test(query)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = mode;
    }
  }

  // Only switch if strong signal and different from current
  if (bestScore >= 1 && bestMatch && bestMatch !== currentMode) {
    return bestMatch;
  }

  return null;
}
