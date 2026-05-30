import { useState } from 'react';
import { ChevronDown, ChevronUp, Crown, Gift } from 'lucide-react';
import type { BettingHouseOdd } from '../types';

interface OddsComparisonProps {
  odds: BettingHouseOdd[];
  homeShort: string;
  awayShort: string;
}

export default function OddsComparison({ odds, homeShort, awayShort }: OddsComparisonProps) {
  const [expanded, setExpanded] = useState(false);

  const sortedOdds = [...odds].sort((a, b) => {
    if (a.isBest) return -1;
    if (b.isBest) return 1;
    return Math.max(b.homeOdd, b.drawOdd, b.awayOdd) - Math.max(a.homeOdd, a.drawOdd, a.awayOdd);
  });

  const visibleOdds = expanded ? sortedOdds : sortedOdds.slice(0, 4);

  const bestHome = Math.max(...odds.map((o) => o.homeOdd));
  const bestDraw = Math.max(...odds.map((o) => o.drawOdd));
  const bestAway = Math.max(...odds.map((o) => o.awayOdd));

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] transition-colors mb-2"
      >
        <span className="text-xs font-bold text-[#0284C7] uppercase tracking-wider flex items-center gap-1.5">
          ⚡ Radar de Odds — 10 Casas
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
        )}
      </button>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-[1fr_50px_50px_50px] sm:grid-cols-[1fr_60px_60px_60px] gap-1 px-2 mb-1 min-w-0">
          <span className="text-xs text-[#94A3B8] uppercase font-semibold">Casa</span>
          <span className="text-xs text-[#94A3B8] uppercase text-center font-semibold">{homeShort}</span>
          <span className="text-xs text-[#94A3B8] uppercase text-center font-semibold">Emp</span>
          <span className="text-xs text-[#94A3B8] uppercase text-center font-semibold">{awayShort}</span>
        </div>

        <div className="space-y-1">
          {visibleOdds.map((odd) => (
            <div
              key={odd.house}
              className={`grid grid-cols-[1fr_50px_50px_50px] sm:grid-cols-[1fr_60px_60px_60px] gap-1 items-center px-2 py-2 sm:py-1.5 rounded-xl transition-colors ${
                odd.isBest
                  ? 'bg-[#FEF3C7] border border-[#D97706]/30'
                  : 'bg-[#F8F9FA] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm">{odd.logo}</span>
                <span className={`text-sm font-medium truncate ${odd.isBest ? 'text-[#78350F]' : 'text-[#475569]'}`}>
                  {odd.house}
                </span>
                {odd.isBest && <Crown className="w-3 h-3 text-[#B45309] flex-shrink-0" />}
                {odd.bonus && (
                  <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-[#FEF3C7] text-[#B45309] text-[8px] font-bold rounded-full border border-[#D97706]/20">
                    <Gift className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">{odd.bonus}</span>
                  </span>
                )}
              </div>
              <span className={`text-sm font-bold text-center ${odd.homeOdd === bestHome ? 'text-[#059669]' : 'text-[#0F172A]'}`}>
                {odd.homeOdd.toFixed(2)}
              </span>
              <span className={`text-sm font-bold text-center ${odd.drawOdd === bestDraw ? 'text-[#059669]' : 'text-[#0F172A]'}`}>
                {odd.drawOdd.toFixed(2)}
              </span>
              <span className={`text-sm font-bold text-center ${odd.awayOdd === bestAway ? 'text-[#059669]' : 'text-[#0F172A]'}`}>
                {odd.awayOdd.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {!expanded && odds.length > 4 && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full mt-1 py-1.5 text-xs text-[#0284C7] font-semibold hover:text-[#0369A1] transition-colors"
          >
            + {odds.length - 4} casas de apostas
          </button>
        )}
      </div>
    </div>
  );
}
