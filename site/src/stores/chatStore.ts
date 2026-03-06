import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, Conversation, DashTwoMode, ConversationHistory, DashTwoCitation } from '@/types/chat';
import { usePersonaStore } from './personaStore';
import { auth } from '@/lib/firebase';

interface ChatState {
  // Current conversation
  messages: ChatMessage[];
  currentMode: DashTwoMode;
  isStreaming: boolean;
  streamingContent: string;
  abortController: AbortController | null;

  // Conversation management
  conversations: Conversation[];
  activeConversationId: string | null;

  // Actions
  sendMessage: (query: string) => Promise<void>;
  setMode: (mode: DashTwoMode) => void;
  stopStreaming: () => void;
  newConversation: () => void;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  setFeedback: (messageId: string, feedback: 'up' | 'down', text?: string) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function buildConversationHistory(messages: ChatMessage[]): ConversationHistory[] {
  return messages.map(m => ({ role: m.role, content: m.content }));
}

function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.slice(0, 60);
  return trimmed.length < firstMessage.length ? trimmed + '...' : trimmed;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
  messages: [],
  currentMode: 'auto',
  isStreaming: false,
  streamingContent: '',
  abortController: null,
  conversations: [],
  activeConversationId: null,

  setMode: (mode) => set({ currentMode: mode }),

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isStreaming: false, abortController: null });
    }
  },

  newConversation: () => {
    const state = get();
    // Save current conversation if it has messages
    if (state.messages.length > 0) {
      const convId = state.activeConversationId || generateId();
      const existing = state.conversations.find(c => c.id === convId);
      const conv: Conversation = {
        id: convId,
        title: existing?.title || generateTitle(state.messages[0].content),
        messages: state.messages,
        mode: state.currentMode,
        createdAt: existing?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [conv, ...state.conversations.filter(c => c.id !== convId)];
      set({
        conversations: updated,
        messages: [],
        activeConversationId: null,
        streamingContent: '',
      });
    } else {
      set({ messages: [], activeConversationId: null, streamingContent: '' });
    }
  },

  loadConversation: (id) => {
    const state = get();
    const conv = state.conversations.find(c => c.id === id);
    if (conv) {
      // Save current first
      if (state.messages.length > 0 && state.activeConversationId !== id) {
        const currentId = state.activeConversationId || generateId();
        const currentConv: Conversation = {
          id: currentId,
          title: generateTitle(state.messages[0].content),
          messages: state.messages,
          mode: state.currentMode,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        const updated = [currentConv, ...state.conversations.filter(c => c.id !== currentId)];
        set({
          conversations: updated,
          messages: conv.messages,
          currentMode: conv.mode,
          activeConversationId: id,
        });
      } else {
        set({
          messages: conv.messages,
          currentMode: conv.mode,
          activeConversationId: id,
        });
      }
    }
  },

  setFeedback: (messageId, feedback, text) => {
    set(state => ({
      messages: state.messages.map(m =>
        m.id === messageId ? { ...m, feedback, feedbackText: text } : m
      ),
    }));
  },

  deleteConversation: (id) => {
    set(state => ({
      conversations: state.conversations.filter(c => c.id !== id),
      ...(state.activeConversationId === id ? { messages: [], activeConversationId: null } : {}),
    }));
  },

  sendMessage: async (query) => {
    const state = get();
    if (state.isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: Date.now(),
      mode: state.currentMode,
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode: state.currentMode,
    };

    const abortController = new AbortController();

    set({
      messages: [...state.messages, userMessage, assistantMessage],
      isStreaming: true,
      streamingContent: '',
      abortController,
    });

    // Assign conversation ID if new
    if (!state.activeConversationId) {
      set({ activeConversationId: generateId() });
    }

    try {
      // Get auth token if signed in
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch {
          // Continue without auth
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          mode: state.currentMode,
          personaPrefix: usePersonaStore.getState().getActivePromptPrefix(),
          conversationHistory: buildConversationHistory(state.messages),
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let citations: DashTwoCitation[] = [];
      let model = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);

            switch (event.type) {
              case 'text':
                fullContent += event.content;
                set({ streamingContent: fullContent });
                break;

              case 'citations':
                citations = event.citations;
                break;

              case 'mode_switch':
                set({ currentMode: event.mode });
                break;

              case 'done':
                model = event.usage?.model || '';
                break;

              case 'daily_limit':
                fullContent = event.message;
                break;

              case 'error':
                fullContent = `Error: ${event.message}`;
                break;
            }
          } catch {
            // Skip malformed SSE events
          }
        }
      }

      // Finalize the assistant message
      set(state => {
        const updatedMessages = state.messages.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: fullContent, citations, model }
            : m
        );
        // Save to conversations list so sidebar stays in sync
        const convId = state.activeConversationId!;
        const existing = state.conversations.find(c => c.id === convId);
        const conv: Conversation = {
          id: convId,
          title: existing?.title || generateTitle(updatedMessages[0]?.content || 'New chat'),
          messages: updatedMessages,
          mode: state.currentMode,
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now(),
        };
        return {
          messages: updatedMessages,
          conversations: [conv, ...state.conversations.filter(c => c.id !== convId)],
          isStreaming: false,
          streamingContent: '',
          abortController: null,
        };
      });

    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled — keep partial content
        const partial = get().streamingContent;
        set(state => ({
          messages: state.messages.map(m =>
            m.id === assistantMessage.id
              ? { ...m, content: partial || 'Cancelled.' }
              : m
          ),
          isStreaming: false,
          streamingContent: '',
          abortController: null,
        }));
        return;
      }

      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      set(state => ({
        messages: state.messages.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: `Error: ${errorMsg}` }
            : m
        ),
        isStreaming: false,
        streamingContent: '',
        abortController: null,
      }));
    }
  },
}),
    {
      name: 'dashtwo-conversations',
      partialize: (state) => ({
        conversations: state.conversations,
        currentMode: state.currentMode,
        messages: state.messages,
        activeConversationId: state.activeConversationId,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<ChatState>),
        // Never restore transient streaming state
        isStreaming: false,
        streamingContent: '',
        abortController: null,
      }),
    }
  )
);
