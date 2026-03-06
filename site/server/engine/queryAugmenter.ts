/**
 * Query Augmenter — from @aeroedge/dashtwo
 * Enriches queries with domain-specific terms for better vector retrieval.
 * Simplified version for Phase 1 — covers the most common aviation topics.
 */

import type { DashTwoMode } from './modelRouter';

interface AugmentationRule {
  pattern: RegExp;
  terms: string;
}

const AUGMENTATION_RULES: AugmentationRule[] = [
  { pattern: /\b(?:current|currency|recent experience|am i (?:legal|current))\b/i,
    terms: '14 CFR 61.57 recent experience requirements passenger currency takeoff landing' },
  { pattern: /\b(?:medical|basicmed|special issuance|AME|first class|second class|third class)\b/i,
    terms: '14 CFR 67 medical standards BasicMed FAA medical certificate duration' },
  { pattern: /\b(?:flight review|BFR|biennial)\b/i,
    terms: '14 CFR 61.56 flight review biennial 24 calendar months' },
  { pattern: /\b(?:night\s+(?:fly|flight|currency|current|landing|takeoff)|fly\s+at\s+night|after\s+sunset)\b/i,
    terms: '14 CFR 61.57 night currency three takeoffs landings to a full stop one hour after sunset' },
  { pattern: /\b(?:IFR|instrument (?:currency|current|rating|approach|proficiency)|IMC|IPC)\b/i,
    terms: '14 CFR 61.57 instrument currency six approaches holding procedures intercepting tracking IPC' },
  { pattern: /\b(?:airspace|class [A-G]|bravo|charlie|delta|echo|golf)\b/i,
    terms: '14 CFR 91.126 91.127 91.129 91.130 91.131 91.133 airspace requirements communication equipment' },
  { pattern: /\b(?:weather minim|VFR minim|visibility|cloud clearance|special VFR)\b/i,
    terms: '14 CFR 91.155 91.157 basic VFR weather minimums visibility cloud clearance special VFR' },
  { pattern: /\b(?:annual|100.hour|inspection|airworth|maintenance|progressive)\b/i,
    terms: '14 CFR 91.409 91.403 91.417 annual 100-hour progressive inspection airworthiness maintenance records' },
  { pattern: /\b(?:student pilot|solo (?:flight|require|endorse)|pre.solo)\b/i,
    terms: '14 CFR 61.87 61.89 61.93 student pilot solo requirements endorsement limitations' },
  { pattern: /\b(?:private pilot|PPL|private certificate)\b/i,
    terms: '14 CFR 61.103 61.109 private pilot certificate aeronautical experience training requirements' },
  { pattern: /\b(?:commercial pilot|CPL|commercial certificate|commercial require)\b/i,
    terms: '14 CFR 61.121 61.129 commercial pilot certificate requirements privileges limitations' },
  { pattern: /\b(?:ATP|airline transport pilot)\b/i,
    terms: '14 CFR 61.153 61.159 airline transport pilot certificate requirements' },
  { pattern: /\b(?:CFI|flight instructor|CFII|MEI|instructor certificate)\b/i,
    terms: '14 CFR 61.183 61.187 61.195 61.197 flight instructor certificate renewal requirements' },
  { pattern: /\b(?:cross.?country|XC)\b/i,
    terms: '14 CFR 61.1 cross-country flight definition distance requirements landing point' },
  { pattern: /\b(?:weight.and.balance|CG|center of gravity|loading|moment|arm)\b/i,
    terms: 'weight and balance center of gravity CG limits loading moment arm envelope PHAK' },
  { pattern: /\b(?:emergency|engine fail|engine out|forced landing|mayday)\b/i,
    terms: '14 CFR 91.3 PIC authority emergency procedures engine failure forced landing' },
  { pattern: /\b(?:ADS.?B|transponder|mode.?[CS]|equipment require)\b/i,
    terms: '14 CFR 91.215 91.225 91.227 ADS-B transponder equipment requirements' },
  { pattern: /\b(?:fuel\s+(?:require|reserve|minimum|plan)|fuel$)\b/i,
    terms: '14 CFR 91.151 91.167 fuel requirements VFR day night IFR 30 45 minutes reserve' },
  { pattern: /\b(?:NTSB|accident|incident|crash)\b/i,
    terms: 'NTSB aviation accident report probable cause narrative aircraft' },
  { pattern: /\b(?:logbook|log (?:time|flight|require)|record(?:keep)?|endorsement)\b/i,
    terms: '14 CFR 61.51 pilot logbook aeronautical experience endorsement record requirements' },
  { pattern: /\b(?:ACS|practical test|checkride|DPE|oral exam|PTS)\b/i,
    terms: 'ACS airman certification standards practical test standards checkride DPE oral examination' },
  { pattern: /\b(?:knowledge test|written test|test prep|practice question|sample question|written exam|FAA exam)\b/i,
    terms: 'FAA knowledge test question written examination airman certification sample questions multiple choice' },
  { pattern: /\b(?:alcohol|drink|drug|8 hours|bottle to throttle)\b/i,
    terms: '14 CFR 91.17 alcohol drugs 8 hours bottle to throttle 0.04 BAC' },
  { pattern: /\b(?:career|airline (?:pilot|hiring)|regional|1500 hour|ATP (?:minim|require))\b/i,
    terms: 'pilot career pathway airline hiring regional carrier 1500 hour rule restricted ATP R-ATP' },
  { pattern: /\b(?:density altitude|performance|takeoff (?:distance|roll)|climb (?:rate|performance))\b/i,
    terms: 'density altitude performance takeoff distance climb rate Koch chart pressure altitude temperature' },
  { pattern: /\b(?:oxygen|supplemental oxygen|cabin altitude|pressuri)\b/i,
    terms: '14 CFR 91.211 supplemental oxygen requirements cabin pressure altitude 12500 14000' },
];

const ACRONYM_MAP: Record<string, string> = {
  'ARROW': 'airworthiness registration operating limitations weight balance',
  'IMSAFE': 'illness medication stress alcohol fatigue eating checklist',
  'PAVE': 'pilot aircraft environment external pressures risk',
  'METAR': 'aviation routine weather report observation',
  'TAF': 'terminal aerodrome forecast',
  'SIGMET': 'significant meteorological information',
  'PIREP': 'pilot report weather',
  'POH': 'pilot operating handbook',
  'ATIS': 'automatic terminal information service',
  'CTAF': 'common traffic advisory frequency',
  'NOTAM': 'notice to air missions',
};

export function augmentQuery(query: string, mode: DashTwoMode): string {
  if (mode === 'support') return query;

  const augmentations: string[] = [];
  let matchCount = 0;
  for (const rule of AUGMENTATION_RULES) {
    if (matchCount >= 3) break;
    if (rule.pattern.test(query)) {
      augmentations.push(rule.terms);
      matchCount++;
    }
  }

  let acronymCount = 0;
  const words = query.split(/\s+/);
  for (const word of words) {
    if (acronymCount >= 3) break;
    const clean = word.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (clean.length >= 2 && ACRONYM_MAP[clean]) {
      augmentations.push(ACRONYM_MAP[clean]);
      acronymCount++;
    }
  }

  if (augmentations.length === 0) return query;
  return `${query}\n\n[Relevant search terms: ${augmentations.join('; ')}]`;
}
