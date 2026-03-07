import { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { AuthModal } from './AuthModal';
import { VerificationModal } from './VerificationModal';

interface SidebarProps {
  onClose: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { conversations, activeConversationId, newConversation, loadConversation, deleteConversation } = useChatStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const { user, profile, signOut } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-surface-800 border-r border-surface-600">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-600">
        <div className="flex items-center gap-2">
          <img src="/dashtwo-icon.png" alt="DashTwo" className="h-7 w-7 object-contain" />
          <span className="text-brand-400 font-bold text-lg">DashTwo</span>
          <span className="text-xs text-gray-500 bg-surface-700 px-1.5 py-0.5 rounded">BETA</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* New conversation button */}
      <div className="p-3">
        <button
          onClick={() => { newConversation(); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New conversation
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {conversations.length === 0 ? (
          <p className="text-xs text-gray-500 text-center mt-8">No conversations yet</p>
        ) : (
          <div className="space-y-1">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`group flex items-center rounded-lg transition-colors ${
                  conv.id === activeConversationId
                    ? 'bg-brand-950'
                    : 'hover:bg-surface-700'
                }`}
              >
                <button
                  onClick={() => { loadConversation(conv.id); onClose(); }}
                  className={`flex-1 text-left px-3 py-2 text-sm truncate ${
                    conv.id === activeConversationId
                      ? 'text-brand-300'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {conv.title}
                </button>
                {confirmDelete === conv.id ? (
                  <div className="flex items-center gap-1 pr-2">
                    <button
                      onClick={() => { deleteConversation(conv.id); setConfirmDelete(null); }}
                      className="text-xs text-red-400 hover:text-red-300 px-1.5 py-0.5"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs text-gray-500 hover:text-gray-300 px-1.5 py-0.5"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(conv.id)}
                    className="hidden group-hover:block pr-2 text-gray-600 hover:text-red-400 transition-colors"
                    title="Delete conversation"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
