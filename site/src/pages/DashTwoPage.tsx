import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatView } from '@/components/ChatView';
import { useChatStore } from '@/stores/chatStore';

export function DashTwoPage() {
  const location = useLocation();
  const sendMessage = useChatStore(s => s.sendMessage);

  // Handle DashTwo CTA prompts from landing pages
  useEffect(() => {
    const prompt = (location.state as { prompt?: string })?.prompt;
    if (prompt) {
      sendMessage(prompt);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, sendMessage]);

  return <ChatView />;
}
