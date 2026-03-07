import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MarkdownContent } from '@/components/MarkdownContent';
import { CitationCard } from '@/components/CitationCard';
import { CitationModal } from '@/components/CitationModal';
import type { DashTwoCitation } from '@/types/chat';

interface ShareData {
  id: string;
  type: 'message' | 'conversation';
  content: string;
  query: string | null;
  citations: DashTwoCitation[];
  conversationMessages: Array<{ role: string; content: string; citations?: DashTwoCitation[] }>;
  mode: string;
  createdAt: string;
  viewCount: number;
}

export function SharedPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [share, setShare] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<DashTwoCitation | null>(null);

  useEffect(() => {
    if (!shareId) return;

    document.title = 'Shared Response — DashTwo';

    fetch(`/api/share/${shareId}`)
      .then(res => {
        if (!res.ok) throw new Error('Share not found');
        return res.json();
      })
      .then(data => {
        setShare(data);
        setLoading(false);
      })
      .catch(() => {
        setError('This shared link could not be found or has expired.');
        setLoading(false);
      });
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="flex items-center gap-3">
          <img src="/dashtwo-icon.png" alt="" className="w-8 h-8 object-contain animate-pulse" />
          <span className="text-muted text-sm">Loading shared content...</span>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <img src="/dashtwo-icon.png" alt="" className="w-12 h-12 object-contain mx-auto mb-4 opacity-50" />
          <p className="text-body mb-4">{error || 'Share not found'}</p>
          <Link to="/dashtwo" className="text-sm text-aero-blue hover:underline">
            Go to DashTwo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      {/* Header */}
      <header className="border-b border-edge bg-panel">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/dashtwo" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/dashtwo-icon.png" alt="DashTwo" className="w-7 h-7 object-contain" />
            <span className="text-sm font-medium text-heading">DashTwo</span>
          </Link>
          <span className="text-faint text-xs">Shared response</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {share.type === 'conversation' ? (
          /* Conversation view */
          <div className="space-y-6">
            {share.conversationMessages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[75%] bg-raised rounded-2xl rounded-br-md px-5 py-3">
                      <p className="text-[15px] text-heading leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <img src="/dashtwo-icon.png" alt="DashTwo" className="w-7 h-7 object-contain" />
                      <span className="text-sm font-medium text-heading">DashTwo</span>
                    </div>
                    <div className="pl-[34px] text-[15px] text-body">
                      <MarkdownContent content={msg.content} />
                    </div>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pl-[34px] mt-3 space-y-1 border-l-2 border-edge ml-0.5">
                        {msg.citations.map((citation, ci) => (
                          <CitationCard
                            key={`${citation.source}-${ci}`}
                            citation={citation}
                            index={ci}
                            onClick={() => setSelectedCitation(citation)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Single message view */
          <div>
            {share.query && (
              <div className="flex justify-end mb-6">
                <div className="max-w-[75%] bg-raised rounded-2xl rounded-br-md px-5 py-3">
                  <p className="text-[15px] text-heading leading-relaxed whitespace-pre-wrap">{share.query}</p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <img src="/dashtwo-icon.png" alt="DashTwo" className="w-7 h-7 object-contain" />
                <span className="text-sm font-medium text-heading">DashTwo</span>
              </div>
              <div className="pl-[34px] text-[15px] text-body">
                <MarkdownContent content={share.content} />
              </div>
            </div>

            {share.citations.length > 0 && (
              <div className="pl-[34px] mt-3 space-y-1 border-l-2 border-edge ml-0.5">
                {share.citations.map((citation, i) => (
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

        {/* CTA */}
        <div className="mt-12 border-t border-edge pt-8 text-center">
          <p className="text-body text-sm mb-4">
            Try DashTwo yourself — AI aviation wingman backed by 515K+ FAA documents
          </p>
          <Link
            to="/dashtwo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-aero-blue text-white text-sm font-medium rounded-xl hover:bg-aero-blue/90 transition-colors"
          >
            <img src="/dashtwo-icon.png" alt="" className="w-5 h-5 object-contain" />
            Try DashTwo
          </Link>
        </div>
      </main>

      {selectedCitation && (
        <CitationModal citation={selectedCitation} onClose={() => setSelectedCitation(null)} />
      )}
    </div>
  );
}
