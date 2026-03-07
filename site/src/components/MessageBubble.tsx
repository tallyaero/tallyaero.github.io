import { useState, useRef, useEffect, memo } from 'react';
import type { ChatMessage, DashTwoCitation } from '@/types/chat';
import { CitationCard } from './CitationCard';
import { CitationModal } from './CitationModal';
import { MarkdownContent } from './MarkdownContent';
import { UpgradeCard } from './UpgradeCard';
import { useChatStore } from '@/stores/chatStore';

async function createShare(content: string, query: string | undefined, citations: DashTwoCitation[] | undefined, mode: string): Promise<string | null> {
  try {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'message', content, query, citations, mode }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.shareId;
  } catch {
    return null;
  }
}

/** Web Animation API — React re-renders cannot restart this */
const LoadingIndicator = memo(function LoadingIndicator() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const anim = el.animate(
      [
        { transform: 'scale(0.85)', opacity: 0.5 },
        { transform: 'scale(1.15)', opacity: 1 },
        { transform: 'scale(0.85)', opacity: 0.5 },
      ],
      { duration: 1800, iterations: Infinity, easing: 'ease-in-out' }
    );
    return () => anim.cancel();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
      <img
        ref={imgRef}
        src="/dashtwo-icon.png"
        alt=""
        style={{ width: 22, height: 22, objectFit: 'contain' }}
      />
      <span className="text-sm text-muted">Standby, checking sources...</span>
    </div>
  );
});

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  // Only the streaming bubble subscribes to streamingContent — isolates re-renders
  const streamingContent = useChatStore(s => isStreaming ? s.streamingContent : undefined);
  const [selectedCitation, setSelectedCitation] = useState<DashTwoCitation | null>(null);
  const [showCitations, setShowCitations] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const feedbackInputRef = useRef<HTMLTextAreaElement>(null);
  const setFeedback = useChatStore(s => s.setFeedback);
  const editMessage = useChatStore(s => s.editMessage);
  const regenerateResponse = useChatStore(s => s.regenerateResponse);
  const messages = useChatStore(s => s.messages);
  const currentMode = useChatStore(s => s.currentMode);
  const chatIsStreaming = useChatStore(s => s.isStreaming);
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'shared'>('idle');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (showFeedbackInput) feedbackInputRef.current?.focus();
  }, [showFeedbackInput]);

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      // Auto-resize
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = editTextareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const content = isStreaming ? (streamingContent || '') : message.content;
  const isUser = message.role === 'user';
  const hasCitations = !isUser && message.citations && message.citations.length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };

  const submitEdit = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content) {
      editMessage(message.id, trimmed);
    }
    setIsEditing(false);
  };

  if (isUser) {
    return (
      <div className="group flex justify-end">
        <div className="max-w-[75%]">
          {isEditing ? (
            <div className="bg-user-bubble rounded-2xl rounded-br-md px-5 py-3">
              <textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={e => {
                  setEditContent(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(); }
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="w-full bg-transparent text-[15px] text-heading leading-relaxed focus:outline-none resize-none min-w-[200px]"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs text-muted hover:text-heading rounded-lg hover:bg-hover transition-colors">
                  Cancel
                </button>
                <button onClick={submitEdit} className="px-3 py-1 text-xs bg-aero-blue hover:bg-aero-blue-dark text-white rounded-lg transition-colors">
                  Send
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-user-bubble rounded-2xl rounded-br-md px-5 py-3">
                <p className="text-[15px] text-heading leading-relaxed whitespace-pre-wrap">{content}</p>
              </div>
              {/* Time + edit — appears on hover, same line */}
              <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[11px] text-faint">{formatTime(message.timestamp)}</span>
                {!chatIsStreaming && (
                  <button
                    onClick={handleEdit}
                    className="p-1 rounded-lg text-faint hover:text-body hover:bg-hover transition-colors"
                    title="Edit message"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Assistant message — Claude/Gemini style: full-width, no bubble, with avatar
  return (
    <>
      <div className="group">
        {/* Avatar + name row — hidden during loading since LoadingIndicator has its own icon */}
        {!(isStreaming && !content) && (
          <div className="flex items-center gap-2.5 mb-2">
            <img src="/dashtwo-icon.png" alt="DashTwo" className="w-7 h-7 object-contain" />
            <span className="text-sm font-medium text-heading">DashTwo</span>
          </div>
        )}

        {/* Response content — full width, rendered markdown */}
        {isStreaming && !content ? (
          <LoadingIndicator />
        ) : (
          <div className="pl-[34px] text-[15px] text-body">
            {content ? <MarkdownContent content={content} /> : null}
            {content.includes('Upgrade to Pro') && <UpgradeCard inline />}
          </div>
        )}

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

        {/* Action buttons — appears on hover like Claude */}
        {!isStreaming && content && (
          <div className="pl-[34px] mt-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[11px] text-faint mr-1.5">{formatTime(message.timestamp)}</span>
            {/* Thumbs up */}
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
            {/* Thumbs down */}
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
            {/* Copy with checkmark */}
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg transition-colors ${
                copied ? 'text-green-400' : 'text-faint hover:text-body hover:bg-hover'
              }`}
              title={copied ? 'Copied!' : 'Copy response'}
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            {/* Share */}
            <button
              onClick={async () => {
                if (shareState !== 'idle') return;
                setShareState('sharing');
                const msgIndex = messages.findIndex(m => m.id === message.id);
                const prevUserMsg = msgIndex > 0 ? messages.slice(0, msgIndex).reverse().find(m => m.role === 'user') : undefined;
                const shareId = await createShare(content, prevUserMsg?.content, message.citations, currentMode);
                if (shareId) {
                  const shareUrl = `${window.location.origin}/share/${shareId}`;
                  if (navigator.share) {
                    navigator.share({ title: 'DashTwo Response', url: shareUrl }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                  }
                  setShareState('shared');
                  setTimeout(() => setShareState('idle'), 2000);
                } else {
                  setShareState('idle');
                }
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                shareState === 'shared' ? 'text-green-400' : 'text-faint hover:text-body hover:bg-hover'
              }`}
              title={shareState === 'shared' ? 'Link copied!' : 'Share response'}
            >
              {shareState === 'shared' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>
            {/* Regenerate */}
            <button
              onClick={() => regenerateResponse(message.id)}
              className="p-1.5 rounded-lg text-faint hover:text-body hover:bg-hover transition-colors"
              title="Regenerate response"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
              className="self-end px-4 py-2 text-sm bg-user-bubble hover:bg-active text-body rounded-xl transition-colors"
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
