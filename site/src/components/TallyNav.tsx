import { NavLink } from 'react-router-dom';
import { NavIcon } from './NavIcon';
import { LANDING_PAGES } from '@/types/landing';
import { useAuthStore } from '@/stores/authStore';

interface TallyNavProps {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
  onShowAuth?: () => void;
  onShowVerify?: () => void;
}

export function TallyNav({ collapsed, onToggle, onClose, onShowAuth, onShowVerify }: TallyNavProps) {
  const { user, profile, signOut } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-aero-dark-800 border-r border-aero-dark-600">
      {/* Header — DashTwo branding */}
      {collapsed ? (
        <div className="shrink-0 flex justify-center py-3 border-b border-aero-dark-600">
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
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-aero-dark-600">
          <NavLink to="/dashtwo" className="flex flex-col min-w-0" onClick={onClose}>
            <div className="flex items-center gap-2">
              <img src="/dashtwo-icon.png" alt="DashTwo" className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold tracking-tight"><span className="text-aero-blue-light">Dash</span><span className="text-aero-orange">Two</span></span>
            </div>
            <div className="ml-8 flex items-center gap-1">
              <span className="text-[10px] text-aero-dark-500">powered by</span>
              <span className="text-[10px] text-aero-text-muted font-medium">TallyAero</span>
            </div>
          </NavLink>
          <button
            onClick={() => { onToggle(); onClose?.(); }}
            className="p-1.5 rounded-lg text-aero-text-subtle hover:text-white hover:bg-aero-dark-700 transition-colors"
            title="Collapse sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {/* DashTwo — pinned, always visible */}
      <div className="shrink-0 px-2 pt-2">
        {LANDING_PAGES.filter(p => p.id === 'dashtwo').map(page => (
          <NavLink
            key={page.id}
            to={page.path}
            onClick={onClose}
            title={collapsed ? page.navLabel : undefined}
            className={({ isActive }) =>
              `group relative flex items-center w-full rounded-lg transition-all ${
                collapsed ? 'justify-center px-0 py-1.5' : 'gap-3 px-3 py-1.5'
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
                  <span className="text-sm font-medium truncate">{page.navLabel}</span>
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
        <div className={`border-t border-aero-dark-600 ${collapsed ? 'mx-0' : 'mx-1'} mt-1.5 mb-0`} />
      </div>

      {/* Platform nav — scrollable */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-1 px-2">
        {LANDING_PAGES.filter(p => p.id !== 'dashtwo').map(page => (
          <NavLink
            key={page.id}
            to={page.path}
            onClick={onClose}
            title={collapsed ? page.navLabel : undefined}
            className={({ isActive }) =>
              `group relative flex items-center w-full rounded-lg transition-all mb-0.5 ${
                collapsed ? 'justify-center px-0 py-1.5' : 'gap-3 px-3 py-1.5'
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
                  <span className="text-sm font-medium truncate">{page.navLabel}</span>
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

      {/* Footer — compact */}
      <div className={`shrink-0 border-t border-aero-dark-600 ${collapsed ? 'px-2 py-1.5' : 'px-3 py-1.5'}`}>
        {user ? (
          collapsed ? (
            <button
              onClick={() => signOut()}
              className="w-full flex justify-center py-1.5 rounded-lg text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors"
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-2 py-1">
              <svg className="w-4 h-4 shrink-0 text-aero-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white truncate">{profile?.displayName || user.email}</div>
                <div className="text-[10px] text-aero-text-subtle leading-tight">
                  {profile?.verificationStatus === 'verified_student' ? (
                    <span className="text-success">Verified Student</span>
                  ) : profile?.verificationStatus === 'verified_cfi' ? (
                    <span className="text-success">Verified CFI</span>
                  ) : profile?.tier === 'paid' ? (
                    'Pro'
                  ) : (
                    <button onClick={() => onShowVerify?.()} className="text-aero-blue-light hover:text-aero-blue">
                      Verify for unlimited
                    </button>
                  )}
                </div>
              </div>
              <button onClick={() => signOut()} className="p-1 rounded-lg text-aero-text-subtle hover:text-white hover:bg-aero-dark-700 transition-colors" title="Sign out">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )
        ) : (
          collapsed ? (
            <button onClick={() => onShowAuth?.()} className="w-full flex justify-center py-1.5 rounded-lg text-aero-blue hover:bg-aero-dark-700 transition-colors" title="Sign in">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          ) : (
            <button onClick={() => onShowAuth?.()} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Sign in</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
