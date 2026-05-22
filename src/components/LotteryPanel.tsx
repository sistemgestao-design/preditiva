import { useState } from 'react';
import type { Lottery } from '../types';
import LotteryCard, { LotteryDetail } from './LotteryCard';
import LotteryOptimizer from './LotteryOptimizer';

interface LotteryPanelProps {
  lotteries: Lottery[];
}

export default function LotteryPanel({ lotteries }: LotteryPanelProps) {
  const [activeLottery, setActiveLottery] = useState<Lottery>(lotteries[0]);

  return (
    <div className="px-3 sm:px-4 py-2 animate-slide-in">
      <div className="mb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-gold">🎰</span> Gerador Quântico de Loterias
        </h2>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Inteligência matemática para {lotteries.length} loterias · Análise de padrões por IA
        </p>
      </div>

      {/* Lottery Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {lotteries.map((lottery) => (
          <LotteryCard
            key={lottery.id}
            lottery={lottery}
            isActive={activeLottery.id === lottery.id}
            onClick={() => setActiveLottery(lottery)}
          />
        ))}
      </div>

      {/* Active Lottery Detail */}
      <LotteryDetail lottery={activeLottery} />

      {/* Optimizer */}
      <div className="mt-4">
        <LotteryOptimizer lottery={activeLottery} />
      </div>
    </div>
  );
}
