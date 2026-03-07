import { useChatStore } from '@/stores/chatStore';
import { CONVERSATION_STARTERS } from '@/types/chat';

export function WelcomeScreen() {
  const { currentMode, sendMessage } = useChatStore();
  const starters = CONVERSATION_STARTERS[currentMode];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-16">
      <div className="text-center mb-12">
        <img src="/dashtwo-icon.png" alt="DashTwo" className="h-14 w-14 mx-auto mb-4 object-contain" />
        <h1 className="text-2xl font-semibold text-heading mb-3">
          How can I help with your flying?
        </h1>
        <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
          515K+ FAA documents — regulations, AIM, handbooks, ACS standards, advisory circulars.
          Every answer backed by source citations.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {starters.map((starter, i) => (
            <button
              key={i}
              onClick={() => sendMessage(starter)}
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
