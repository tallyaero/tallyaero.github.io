import type { DashTwoCitation } from '@/types/chat';

interface CitationCardProps {
  citation: DashTwoCitation;
  index: number;
  onClick: () => void;
}

const TYPE_COLORS: Record<DashTwoCitation['type'], string> = {
  regulation: 'bg-blue-500/10 text-blue-400',
  aim: 'bg-emerald-500/10 text-emerald-400',
  ac: 'bg-purple-500/10 text-purple-400',
  document: 'bg-gray-500/10 text-gray-400',
  training: 'bg-amber-500/10 text-amber-400',
  ntsb: 'bg-red-500/10 text-red-400',
};

const TYPE_LABELS: Record<DashTwoCitation['type'], string> = {
  regulation: 'REG',
  aim: 'AIM',
  ac: 'AC',
  document: 'DOC',
  training: 'HB',
  ntsb: 'NTSB',
};

export function CitationCard({ citation, index, onClick }: CitationCardProps) {
  const colors = TYPE_COLORS[citation.type] || 'bg-gray-500/10 text-gray-400';
  const label = TYPE_LABELS[citation.type] || 'SRC';

  return (
    <button
      onClick={onClick}
      className="flex items-start gap-2 w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-active/50 transition-colors group"
    >
      <span className={`shrink-0 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${colors}`}>
        {label}
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-medium text-body group-hover:text-heading">
          [{index + 1}] {citation.source}
        </span>
        {citation.snippet && (
          <p className="text-[10px] text-faint line-clamp-1 mt-0.5 italic">
            {citation.snippet}
          </p>
        )}
      </div>
    </button>
  );
}
