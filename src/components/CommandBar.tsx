import { Zap, TrendingUp, Percent, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Match } from '../types';

interface CommandBarProps {
  matches: Match[];
  refreshing: boolean;
  onRefresh: () => void;
}

interface StatCard {
  label: string;
  value: string;
  Icon: typeof Zap;
  accent: 'cyan' | 'goldgreen' | 'gold' | 'red';
}

const ACCENT: Record<StatCard['accent'], { ring: string; text: string }> = {
  cyan: { ring: 'neon-border', text: 'text-[#0284C7]' },
  goldgreen: { ring: 'neon-border-gold', text: 'text-emerald-600' },
  gold: { ring: 'neon-border-gold', text: 'text-[#B45309]' },
  red: { ring: 'neon-border-red', text: 'text-red-600' },
};

export default function CommandBar({ matches, refreshing, onRefresh }: CommandBarProps) {
  const analyzed = matches.length;
  const valueBets = matches.filter((m) => m.valueBet).length;

  const cards: StatCard[] = [
    { label: 'Jogos Analisados', value: analyzed > 0 ? String(analyzed) : '—', Icon: Zap, accent: 'cyan' },
    { label: 'Taxa de Acerto', value: '76.1%', Icon: TrendingUp, accent: 'goldgreen' },
    { label: 'ROI Médio', value: '+10.2%', Icon: Percent, accent: 'cyan' },
    {
      label: 'Surebets & Alertas',
      value: `${valueBets} ${valueBets === 1 ? 'ativo' : 'ativos'}`,
      Icon: AlertTriangle,
      accent: 'red',
    },
  ];

  return (
    <div className="px-3 sm:px-4 pt-3 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {cards.map((c) => {
          const a = ACCENT[c.accent];
          return (
            <div
              key={c.label}
              className={`bg-white rounded-xl px-3 py-3 sm:py-4 ${a.ring} transition-transform hover:-translate-y-0.5`}
            >
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#64748B] leading-tight">
                {c.label}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <c.Icon className={`w-4 h-4 ${a.text}`} />
                <span className={`text-xl sm:text-2xl font-extrabold ${a.text}`}>{c.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="w-full neon-border neon-glow-pulse bg-white rounded-xl py-3.5 flex items-center justify-center gap-2.5 font-extrabold text-sm sm:text-base uppercase tracking-wider text-[#0284C7] disabled:opacity-70 transition-all hover:brightness-110"
      >
        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin-slow' : ''}`} />
        {refreshing ? 'Analisando…' : 'Analisar Jogos de Hoje'}
      </button>
    </div>
  );
}
