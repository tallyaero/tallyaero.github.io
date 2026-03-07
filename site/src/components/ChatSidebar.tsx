import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore';
import { MODE_CONFIG, type DashTwoMode } from '@/types/chat';
import type { Conversation } from '@/types/chat';

async function shareConversation(conv: { messages: Array<{ role: string; content: string; citations?: any[] }>; mode: string }): Promise<string | null> {
  try {
    const conversationMessages = conv.messages.map(m => ({
      role: m.role,
      content: m.content,
      citations: m.citations,
    }));
    const firstAssistant = conv.messages.find(m => m.role === 'assistant');
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'conversation',
        content: firstAssistant?.content || '',
        conversationMessages,
        mode: conv.mode,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.shareId;
  } catch {
    return null;
  }
}

/** Fallback: copy conversation as plain text */
function copyConversationText(conv: Conversation) {
  const text = conv.messages
    .map(m => `${m.role === 'user' ? 'You' : 'DashTwo'}: ${m.content}`)
    .join('\n\n');
  navigator.clipboard.writeText(text);
}

const MODE_ORDER: DashTwoMode[] = ['auto', 'general', 'checkride', 'training', 'interview', 'support', 'debrief'];

function groupByDate(conversations: Conversation[]): { label: string; convs: Conversation[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const prev7 = today - 7 * 86400000;
  const prev30 = today - 30 * 86400000;

  const groups: { label: string; convs: Conversation[] }[] = [
    { label: 'Today', convs: [] },
    { label: 'Yesterday', convs: [] },
    { label: 'Previous 7 days', convs: [] },
    { label: 'Previous 30 days', convs: [] },
    { label: 'Older', convs: [] },
  ];

  for (const conv of conversations) {
    const t = conv.updatedAt;
    if (t >= today) groups[0].convs.push(conv);
    else if (t >= yesterday) groups[1].convs.push(conv);
    else if (t >= prev7) groups[2].convs.push(conv);
    else if (t >= prev30) groups[3].convs.push(conv);
    else groups[4].convs.push(conv);
  }

  return groups.filter(g => g.convs.length > 0);
}

interface MenuState {
  convId: string;
  x: number;
  y: number;
}

interface ChatSidebarProps {
  onClose?: () => void;
  onCollapse?: () => void;
}

export function ChatSidebar({ onClose, onCollapse }: ChatSidebarProps) {
  const { conversations, activeConversationId, currentMode, setMode, newConversation, loadConversation, deleteConversation, renameConversation } = useChatStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{ conv: Conversation; url: string | null; loading: boolean; copied: boolean } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [search, setSearch] = useState('');
  const [modeOpen, setModeOpen] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus rename modal input
  useEffect(() => {
    if (renameTarget) {
      // Small delay so the modal renders first
      requestAnimationFrame(() => renameInputRef.current?.select());
    }
  }, [renameTarget]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menu]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!menu) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menu]);

  // Close mode dropdown on outside click
  useEffect(() => {
    if (!modeOpen) return;
    const handler = (e: MouseEvent) => {
      if (modeRef.current && !modeRef.current.contains(e.target as Node)) {
        setModeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [modeOpen]);

  const openRename = (convId: string) => {
    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;
    setRenameTarget({ id: convId, title: conv.title });
    setRenameValue(conv.title);
    setMenu(null);
  };

  const commitRename = () => {
    if (renameTarget && renameValue.trim()) {
      renameConversation(renameTarget.id, renameValue.trim());
    }
    setRenameTarget(null);
    setRenameValue('');
  };

  const handleShare = async (conv: Conversation) => {
    setMenu(null);
    setShareModal({ conv, url: null, loading: true, copied: false });
    const shareId = await shareConversation({ messages: conv.messages, mode: conv.mode });
    if (shareId) {
      setShareModal({ conv, url: `${window.location.origin}/share/${shareId}`, loading: false, copied: false });
    } else {
      setShareModal({ conv, url: null, loading: false, copied: false });
    }
  };

  const copyShareLink = () => {
    if (!shareModal) return;
    if (shareModal.url) {
      navigator.clipboard.writeText(shareModal.url);
    } else {
      copyConversationText(shareModal.conv);
    }
    setShareModal({ ...shareModal, copied: true });
    setTimeout(() => setShareModal(null), 1500);
  };

  const handleDelete = (convId: string) => {
    setMenu(null);
    setDeleteTarget(convId);
  };

  // Filter conversations by search
  const filtered = search.trim()
    ? conversations.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.messages.some(m => m.content.toLowerCase().includes(search.toLowerCase()))
      )
    : conversations;

  const groups = groupByDate(filtered);

  return (
    <div className="flex flex-col h-full bg-panel border-l border-edge">
      {/* Header — Mode dropdown with collapse/close */}
      <div className="px-3 pt-3 pb-2 border-b border-edge">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-muted uppercase tracking-wider">Mode</label>
          <div className="flex items-center gap-1">
            {onCollapse && (
              <button onClick={onCollapse} className="hidden lg:block p-1 text-muted hover:text-heading transition-colors" title="Collapse sidebar">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="lg:hidden p-1 text-muted hover:text-heading">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div ref={modeRef} className="relative">
          <button
            onClick={() => setModeOpen(!modeOpen)}
            className="w-full flex items-center justify-between bg-input border border-edge rounded-lg px-2.5 py-2 text-sm text-heading hover:border-aero-blue/50 focus:outline-none focus:border-aero-blue cursor-pointer transition-colors"
          >
            <span>{MODE_CONFIG[currentMode].label}</span>
            <svg className={`w-3.5 h-3.5 text-muted transition-transform ${modeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {modeOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-panel border border-edge rounded-xl shadow-lg py-1 z-50">
              {MODE_ORDER.map(mode => (
                <button
                  key={mode}
                  onClick={() => { setMode(mode); setModeOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col gap-0.5 ${
                    mode === currentMode
                      ? 'bg-active text-heading'
                      : 'text-body hover:bg-hover'
                  }`}
                >
                  <span className="font-medium">{MODE_CONFIG[mode].label}</span>
                  <span className="text-[10px] text-muted">{MODE_CONFIG[mode].description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted mt-1 px-0.5 min-h-[24px]">
          {MODE_CONFIG[currentMode].description}
        </p>
      </div>

      {/* Search */}
      <div className="px-2 pt-2">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-input border border-edge rounded-lg pl-8 pr-3 py-1.5 text-xs text-heading placeholder-faint focus:outline-none focus:border-aero-blue"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-heading">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* New conversation */}
      <div className="px-2 pt-2">
        <button
          onClick={() => { newConversation(); onClose?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-heading hover:bg-hover rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>
      </div>

      {/* Conversation list — grouped by date */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {groups.map(group => (
          <div key={group.label}>
            <div className="px-3 pt-3 pb-1">
              <span className="text-[10px] font-medium text-faint uppercase tracking-wider">{group.label}</span>
            </div>
            <div className="space-y-0.5">
              {group.convs.map(conv => (
                <div
                  key={conv.id}
                  className={`group flex items-center rounded-lg transition-colors ${
                    conv.id === activeConversationId ? 'bg-active' : 'hover:bg-hover'
                  }`}
                >
                  <button
                    onClick={() => { loadConversation(conv.id); onClose?.(); }}
                    className={`flex-1 text-left px-3 py-1.5 text-xs truncate ${
                      conv.id === activeConversationId ? 'text-heading font-medium' : 'text-muted hover:text-heading'
                    }`}
                  >
                    {conv.title}
                  </button>
                  {(
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenu({ convId: conv.id, x: rect.right, y: rect.bottom + 4 });
                      }}
                      className="opacity-0 group-hover:opacity-100 shrink-0 p-1 mr-1 rounded-md text-faint hover:text-heading hover:bg-hover transition-all"
                      title="More options"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[10px] text-faint text-center py-4">
            {search ? 'No matching conversations' : 'No conversations yet'}
          </p>
        )}
      </div>

      {/* Settings */}
      <div className="border-t border-edge px-2 py-2">
        <button
          onClick={() => { navigate('/settings'); onClose?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-heading hover:bg-hover rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>

      {/* Three-dot dropdown menu */}
      {menu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-panel border border-edge rounded-xl shadow-lg py-1 min-w-[160px]"
          style={{ right: Math.max(8, window.innerWidth - menu.x), top: Math.min(menu.y, window.innerHeight - 160) }}
        >
          {(() => {
            const conv = conversations.find(c => c.id === menu.convId);
            if (!conv) return null;
            return (
              <>
                <button
                  onClick={() => openRename(menu.convId)}
                  className="w-full text-left px-3 py-2 text-xs text-body hover:bg-hover flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Rename
                </button>
                <button
                  onClick={() => handleShare(conv)}
                  className="w-full text-left px-3 py-2 text-xs text-body hover:bg-hover flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
                <div className="border-t border-edge my-1" />
                <button
                  onClick={() => handleDelete(menu.convId)}
                  className="w-full text-left px-3 py-2 text-xs text-danger hover:bg-hover flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Rename modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setRenameTarget(null)}>
          <div className="bg-panel border border-edge rounded-2xl shadow-xl w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-heading mb-3">Rename chat</h3>
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setRenameTarget(null); setRenameValue(''); }
              }}
              className="w-full bg-input border border-edge rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-aero-blue"
              placeholder="Chat name"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRenameTarget(null); setRenameValue(''); }}
                className="px-4 py-2 text-xs text-muted hover:text-heading rounded-lg hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={commitRename}
                disabled={!renameValue.trim()}
                className="px-4 py-2 text-xs bg-aero-blue hover:bg-aero-blue-dark text-white rounded-lg transition-colors disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (() => {
        const conv = conversations.find(c => c.id === deleteTarget);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteTarget(null)}>
            <div className="bg-panel border border-edge rounded-2xl shadow-xl w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-semibold text-heading mb-2">Delete chat?</h3>
              <p className="text-xs text-muted mb-1">This will delete</p>
              <p className="text-xs text-body font-medium truncate mb-4">{conv?.title || 'this conversation'}</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-xs text-muted hover:text-heading rounded-lg hover:bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { deleteConversation(deleteTarget); setDeleteTarget(null); }}
                  className="px-4 py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Share modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShareModal(null)}>
          <div className="bg-panel border border-edge rounded-2xl shadow-xl w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-heading mb-2">Share chat</h3>
            <p className="text-xs text-muted mb-1 truncate">{shareModal.conv.title}</p>
            {shareModal.loading ? (
              <div className="flex items-center gap-2 mt-4 text-xs text-muted">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating share link...
              </div>
            ) : shareModal.url ? (
              <div className="mt-3 flex items-center gap-2 bg-input border border-edge rounded-xl px-3 py-2.5">
                <input
                  readOnly
                  value={shareModal.url}
                  className="flex-1 bg-transparent text-xs text-heading focus:outline-none truncate"
                  onFocus={e => e.target.select()}
                />
              </div>
            ) : (
              <p className="text-xs text-muted mt-3">Share link unavailable. You can copy the conversation text instead.</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShareModal(null)}
                className="px-4 py-2 text-xs text-muted hover:text-heading rounded-lg hover:bg-hover transition-colors"
              >
                Cancel
              </button>
              {!shareModal.loading && (
                <button
                  onClick={copyShareLink}
                  className={`px-4 py-2 text-xs rounded-lg transition-colors ${
                    shareModal.copied
                      ? 'bg-green-500 text-white'
                      : 'bg-aero-blue hover:bg-aero-blue-dark text-white'
                  }`}
                >
                  {shareModal.copied ? 'Copied!' : shareModal.url ? 'Copy link' : 'Copy text'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
