import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import type { Lottery } from '../types';

interface LotteryCardProps {
  lottery: Lottery;
  isActive: boolean;
  onClick: () => void;
}

export default function LotteryCard({ lottery, isActive, onClick }: LotteryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-36 sm:w-44 p-3 sm:p-4 rounded-2xl border transition-all duration-300 text-left ${
        isActive
          ? 'bg-gradient-to-br from-gold/15 to-orange-500/10 border-gold/40 shadow-[0_0_20px_rgba(255,215,0,0.1)]'
          : 'bg-grafite-800 border-grafite-600 hover:border-grafite-500'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">🎰</span>
        {lottery.accumulated && (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-bold rounded-full uppercase">
            Acumulou
          </span>
        )}
      </div>
      <h3 className="font-bold text-white text-base mb-1">{lottery.name}</h3>
      <p className="text-xl font-bold text-gold mb-1">{lottery.prize}</p>
      <p className="text-xs text-gray-500">{lottery.nextDraw}</p>
    </button>
  );
}

interface LotteryDetailProps {
  lottery: Lottery;
}

export function LotteryDetail({ lottery }: LotteryDetailProps) {
  return (
    <div className="animate-slide-in space-y-4">
      {/* Distribution Chart */}
      <div className="bg-grafite-800 rounded-2xl border border-grafite-600 p-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-electric-blue" />
          Insights da IA — {lottery.name}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Hot Numbers */}
          <div className="bg-grafite-700 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-neon-green" />
              <span className="text-xs text-neon-green font-bold uppercase">Números Quentes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lottery.hotNumbers.slice(0, 6).map((num) => (
                <span
                  key={num}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-neon-green/20 text-neon-green text-xs font-bold border border-neon-green/30"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>

          {/* Cold Numbers */}
          <div className="bg-grafite-700 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-3.5 h-3.5 text-electric-blue" />
              <span className="text-xs text-electric-blue font-bold uppercase">Números Frios</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lottery.coldNumbers.slice(0, 6).map((num) => (
                <span
                  key={num}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-electric-blue/20 text-electric-blue text-xs font-bold border border-electric-blue/30"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution Bar */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Distribuição dos Últimos 100 Sorteios</p>
          <div className="space-y-1.5">
            {[
              { range: '01-10', pct: 22, color: 'bg-neon-green' },
              { range: '11-20', pct: 18, color: 'bg-electric-blue' },
              { range: '21-30', pct: 15, color: 'bg-gold' },
              { range: '31-40', pct: 14, color: 'bg-purple-500' },
              { range: '41-50', pct: 17, color: 'bg-orange-500' },
              { range: '51-60', pct: 14, color: 'bg-pink-500' },
            ].slice(0, Math.ceil(lottery.numbersRange / 10)).map((item) => (
              <div key={item.range} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-10">{item.range}</span>
                <div className="flex-1 h-4 bg-grafite-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Results */}
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Últimos Resultados</p>
          <div className="space-y-2">
            {lottery.lastResults.map((result, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 w-4">#{idx + 1}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {result.map((num) => (
                    <span
                      key={num}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-grafite-700 text-white text-[10px] font-bold border border-grafite-500"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
