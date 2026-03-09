import { useState } from 'react';
import { ChatView } from './ChatView';
import { IconMessageCircle, IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

/**
 * DashTwoPanel — Collapsible chat panel for preview pages.
 * Sits on the right side of the ProductShellLayout.
 */
export function DashTwoPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop panel */}
      <div className={`hidden lg:flex flex-col h-full border-l border-edge bg-base transition-all duration-200 ${
        collapsed ? 'w-12' : 'w-[380px]'
      }`}>
        {collapsed ? (
          <div className="flex flex-col items-center pt-3 gap-2">
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-lg text-muted hover:text-heading hover:bg-hover transition-colors"
              title="Open DashTwo"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-lg text-aero-blue-light hover:bg-hover transition-colors"
              title="Open DashTwo chat"
            >
              <IconMessageCircle size={20} />
            </button>
          </div>
        ) : (
          <>
            {/* Panel header */}
            <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-edge">
              <div className="flex items-center gap-2">
                <img src="/dashtwo-icon.png" alt="DashTwo" className="h-5 w-5 object-contain" />
                <span className="text-sm font-semibold text-heading">DashTwo</span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1 rounded-lg text-muted hover:text-heading hover:bg-hover transition-colors"
                title="Collapse panel"
              >
                <IconChevronRight size={16} />
              </button>
            </div>

            {/* Chat content */}
            <div className="flex-1 min-h-0">
              <ChatView />
            </div>
          </>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-30 p-3.5 rounded-full bg-aero-blue text-white shadow-lg shadow-aero-blue/30 hover:bg-aero-blue-dark transition-colors btn-press"
        title="Ask DashTwo"
      >
        <IconMessageCircle size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed inset-x-0 bottom-0 top-12 z-50 bg-base rounded-t-2xl flex flex-col shadow-2xl">
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-edge">
              <div className="flex items-center gap-2">
                <img src="/dashtwo-icon.png" alt="DashTwo" className="h-5 w-5 object-contain" />
                <span className="text-sm font-semibold text-heading">DashTwo</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-hover transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatView />
            </div>
          </div>
        </>
      )}
    </>
  );
}
