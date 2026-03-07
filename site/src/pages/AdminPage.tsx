import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AdminStats {
  funnel: {
    totalUsers: number;
    verifiedUsers: number;
    paidUsers: number;
    freeUsers: number;
  };
  feedback: {
    totalUp: number;
    totalDown: number;
    byMode: Record<string, { up: number; down: number }>;
  };
  todayUsage: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCostCents: number;
    totalMessages: number;
    uniqueUsers: number;
  };
  cfiReferrals: Array<{
    referralCode: string;
    displayName: string;
    studentCount: number;
  }>;
  waitlistCount: number;
}

interface TopicsResponse {
  topics: unknown[];
  note: string;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-aero-blue border-t-transparent" />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-panel border border-edge rounded-xl px-5 py-4">
      <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-heading mt-1">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function FunnelBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex-1 min-w-[120px]">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-sm font-medium text-heading">{label}</span>
        <span className="text-xs text-muted">{count} ({pct}%)</span>
      </div>
      <div className="h-3 bg-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-aero-blue rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-heading mb-3 border-b border-edge pb-2">{title}</h2>
      {children}
    </section>
  );
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topics, setTopics] = useState<TopicsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, topicsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`),
        fetch(`${API_BASE}/api/admin/topics`),
      ]);
      if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`);
      if (!topicsRes.ok) throw new Error(`Topics fetch failed: ${topicsRes.status}`);
      setStats(await statsRes.json());
      setTopics(await topicsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Admin Dashboard — DashTwo';
    fetchData();
    return () => { document.title = 'Tally Aero — AI Flight Training Platform'; };
  }, [fetchData]);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-panel border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 font-medium">Error loading admin data</p>
          <p className="text-sm text-muted mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-aero-blue text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const avgCostPerMsg = stats.todayUsage.totalMessages > 0
    ? (stats.todayUsage.totalCostCents / stats.todayUsage.totalMessages).toFixed(2)
    : '0.00';

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading">Admin Dashboard</h1>
          <p className="text-sm text-muted mt-1">Internal analytics for DashTwo</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-panel border border-edge rounded-lg text-sm text-body hover:text-heading hover:border-aero-blue/50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Conversion Funnel */}
      <Section title="Conversion Funnel">
        <div className="flex flex-wrap gap-6">
          <FunnelBar label="Total Users" count={stats.funnel.totalUsers} total={stats.funnel.totalUsers} />
          <FunnelBar label="Verified" count={stats.funnel.verifiedUsers} total={stats.funnel.totalUsers} />
          <FunnelBar label="Paid" count={stats.funnel.paidUsers} total={stats.funnel.totalUsers} />
          <FunnelBar label="Free" count={stats.funnel.freeUsers} total={stats.funnel.totalUsers} />
        </div>
      </Section>

      {/* Today's Usage */}
      <Section title="Today's Usage">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Messages" value={stats.todayUsage.totalMessages} />
          <StatCard label="Active Users" value={stats.todayUsage.uniqueUsers} />
          <StatCard
            label="Input Tokens"
            value={stats.todayUsage.totalInputTokens.toLocaleString()}
          />
          <StatCard
            label="Output Tokens"
            value={stats.todayUsage.totalOutputTokens.toLocaleString()}
          />
          <StatCard
            label="Est. Cost"
            value={`$${(stats.todayUsage.totalCostCents / 100).toFixed(2)}`}
            sub={`Avg ${avgCostPerMsg}c / msg`}
          />
        </div>
      </Section>

      {/* Feedback */}
      <Section title="Feedback Summary">
        {stats.feedback.totalUp === 0 && stats.feedback.totalDown === 0 ? (
          <div className="bg-panel border border-edge rounded-xl p-6 text-center">
            <p className="text-muted text-sm">No feedback data available yet.</p>
            <p className="text-muted text-xs mt-1">Feedback is currently stored client-side. Server-side persistence is needed for aggregation.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Thumbs Up" value={stats.feedback.totalUp} />
            <StatCard label="Thumbs Down" value={stats.feedback.totalDown} />
            <StatCard
              label="Approval Rate"
              value={
                stats.feedback.totalUp + stats.feedback.totalDown > 0
                  ? `${Math.round((stats.feedback.totalUp / (stats.feedback.totalUp + stats.feedback.totalDown)) * 100)}%`
                  : 'N/A'
              }
            />
          </div>
        )}
      </Section>

      {/* CFI Referrals */}
      <Section title="CFI Referral Dashboard">
        {stats.cfiReferrals.length === 0 ? (
          <div className="bg-panel border border-edge rounded-xl p-6 text-center">
            <p className="text-muted text-sm">No verified CFIs with referral links yet.</p>
          </div>
        ) : (
          <div className="bg-panel border border-edge rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge">
                  <th className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider font-medium">CFI Name</th>
                  <th className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wider font-medium">Referral Code</th>
                  <th className="text-right px-4 py-3 text-xs text-muted uppercase tracking-wider font-medium">Students Referred</th>
                </tr>
              </thead>
              <tbody>
                {stats.cfiReferrals.map((cfi, i) => (
                  <tr key={cfi.referralCode} className={i < stats.cfiReferrals.length - 1 ? 'border-b border-edge' : ''}>
                    <td className="px-4 py-3 text-heading">{cfi.displayName}</td>
                    <td className="px-4 py-3 text-body font-mono text-xs">{cfi.referralCode}</td>
                    <td className="px-4 py-3 text-heading text-right font-semibold">{cfi.studentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Waitlist */}
      <Section title="Waitlist">
        <StatCard label="Total Signups" value={stats.waitlistCount} />
      </Section>

      {/* Conversation Topics */}
      <Section title="Conversation Topics">
        <div className="bg-panel border border-edge rounded-xl p-6 text-center">
          <p className="text-muted text-sm">{topics?.note || 'Conversation data is client-side. Server-side persistence needed for topic analysis.'}</p>
        </div>
      </Section>
    </div>
  );
}
