import { useState, useRef, useEffect } from 'react';
import type { ChatMessage, DashTwoCitation } from '@/types/chat';
import { CitationCard } from './CitationCard';
import { CitationModal } from './CitationModal';
import { MarkdownContent } from './MarkdownContent';
import { useChatStore } from '@/stores/chatStore';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  streamingContent?: string;
}

export function MessageBubble({ message, isStreaming, streamingContent }: MessageBubbleProps) {
  const [selectedCitation, setSelectedCitation] = useState<DashTwoCitation | null>(null);
  const [showCitations, setShowCitations] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const feedbackInputRef = useRef<HTMLTextAreaElement>(null);
  const setFeedback = useChatStore(s => s.setFeedback);

  useEffect(() => {
    if (showFeedbackInput) feedbackInputRef.current?.focus();
  }, [showFeedbackInput]);

  const content = isStreaming ? (streamingContent || '') : message.content;
  const isUser = message.role === 'user';
  const hasCitations = !isUser && message.citations && message.citations.length > 0;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-raised rounded-2xl rounded-br-md px-5 py-3">
          <p className="text-[15px] text-heading leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  // Assistant message — Claude/Gemini style: full-width, no bubble, with avatar
  return (
    <>
      <div className="group">
        {/* Avatar + name row */}
        <div className="flex items-center gap-2.5 mb-2">
          <img src="/dashtwo-icon.jpg" alt="DashTwo" className="w-6 h-6 object-contain" />
          <span className="text-sm font-medium text-heading">DashTwo</span>
          {message.model && (
            <span className="text-[11px] text-faint">
              {message.model.includes('haiku') ? 'Haiku' : message.model.includes('sonnet') ? 'Sonnet' : ''}
            </span>
          )}
        </div>

        {/* Response content — full width, rendered markdown */}
        <div className="pl-[34px] text-[15px] text-body">
          {content ? (
            <MarkdownContent content={content} />
          ) : null}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-aero-blue-light/70 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
          )}
        </div>

        {/* Citations */}
        {hasCitations && (
          <div className="pl-[34px] mt-3">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center gap-1.5 text-xs text-faint hover:text-heading transition-colors"
            >
              <svg className={`w-3.5 h-3.5 transition-transform ${showCitations ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {message.citations!.length} source{message.citations!.length !== 1 ? 's' : ''} cited
            </button>
            {showCitations && (
              <div className="mt-2 space-y-1 border-l-2 border-edge ml-0.5">
                {message.citations!.map((citation, i) => (
                  <CitationCard
                    key={`${citation.source}-${i}`}
                    citation={citation}
                    index={i}
                    onClick={() => setSelectedCitation(citation)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback — appears on hover like Claude */}
        {!isStreaming && content && (
          <div className="pl-[34px] mt-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setFeedback(message.id, 'up')}
              className={`p-1.5 rounded-lg transition-colors ${
                message.feedback === 'up' ? 'text-green-400 bg-green-400/10' : 'text-faint hover:text-body hover:bg-hover'
              }`}
              title="Good response"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button
              onClick={() => {
                setFeedback(message.id, 'down');
                if (message.feedback !== 'down') setShowFeedbackInput(true);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                message.feedback === 'down' ? 'text-red-400 bg-red-400/10' : 'text-faint hover:text-body hover:bg-hover'
              }`}
              title="Bad response"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(content); }}
              className="p-1.5 rounded-lg text-faint hover:text-body hover:bg-hover transition-colors"
              title="Copy response"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        )}

        {/* Feedback text input */}
        {showFeedbackInput && message.feedback === 'down' && (
          <div className="pl-[34px] mt-2 flex gap-2 max-w-md">
            <textarea
              ref={feedbackInputRef}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="What was wrong? (optional)"
              rows={2}
              maxLength={500}
              className="flex-1 bg-panel border border-edge rounded-xl px-3 py-2 text-sm text-heading placeholder-faint focus:outline-none focus:border-aero-blue resize-none"
            />
            <button
              onClick={() => {
                setFeedback(message.id, 'down', feedbackText || undefined);
                setShowFeedbackInput(false);
                setFeedbackText('');
              }}
              className="self-end px-4 py-2 text-sm bg-raised hover:bg-active text-body rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {selectedCitation && (
        <CitationModal citation={selectedCitation} onClose={() => setSelectedCitation(null)} />
      )}
    </>
  );
}
