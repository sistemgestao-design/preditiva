import { Brain, TrendingUp } from 'lucide-react';
import type { MatchAnalysis, TeamForm } from '../types';

// Colored chip for a single recent result (V = vitória/win, E = empate/draw,
// D = derrota/loss).
function ResultChip({ r }: { r: string }) {
  const style =
    r === 'V'
      ? 'bg-emerald-500 text-white'
      : r === 'E'
        ? 'bg-slate-400 text-white'
        : 'bg-red-500 text-white';
  return (
    <span
      className={`inline-flex w-5 h-5 items-center justify-center rounded text-[10px] font-extrabold ${style}`}
    >
      {r}
    </span>
  );
}

function approval(form: TeamForm): number {
  const denom = form.played * 3;
  return denom > 0 ? Math.round(((form.wins * 3 + form.draws) / denom) * 100) : 0;
}

function FormColumn({ name, form }: { name: string; form: TeamForm | null }) {
  if (!form || form.played === 0) {
    return (
      <div className="flex-1 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] p-3 text-center">
        <p className="text-xs font-bold text-[#0F172A] truncate">{name}</p>
        <p className="text-[10px] text-[#94A3B8] mt-2">Histórico indisponível</p>
      </div>
    );
  }
  const seq = form.sequence ? form.sequence.split(' ').filter(Boolean) : [];
  const gd = form.goalsFor - form.goalsAgainst;
  return (
    <div className="flex-1 rounded-xl bg-[#F8F9FA] border border-[#E2E8F0] p-3">
      <p className="text-xs font-bold text-[#0F172A] truncate text-center">{name}</p>
      <div className="flex items-center justify-center gap-1 mt-2">
        {seq.map((r, i) => (
          <ResultChip key={i} r={r} />
        ))}
      </div>
      <p className="text-[11px] text-[#475569] text-center mt-2 font-semibold">
        Últimos {form.played}: {form.wins}V {form.draws}E {form.losses}D
      </p>
      <p className="text-[10px] text-[#64748B] text-center">
        Gols {form.goalsFor}-{form.goalsAgainst} (saldo {gd >= 0 ? '+' : ''}
        {gd}) · {approval(form)}% aprov.
      </p>
      {/* Form score bar */}
      <div className="mt-2 h-2 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0284C7] to-emerald-500 transition-all duration-700"
          style={{ width: `${form.formScore}%` }}
        />
      </div>
      <p className="text-[10px] text-[#0284C7] text-center mt-1 font-bold">Forma {form.formScore}%</p>
    </div>
  );
}

interface Props {
  analysis: MatchAnalysis;
  homeName: string;
  awayName: string;
}

export default function AnalysisPanel({ analysis, homeName, awayName }: Props) {
  const { homeForm, awayForm, prediction } = analysis;
  // Nothing useful to show.
  if (!homeForm && !awayForm && !prediction) return null;

  const season = homeForm?.season ?? awayForm?.season;

  return (
    <div className="mb-4 rounded-2xl border border-[#E2E8F0] bg-white p-3 sm:p-4 dark:neon-border">
      <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <Brain className="w-4 h-4 text-[#0284C7]" /> Análise Preditiva da IA
        {season && (
          <span className="ml-auto normal-case tracking-normal text-[10px] font-medium text-[#94A3B8]">
            Base: temporada {season}
          </span>
        )}
      </h3>

      <div className="flex items-stretch gap-2 sm:gap-3">
        <FormColumn name={homeName} form={homeForm} />
        <FormColumn name={awayName} form={awayForm} />
      </div>

      {prediction ? (
        <div className="mt-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-3 sm:p-4">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Sugestão da IA
            </span>
            <span className="text-xs font-extrabold text-emerald-700">
              Confiança {prediction.confidence}%
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-[#065F46]">
            {prediction.label}
            {prediction.odd > 0 && (
              <span className="ml-2 bg-white/80 px-2 py-0.5 rounded border border-emerald-400 text-sm">
                @ {prediction.odd.toFixed(2)}
                {prediction.house ? ` · ${prediction.house}` : ''}
              </span>
            )}
          </h4>
          <p className="text-xs sm:text-sm text-[#047857] mt-1.5 leading-relaxed">
            {prediction.reasoning}
          </p>
        </div>
      ) : (
        (homeForm || awayForm) && (
          <p className="mt-3 text-[11px] text-[#94A3B8] text-center">
            Confiança estatística abaixo de 70% — sem sugestão de aposta para este jogo.
          </p>
        )
      )}
    </div>
  );
}
