import { useState } from 'react';
import { usePersonaStore } from '@/stores/personaStore';
import { PERSONA_CATALOG, MILITARY_PERSONAS, type PersonaId, type MilitaryBranch } from '@/types/persona';

const BRANCH_OPTIONS: { value: MilitaryBranch; label: string }[] = [
  { value: 'air_force', label: 'Air Force' },
  { value: 'navy', label: 'Navy' },
  { value: 'marines', label: 'Marines' },
  { value: 'army', label: 'Army' },
  { value: 'coast_guard', label: 'Coast Guard' },
];

export function PersonaSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    activePersona,
    callsign,
    pilotName,
    militaryBranch,
    customPromptPrefix,
    setPersona,
    setCallsign,
    setPilotName,
    setMilitaryBranch,
    setCustomPromptPrefix,
  } = usePersonaStore();

  const activeConfig = PERSONA_CATALOG.find(p => p.id === activePersona);
  const isMilitary = MILITARY_PERSONAS.includes(activePersona);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-gray-200 bg-surface-700 hover:bg-surface-600 rounded-full transition-colors"
        title={activeConfig?.description}
      >
        <span className="text-brand-400">{activeConfig?.label || 'Persona'}</span>
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Persona grid */}
            <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
              {PERSONA_CATALOG.map(persona => (
                <button
                  key={persona.id}
                  onClick={() => setPersona(persona.id as PersonaId)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    persona.id === activePersona
                      ? 'bg-brand-600/20 border border-brand-600/40'
                      : 'hover:bg-surface-700 border border-transparent'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-100">{persona.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{persona.description}</div>
                </button>
              ))}
            </div>

            {/* Personalization fields */}
            <div className="border-t border-surface-600 p-3 space-y-2.5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Callsign</label>
                <input
                  type="text"
                  value={callsign}
                  onChange={e => setCallsign(e.target.value)}
                  placeholder="e.g. Maverick"
                  maxLength={20}
                  className="w-full bg-surface-700 border border-surface-600 rounded-lg px-2.5 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-600"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Pilot Name</label>
                <input
                  type="text"
                  value={pilotName}
                  onChange={e => setPilotName(e.target.value)}
                  placeholder="e.g. Pete Mitchell"
                  maxLength={40}
                  className="w-full bg-surface-700 border border-surface-600 rounded-lg px-2.5 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-600"
                />
              </div>

              {/* Military branch — only for military personas */}
              {isMilitary && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Branch</label>
                  <div className="flex flex-wrap gap-1">
                    {BRANCH_OPTIONS.map(b => (
                      <button
                        key={b.value}
                        onClick={() => setMilitaryBranch(militaryBranch === b.value ? null : b.value)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          militaryBranch === b.value
                            ? 'bg-brand-600 text-white'
                            : 'bg-surface-700 text-gray-400 hover:bg-surface-600'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom prompt — only for custom persona */}
              {activePersona === 'custom' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Custom Instructions</label>
                  <textarea
                    value={customPromptPrefix}
                    onChange={e => setCustomPromptPrefix(e.target.value)}
                    placeholder="Define how DashTwo should communicate..."
                    maxLength={500}
                    rows={3}
                    className="w-full bg-surface-700 border border-surface-600 rounded-lg px-2.5 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-600 resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
