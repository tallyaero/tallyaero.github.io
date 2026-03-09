import { useMemo } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useABStore } from '@/stores/abStore';
import { usePlatform } from '@/contexts/PlatformContext';
import { CONVERSATION_STARTERS } from '@/types/chat';

/** A/B variant starters — 'question_focused' uses more direct questions, 'scenario_based' uses scenarios */
const VARIANT_STARTERS: Record<string, string[]> = {
  question_focused: [
    'What are the minimum weather requirements to fly VFR today?',
    'Am I current to carry passengers at night?',
    'What does the ACS require for a private pilot steep turn?',
    'How do I calculate my weight and balance?',
  ],
  scenario_based: [
    "I'm planning a cross-country tomorrow — what do I need to check?",
    "My instructor said my landings are inconsistent — what's going wrong?",
    "I just got my instrument rating — what should I do to stay proficient?",
    "I'm at a towered airport and ground gave me a confusing taxi instruction",
  ],
};

/** Flight School context starters */
const FSM_STARTERS = [
  'How should I organize my Part 141 training curriculum?',
  'What endorsements does a student need before solo?',
  'How do I track fleet maintenance schedules?',
  'What are the instructor record-keeping requirements under 14 CFR 61.189?',
];

export function WelcomeScreen() {
  const { currentMode, sendMessage } = useChatStore();
  const profile = useAuthStore(s => s.profile);
  const getVariant = useABStore(s => s.getVariant);
  const recordEvent = useABStore(s => s.recordEvent);
  const { mode: platformMode } = usePlatform();

  const starters = useMemo(() => {
    // Flight School context gets its own starters
    if (platformMode === 'flight-school') {
      return FSM_STARTERS;
    }

    // Only A/B test the auto/general modes
    if (currentMode !== 'auto' && currentMode !== 'general') {
      return CONVERSATION_STARTERS[currentMode];
    }

    const variant = getVariant('welcome_starters');
    const base = VARIANT_STARTERS[variant] || CONVERSATION_STARTERS[currentMode];

    // Contextual: if user has an aircraft type, swap in an aircraft-specific starter
    if (profile?.aircraftType) {
      const aircraftStarter = `What are the key V-speeds and limitations for a ${profile.aircraftType}?`;
      return [aircraftStarter, ...base.slice(0, 3)];
    }

    return base;
  }, [currentMode, profile?.aircraftType, getVariant, platformMode]);

  const handleStarterClick = (starter: string) => {
    recordEvent('welcome_starters', 'click');
    sendMessage(starter);
  };

  const heading = platformMode === 'flight-school'
    ? 'How can I help with your flight school?'
    : 'How can I help with your flying?';

  const description = platformMode === 'flight-school'
    ? 'Student management, fleet operations, scheduling, endorsements — backed by 515K+ FAA documents.'
    : '515K+ FAA documents — regulations, AIM, handbooks, ACS standards, advisory circulars. Every answer backed by source citations.';

  return (
    <div className="flex flex-col items-center h-full px-4 sm:px-6 pt-[15vh] pb-8">
      <div className="text-center mb-8 sm:mb-12">
        <img src="/dashtwo-icon.png" alt="DashTwo" className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-3 sm:mb-4 object-contain" />
        <h1 className="text-xl sm:text-2xl font-semibold text-heading mb-2 sm:mb-3">
          {heading}
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {starters.map((starter, i) => (
            <button
              key={i}
              onClick={() => handleStarterClick(starter)}
              className="text-left px-4 py-3.5 text-[14px] text-body hover:text-heading bg-panel hover:bg-hover rounded-xl border border-edge hover:border-edge transition-all btn-press"
            >
              {starter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
