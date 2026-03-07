import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatView } from '@/components/ChatView';
import { useChatStore } from '@/stores/chatStore';

export function DashTwoPage() {
  const location = useLocation();
  const sendMessage = useChatStore(s => s.sendMessage);

  // Set page title + canonical
  useEffect(() => {
    document.title = 'DashTwo — AI Aviation Wingman';
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = 'https://tallyaero.com/dashtwo';
    return () => {
      document.title = 'Tally Aero — AI Flight Training Platform';
      if (canonical) canonical.href = 'https://tallyaero.com';
    };
  }, []);

  // Handle DashTwo CTA prompts from landing pages
  useEffect(() => {
    const prompt = (location.state as { prompt?: string })?.prompt;
    if (prompt) {
      sendMessage(prompt);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, sendMessage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + O = new chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        useChatStore.getState().newConversation();
      }
      // Ctrl/Cmd + Shift + S = stop streaming
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        useChatStore.getState().stopStreaming();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return <ChatView />;
}
