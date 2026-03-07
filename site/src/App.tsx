import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import '@/stores/themeStore'; // side-effect: applies initial theme
import { SiteLayout } from '@/components/SiteLayout';
import { DashTwoPage } from '@/pages/DashTwoPage';
import { LandingPage } from '@/components/LandingPage';
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
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/share/:shareId" element={<SharedPage />} />
      <Route element={<SiteLayout />}>
        <Route path="/dashtwo" element={<DashTwoPage />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/admin" element={<AdminPage />} />
        {LANDING_PAGES.filter(p => p.id !== 'dashtwo').map(page => (
          <Route
            key={page.id}
            path={page.path}
            element={<LandingPage config={page} />}
          />
        ))}
        <Route path="*" element={<Navigate to="/dashtwo" replace />} />
      </Route>
    </Routes>
    </>
  );
}
