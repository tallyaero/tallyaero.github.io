/**
 * UpgradeCard — shown in settings and as an inline prompt when users hit the daily limit
 */

import { useAuthStore } from '@/stores/authStore';

interface UpgradeCardProps {
  inline?: boolean; // compact version for inline chat display
}

export function UpgradeCard({ inline }: UpgradeCardProps) {
  const { user, profile, startCheckout } = useAuthStore();

  if (!user || profile?.tier === 'paid') return null;

  if (inline) {
    return (
      <div className="flex items-center gap-3 bg-panel border border-edge rounded-xl px-4 py-3 my-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-heading">Upgrade to DashTwo Pro</p>
          <p className="text-xs text-muted">Unlimited access for $4.99/month</p>
        </div>
        <button
          onClick={startCheckout}
          className="shrink-0 px-4 py-2 bg-aero-blue hover:bg-aero-blue-dark text-white text-sm font-medium rounded-lg transition-colors btn-press"
        >
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <div className="bg-panel rounded-xl border border-edge p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-aero-blue/10 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-aero-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-heading mb-1">DashTwo Pro</h3>
          <p className="text-sm text-muted mb-3">
            Unlimited DashTwo access, priority responses, and aircraft-specific answers.
          </p>
          <ul className="space-y-1.5 mb-4">
            {[
              'Unlimited daily messages',
              'No daily cost cap',
              'Priority model routing',
              'Aircraft document search (coming soon)',
            ].map((feat, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-body">
                <svg className="w-4 h-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feat}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <button
              onClick={startCheckout}
              className="px-5 py-2.5 bg-aero-blue hover:bg-aero-blue-dark text-white text-sm font-medium rounded-lg transition-colors btn-press"
            >
              Upgrade — $4.99/month
            </button>
            <span className="text-xs text-faint">Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
