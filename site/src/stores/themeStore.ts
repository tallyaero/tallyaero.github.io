import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    { name: 'dashtwo-theme' }
  )
);

// Apply theme on initial load (before React renders)
const stored = JSON.parse(localStorage.getItem('dashtwo-theme') || '{}');
applyTheme(stored?.state?.theme || 'light');
