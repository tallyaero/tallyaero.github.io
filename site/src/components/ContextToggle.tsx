import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatform } from '@/contexts/PlatformContext';
import { IconChevronDown, IconBook2, IconBuildingCommunity } from '@tabler/icons-react';

const CONTEXTS = [
  { mode: 'logbook' as const, label: 'Pilot Logbook', icon: IconBook2, path: '/dashtwo' },
  { mode: 'flight-school' as const, label: 'Flight School', icon: IconBuildingCommunity, path: '/flight-school' },
];

interface ContextToggleProps {
  collapsed?: boolean;
}

export function ContextToggle({ collapsed }: ContextToggleProps) {
  const { mode } = usePlatform();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = CONTEXTS.find(c => c.mode === mode) || CONTEXTS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (collapsed) {
    return (
      <div className="px-2 py-1.5">
        <button
          onClick={() => setOpen(!open)}
          className="group relative w-full flex justify-center p-1.5 rounded-lg text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors"
          title={current.label}
        >
          <current.icon size={18} stroke={1.5} />
          <div className="absolute left-full ml-2 px-2 py-1 bg-aero-dark-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg border border-aero-dark-600">
            {current.label}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative px-3 py-1.5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-aero-text-muted hover:text-white hover:bg-aero-dark-700 transition-colors"
      >
        <current.icon size={14} stroke={1.5} />
        <span className="truncate">{current.label}</span>
        <IconChevronDown size={12} className={`ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-aero-dark-700 border border-aero-dark-600 rounded-lg shadow-xl z-50 overflow-hidden">
          {CONTEXTS.map(ctx => (
            <button
              key={ctx.mode}
              onClick={() => {
                navigate(ctx.path);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                ctx.mode === mode
                  ? 'text-white bg-aero-dark-600'
                  : 'text-aero-text-muted hover:text-white hover:bg-aero-dark-600'
              }`}
            >
              <ctx.icon size={14} stroke={1.5} />
              <span>{ctx.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
