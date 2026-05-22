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
        className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-grafite-700/50 hover:bg-grafite-700 transition-colors mb-2"
      >
        <span className="text-xs font-bold text-electric-blue uppercase tracking-wider flex items-center gap-1.5">
          📊 Comparar Odds — 10 Casas do Brasil
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>

      <div className="overflow-x-auto">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_50px_50px_50px] sm:grid-cols-[1fr_60px_60px_60px] gap-1 px-2 mb-1 min-w-0">
          <span className="text-xs text-gray-600 uppercase">Casa</span>
          <span className="text-xs text-gray-600 uppercase text-center">{homeShort}</span>
          <span className="text-xs text-gray-600 uppercase text-center">Emp</span>
          <span className="text-xs text-gray-600 uppercase text-center">{awayShort}</span>
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {visibleOdds.map((odd) => (
            <div
              key={odd.house}
              className={`grid grid-cols-[1fr_50px_50px_50px] sm:grid-cols-[1fr_60px_60px_60px] gap-1 items-center px-2 py-2 sm:py-1.5 rounded-lg transition-colors ${
                odd.isBest
                  ? 'bg-neon-green/10 border border-neon-green/20'
                  : 'bg-grafite-700/30 hover:bg-grafite-700/50'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm">{odd.logo}</span>
                <span className={`text-sm font-medium truncate ${odd.isBest ? 'text-neon-green' : 'text-gray-300'}`}>
                  {odd.house}
                </span>
                {odd.isBest && <Crown className="w-3 h-3 text-gold flex-shrink-0" />}
                {odd.bonus && (
                  <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-gold/10 text-gold text-[8px] font-bold rounded-full">
                    <Gift className="w-2.5 h-2.5" />
                    {odd.bonus}
                  </span>
                )}
              </div>
              <span className={`text-sm font-bold text-center ${odd.homeOdd === bestHome ? 'text-neon-green' : 'text-gray-300'}`}>
                {odd.homeOdd.toFixed(2)}
              </span>
              <span className={`text-sm font-bold text-center ${odd.drawOdd === bestDraw ? 'text-neon-green' : 'text-gray-300'}`}>
                {odd.drawOdd.toFixed(2)}
              </span>
              <span className={`text-sm font-bold text-center ${odd.awayOdd === bestAway ? 'text-neon-green' : 'text-gray-300'}`}>
                {odd.awayOdd.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {!expanded && odds.length > 4 && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full mt-1 py-1.5 text-xs text-electric-blue hover:text-electric-blue/80 transition-colors"
          >
            + {odds.length - 4} casas de apostas
          </button>
        )}
      </div>
    </div>
  );
}
