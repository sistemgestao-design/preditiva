import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
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
            ? 'bg-[#FEF3C7] hover:bg-[#FDE68A] border-2 border-[#D97706]'
            : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0]'
        }`}
      >
        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isSurebet ? 'text-[#B45309]' : 'text-[#64748B]'
        }`}>
          <Shield className="w-3 h-3" />
          {isSurebet ? `SUREBET DETECTADA — Lucro ${profitPct.toFixed(2)}%` : 'Análise de Arbitragem'}
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 p-4 rounded-xl border animate-slide-in bg-white border-[#E2E8F0] shadow-sm">
          {isSurebet ? (
            <>
              <div className="flex items-center gap-2 mb-3 p-3 bg-[#F0FDF4] rounded-lg border border-emerald-200">
                <Shield className="w-4 h-4 text-emerald-600" />
                <p className="text-sm text-emerald-700 font-bold">
                  Lucro garantido de {profitPct.toFixed(2)}% independente do resultado!
                </p>
              </div>

              <div className="mb-3">
                <label className="text-xs text-[#64748B] mb-1 block font-semibold">Valor total para investir:</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94A3B8] font-medium">R$</span>
                  <input
                    type="number"
                    value={totalStake}
                    onChange={(e) => setTotalStake(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl text-base text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#059669] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{bestHomeHouse?.logo}</span>
                    <div>
                      <p className="text-xs text-[#64748B]">{homeShort} na {bestHomeHouse?.house}</p>
                      <p className="text-sm text-[#0F172A] font-bold">@ {bestHomeOdd.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-emerald-600">R$ {homeStake.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{bestDrawHouse?.logo}</span>
                    <div>
                      <p className="text-xs text-[#64748B]">Empate na {bestDrawHouse?.house}</p>
                      <p className="text-sm text-[#0F172A] font-bold">@ {bestDrawOdd.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-emerald-600">R$ {drawStake.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{bestAwayHouse?.logo}</span>
                    <div>
                      <p className="text-xs text-[#64748B]">{awayShort} na {bestAwayHouse?.house}</p>
                      <p className="text-sm text-[#0F172A] font-bold">@ {bestAwayOdd.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-emerald-600">R$ {awayStake.toFixed(2)}</p>
                </div>
              </div>

              {stakeNum > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F0FDF4] rounded-xl p-3 text-center border border-emerald-100">
                    <p className="text-xs text-emerald-600 uppercase font-bold">Retorno Garantido</p>
                    <p className="text-lg font-extrabold text-emerald-700">R$ {guaranteedReturn.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#F0FDF4] rounded-xl p-3 text-center border border-emerald-100">
                    <p className="text-xs text-emerald-600 uppercase font-bold">Lucro Líquido</p>
                    <p className="text-lg font-extrabold text-emerald-700">R$ {guaranteedProfit.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3 p-3">
              <AlertTriangle className="w-5 h-5 text-[#94A3B8] flex-shrink-0" />
              <div>
                <p className="text-sm text-[#475569]">Sem arbitragem disponível</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">
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
