import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore';
import { MODE_CONFIG, type DashTwoMode } from '@/types/chat';

const MODE_ORDER: DashTwoMode[] = ['auto', 'general', 'checkride', 'training', 'interview', 'support', 'debrief'];

interface ChatSidebarProps {
  onClose?: () => void;
  onCollapse?: () => void;
}

export function ChatSidebar({ onClose, onCollapse }: ChatSidebarProps) {
  const { conversations, activeConversationId, currentMode, setMode, newConversation, loadConversation, deleteConversation } = useChatStore();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-aero-dark-800 border-l border-aero-dark-600">
      {/* Header — Mode dropdown with collapse/close */}
      <div className="px-3 pt-3 pb-2 border-b border-aero-dark-600">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-aero-text-subtle uppercase tracking-wider">Mode</label>
          <div className="flex items-center gap-1">
            {onCollapse && (
              <button onClick={onCollapse} className="hidden lg:block p-1 text-aero-text-subtle hover:text-white transition-colors" title="Hide sidebar">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="lg:hidden p-1 text-aero-text-subtle hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <select
          value={currentMode}
          onChange={e => setMode(e.target.value as DashTwoMode)}
          className="w-full bg-aero-dark-700 border border-aero-dark-600 rounded-lg px-2.5 py-2 text-sm text-white focus:outline-none focus:border-aero-blue cursor-pointer"
        >
          {MODE_ORDER.map(mode => (
            <option key={mode} value={mode}>{MODE_CONFIG[mode].label}</option>
          ))}
        </select>
        <p className="text-[10px] text-aero-text-subtle mt-1 px-0.5">
          {MODE_CONFIG[currentMode].description}
        </p>
      </div>

      {/* New conversation */}
      <div className="px-2 pt-2">
        <button
          onClick={() => { newConversation(); onClose?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-aero-text-muted hover:text-white hover:bg-aero-dark-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`group flex items-center rounded-lg transition-colors ${
              conv.id === activeConversationId ? 'bg-aero-dark-600' : 'hover:bg-aero-dark-700'
            }`}
          >
            <button
              onClick={() => { loadConversation(conv.id); onClose?.(); }}
              className={`flex-1 text-left px-3 py-1.5 text-xs truncate ${
                conv.id === activeConversationId ? 'text-white' : 'text-aero-text-muted hover:text-white'
              }`}
            >
              {conv.title}
            </button>
            {confirmDelete === conv.id ? (
              <div className="flex items-center gap-1 pr-2">
                <button onClick={() => { deleteConversation(conv.id); setConfirmDelete(null); }} className="text-[10px] text-danger hover:text-red-300 px-1">Del</button>
                <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-aero-text-subtle hover:text-white px-1">No</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(conv.id)} className="hidden group-hover:block pr-2 text-aero-dark-400 hover:text-danger transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="text-[10px] text-aero-text-subtle text-center py-4">No conversations yet</p>
        )}
      </div>

      {/* Settings */}
      <div className="border-t border-aero-dark-600 px-2 py-2">
        <button
          onClick={() => { navigate('/settings'); onClose?.(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-aero-text-muted hover:text-white hover:bg-aero-dark-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>
    </div>
  );
}
