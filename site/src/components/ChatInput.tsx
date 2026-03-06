import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';

export function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming, stopStreaming } = useChatStore();

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="relative max-w-3xl mx-auto">
        <div className="flex items-end bg-panel border border-edge rounded-2xl shadow-lg focus-within:border-aero-blue/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask DashTwo anything about aviation..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-[15px] text-heading rounded-2xl px-5 py-3.5 focus:outline-none placeholder:text-faint min-h-[52px]"
            disabled={isStreaming}
          />
          <div className="pr-2 pb-2">
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="p-2 rounded-xl bg-active hover:bg-active text-body transition-colors btn-press"
                title="Stop generating"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-aero-blue hover:bg-aero-blue-dark text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed btn-press"
                title="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12l6-6 6 6M12 6v12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-faint text-center mt-2">
          DashTwo can make mistakes. Verify critical information against official FAA sources.
        </p>
      </div>
    </div>
  );
}
