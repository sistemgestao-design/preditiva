import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import type { Lottery } from '../types';

interface LotteryCardProps {
  lottery: Lottery;
  active: boolean;
  onClick: () => void;
}

export function LotteryCard({ lottery, active, onClick }: LotteryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-36 sm:w-44 p-3 sm:p-4 rounded-2xl border transition-all duration-300 text-left ${
        active
          ? 'bg-[#FEF3C7] border-[#D97706] shadow-md'
          : 'bg-white border-[#E2E8F0] hover:border-[#94A3B8] shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">🎰</span>
        {lottery.accumulated && (
          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded-full uppercase">
            Acumulou
          </span>
        )}
      </div>
      <h3 className="font-bold text-[#0F172A] text-base mb-1">{lottery.name}</h3>
      <p className={`text-xl font-bold mb-1 ${active ? 'text-[#B45309]' : 'text-[#0284C7]'}`}>{lottery.prize}</p>
      <p className="text-xs text-[#64748B]">{lottery.nextDraw}</p>
    </button>
  );
}

interface LotteryDetailProps {
  lottery: Lottery;
}

export function LotteryDetail({ lottery }: LotteryDetailProps) {
  return (
    <div className="animate-slide-in space-y-4">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
        <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-[#0284C7]" />
          Insights da IA — {lottery.name}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="bg-[#F0FDF4] rounded-xl p-3 border border-emerald-100">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs text-emerald-600 font-bold uppercase">Números Quentes</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lottery.hotNumbers.slice(0, 6).map((num) => (
                <span
                  key={num}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#EFF6FF] rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-3.5 h-3.5 text-[#0284C7]" />
              <span className="text-xs text-[#0284C7] font-bold uppercase">Números Frios</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lottery.coldNumbers.slice(0, 6).map((num) => (
                <span
                  key={num}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-[#0284C7] text-xs font-bold border border-blue-200"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-[#64748B] mb-2 uppercase tracking-wider font-semibold">Distribuição dos Últimos 100 Sorteios</p>
          <div className="space-y-1.5">
            {[
              { range: '01-10', pct: 22, color: 'bg-emerald-500' },
              { range: '11-20', pct: 18, color: 'bg-[#0284C7]' },
              { range: '21-30', pct: 15, color: 'bg-[#D97706]' },
              { range: '31-40', pct: 14, color: 'bg-purple-500' },
              { range: '41-50', pct: 17, color: 'bg-orange-500' },
              { range: '51-60', pct: 14, color: 'bg-pink-500' },
            ].slice(0, Math.ceil(lottery.numbersRange / 10)).map((item) => (
              <div key={item.range} className="flex items-center gap-2">
                <span className="text-xs text-[#64748B] w-10">{item.range}</span>
                <div className="flex-1 h-4 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="text-xs text-[#475569] w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[#64748B] mb-2 uppercase tracking-wider font-semibold">Últimos Resultados</p>
          <div className="space-y-2">
            {lottery.lastResults.map((result, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-[#94A3B8] w-12">#{idx + 1}</span>
                <div className="flex flex-wrap gap-1">
                  {result.map((num) => (
                    <span
                      key={num}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569] text-xs font-medium border border-[#E2E8F0]"
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
