import { useRef, useEffect, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import { LoadingLogo } from './LoadingLogo';

export function ChatView() {
  const { messages, isStreaming, streamingContent } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  // Detect when user scrolls away from bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Consider "at bottom" if within 80px of the end
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    userScrolledUp.current = !atBottom;
  }, []);

  // Auto-scroll only if user hasn't scrolled up
  useEffect(() => {
    if (scrollRef.current && !userScrolledUp.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Reset scroll lock when a new user message is sent (messages array grows)
  const prevMessageCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'user') {
        userScrolledUp.current = false;
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-base">
      {/* Messages area — full height, no header bar */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {hasMessages ? (
          <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
            {messages.map((msg, i) => {
              const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
              const isThinking = isLastAssistant && isStreaming && !streamingContent;
              if (isThinking) {
                return (
                  <div key={msg.id} className="flex items-center gap-3">
                    <LoadingLogo size={24} />
                    <span className="text-sm text-muted">Searching FAA knowledge base...</span>
                  </div>
                );
              }
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={isLastAssistant && isStreaming}
                  streamingContent={isLastAssistant && isStreaming ? streamingContent : undefined}
                />
              );
            })}
          </div>
        ) : (
          <WelcomeScreen />
        )}
      </div>

      {/* Input */}
      <div className="shrink-0">
        <ChatInput />
      </div>
    </div>
  );
}
