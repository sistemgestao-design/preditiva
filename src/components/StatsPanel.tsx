import { useState } from 'react';
import { BarChart3, TrendingUp, Award, Percent, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface HouseStats {
  house: string;
  logo: string;
  avgOdd: number;
  bestOddsCount: number;
  roi: number;
  rating: number;
}

const houseStats: HouseStats[] = [
  { house: 'Betfair', logo: '🟡', avgOdd: 2.35, bestOddsCount: 8, roi: 12.4, rating: 9.5 },
  { house: 'Superbet', logo: '🟡', avgOdd: 2.28, bestOddsCount: 6, roi: 10.8, rating: 9.2 },
  { house: 'Bet365', logo: '🟢', avgOdd: 2.22, bestOddsCount: 5, roi: 9.5, rating: 9.0 },
  { house: 'Stake', logo: '🔵', avgOdd: 2.18, bestOddsCount: 4, roi: 8.2, rating: 8.7 },
  { house: 'Betano', logo: '🟠', avgOdd: 2.20, bestOddsCount: 4, roi: 7.9, rating: 8.5 },
  { house: 'Sportingbet', logo: '⚫', avgOdd: 2.15, bestOddsCount: 3, roi: 6.8, rating: 8.2 },
  { house: 'KTO', logo: '🟣', avgOdd: 2.14, bestOddsCount: 2, roi: 6.2, rating: 8.0 },
  { house: 'Novibet', logo: '🔴', avgOdd: 2.12, bestOddsCount: 2, roi: 5.8, rating: 7.8 },
  { house: 'Pixbet', logo: '🟢', avgOdd: 2.08, bestOddsCount: 1, roi: 4.5, rating: 7.5 },
  { house: 'Estrela Bet', logo: '⭐', avgOdd: 2.10, bestOddsCount: 1, roi: 5.0, rating: 7.6 },
];

const globalStats = {
  totalAnalyzed: 847,
  hitRate: 72.3,
  avgProfit: 8.7,
  surebetsFound: 23,
  valueBetsFound: 156,
  bestStreak: 12,
};

export default function StatsPanel() {
  const [expanded, setExpanded] = useState(false);
  const visibleHouses = expanded ? houseStats : houseStats.slice(0, 5);
  const maxRoi = Math.max(...houseStats.map((h) => h.roi));

  return (
    <div className="px-4 py-2">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-3 bg-[#F1F5F9] border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0284C7]" />
            Painel de Performance da IA
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Estatísticas baseadas nos últimos 30 dias de análise
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4">
          <div className="bg-[#EFF6FF] rounded-xl p-3 text-center border border-blue-100">
            <Zap className="w-4 h-4 text-[#0284C7] mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-extrabold text-[#0F172A]">{globalStats.totalAnalyzed}</p>
            <p className="text-[10px] sm:text-xs text-[#64748B] uppercase font-semibold">Jogos Analisados</p>
          </div>
          <div className="bg-[#F0FDF4] rounded-xl p-3 text-center border border-emerald-100">
            <TrendingUp className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-extrabold text-emerald-700">{globalStats.hitRate}%</p>
            <p className="text-[10px] sm:text-xs text-[#64748B] uppercase font-semibold">Taxa de Acerto</p>
          </div>
          <div className="bg-[#FEF3C7] rounded-xl p-3 text-center border border-amber-200">
            <Percent className="w-4 h-4 text-[#B45309] mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-extrabold text-[#B45309]">+{globalStats.avgProfit}%</p>
            <p className="text-[10px] sm:text-xs text-[#64748B] uppercase font-semibold">ROI Médio</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="bg-[#F8F9FA] rounded-lg p-2 text-center border border-[#E2E8F0]">
            <p className="text-base font-bold text-emerald-600">{globalStats.valueBetsFound}</p>
            <p className="text-[10px] text-[#64748B] uppercase font-semibold">Value Bets</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-lg p-2 text-center border border-[#E2E8F0]">
            <p className="text-base font-bold text-[#B45309]">{globalStats.surebetsFound}</p>
            <p className="text-[10px] text-[#64748B] uppercase font-semibold">Surebets</p>
          </div>
          <div className="bg-[#F8F9FA] rounded-lg p-2 text-center border border-[#E2E8F0]">
            <p className="text-base font-bold text-[#0284C7]">{globalStats.bestStreak}x</p>
            <p className="text-[10px] text-[#64748B] uppercase font-semibold">Melhor Sequência</p>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-3.5 h-3.5 text-[#B45309]" />
            <span className="text-xs text-[#B45309] font-bold uppercase tracking-wider">
              Ranking ROI por Casa de Apostas
            </span>
          </div>

          <div className="space-y-1.5">
            {visibleHouses.map((house, idx) => (
              <div
                key={house.house}
                className={`flex items-center gap-2 p-2 rounded-xl transition-colors ${
                  idx === 0 ? 'bg-[#FEF3C7] border border-[#D97706]/20' : 'bg-[#F8F9FA] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
                }`}
              >
                <span className="text-xs text-[#64748B] w-5 font-bold">#{idx + 1}</span>
                <span className="text-base">{house.logo}</span>
                <span className={`text-sm font-medium flex-shrink-0 w-20 sm:w-24 truncate ${idx === 0 ? 'text-[#78350F]' : 'text-[#0F172A]'}`}>{house.house}</span>
                <div className="flex-1 h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? 'bg-[#D97706]' : 'bg-[#0284C7]'}`}
                    style={{ width: `${(house.roi / maxRoi) * 100}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${idx === 0 ? 'text-[#B45309]' : 'text-[#059669]'}`}>
                  +{house.roi}%
                </span>
              </div>
            ))}
          </div>

          {houseStats.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-2 py-1.5 flex items-center justify-center gap-1.5 text-sm text-[#0284C7] font-semibold hover:text-[#0369A1] transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Menos casas
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  + {houseStats.length - 5} casas
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
