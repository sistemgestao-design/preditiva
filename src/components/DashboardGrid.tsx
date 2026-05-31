import { Trophy, Radio } from 'lucide-react';
import type { Match } from '../types';

const HOUSE_STYLE: Record<string, { bg: string; fg: string }> = {
  Betano: { bg: '#ff6a00', fg: '#ffffff' },
  Bet365: { bg: '#027b5b', fg: '#ffffff' },
  Betfair: { bg: '#ffb80c', fg: '#111111' },
  Superbet: { bg: '#e2001a', fg: '#ffffff' },
  Betway: { bg: '#00a826', fg: '#ffffff' },
  Stake: { bg: '#1a73e8', fg: '#ffffff' },
  Matchbook: { bg: '#0a3d62', fg: '#ffffff' },
  Smarkets: { bg: '#00b3a4', fg: '#ffffff' },
};

function HouseBadge({ name }: { name: string }) {
  const s = HOUSE_STYLE[name] ?? { bg: '#334155', fg: '#ffffff' };
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-extrabold leading-none"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {name}
    </span>
  );
}

const ROI_RANKING = [
  { house: 'Betfair', roi: 14.1 },
  { house: 'Superbet', roi: 12.8 },
  { house: 'Bet365', roi: 11.2 },
  { house: 'Betano', roi: 9.9 },
  { house: 'Betway', roi: 9.5 },
];

function pickFeatured(matches: Match[]): Match | undefined {
  return (
    matches.find((m) => m.status === 'live' && m.oddsComparison.length > 0) ??
    matches.find((m) => m.oddsComparison.length > 0) ??
    matches[0]
  );
}

export default function DashboardGrid({ matches }: { matches: Match[] }) {
  const maxRoi = Math.max(...ROI_RANKING.map((h) => h.roi));
  const featured = pickFeatured(matches);
  const odds = featured?.oddsComparison.slice(0, 4) ?? [];

  return (
    <div className="px-3 sm:px-4 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* ROI ranking */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm dark:neon-border">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#0284C7] flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4" /> Ranking ROI por Casa de Apostas
        </h3>
        <div className="space-y-2.5">
          {ROI_RANKING.map((h, idx) => (
            <div key={h.house} className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-[#94A3B8] w-4">{idx + 1}.</span>
              <span className="w-20 shrink-0">
                <HouseBadge name={h.house} />
              </span>
              <div className="flex-1 h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    idx === 0 ? 'bg-[#ffd700]' : 'bg-[#00e0ff]'
                  }`}
                  style={{
                    width: `${(h.roi / maxRoi) * 100}%`,
                    boxShadow:
                      idx === 0
                        ? '0 0 10px rgba(255,215,0,0.6)'
                        : '0 0 10px rgba(0,224,255,0.6)',
                  }}
                />
              </div>
              <span className="text-sm font-extrabold text-emerald-600 w-14 text-right">{h.roi}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live match analysis */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm dark:neon-border">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#0284C7] flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4" /> Jogos em Análise (Live)
        </h3>

        {featured ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-center gap-1.5 w-1/3 text-center">
                <img src={featured.homeTeam.logo} alt={featured.homeTeam.name} className="w-12 h-12 object-contain" />
                <span className="text-sm font-bold text-[#0F172A] leading-tight">{featured.homeTeam.name}</span>
              </div>
              <div className="flex flex-col items-center w-1/3">
                <span className="text-xl font-extrabold text-[#0F172A]">VS</span>
                {featured.expectedGoals ? (
                  <span className="text-[11px] text-[#64748B] mt-1">xG Esperado: {featured.expectedGoals}</span>
                ) : null}
              </div>
              <div className="flex flex-col items-center gap-1.5 w-1/3 text-center">
                <img src={featured.awayTeam.logo} alt={featured.awayTeam.name} className="w-12 h-12 object-contain" />
                <span className="text-sm font-bold text-[#0F172A] leading-tight">{featured.awayTeam.name}</span>
              </div>
            </div>

            {/* Probability bar */}
            <div className="mt-3 w-full h-7 rounded-lg overflow-hidden flex text-[11px] font-bold text-white">
              <div className="bg-[#dc2626] flex items-center justify-center" style={{ width: `${featured.homeProb}%` }}>
                {featured.homeTeam.shortName} {featured.homeProb}%
              </div>
              <div className="bg-[#475569] flex items-center justify-center" style={{ width: `${featured.drawProb}%` }}>
                Emp {featured.drawProb}%
              </div>
              <div className="bg-[#334155] flex items-center justify-center" style={{ width: `${featured.awayProb}%` }}>
                {featured.awayTeam.shortName} {featured.awayProb}%
              </div>
            </div>

            {/* Odds rows */}
            <div className="mt-3 space-y-1.5">
              {odds.length > 0 ? (
                odds.map((o, idx) => (
                  <div
                    key={`${o.house}-${idx}`}
                    className="flex items-center justify-between gap-2 bg-[#F8F9FA] rounded-lg px-2.5 py-1.5 border border-[#E2E8F0]"
                  >
                    <HouseBadge name={o.house} />
                    <div className="flex items-center gap-3 text-xs font-bold text-[#0F172A]">
                      <span>{featured.homeTeam.shortName}: {o.homeOdd.toFixed(2)}</span>
                      <span className="text-[#94A3B8]">Emp: {o.drawOdd.toFixed(2)}</span>
                      <span>{featured.awayTeam.shortName}: {o.awayOdd.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#94A3B8] text-center py-2">⏳ Aguardando odds do mercado</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-[#94A3B8] text-center py-6">Aguardando jogos do dia…</p>
        )}
      </div>
    </div>
  );
}
