import { useChatStore } from '@/stores/chatStore';
import { MODE_CONFIG, type DashTwoMode } from '@/types/chat';

const MODE_ORDER: DashTwoMode[] = ['general', 'checkride', 'training', 'interview', 'support', 'debrief'];

export function ModeSelector() {
  const { currentMode, setMode } = useChatStore();

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {MODE_ORDER.map(mode => {
        const config = MODE_CONFIG[mode];
        const isActive = mode === currentMode;
        return (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            title={config.description}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'bg-surface-700 text-gray-400 hover:bg-surface-600 hover:text-gray-200'
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
