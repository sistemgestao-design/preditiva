import { useState } from 'react';
import { Wand2, Sparkles, Copy, Check } from 'lucide-react';
import type { Lottery } from '../types';

interface LotteryOptimizerProps {
  lottery: Lottery;
}

export default function LotteryOptimizer({ lottery }: LotteryOptimizerProps) {
  const [userNumbers, setUserNumbers] = useState<number[]>([]);
  const [optimizedGames, setOptimizedGames] = useState<number[][]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const toggleNumber = (num: number) => {
    setUserNumbers((prev) =>
      prev.includes(num)
        ? prev.filter((n) => n !== num)
        : [...prev, num]
    );
  };

  const optimizeGame = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const games: number[][] = [];
      const sorted = [...userNumbers].sort((a, b) => a - b);
      const numGames = Math.min(5, Math.ceil(sorted.length / lottery.pickCount));

      for (let i = 0; i < numGames; i++) {
        const game: number[] = [];
        const pool = [...sorted];
        while (game.length < lottery.pickCount && pool.length > 0) {
          const idx = Math.floor(Math.random() * pool.length);
          game.push(pool.splice(idx, 1)[0]);
        }
        games.push(game.sort((a, b) => a - b));
      }

      setOptimizedGames(games);
      setIsOptimizing(false);
    }, 1500);
  };

  const copyGame = (game: number[], idx: number) => {
    navigator.clipboard.writeText(game.join(' - '));
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
      <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2 mb-1">
        <Wand2 className="w-4 h-4 text-[#B45309]" />
        Otimizador Quântico — {lottery.name}
      </h3>
      <p className="text-xs text-[#64748B] mb-4">
        Selecione {lottery.pickCount}+ números da sorte e a IA gera o fechamento matemático perfeito
      </p>

      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 sm:gap-1.5 mb-4">
        {Array.from({ length: lottery.numbersRange }, (_, i) => i + 1).map((num) => {
          const isSelected = userNumbers.includes(num);
          const isHot = lottery.hotNumbers.includes(num);
          return (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              className={`w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200 min-h-[40px] sm:min-h-0 ${
                isSelected
                  ? 'bg-[#0284C7] text-white scale-110 shadow-md'
                  : isHot
                    ? 'bg-[#F0FDF4] text-emerald-600 border border-emerald-200 hover:border-emerald-400'
                    : 'bg-[#F8F9FA] text-[#475569] border border-[#E2E8F0] hover:border-[#94A3B8]'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <span className="text-xs text-[#64748B]">
          {userNumbers.length} selecionados · Mínimo: {lottery.pickCount}
        </span>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          {userNumbers.length > 0 && (
            <button
              onClick={() => { setUserNumbers([]); setOptimizedGames([]); }}
              className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] text-[#64748B] text-sm border border-[#E2E8F0] hover:bg-[#E2E8F0] transition-colors"
            >
              Limpar
            </button>
          )}
          <button
            onClick={optimizeGame}
            disabled={userNumbers.length < lottery.pickCount || isOptimizing}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${
              userNumbers.length >= lottery.pickCount
                ? 'bg-[#B45309] hover:bg-[#92400E] text-white shadow-md'
                : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed border border-[#E2E8F0]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {isOptimizing ? 'Otimizando...' : 'Otimizar Jogo'}
          </button>
        </div>
      </div>

      {optimizedGames.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#64748B] uppercase tracking-wider font-semibold">
            Bilhetes Otimizados pela IA
          </p>
          {optimizedGames.map((game, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-[#FEF3C7] rounded-xl border border-[#D97706]/20 animate-slide-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#B45309]">#{idx + 1}</span>
                <div className="flex flex-wrap gap-1">
                  {game.map((num) => (
                    <span
                      key={num}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-[#B45309] text-xs font-bold border border-[#D97706]/30"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => copyGame(game, idx)}
                className="p-1.5 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0"
                title="Copiar bilhete"
              >
                {copiedIdx === idx ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-[#B45309]" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
