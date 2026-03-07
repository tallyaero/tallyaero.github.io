/**
 * Loading indicator — gentle scale pulse on the DashTwo icon.
 * Animation defined in index.css so it's never re-injected.
 */
import { memo } from 'react';

interface LoadingLogoProps {
  size?: number;
  className?: string;
}

export const LoadingLogo = memo(function LoadingLogo({ size = 28, className = '' }: LoadingLogoProps) {
  return (
    <img
      src="/dashtwo-icon.png"
      alt=""
      className={`dashtwo-breathe ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
});
