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

export default function App() {
  const initialize = useAuthStore(s => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/dashtwo" element={<DashTwoPage />} />
        <Route path="/settings" element={<SettingsView />} />
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
