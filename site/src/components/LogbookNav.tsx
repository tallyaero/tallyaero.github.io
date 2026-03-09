import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ContextToggle } from './ContextToggle';
import { DashTwoNavIcon } from './DashTwoNavIcon';
import {
  IconGauge,
  IconBook2,
  IconDeviceDesktopAnalytics,
  IconChalkboard,
  IconRosette,
  IconBooks,
  IconHourglass,
  IconChartDots3,
  IconCertificate2,
  IconBrain,
  IconStairsUp,
  IconClipboardCheck,
  IconMedal,
  IconPropeller,
  IconFolder,
  IconAlertOctagon,
  IconShare2,
  IconFileImport,
  IconFileExport,
  IconSettings,
  IconChevronDown,
  IconChevronRight,
  IconLogout,
  IconUser,
} from '@tabler/icons-react';

// Book spine colors matching the real logbook
const BOOK_SPINE_COLORS: Record<string, string> = {
  'master-logbook': '#3B82F6',   // blue
  'simulator-log': '#8B5CF6',    // purple
  'ground-session': '#F59E0B',   // amber
  'cfi-records': '#10B981',      // green
  'endorsement-library': '#F43F5E', // rose
};

interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; stroke?: number }>;
  path: string;
}

interface LogbookNavProps {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
  onShowAuth?: () => void;
  onShowVerify?: () => void;
}

// Platform nav items — exact real logbook order
const PLATFORM_NAV: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: IconGauge, path: '/dashtwo/dashboard' },
  // logbook_group is rendered separately
  { id: 'currency', label: 'Currency', icon: IconHourglass, path: '/dashtwo/currency' },
  { id: 'reports', label: 'Reports', icon: IconChartDots3, path: '/dashtwo/reports' },
  { id: 'training', label: 'Training', icon: IconCertificate2, path: '/dashtwo/training' },
  { id: 'pilotiq', label: 'Pilot IQ', icon: IconBrain, path: '/dashtwo/pilotiq' },
  { id: 'career', label: 'Career Tools', icon: IconStairsUp, path: '/dashtwo/career' },
  { id: 'checkride', label: 'Checkride', icon: IconClipboardCheck, path: '/dashtwo/checkride' },
  { id: 'dpe', label: 'DPE Portal', icon: IconClipboardCheck, path: '/dashtwo/dpe' },
  { id: 'achievements', label: 'Achievements', icon: IconMedal, path: '/dashtwo/achievements' },
  { id: 'aircraft', label: 'Aircraft', icon: IconPropeller, path: '/dashtwo/aircraft' },
  { id: 'docs', label: 'Documents', icon: IconFolder, path: '/dashtwo/docs' },
  { id: 'safety', label: 'Safety Reporting', icon: IconAlertOctagon, path: '/dashtwo/safety' },
  { id: 'connections', label: 'Connections', icon: IconShare2, path: '/dashtwo/connections' },
];

// Logbook group children with spine colors
const LOGBOOK_GROUP: { id: string; label: string; icon: React.ComponentType<{ size?: number; stroke?: number }>; path: string; color: string }[] = [
  { id: 'master-logbook', label: 'Master Logbook', icon: IconBook2, path: '/dashtwo/logbook', color: BOOK_SPINE_COLORS['master-logbook'] },
  { id: 'simulator-log', label: 'Simulator Log', icon: IconDeviceDesktopAnalytics, path: '/dashtwo/simulator', color: BOOK_SPINE_COLORS['simulator-log'] },
  { id: 'ground-session', label: 'Ground Session Log', icon: IconChalkboard, path: '/dashtwo/ground-sessions', color: BOOK_SPINE_COLORS['ground-session'] },
  { id: 'cfi-records', label: 'CFI Records', icon: IconRosette, path: '/dashtwo/cfi-records', color: BOOK_SPINE_COLORS['cfi-records'] },
  { id: 'endorsement-library', label: 'Endorsement Library', icon: IconBooks, path: '/dashtwo/endorsements', color: BOOK_SPINE_COLORS['endorsement-library'] },
];

// Below-divider items
const FOOTER_NAV: NavItemConfig[] = [
  { id: 'import', label: 'Import', icon: IconFileImport, path: '/dashtwo/import' },
  { id: 'export', label: 'Export', icon: IconFileExport, path: '/dashtwo/export' },
  { id: 'settings', label: 'Settings', icon: IconSettings, path: '/settings' },
];

export function LogbookNav({ collapsed, onToggle, onClose, onShowAuth, onShowVerify }: LogbookNavProps) {
  const { user, profile, signOut } = useAuthStore();
  const [logbookExpanded, setLogbookExpanded] = useState(false);

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
          <div className="flex flex-col min-w-0">
            <NavLink to="/dashtwo" className="flex items-center gap-2" onClick={onClose}>
              <img src="/dashtwo-icon.png" alt="DashTwo" className="h-8 w-8 object-contain" />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-aero-blue-light">Dash</span>
                <span className="text-aero-orange">Two</span>
              </span>
            </NavLink>
            <NavLink to="/" className="ml-8 flex items-center gap-1 group" onClick={onClose}>
              <span className="text-[10px] text-aero-dark-500">powered by</span>
              <span className="text-[10px] text-aero-text-muted font-medium group-hover:text-white transition-colors">TallyAero</span>
            </NavLink>
          </div>
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

      {/* Context Toggle */}
      <ContextToggle collapsed={collapsed} />

      {/* DashTwo — pinned */}
      <div className="shrink-0 px-2 pt-1">
        {!collapsed && (
          <div className="px-3 pb-1">
            <span className="text-[9px] font-semibold tracking-widest text-aero-dark-500 uppercase">Pinned</span>
          </div>
        )}
        <NavItem
          label="DASHTWO"
          path="/dashtwo"
          icon={({ size }) => <DashTwoNavIcon size={size} />}
          collapsed={collapsed}
          onClose={onClose}
          end
        />
        <div className={`border-t border-aero-dark-600 ${collapsed ? 'mx-0' : 'mx-1'} mt-1.5 mb-0`} />
      </div>

      {/* Platform nav — scrollable */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-1 px-2 scrollbar-thin">
        {!collapsed && (
          <div className="px-3 pb-1 pt-0.5">
            <span className="text-[9px] font-semibold tracking-widest text-aero-dark-500 uppercase">Platform</span>
          </div>
        )}

        {/* Dashboard */}
        <NavItem {...PLATFORM_NAV[0]} collapsed={collapsed} onClose={onClose} />

        {/* Logbook Group — collapsible */}
        <LogbookGroup
          collapsed={collapsed}
          expanded={logbookExpanded}
          onToggle={() => setLogbookExpanded(!logbookExpanded)}
          onClose={onClose}
        />

        {/* Remaining platform items */}
        {PLATFORM_NAV.slice(1).map(item => (
          <NavItem key={item.id} {...item} collapsed={collapsed} onClose={onClose} />
        ))}

        {/* Divider */}
        <div className={`border-t border-aero-dark-600 ${collapsed ? 'mx-0' : 'mx-1'} my-1.5`} />

        {/* Below-divider items */}
        {FOOTER_NAV.map(item => (
          <NavItem key={item.id} {...item} collapsed={collapsed} onClose={onClose} />
        ))}
      </nav>

      {/* TallyAero home link */}
      {!collapsed && (
        <div className="shrink-0 px-3 py-1.5 border-t border-aero-dark-600">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-2 px-2 py-1 rounded-lg text-aero-text-subtle hover:text-white hover:bg-aero-dark-700 transition-colors"
          >
            <img src="/tally-aero-favicon.png" alt="TallyAero" className="h-3.5 w-3.5 object-contain" />
            <span className="text-[10px] font-medium">TallyAero.com</span>
          </NavLink>
        </div>
      )}

      {/* Footer — user info */}
      <UserFooter
        collapsed={collapsed}
        user={user}
        profile={profile}
        signOut={signOut}
        onShowAuth={onShowAuth}
        onShowVerify={onShowVerify}
      />
    </div>
  );
}

// ─── NavItem ────────────────────────────────────────────────────

function NavItem({
  label,
  path,
  icon: Icon,
  collapsed,
  onClose,
  end,
}: NavItemConfig & { collapsed: boolean; onClose?: () => void; end?: boolean }) {
  return (
    <NavLink
      to={path}
      end={end}
      onClick={onClose}
      title={collapsed ? label : undefined}
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
          <Icon size={18} stroke={1.5} />
          {!collapsed && (
            <span className="text-sm font-medium truncate">{label}</span>
          )}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-aero-dark-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg border border-aero-dark-600">
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Logbook Group ──────────────────────────────────────────────

function LogbookGroup({
  collapsed,
  expanded,
  onToggle,
  onClose,
}: {
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
  onClose?: () => void;
}) {
  if (collapsed) {
    // Rail mode: show book icon, popover on click
    return (
      <div className="relative group">
        <button
          onClick={onToggle}
          className="w-full flex justify-center py-1.5 rounded-lg text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors mb-0.5"
          title="Logbook"
        >
          <IconBook2 size={18} stroke={1.5} />
        </button>
        {/* Rail tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-aero-dark-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg border border-aero-dark-600">
          Logbook
        </div>
      </div>
    );
  }

  return (
    <div className="mb-0.5">
      {/* Group header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors"
      >
        {expanded ? <IconChevronDown size={14} stroke={1.5} /> : <IconChevronRight size={14} stroke={1.5} />}
        <IconBook2 size={18} stroke={1.5} />
        <span className="text-sm font-medium truncate">Logbook</span>
      </button>

      {/* Expanded children — book spines */}
      {expanded && (
        <div className="ml-4 mt-0.5 space-y-px">
          {LOGBOOK_GROUP.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-2 pl-4 pr-3 py-1 rounded-r-lg transition-colors text-xs ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-aero-text-muted hover:text-white hover:bg-white/[0.07]'
                }`
              }
            >
              {/* Book spine — colored left border */}
              <div
                className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="uppercase text-[10px] font-semibold tracking-wide truncate">
                {item.label}
              </span>
            </NavLink>
          ))}
          {/* Shelf line */}
          <div className="ml-4 mr-3 border-b border-aero-dark-600 mt-1" />
        </div>
      )}
    </div>
  );
}

// ─── User Footer ────────────────────────────────────────────────

function UserFooter({
  collapsed,
  user,
  profile,
  signOut,
  onShowAuth,
  onShowVerify,
}: {
  collapsed: boolean;
  user: any;
  profile: any;
  signOut: () => void;
  onShowAuth?: () => void;
  onShowVerify?: () => void;
}) {
  return (
    <div className={`shrink-0 border-t border-aero-dark-600 ${collapsed ? 'px-2 py-1.5' : 'px-3 py-1.5'}`}>
      {user ? (
        collapsed ? (
          <button
            onClick={() => signOut()}
            className="w-full flex justify-center py-1.5 rounded-lg text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors"
            title="Sign out"
          >
            <IconLogout size={18} stroke={1.5} />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1">
            <IconUser size={16} stroke={1.5} className="shrink-0 text-aero-text-subtle" />
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
              <IconLogout size={14} stroke={1.5} />
            </button>
          </div>
        )
      ) : (
        collapsed ? (
          <button onClick={() => onShowAuth?.()} className="w-full flex justify-center py-1.5 rounded-lg text-aero-blue hover:bg-aero-dark-700 transition-colors" title="Sign in">
            <IconUser size={18} stroke={1.5} />
          </button>
        ) : (
          <button onClick={() => onShowAuth?.()} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors">
            <IconUser size={16} stroke={1.5} className="shrink-0" />
            <span className="text-xs font-medium">Sign in</span>
          </button>
        )
      )}
    </div>
  );
}
