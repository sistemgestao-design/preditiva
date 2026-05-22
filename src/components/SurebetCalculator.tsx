import { useState } from 'react';
import { Shield, DollarSign, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { BettingHouseOdd } from '../types';

interface SurebetCalculatorProps {
  odds: BettingHouseOdd[];
  homeShort: string;
  awayShort: string;
}

export default function SurebetCalculator({ odds, homeShort, awayShort }: SurebetCalculatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [totalStake, setTotalStake] = useState('100');

  const bestHomeOdd = Math.max(...odds.map((o) => o.homeOdd));
  const bestDrawOdd = Math.max(...odds.map((o) => o.drawOdd));
  const bestAwayOdd = Math.max(...odds.map((o) => o.awayOdd));

  const bestHomeHouse = odds.find((o) => o.homeOdd === bestHomeOdd);
  const bestDrawHouse = odds.find((o) => o.drawOdd === bestDrawOdd);
  const bestAwayHouse = odds.find((o) => o.awayOdd === bestAwayOdd);

  const margin = (1 / bestHomeOdd + 1 / bestDrawOdd + 1 / bestAwayOdd);
  const isSurebet = margin < 1;
  const profitPct = isSurebet ? ((1 / margin - 1) * 100) : 0;

  const stakeNum = parseFloat(totalStake) || 0;
  const homeStake = stakeNum * (1 / bestHomeOdd) / margin;
  const drawStake = stakeNum * (1 / bestDrawOdd) / margin;
  const awayStake = stakeNum * (1 / bestAwayOdd) / margin;
  const guaranteedReturn = isSurebet ? stakeNum / margin : 0;
  const guaranteedProfit = guaranteedReturn - stakeNum;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors ${
          isSurebet
            ? 'bg-neon-green/10 hover:bg-neon-green/15 border border-neon-green/20'
            : 'bg-grafite-700/50 hover:bg-grafite-700'
        }`}
      >
        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isSurebet ? 'text-neon-green' : 'text-gray-400'
        }`}>
          <Shield className="w-3 h-3" />
          {isSurebet ? `SUREBET DETECTADA — Lucro ${profitPct.toFixed(2)}%` : 'Análise de Arbitragem'}
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 p-3 rounded-xl border animate-slide-in bg-grafite-700/30 border-grafite-500">
          {isSurebet ? (
            <>
              <div className="flex items-center gap-2 mb-3 p-2 bg-neon-green/10 rounded-lg border border-neon-green/20">
                <Shield className="w-4 h-4 text-neon-green" />
                <p className="text-sm text-neon-green font-bold">
                  Lucro garantido de {profitPct.toFixed(2)}% independente do resultado!
                </p>
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Valor total para investir:</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="number"
                    value={totalStake}
                    onChange={(e) => setTotalStake(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-grafite-800 border border-grafite-500 rounded-lg text-base text-white placeholder-gray-600 focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between p-2 bg-grafite-800 rounded-lg border border-grafite-500">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{bestHomeHouse?.logo}</span>
                    <div>
                      <p className="text-xs text-gray-500">{homeShort} na {bestHomeHouse?.house}</p>
                      <p className="text-sm text-white font-bold">@ {bestHomeOdd.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-neon-green">R$ {homeStake.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between p-2 bg-grafite-800 rounded-lg border border-grafite-500">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{bestDrawHouse?.logo}</span>
                    <div>
                      <p className="text-xs text-gray-500">Empate na {bestDrawHouse?.house}</p>
                      <p className="text-sm text-white font-bold">@ {bestDrawOdd.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-neon-green">R$ {drawStake.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between p-2 bg-grafite-800 rounded-lg border border-grafite-500">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{bestAwayHouse?.logo}</span>
                    <div>
                      <p className="text-xs text-gray-500">{awayShort} na {bestAwayHouse?.house}</p>
                      <p className="text-sm text-white font-bold">@ {bestAwayOdd.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-neon-green">R$ {awayStake.toFixed(2)}</p>
                </div>
              </div>

              {stakeNum > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-neon-green/10 rounded-lg p-2 text-center border border-neon-green/20">
                    <p className="text-xs text-neon-green uppercase">Retorno Garantido</p>
                    <p className="text-base font-bold text-neon-green">R$ {guaranteedReturn.toFixed(2)}</p>
                  </div>
                  <div className="bg-neon-green/10 rounded-lg p-2 text-center border border-neon-green/20">
                    <p className="text-xs text-neon-green uppercase">Lucro Líquido</p>
                    <p className="text-base font-bold text-neon-green">R$ {guaranteedProfit.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 p-3">
              <AlertTriangle className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-300">Sem arbitragem disponível</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Margem: {((margin - 1) * 100).toFixed(2)}% — precisa ser negativa para surebet
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
