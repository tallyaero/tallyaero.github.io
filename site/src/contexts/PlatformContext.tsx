import { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type PlatformMode = 'logbook' | 'flight-school' | 'marketing';

interface PlatformContextValue {
  mode: PlatformMode;
}

const PlatformCtx = createContext<PlatformContextValue>({ mode: 'logbook' });

export function usePlatform() {
  return useContext(PlatformCtx);
}

/**
 * Global getter for platform mode — used by chatStore (which can't access React context).
 * Updated via useEffect in PlatformProvider.
 */
let _currentPlatformMode: PlatformMode = 'logbook';
export function getCurrentPlatformMode(): PlatformMode {
  return _currentPlatformMode;
}

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const value = useMemo<PlatformContextValue>(() => {
    if (location.pathname.startsWith('/flight-school')) {
      return { mode: 'flight-school' };
    }
    if (location.pathname === '/') {
      return { mode: 'marketing' };
    }
    return { mode: 'logbook' };
  }, [location.pathname]);

  // Keep global getter in sync
  useEffect(() => {
    _currentPlatformMode = value.mode;
  }, [value.mode]);

  return <PlatformCtx.Provider value={value}>{children}</PlatformCtx.Provider>;
}
