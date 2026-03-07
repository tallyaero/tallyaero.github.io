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
  renameConversation: (id: string, title: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  regenerateResponse: (messageId: string) => void;
  clearAllConversations: () => void;
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

  clearAllConversations: () => {
    set({ conversations: [], messages: [], activeConversationId: null, streamingContent: '' });
  },

  renameConversation: (id, title) => {
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === id ? { ...c, title } : c
      ),
    }));
  },

  editMessage: (messageId, newContent) => {
    const state = get();
    if (state.isStreaming) return;
    // Find the message index, truncate everything after it, and resend
    const msgIndex = state.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const truncated = state.messages.slice(0, msgIndex);
    set({ messages: truncated });
    // Send as new message (which will append user + assistant messages)
    get().sendMessage(newContent);
  },

  regenerateResponse: (messageId) => {
    const state = get();
    if (state.isStreaming) return;
    const msgIndex = state.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    // Find the preceding user message
    const prevUserMsg = state.messages.slice(0, msgIndex).reverse().find(m => m.role === 'user');
    if (!prevUserMsg) return;
    // Truncate from the assistant message onward
    const truncated = state.messages.slice(0, msgIndex);
    set({ messages: truncated });
    get().sendMessage(prevUserMsg.content);
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


    // Buffer streaming updates to one per animation frame
    let pendingContent: string | null = null;
    let rafId = 0;
    const flushContent = () => {
      if (pendingContent !== null) {
        set({ streamingContent: pendingContent });
        pendingContent = null;
      }
      rafId = 0;
    };

    // Assign conversation ID if new
    if (!state.activeConversationId) {
      set({ activeConversationId: generateId() });
    }

    const MAX_RETRIES = 2;
    let fullContent = '';
    let citations: DashTwoCitation[] = [];
    let model = '';
    let attempt = 0;
    let succeeded = false;

    while (attempt <= MAX_RETRIES && !succeeded) {
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
                  pendingContent = fullContent;
                  if (!rafId) rafId = requestAnimationFrame(flushContent);
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

        succeeded = true;

      } catch (err) {
        // User abort — don't retry
        if (err instanceof DOMException && err.name === 'AbortError') {
          if (rafId) cancelAnimationFrame(rafId);
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

        // Server errors (4xx/5xx) — don't retry
        const isServerError = err instanceof Error && err.message.startsWith('Server error:');
        if (isServerError || attempt >= MAX_RETRIES) {
          if (rafId) cancelAnimationFrame(rafId);
          // If we got partial content, keep it with a note
          const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
          const finalContent = fullContent
            ? fullContent + '\n\n*[Connection lost — partial response]*'
            : `Error: ${errorMsg}`;
          set(state => ({
            messages: state.messages.map(m =>
              m.id === assistantMessage.id
                ? { ...m, content: finalContent, citations: citations.length ? citations : undefined }
                : m
            ),
            isStreaming: false,
            streamingContent: '',
            abortController: null,
          }));
          return;
        }

        // Network error — retry after brief delay
        attempt++;
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }

    // Cancel any pending animation frame and flush
    if (rafId) cancelAnimationFrame(rafId);
    pendingContent = null;

    // Finalize the assistant message
    set(state => {
      const updatedMessages = state.messages.map(m =>
        m.id === assistantMessage.id
          ? { ...m, content: fullContent, citations, model }
          : m
      );
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
