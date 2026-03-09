/**
 * DashTwoNavIcon — Drop-in icon for the DashTwo nav item.
 * Uses the dashtwo-icon.png, matching the real logbook's approach.
 */
export function DashTwoNavIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/dashtwo-icon.png"
        alt="DashTwo"
        width={size}
        height={size}
        className="object-contain"
        draggable={false}
      />
    </span>
  );
}
