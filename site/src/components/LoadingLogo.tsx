/**
 * Animated DashTwo loading logo.
 * The two swoosh arcs draw themselves via SVG stroke animation,
 * then the full icon fades in on top.
 */

interface LoadingLogoProps {
  size?: number;
  className?: string;
}

export function LoadingLogo({ size = 64, className = '' }: LoadingLogoProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* SVG swoosh animation */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ transform: 'rotate(-10deg)' }}
      >
        {/* Blue arc — draws first */}
        <path
          d="M 50 15 C 25 15, 10 35, 15 60"
          fill="none"
          stroke="#36a7f6"
          strokeWidth="5"
          strokeLinecap="round"
          className="animate-draw-blue"
        />
        {/* Orange arc — draws second */}
        <path
          d="M 20 70 C 30 90, 60 95, 80 70 C 90 55, 85 35, 70 25"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4.5"
          strokeLinecap="round"
          className="animate-draw-orange"
        />
        {/* Orange jet trail — small upward stroke */}
        <path
          d="M 68 28 L 75 15"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-draw-jet"
        />
        {/* Second jet trail */}
        <path
          d="M 72 40 L 82 28"
          fill="none"
          stroke="#ea580c"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-draw-jet2"
        />
      </svg>

      {/* Full logo fades in after swooshes draw */}
      <img
        src="/dashtwo-icon.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-contain animate-logo-reveal"
      />
    </div>
  );
}
