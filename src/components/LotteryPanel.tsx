import { useState } from 'react';
import type { Lottery } from '../types';
import { LotteryCard, LotteryDetail } from './LotteryCard';
import LotteryOptimizer from './LotteryOptimizer';

interface LotteryPanelProps {
  lotteries: Lottery[];
}

export default function LotteryPanel({ lotteries }: LotteryPanelProps) {
  const [activeLottery, setActiveLottery] = useState<Lottery>(lotteries[0]);

  return (
    <div className="px-3 sm:px-4 py-2 animate-slide-in">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
          <span className="text-[#B45309]">🎰</span> Gerador Quântico de Loterias
        </h2>
        <p className="text-sm text-[#64748B] mt-0.5">
          Inteligência matemática para {lotteries.length} loterias · Análise de padrões por IA
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {lotteries.map((lottery) => (
          <LotteryCard
            key={lottery.id}
            lottery={lottery}
            active={activeLottery.id === lottery.id}
            onClick={() => setActiveLottery(lottery)}
          />
        ))}
      </div>

      <LotteryDetail lottery={activeLottery} />
      <LotteryOptimizer lottery={activeLottery} />
    </div>
  );
}
