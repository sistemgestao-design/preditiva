import { Filter } from 'lucide-react';
import type { Match } from '../types';
import MatchCard from './MatchCard';

interface FootballPanelProps {
  matches: Match[];
}

export default function FootballPanel({ matches }: FootballPanelProps) {
  const liveMatches = matches.filter((m) => m.status === 'live');
  const otherMatches = matches.filter((m) => m.status !== 'live');

  return (
    <div className="px-3 sm:px-4 py-2 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <span className="text-[#0284C7]">⚡</span> Janela de Oportunidades
          </h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            {matches.length} jogos analisados · {matches.filter((m) => m.valueBet).length} value bets detectadas
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors shadow-sm">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="text-sm text-[#64748B]">Filtrar</span>
        </button>
      </div>

      {liveMatches.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Ao Vivo</span>
            <div className="h-px flex-1 bg-red-100" />
          </div>
          <div className="grid gap-4">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-[#0284C7] uppercase tracking-wider">Próximos Jogos</span>
          <div className="h-px flex-1 bg-[#E0F2FE]" />
        </div>
        <div className="grid gap-4">
          {otherMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}
