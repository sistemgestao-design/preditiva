import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

interface ProfitCalculatorProps {
  odd: number;
  label: string;
}

export default function ProfitCalculator({ odd, label }: ProfitCalculatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [stake, setStake] = useState('100');
  const presets = [50, 100, 200, 500];

  const stakeNum = parseFloat(stake) || 0;
  const profit = stakeNum * odd - stakeNum;
  const totalReturn = stakeNum * odd;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] transition-colors"
      >
        <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5" />
          Calculadora de Retorno
        </span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm animate-slide-in">
          <p className="text-xs text-[#64748B] mb-2">
            Aposta: <span className="text-[#0F172A] font-medium">{label}</span> @ <span className="text-[#059669] font-bold">{odd.toFixed(2)}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Valor do Investimento</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94A3B8] font-medium">R$</span>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  placeholder="Valor da aposta"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0284C7] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Odd Selecionada</label>
              <input
                type="text"
                value={odd.toFixed(2)}
                disabled
                className="w-full px-4 py-2.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#475569]"
              />
            </div>
          </div>

          <div className="flex gap-1.5 mb-3 flex-wrap">
            {presets.map((val) => (
              <button
                key={val}
                onClick={() => setStake(val.toString())}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  stake === val.toString()
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] hover:border-[#94A3B8]'
                }`}
              >
                R$ {val}
              </button>
            ))}
          </div>

          {stakeNum > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F1F5F9]">
              <div className="bg-[#F0FDF4] p-3 rounded-xl border border-emerald-100">
                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Retorno Estimado</span>
                <span className="text-lg font-extrabold text-emerald-700">R$ {totalReturn.toFixed(2)}</span>
              </div>
              <div className="bg-[#EFF6FF] p-3 rounded-xl border border-blue-100">
                <span className="block text-[10px] font-bold text-blue-600 uppercase">Lucro Líquido Real</span>
                <span className="text-lg font-extrabold text-blue-700 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  R$ {profit.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
