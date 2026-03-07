import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TallyNav } from './TallyNav';
import { ChatSidebar } from './ChatSidebar';
import { AuthModal } from './AuthModal';
import { VerificationModal } from './VerificationModal';
import { useChatStore } from '@/stores/chatStore';

export function SiteLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const [chatSidebarCollapsed, setChatSidebarCollapsed] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashTwo = location.pathname === '/dashtwo';
  const showRightSidebar = isDashTwo || location.pathname === '/settings';
  const newConversation = useChatStore(s => s.newConversation);

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      {/* Mobile overlay */}
      {(navOpen || chatSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => { setNavOpen(false); setChatSidebarOpen(false); }}
        />
      )}

      {/* Left sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transform transition-all duration-200
        lg:relative lg:translate-x-0
        ${navCollapsed ? 'w-14' : 'w-64'}
        ${navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <TallyNav
          collapsed={navCollapsed}
          onToggle={() => setNavCollapsed(!navCollapsed)}
          onClose={() => setNavOpen(false)}
          onShowAuth={() => { setNavOpen(false); setShowAuth(true); }}
          onShowVerify={() => { setNavOpen(false); setShowVerify(true); }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-aero-dark-500 bg-aero-dark-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setNavOpen(true)} className="p-1.5 text-aero-text-subtle hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img src="/dashtwo-icon.png" alt="DashTwo" className="h-7 w-7 object-contain" />
              <span className="text-white font-semibold text-sm">DashTwo</span>
            </div>
          </div>
          {showRightSidebar && (
            <button onClick={() => setChatSidebarOpen(true)} className="p-1.5 text-aero-text-subtle hover:text-white" title="Conversations">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        <Outlet />
      </div>

      {/* Right sidebar — desktop: collapsible rail / expanded; mobile: slide-in overlay */}
      {showRightSidebar && (
        <>
          {/* Desktop: always visible, either collapsed rail or full panel */}
          <div className={`
            hidden lg:flex flex-col h-full transition-all duration-200
            ${chatSidebarCollapsed ? 'w-12' : 'w-56'}
          `}>
            {chatSidebarCollapsed ? (
              <div className="flex flex-col h-full bg-panel border-l border-edge">
                {/* Expand button */}
                <div className="p-2 pt-3 border-b border-edge">
                  <button
                    onClick={() => setChatSidebarCollapsed(false)}
                    className="w-full flex justify-center p-2 rounded-lg text-muted hover:text-heading hover:bg-hover transition-colors"
                    title="Expand sidebar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>

                {/* New chat */}
                <div className="px-2 pt-2">
                  <button
                    onClick={() => { newConversation(); setChatSidebarCollapsed(false); }}
                    className="w-full flex justify-center p-2 rounded-lg text-muted hover:text-heading hover:bg-hover transition-colors"
                    title="New chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Conversations */}
                <div className="px-2 pt-1">
                  <button
                    onClick={() => setChatSidebarCollapsed(false)}
                    className="w-full flex justify-center p-2 rounded-lg text-muted hover:text-heading hover:bg-hover transition-colors"
                    title="Conversations"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1" />

                {/* Settings */}
                <div className="border-t border-edge px-2 py-2">
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex justify-center p-2 rounded-lg text-muted hover:text-heading hover:bg-hover transition-colors"
                    title="Settings"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <ChatSidebar
                onCollapse={() => setChatSidebarCollapsed(true)}
              />
            )}
          </div>

          {/* Mobile: slide-in overlay */}
          <div className={`
            fixed inset-y-0 right-0 z-30 w-64 transform transition-transform duration-200
            lg:hidden
            ${chatSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <ChatSidebar
              onClose={() => setChatSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Modals — rendered at top level so they're never clipped */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showVerify && <VerificationModal onClose={() => setShowVerify(false)} />}
    </div>
  );
}
