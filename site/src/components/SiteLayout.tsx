import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TallyNav } from './TallyNav';
import { ChatSidebar } from './ChatSidebar';

export function SiteLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const [chatSidebarVisible, setChatSidebarVisible] = useState(true);
  const location = useLocation();
  const isDashTwo = location.pathname === '/dashtwo';
  const showRightSidebar = isDashTwo || location.pathname === '/settings';

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
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-aero-dark-600 bg-aero-dark-800">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          )}
        </div>

        <Outlet />
      </div>

      {/* Right sidebar — DashTwo panel */}
      {showRightSidebar && (
        <>
          {/* Desktop toggle when collapsed */}
          {!chatSidebarVisible && (
            <button
              onClick={() => setChatSidebarVisible(true)}
              className="hidden lg:flex fixed right-3 top-3 z-10 p-2 rounded-lg bg-aero-dark-800 border border-aero-dark-600 text-aero-text-subtle hover:text-white hover:bg-aero-dark-700 transition-colors shadow-sm"
              title="Show sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          )}

          <div className={`
            fixed inset-y-0 right-0 z-30 w-56 transform transition-transform duration-200
            ${chatSidebarVisible ? 'lg:relative lg:translate-x-0' : 'lg:hidden'}
            ${chatSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <ChatSidebar
              onClose={() => setChatSidebarOpen(false)}
              onCollapse={() => setChatSidebarVisible(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
