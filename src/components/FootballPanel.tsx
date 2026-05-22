import { Filter } from 'lucide-react';
import type { Match } from '../types';
import MatchCard from './MatchCard';

interface FootballPanelProps {
  matches: Match[];
}

export default function FootballPanel({ matches }: FootballPanelProps) {
  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status !== 'live');

  return (
    <div className="px-3 sm:px-4 py-2 animate-slide-in">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-neon-green">⚡</span> Janela de Oportunidades
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {matches.length} jogos analisados · {matches.filter((m) => m.valueBet).length} value bets detectadas
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-grafite-700 border border-grafite-500 hover:bg-grafite-600 transition-colors">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm text-gray-400">Filtrar</span>
        </button>
      </div>

      {/* Live Games */}
      {liveMatches.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Ao Vivo</span>
            <div className="h-px flex-1 bg-red-500/20" />
          </div>
          <div className="grid gap-3">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Games */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-electric-blue uppercase tracking-wider">Próximos Jogos</span>
          <div className="h-px flex-1 bg-electric-blue/20" />
        </div>
        <div className="grid gap-3">
          {upcomingMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
}
