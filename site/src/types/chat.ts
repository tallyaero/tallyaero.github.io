/** DashTwo public chatbot types */

export type DashTwoMode =
  | 'auto'
  | 'general'
  | 'checkride'
  | 'support'
  | 'interview'
  | 'training'
  | 'debrief';

export interface DashTwoCitation {
  source: string;
  title: string;
  snippet: string;
  fullText?: string;
  type: 'regulation' | 'aim' | 'ac' | 'document' | 'training' | 'ntsb';
  sourceUrl?: string;
  pageNumber?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: DashTwoCitation[];
  mode?: DashTwoMode;
  model?: string;
  timestamp: number;
  feedback?: 'up' | 'down';
  feedbackText?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  mode: DashTwoMode;
  createdAt: number;
  updatedAt: number;
}

export interface ConversationHistory {
  role: 'user' | 'assistant';
  content: string;
}

/** SSE event types from the streaming API */
export type SSEEvent =
  | { type: 'text'; content: string }
  | { type: 'citations'; citations: DashTwoCitation[] }
  | { type: 'done'; usage: { inputTokens: number; outputTokens: number; model: string } }
  | { type: 'error'; message: string }
  | { type: 'mode_switch'; mode: DashTwoMode; reason: string };

export interface ChatRequest {
  query: string;
  mode: DashTwoMode;
  personaPrefix?: string;
  conversationHistory: ConversationHistory[];
}

export const MODE_CONFIG: Record<DashTwoMode, { label: string; description: string; icon: string }> = {
  auto: {
    label: 'Auto',
    description: 'DashTwo detects the best mode from your message',
    icon: 'sparkles',
  },
  general: {
    label: 'General',
    description: 'Aviation knowledge — regs, AIM, weather, planning',
    icon: 'compass',
  },
  checkride: {
    label: 'Checkride Prep',
    description: 'DPE simulator — oral and practical prep',
    icon: 'clipboard-check',
  },
  training: {
    label: 'Training Coach',
    description: 'Gap analysis, drill routing, readiness assessment',
    icon: 'academic-cap',
  },
  interview: {
    label: 'Interview Prep',
    description: 'Airline interview — HR, technical, CRM scenarios',
    icon: 'briefcase',
  },
  support: {
    label: 'Logging Help',
    description: 'Logbook questions — what to log, how to log it',
    icon: 'book-open',
  },
  debrief: {
    label: 'Debrief',
    description: 'Post-flight analysis and after-action reports',
    icon: 'chat-bubble',
  },
};

/** Conversation starters per mode */
export const CONVERSATION_STARTERS: Record<DashTwoMode, string[]> = {
  auto: [
    'What is DashTwo and why should I trust it?',
    'I have a checkride coming up — help me prepare',
    'What are the VFR weather minimums for Class D airspace?',
    'Debrief my flight with me',
  ],
  general: [
    'What are the VFR weather minimums for Class D airspace?',
    'Explain the difference between Part 91 and Part 135 operations',
    'What are the requirements for a night currency check?',
    'Walk me through the IMSAFE checklist',
  ],
  checkride: [
    'Start a private pilot oral exam practice session',
    'Quiz me on airspace requirements',
    'What ACS areas should I focus on for instrument rating?',
    'Give me a mock checkride scenario for commercial',
  ],
  training: [
    'Analyze my weak areas for private pilot checkride',
    'What should I practice for my instrument proficiency check?',
    'How do I improve my steep turns?',
    'Create a study plan for commercial written exam',
  ],
  interview: [
    'Practice regional airline interview questions',
    'Give me a CRM scenario for a major airline interview',
    'What technical questions should I expect at Delta?',
    'Help me prepare my TMAAT (Tell me about a time) answers',
  ],
  support: [
    'How do I log PIC time vs SIC time?',
    'What counts as cross-country time for instrument requirements?',
    'How should I log simulator time in my logbook?',
    'What endorsements do I need in my logbook for solo?',
  ],
  debrief: [
    'Debrief my cross-country flight — I had trouble with radio calls',
    'Help me analyze what went wrong with my landing today',
    'I just did my first solo — walk me through a debrief',
    'Debrief a flight where I had to divert due to weather',
  ],
};
