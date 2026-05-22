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
      <div className="bg-grafite-800 rounded-2xl border border-grafite-600 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-grafite-700/50 border-b border-grafite-600">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-electric-blue" />
            Painel de Performance da IA
          </h2>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Estatísticas baseadas nos últimos 30 dias de análise
          </p>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-3">
          <div className="bg-grafite-700 rounded-xl p-3 text-center">
            <Zap className="w-4 h-4 text-electric-blue mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{globalStats.totalAnalyzed}</p>
            <p className="text-[9px] text-gray-500 uppercase">Jogos Analisados</p>
          </div>
          <div className="bg-grafite-700 rounded-xl p-3 text-center">
            <TrendingUp className="w-4 h-4 text-neon-green mx-auto mb-1" />
            <p className="text-lg font-bold text-neon-green">{globalStats.hitRate}%</p>
            <p className="text-[9px] text-gray-500 uppercase">Taxa de Acerto</p>
          </div>
          <div className="bg-grafite-700 rounded-xl p-3 text-center">
            <Percent className="w-4 h-4 text-gold mx-auto mb-1" />
            <p className="text-lg font-bold text-gold">+{globalStats.avgProfit}%</p>
            <p className="text-[9px] text-gray-500 uppercase">ROI Médio</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-2 px-3 pb-3">
          <div className="bg-gradient-to-br from-neon-green/10 to-transparent rounded-lg p-2 text-center border border-neon-green/20">
            <p className="text-sm font-bold text-neon-green">{globalStats.valueBetsFound}</p>
            <p className="text-[8px] text-gray-500 uppercase">Value Bets</p>
          </div>
          <div className="bg-gradient-to-br from-gold/10 to-transparent rounded-lg p-2 text-center border border-gold/20">
            <p className="text-sm font-bold text-gold">{globalStats.surebetsFound}</p>
            <p className="text-[8px] text-gray-500 uppercase">Surebets</p>
          </div>
          <div className="bg-gradient-to-br from-electric-blue/10 to-transparent rounded-lg p-2 text-center border border-electric-blue/20">
            <p className="text-sm font-bold text-electric-blue">{globalStats.bestStreak}x</p>
            <p className="text-[8px] text-gray-500 uppercase">Melhor Sequência</p>
          </div>
        </div>

        {/* House ROI Ranking */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] text-gold font-bold uppercase tracking-wider">
              Ranking ROI por Casa de Apostas
            </span>
          </div>

          <div className="space-y-1.5">
            {visibleHouses.map((house, idx) => (
              <div
                key={house.house}
                className="flex items-center gap-2 p-2 rounded-lg bg-grafite-700/50 hover:bg-grafite-700 transition-colors"
              >
                <span className="text-[10px] text-gray-600 w-4 font-bold">#{idx + 1}</span>
                <span className="text-sm">{house.logo}</span>
                <span className="text-xs font-medium text-white flex-shrink-0 w-20 truncate">{house.house}</span>
                <div className="flex-1 h-3 bg-grafite-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      idx === 0 ? 'bg-gradient-to-r from-neon-green to-electric-blue' :
                      idx < 3 ? 'bg-neon-green/70' : 'bg-grafite-500'
                    }`}
                    style={{ width: `${(house.roi / maxRoi) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-14 text-right ${
                  idx === 0 ? 'text-neon-green' : idx < 3 ? 'text-neon-green/70' : 'text-gray-400'
                }`}>
                  +{house.roi}%
                </span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px] text-gray-500">{house.rating}</span>
                  <span className="text-[8px]">⭐</span>
                </div>
              </div>
            ))}
          </div>

          {houseStats.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-2 py-1.5 flex items-center justify-center gap-1.5 text-xs text-electric-blue hover:text-electric-blue/80 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Ver todas as {houseStats.length} casas
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
