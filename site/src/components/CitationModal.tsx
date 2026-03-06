import { useState } from 'react';
import type { DashTwoCitation } from '@/types/chat';

interface CitationModalProps {
  citation: DashTwoCitation;
  onClose: () => void;
}

const TYPE_COLORS: Record<DashTwoCitation['type'], string> = {
  regulation: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  aim: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  ac: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  document: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  training: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  ntsb: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const TYPE_LABELS: Record<string, string> = {
  regulation: 'Federal Regulation',
  aim: 'Aeronautical Information Manual',
  ac: 'Advisory Circular',
  document: 'FAA Document',
  training: 'Training Handbook',
  ntsb: 'NTSB Report',
};

export function CitationModal({ citation, onClose }: CitationModalProps) {
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasFullText = citation.fullText && citation.fullText !== citation.snippet;
  const displayText = showFull && citation.fullText ? citation.fullText : citation.snippet;
  const colors = TYPE_COLORS[citation.type] || TYPE_COLORS.document;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-panel rounded-xl border border-edge max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-3 border-b border-edge">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${colors}`}>
                  {TYPE_LABELS[citation.type] || 'Source'}
                </span>
                {citation.pageNumber && (
                  <span className="text-[10px] text-faint">p. {citation.pageNumber}</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-heading">{citation.source}</h3>
              {citation.title !== citation.source && (
                <p className="text-xs text-muted mt-0.5">{citation.title}</p>
              )}
            </div>
            <button onClick={onClose} className="shrink-0 p-1 text-muted hover:text-heading">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {displayText ? (
            <p className="text-sm text-body whitespace-pre-wrap leading-relaxed">
              {displayText}
            </p>
          ) : (
            <p className="text-sm text-faint italic">
              This reference was mentioned by DashTwo but the full text wasn't retrieved from the knowledge base.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 border-t border-edge flex items-center gap-3">
          {hasFullText && (
            <button
              onClick={() => setShowFull(!showFull)}
              className="text-xs text-muted hover:text-heading transition-colors"
            >
              {showFull ? 'Show relevant section' : 'Show full document'}
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleCopy}
            className="text-xs text-muted hover:text-heading flex items-center gap-1 transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
          {citation.sourceUrl && (
            <a
              href={citation.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-aero-blue-light hover:text-aero-blue flex items-center gap-1"
            >
              View official source
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
