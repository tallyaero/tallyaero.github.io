import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      // Use rAF to reset after the new route renders
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.querySelectorAll('[class*="overflow-y"]').forEach(el => {
          el.scrollTop = 0;
        });
      });
    }
  }, [pathname]);

  return null;
}
