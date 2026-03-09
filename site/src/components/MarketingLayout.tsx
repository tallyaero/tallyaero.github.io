import { Outlet } from 'react-router-dom';

/**
 * MarketingLayout — No sidebars. Clean marketing shell.
 * Used for `/`, `/compare`, and other marketing pages.
 */
export function MarketingLayout() {
  return <Outlet />;
}
