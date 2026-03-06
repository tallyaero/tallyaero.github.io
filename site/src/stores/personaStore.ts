/**
 * Persona Store — Zustand store for DashTwo persona configuration
 * Persisted to localStorage under 'dashtwo-persona'
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type PersonaId,
  type MilitaryBranch,
  type PersonaSettings,
  DEFAULT_PERSONA_SETTINGS,
  PERSONA_CATALOG,
} from '@/types/persona';

interface PersonaState extends PersonaSettings {
  setPersona: (id: PersonaId) => void;
  setCallsign: (callsign: string) => void;
  setPilotName: (name: string) => void;
  setMilitaryBranch: (branch: MilitaryBranch) => void;
  setCustomPromptPrefix: (prefix: string) => void;
  getActivePromptPrefix: () => string;
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PERSONA_SETTINGS,

      setPersona: (id) => set({ activePersona: id }),
      setCallsign: (callsign) => set({ callsign }),
      setPilotName: (name) => set({ pilotName: name }),
      setMilitaryBranch: (branch) => set({ militaryBranch: branch }),
      setCustomPromptPrefix: (prefix) => set({ customPromptPrefix: prefix }),

      getActivePromptPrefix: () => {
        const { activePersona, callsign, pilotName, customPromptPrefix } = get();

        if (activePersona === 'custom') {
          return customPromptPrefix || '';
        }

        const config = PERSONA_CATALOG.find((p) => p.id === activePersona);
        if (!config) return '';

        let prefix = config.promptPrefix;
        prefix = prefix.replace(/\{callsign\}/g, callsign || 'pilot');
        prefix = prefix.replace(/\{pilotName\}/g, pilotName || 'pilot');

        return prefix;
      },
    }),
    {
      name: 'dashtwo-persona',
    }
  )
);
