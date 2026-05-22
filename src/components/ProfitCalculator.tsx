import { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface ProfitCalculatorProps {
  odd: number;
  label: string;
}

export default function ProfitCalculator({ odd, label }: ProfitCalculatorProps) {
  const [stake, setStake] = useState('');
  const [expanded, setExpanded] = useState(false);

  const stakeNum = parseFloat(stake) || 0;
  const profit = stakeNum * odd - stakeNum;
  const totalReturn = stakeNum * odd;

  const presets = [10, 25, 50, 100, 250, 500];

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg bg-grafite-700/50 hover:bg-grafite-700 transition-colors"
      >
        <span className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
          <Calculator className="w-3 h-3" />
          Calculadora de Lucro
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 p-3 bg-grafite-700/30 rounded-xl border border-grafite-500 animate-slide-in">
          <p className="text-[10px] text-gray-500 mb-2">
            Aposta: <span className="text-white font-medium">{label}</span> @ <span className="text-neon-green font-bold">{odd.toFixed(2)}</span>
          </p>

          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="Valor da aposta"
                className="w-full pl-8 pr-3 py-2 bg-grafite-800 border border-grafite-500 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-electric-blue transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-1.5 mb-3 flex-wrap">
            {presets.map((val) => (
              <button
                key={val}
                onClick={() => setStake(val.toString())}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  stake === val.toString()
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                    : 'bg-grafite-700 text-gray-400 border border-grafite-500 hover:border-gray-400'
                }`}
              >
                R$ {val}
              </button>
            ))}
          </div>

          {stakeNum > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-grafite-800 rounded-lg p-2 text-center border border-grafite-500">
                <p className="text-[9px] text-gray-500 uppercase">Investido</p>
                <p className="text-sm font-bold text-white">R$ {stakeNum.toFixed(2)}</p>
              </div>
              <div className="bg-grafite-800 rounded-lg p-2 text-center border border-neon-green/20">
                <p className="text-[9px] text-neon-green uppercase">Lucro</p>
                <p className="text-sm font-bold text-neon-green flex items-center justify-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  R$ {profit.toFixed(2)}
                </p>
              </div>
              <div className="bg-grafite-800 rounded-lg p-2 text-center border border-electric-blue/20">
                <p className="text-[9px] text-electric-blue uppercase">Retorno</p>
                <p className="text-sm font-bold text-electric-blue">R$ {totalReturn.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
