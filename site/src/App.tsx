import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import '@/stores/themeStore'; // side-effect: applies initial theme
import { PlatformProvider } from '@/contexts/PlatformContext';
import { SiteLayout } from '@/components/SiteLayout';
import { MarketingLayout } from '@/components/MarketingLayout';
import { ProductShellLayout } from '@/components/ProductShellLayout';
import { DashTwoPage } from '@/pages/DashTwoPage';
import { LandingPage } from '@/components/LandingPage';
import { HomePage } from '@/components/HomePage';
import { SettingsView } from '@/components/SettingsView';
import { ScrollToTop } from '@/components/ScrollToTop';
import { LANDING_PAGES } from '@/types/landing';
import { SharedPage } from '@/pages/SharedPage';
import { AdminPage } from '@/pages/AdminPage';

export default function App() {
  const initialize = useAuthStore(s => s.initialize);

  useEffect(() => {
    // Capture referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('dashtwo_ref', ref);
      // Clean URL
      params.delete('ref');
      const cleanUrl = params.toString()
        ? `${window.location.pathname}?${params}`
        : window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return (
    <PlatformProvider>
      <ScrollToTop />
      <Routes>
        {/* Standalone pages (no shell) */}
        <Route path="/share/:shareId" element={<SharedPage />} />

        {/* Marketing shell — no sidebars */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* /compare will be added in Phase 6 */}
        </Route>

        {/* Logbook shell — left nav + right sidebar */}
        <Route element={<SiteLayout />}>
          {/* DashTwo main chat — full center, ChatSidebar on right */}
          <Route path="/dashtwo" element={<DashTwoPage />} />

          {/* Preview pages — interactive demo + DashTwo panel */}
          <Route element={<ProductShellLayout />}>
            {LANDING_PAGES.filter(p => p.id !== 'dashtwo').map(page => (
              <Route
                key={page.id}
                path={`/dashtwo/${page.id}`}
                element={<LandingPage config={page} />}
              />
            ))}
          </Route>

          {/* Settings & Admin — require auth */}
          <Route path="/settings" element={<RequireAuth><SettingsView /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminPage /></RequireAuth>} />
        </Route>

        {/* Flight School shell — placeholder for Phase 5 */}
        <Route element={<SiteLayout />}>
          <Route path="/flight-school" element={<FlightSchoolPlaceholder />} />
          <Route path="/flight-school/*" element={<FlightSchoolPlaceholder />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashtwo" replace />} />
      </Routes>
    </PlatformProvider>
  );
}

/** Redirect to /dashtwo if not authenticated */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);
  if (loading) return null; // still initializing — don't flash redirect
  if (!user) return <Navigate to="/dashtwo" replace />;
  return <>{children}</>;
}

/** Minimal placeholder for flight school routes until Phase 5 */
function FlightSchoolPlaceholder() {
  return (
    <div className="flex items-center justify-center h-full bg-base">
      <div className="text-center px-6">
        <h1 className="text-2xl font-bold text-heading mb-3">Flight School Management</h1>
        <p className="text-muted text-sm max-w-md mx-auto mb-6">
          Student roster, fleet management, scheduling, and endorsement tracking — coming soon.
        </p>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aero-blue/15 text-aero-blue-light text-xs font-medium">
          Preview Coming Soon
        </span>
      </div>
    </div>
  );
}
