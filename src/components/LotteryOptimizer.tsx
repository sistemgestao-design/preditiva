import { useState } from 'react';
import { Wand2, Copy, Check, Sparkles } from 'lucide-react';
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
        : prev.length < lottery.pickCount + 4
          ? [...prev, num].sort((a, b) => a - b)
          : prev
    );
    setOptimizedGames([]);
  };

  const optimizeGame = () => {
    if (userNumbers.length < lottery.pickCount) return;
    setIsOptimizing(true);

    setTimeout(() => {
      const games: number[][] = [];
      const pool = [...userNumbers];

      for (let g = 0; g < Math.min(Math.ceil(pool.length / lottery.pickCount) + 2, 6); g++) {
        const game: number[] = [];
        const available = [...pool];
        while (game.length < lottery.pickCount && available.length > 0) {
          const idx = Math.floor(Math.random() * available.length);
          game.push(available[idx]);
          available.splice(idx, 1);
        }
        while (game.length < lottery.pickCount) {
          let num: number;
          do {
            num = Math.floor(Math.random() * lottery.numbersRange) + 1;
          } while (game.includes(num));
          game.push(num);
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
    <div className="bg-grafite-800 rounded-2xl border border-grafite-600 p-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
        <Wand2 className="w-4 h-4 text-gold" />
        Otimizador Quântico — {lottery.name}
      </h3>
      <p className="text-[10px] text-gray-500 mb-4">
        Selecione {lottery.pickCount}+ números da sorte e a IA gera o fechamento matemático perfeito
      </p>

      {/* Number Grid */}
      <div className="grid grid-cols-10 gap-1.5 mb-4">
        {Array.from({ length: lottery.numbersRange }, (_, i) => i + 1).map((num) => {
          const isSelected = userNumbers.includes(num);
          const isHot = lottery.hotNumbers.includes(num);
          return (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              className={`w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-br from-neon-green to-electric-blue text-grafite-900 scale-110 shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                  : isHot
                    ? 'bg-grafite-700 text-neon-green border border-neon-green/20 hover:border-neon-green/50'
                    : 'bg-grafite-700 text-gray-400 border border-grafite-500 hover:border-gray-400'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-gray-500">
          {userNumbers.length} selecionados · Mínimo: {lottery.pickCount}
        </span>
        <div className="flex gap-2">
          {userNumbers.length > 0 && (
            <button
              onClick={() => { setUserNumbers([]); setOptimizedGames([]); }}
              className="px-3 py-1.5 rounded-lg bg-grafite-700 text-gray-400 text-xs hover:bg-grafite-600 transition-colors"
            >
              Limpar
            </button>
          )}
          <button
            onClick={optimizeGame}
            disabled={userNumbers.length < lottery.pickCount || isOptimizing}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
              userNumbers.length >= lottery.pickCount
                ? 'bg-gradient-to-r from-gold to-orange-500 text-grafite-900 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                : 'bg-grafite-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
            {isOptimizing ? 'Otimizando...' : 'Otimizar Jogo'}
          </button>
        </div>
      </div>

      {/* Optimized Games */}
      {optimizedGames.length > 0 && (
        <div className="space-y-2 animate-slide-in">
          <p className="text-[10px] text-neon-green font-bold uppercase tracking-wider">
            ✨ {optimizedGames.length} Bilhetes Otimizados pela IA
          </p>
          {optimizedGames.map((game, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-grafite-700 rounded-xl border border-grafite-500"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-14">Jogo {idx + 1}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {game.map((num) => (
                    <span
                      key={num}
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold ${
                        userNumbers.includes(num)
                          ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                          : 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                      }`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => copyGame(game, idx)}
                className="p-2 rounded-lg hover:bg-grafite-600 transition-colors"
              >
                {copiedIdx === idx ? (
                  <Check className="w-4 h-4 text-neon-green" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
