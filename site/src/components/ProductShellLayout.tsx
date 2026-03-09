import { Outlet } from 'react-router-dom';
import { DashTwoPanel } from './DashTwoPanel';

/**
 * ProductShellLayout — Wraps preview pages with DashTwo chat panel on the right.
 * Used for /dashtwo/* routes (not /dashtwo itself).
 *
 * Layout:
 * ┌──────────────────────────┬────────────┐
 * │ Interactive Preview      │ DashTwo    │
 * │ (Outlet)                 │ Panel      │
 * └──────────────────────────┴────────────┘
 */
export function ProductShellLayout() {
  return (
    <div className="flex h-full min-w-0">
      {/* Main content — preview page */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </div>

      {/* DashTwo panel — collapsible chat */}
      <DashTwoPanel />
    </div>
  );
}
