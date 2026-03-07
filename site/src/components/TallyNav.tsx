import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { NavIcon } from './NavIcon';
import { LANDING_PAGES } from '@/types/landing';
import { useAuthStore } from '@/stores/authStore';
import { AuthModal } from './AuthModal';
import { VerificationModal } from './VerificationModal';

interface TallyNavProps {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export function TallyNav({ collapsed, onToggle, onClose }: TallyNavProps) {
  const { user, profile, signOut } = useAuthStore();
  const [showAuth, setShowAuth] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  return (
    <div className="flex flex-col h-full bg-aero-dark-800 border-r border-aero-dark-600">
      {/* Header — DashTwo branding */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-1 py-3 border-b border-aero-dark-600">
          <img src="/dashtwo-icon.png" alt="DashTwo" className="h-9 w-9 object-contain" />
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-aero-text-subtle hover:text-white hover:bg-aero-dark-700 transition-colors"
            title="Expand sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 border-b border-aero-dark-600">
          <NavLink to="/dashtwo" className="flex flex-col min-w-0" onClick={onClose}>
            <div className="flex items-center gap-2">
              <img src="/dashtwo-icon.png" alt="DashTwo" className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold text-white tracking-tight">DashTwo</span>
            </div>
            <span className="text-[10px] text-aero-dark-400 ml-8">powered by <span className="text-aero-blue">Tally</span><span className="text-aero-orange">Aero</span></span>
          </NavLink>
          <div className="flex items-center gap-1">
            {onClose && (
              <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-aero-text-subtle hover:text-white hover:bg-aero-dark-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={onToggle}
              className="hidden lg:block p-1.5 rounded-lg text-aero-text-subtle hover:text-white hover:bg-aero-dark-700 transition-colors"
              title="Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {LANDING_PAGES.map(page => (
          <NavLink
            key={page.id}
            to={page.path}
            onClick={onClose}
            title={collapsed ? page.navLabel : undefined}
            className={({ isActive }) =>
              `group relative flex items-center w-full rounded-lg transition-all mb-0.5 ${
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-aero-dark-600 text-white'
                  : 'text-aero-text-muted hover:text-white hover:bg-aero-dark-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-aero-blue rounded-r" />
                )}
                <NavIcon icon={page.icon} className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium truncate">{page.navLabel}</span>
                    {page.status === 'live' && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                    )}
                  </>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-aero-dark-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg border border-aero-dark-600">
                    {page.navLabel}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-aero-dark-600 ${collapsed ? 'px-2 py-2' : 'p-3'} space-y-1`}>
        {/* User */}
        {user ? (
          collapsed ? (
            <button
              onClick={() => signOut()}
              className="w-full flex justify-center py-2.5 rounded-lg text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors"
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2">
              <svg className="w-5 h-5 shrink-0 text-aero-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{profile?.displayName || user.email}</div>
                <div className="text-[10px] text-aero-text-subtle">
                  {profile?.verificationStatus === 'verified_student' ? (
                    <span className="text-success">Verified Student</span>
                  ) : profile?.verificationStatus === 'verified_cfi' ? (
                    <span className="text-success">Verified CFI</span>
                  ) : profile?.tier === 'paid' ? (
                    'Pro'
                  ) : (
                    <button onClick={() => setShowVerify(true)} className="text-aero-blue-light hover:text-aero-blue">
                      Verify for unlimited
                    </button>
                  )}
                </div>
              </div>
              <button onClick={() => signOut()} className="p-1.5 rounded-lg text-aero-text-subtle hover:text-white hover:bg-aero-dark-700 transition-colors" title="Sign out">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )
        ) : (
          collapsed ? (
            <button onClick={() => setShowAuth(true)} className="w-full flex justify-center py-2.5 rounded-lg text-aero-blue hover:bg-aero-dark-700 transition-colors" title="Sign in">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium">Sign in</span>
            </button>
          )
        )}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showVerify && <VerificationModal onClose={() => setShowVerify(false)} />}
    </div>
  );
}
