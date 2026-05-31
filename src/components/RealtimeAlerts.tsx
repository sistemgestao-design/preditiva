import { Activity, TrendingUp, Building2 } from 'lucide-react';
import TeamLogo from './TeamLogo';

// Brand-ish colored badge for a betting house (we have no logo assets, so we
// approximate the reference look with small color-coded pills).
const HOUSE_STYLE: Record<string, { bg: string; fg: string }> = {
  Betano: { bg: '#ff6a00', fg: '#ffffff' },
  Bet365: { bg: '#027b5b', fg: '#ffffff' },
  Betfair: { bg: '#ffb80c', fg: '#111111' },
  Superbet: { bg: '#e2001a', fg: '#ffffff' },
  Betway: { bg: '#00a826', fg: '#ffffff' },
};

function HouseBadge({ name }: { name: string }) {
  const s = HOUSE_STYLE[name] ?? { bg: '#334155', fg: '#ffffff' };
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-extrabold leading-none"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {name}
    </span>
  );
}

const surebetLegs = [
  { house: 'Betano', text: 'Aposte R$ 100 (Vitória Getafe @ 2.05)' },
  { house: 'Bet365', text: 'Aposte R$ 98 (Empate @ 3.40)' },
  { house: 'Betfair', text: 'Aposte R$ 49 (Vitória Osasuna @ 5.10)' },
];

export default function RealtimeAlerts() {
  return (
    <div className="px-3 sm:px-4 pt-4">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold uppercase tracking-widest text-[#0284C7] flex items-center gap-2">
          <Activity className="w-4 h-4" /> Alertas em Tempo Real
        </span>
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 dark:neon-border-green text-emerald-600 text-[11px] font-bold uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ao Vivo
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Left column: two stacked alerts */}
        <div className="space-y-3">
          {/* Futebol — Flamengo */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] border-l-4 border-l-emerald-500 p-3.5 shadow-sm">
            <div className="flex items-start gap-3">
              <TeamLogo
                team={{ name: 'Flamengo', shortName: 'FLA', logo: 'https://media.api-sports.io/football/teams/127.png' }}
                className="w-9 h-9 object-contain shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wide">Futebol</span>
                  <span className="text-[11px] text-[#94A3B8] shrink-0">Há 1 min</span>
                </div>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5 leading-snug">
                  IA recalcula probabilidade para Flamengo vs Palmeiras.
                </p>
                <p className="text-xs text-[#64748B] mt-0.5 leading-snug">
                  Probabilidade de vitória do Flamengo subiu para{' '}
                  <span className="font-bold text-emerald-600">71%</span> (após escalação oficial).
                </p>
              </div>
            </div>
          </div>

          {/* Arbitragem genérica */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#0284C7] p-3.5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E0F2FE] flex items-center justify-center shrink-0 dark:neon-border">
                <TrendingUp className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-extrabold text-[#0284C7] uppercase tracking-wide">Arbitragem</span>
                <p className="text-sm font-bold text-[#0F172A] mt-0.5 leading-snug">IA Arbitragem (Surebet).</p>
                <p className="text-xs text-[#64748B] mt-0.5">Monitorando 41 casas em tempo real.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: surebet breakdown */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-3.5 shadow-sm dark:neon-border">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-[#0284C7] uppercase tracking-wide">Arbitragem</span>
            <span className="text-[11px] text-[#94A3B8]">Há 2 min</span>
          </div>
          <p className="text-sm font-extrabold text-[#0F172A] mt-1 leading-snug">
            SUREBET DETECTADA: [A] Getafe vs Osasuna.
          </p>
          <p className="text-xs text-emerald-600 font-bold mt-0.5">Lucro Garantido de R$ 3,18.</p>
          <div className="mt-2.5 space-y-1.5">
            {surebetLegs.map((leg) => (
              <div key={leg.house} className="flex items-center gap-2">
                <span className="w-16 shrink-0">
                  <HouseBadge name={leg.house} />
                </span>
                <span className="text-xs text-[#475569] truncate">{leg.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-width alert: Manchester City */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#0284C7] p-3.5 shadow-sm mt-3">
        <div className="flex items-start gap-3">
          <TeamLogo
            team={{ name: 'Manchester City', shortName: 'MCI', logo: 'https://media.api-sports.io/football/teams/50.png' }}
            className="w-9 h-9 object-contain shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wide flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Futebol
              </span>
              <span className="text-[11px] text-[#94A3B8] shrink-0">Há 3 min</span>
            </div>
            <p className="text-sm font-bold text-[#0F172A] mt-0.5 leading-snug">
              Nova Casa de Apostas detectada para Jogo do Manchester City.
            </p>
            <p className="text-xs text-[#64748B] mt-0.5">
              A <span className="font-bold text-emerald-600">Betway</span> cobriu a odd da Betano. Melhores odds agora na
              Betway e Bet365.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
