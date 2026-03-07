import { useRef, useEffect, useCallback, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';

export function ChatView() {
  const messages = useChatStore(s => s.messages);
  const isStreaming = useChatStore(s => s.isStreaming);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Detect when user scrolls away from bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    userScrolledUp.current = !atBottom;
    setShowScrollBtn(!atBottom && messages.length > 0);
  }, [messages.length]);

  // Suppress streaming auto-scroll briefly after sending a new message
  const justSentRef = useRef(false);

  // Auto-scroll during streaming
  useEffect(() => {
    const unsub = useChatStore.subscribe((state) => {
      if (state.isStreaming && scrollRef.current && !userScrolledUp.current && !justSentRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
    return unsub;
  }, []);

  // When streaming starts, scroll the latest user message to the top of the viewport
  const wasStreaming = useRef(false);
  useEffect(() => {
    if (isStreaming && !wasStreaming.current) {
      // Streaming just started — scroll user message to top
      userScrolledUp.current = false;
      setShowScrollBtn(false);
      justSentRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const container = scrollRef.current;
          if (!container) return;
          const messageList = container.querySelector('[data-messages]');
          if (messageList && messageList.children.length >= 2) {
            const userMsgEl = messageList.children[messageList.children.length - 2] as HTMLElement;
            const containerRect = container.getBoundingClientRect();
            const msgRect = userMsgEl.getBoundingClientRect();
            const scrollTarget = container.scrollTop + (msgRect.top - containerRect.top) - 24;
            container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          }
          setTimeout(() => { justSentRef.current = false; }, 1200);
        });
      });
    }
    wasStreaming.current = isStreaming;
  }, [isStreaming]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      userScrolledUp.current = false;
      setShowScrollBtn(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-base relative">
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
        {hasMessages ? (
          <div data-messages className="max-w-3xl mx-auto px-5 py-8 space-y-8">
            {messages.map((msg, i) => {
              const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
              return (
                <div key={msg.id}>
                  <MessageBubble
                    message={msg}
                    isStreaming={isLastAssistant && isStreaming}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute left-1/2 -translate-x-1/2 bottom-24 z-10 p-2 bg-panel border border-edge rounded-full shadow-lg text-muted hover:text-heading hover:bg-hover transition-all"
          title="Scroll to bottom"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      <div className="shrink-0">
        <ChatInput />
      </div>
    </div>
  );
}
