/**
 * SocialProof — Shows anonymized usage stats on landing pages.
 * Fetches from /api/stats, caches in sessionStorage.
 */

import { useState, useEffect } from 'react';

interface Stats {
  totalPilots: number;
  totalConversations: number;
  totalCitations: number;
  verifiedPilots: number;
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function SocialProof() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Check sessionStorage cache first
    const cached = sessionStorage.getItem('dashtwo_stats');
    if (cached) {
      try {
        const { data, time } = JSON.parse(cached);
        if (Date.now() - time < 5 * 60 * 1000) {
          setStats(data);
          return;
        }
      } catch { /* ignore */ }
    }

    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        sessionStorage.setItem('dashtwo_stats', JSON.stringify({ data, time: Date.now() }));
      })
      .catch(() => {});
  }, []);

  // Don't render until we have data, and only if there are actual users
  if (!stats || stats.totalPilots === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted">
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-aero-blue-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>{formatNum(stats.totalPilots)} pilots</span>
      </div>
      <span className="w-1 h-1 rounded-full bg-active" />
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-aero-blue-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span>{formatNum(stats.totalConversations)} questions answered</span>
      </div>
      {stats.verifiedPilots > 0 && (
        <>
          <span className="w-1 h-1 rounded-full bg-active" />
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{formatNum(stats.verifiedPilots)} verified pilots</span>
          </div>
        </>
      )}
    </div>
  );
}
