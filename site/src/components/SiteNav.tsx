import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { NavIcon } from './NavIcon';
import { LANDING_PAGES } from '@/types/landing';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { AuthModal } from './AuthModal';
import { VerificationModal } from './VerificationModal';

interface SiteNavProps {
  onClose?: () => void;
}

export function SiteNav({ onClose }: SiteNavProps) {
  const { user, profile, signOut } = useAuthStore();
  const [showAuth, setShowAuth] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const location = useLocation();
  const isDashTwo = location.pathname === '/dashtwo';

  return (
    <div className="flex flex-col h-full bg-surface-800 border-r border-surface-600">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-600">
        <NavLink to="/dashtwo" className="flex items-center gap-2" onClick={onClose}>
          <img src="/dashtwo-icon.jpg" alt="Tally Aero" className="h-7 w-7 object-contain" />
          <span className="text-brand-400 font-bold text-lg">Tally Aero</span>
          <span className="text-xs text-gray-500 bg-surface-700 px-1.5 py-0.5 rounded">BETA</span>
        </NavLink>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Conversation management (only when on /dashtwo) */}
      {isDashTwo && <ConversationList onClose={onClose} />}

      {/* Navigation tabs */}
      <nav className={`flex-1 overflow-y-auto py-2 px-2 ${isDashTwo ? 'border-t border-surface-600' : ''}`}>
        {!isDashTwo && (
          <p className="text-[10px] text-gray-500 uppercase tracking-wider px-3 mb-1">Platform</p>
        )}
        {isDashTwo && (
          <p className="text-[10px] text-gray-500 uppercase tracking-wider px-3 mb-1 mt-1">Explore</p>
        )}
        {LANDING_PAGES.filter(p => isDashTwo ? p.id !== 'dashtwo' : true).map(page => (
          <NavLink
            key={page.id}
            to={page.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs transition-colors mb-0.5 ${
                isActive
                  ? 'bg-brand-950 text-brand-300'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
              }`
            }
          >
            <NavIcon icon={page.icon} className="w-4 h-4 shrink-0" />
            <span className="truncate">{page.navLabel}</span>
            {page.status === 'live' && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-surface-600 space-y-2">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-200 truncate">{profile?.displayName || user.email}</div>
              <div className="text-[10px] text-gray-500">
                {profile?.verificationStatus === 'verified_student' ? (
                  <span className="text-green-400">Verified Student</span>
                ) : profile?.verificationStatus === 'verified_cfi' ? (
                  <span className="text-green-400">Verified CFI</span>
                ) : profile?.tier === 'paid' ? (
                  'Pro'
                ) : (
                  <button
                    onClick={() => setShowVerify(true)}
                    className="text-brand-400 hover:text-brand-300"
                  >
                    Verify for unlimited access
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="w-full px-3 py-2 text-sm text-brand-400 hover:text-brand-300 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors text-center"
          >
            Sign in to save progress
          </button>
        )}

        <a
          href="https://tallyaero.com"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-gray-500 hover:text-brand-400 transition-colors"
        >
          Powered by Tally Aero
        </a>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showVerify && <VerificationModal onClose={() => setShowVerify(false)} />}
    </div>
  );
}

/** Conversation management section for DashTwo tab */
function ConversationList({ onClose }: { onClose?: () => void }) {
  const { conversations, activeConversationId, newConversation, loadConversation, deleteConversation } = useChatStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="px-2 pt-2">
      {/* New conversation */}
      <button
        onClick={() => { newConversation(); onClose?.(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors mb-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New conversation
      </button>

      {/* Conversation list */}
      {conversations.length > 0 && (
        <div className="space-y-0.5 max-h-48 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`group flex items-center rounded-lg transition-colors ${
                conv.id === activeConversationId ? 'bg-brand-950' : 'hover:bg-surface-700'
              }`}
            >
              <button
                onClick={() => { loadConversation(conv.id); onClose?.(); }}
                className={`flex-1 text-left px-3 py-1.5 text-xs truncate ${
                  conv.id === activeConversationId ? 'text-brand-300' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {conv.title}
              </button>
              {confirmDelete === conv.id ? (
                <div className="flex items-center gap-1 pr-2">
                  <button
                    onClick={() => { deleteConversation(conv.id); setConfirmDelete(null); }}
                    className="text-[10px] text-red-400 hover:text-red-300 px-1"
                  >
                    Del
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-[10px] text-gray-500 hover:text-gray-300 px-1"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(conv.id)}
                  className="hidden group-hover:block pr-2 text-gray-600 hover:text-red-400 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
