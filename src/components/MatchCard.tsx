import { Heart, ArrowRight } from 'lucide-react';
import type { Match } from '../types';
import OddsComparison from './OddsComparison';
import ProfitCalculator from './ProfitCalculator';
import SurebetCalculator from './SurebetCalculator';
import { useFavorites } from '../context/FavoritesContext';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(match.id);
  // Odds/probabilities may be missing when only fixture data is available
  // (e.g. no odds API key). Avoid rendering zeroed/frozen values.
  const hasOdds = match.oddsComparison.length > 0 && match.homeOdd > 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* League Header */}
      <div className="px-4 sm:px-6 py-3 bg-[#F1F5F9] flex items-center justify-between border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="text-base">{match.leagueIcon}</span>
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{match.league}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 uppercase tracking-widest animate-pulse">
              ● Ao Vivo {match.minute}&apos;
            </span>
          )}
          {match.status === 'upcoming' && (
            <span className="text-xs font-medium text-[#64748B] bg-white px-2 py-1 rounded border border-[#E2E8F0]">Hoje · {match.kickoff}</span>
          )}
          {match.status === 'today' && (
            <span className="text-xs font-medium text-[#0284C7] bg-[#E0F2FE] px-2 py-1 rounded border border-[#BAE6FD]">{match.kickoff}</span>
          )}
          <button
            onClick={() => toggleFavorite(match.id)}
            className="p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-all"
            title={favorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                favorited
                  ? 'text-red-500 fill-red-500 scale-110'
                  : 'text-[#94A3B8] hover:text-red-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Teams & Score */}
      <div className="px-4 sm:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between max-w-md mx-auto mb-6">
          <div className="flex flex-col items-center gap-2 w-1/3 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F8F9FA] rounded-full border border-[#E2E8F0] flex items-center justify-center shadow-inner overflow-hidden">
              <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            </div>
            <span className="font-bold text-sm sm:text-lg text-[#0F172A]">{match.homeTeam.name}</span>
          </div>

          <div className="flex flex-col items-center justify-center w-1/3">
            {match.status === 'live' ? (
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A]">
                {match.homeScore} <span className="text-[#94A3B8] font-light mx-1 sm:mx-2">:</span> {match.awayScore}
              </div>
            ) : (
              <span className="text-[#94A3B8] font-bold text-lg sm:text-xl">VS</span>
            )}
            {match.expectedGoals > 0 && (
              <span className="text-[10px] sm:text-xs text-[#64748B] font-medium mt-2 bg-[#F1F5F9] px-2 py-0.5 rounded">
                xG Esperado: {match.expectedGoals.toFixed(1)}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 w-1/3 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#F8F9FA] rounded-full border border-[#E2E8F0] flex items-center justify-center shadow-inner overflow-hidden">
              <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            </div>
            <span className="font-bold text-sm sm:text-lg text-[#0F172A]">{match.awayTeam.name}</span>
          </div>
        </div>

        {!hasOdds && (
          <div className="mb-2 rounded-xl bg-[#F8F9FA] border border-dashed border-[#CBD5E1] px-4 py-3 text-center">
            <p className="text-xs font-semibold text-[#64748B]">⏳ Aguardando odds do mercado</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">Jogo real carregado · odds e análise da IA em breve</p>
          </div>
        )}

        {/* AI Probability Bar */}
        {hasOdds && (
        <div className="mb-4">
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5 mb-2">
            📊 Veredito Analítico da IA
          </h3>
          <div className="w-full bg-[#F1F5F9] h-8 sm:h-9 rounded-xl overflow-hidden flex font-semibold text-xs text-white">
            <div
              className="bg-[#0284C7] flex items-center justify-center transition-all duration-500 hover:opacity-90"
              style={{ width: `${match.homeProb}%` }}
            >
              <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">{match.homeTeam.shortName} {match.homeProb}%</span>
            </div>
            <div
              className="bg-[#64748B] flex items-center justify-center transition-all duration-500 hover:opacity-90"
              style={{ width: `${match.drawProb}%` }}
            >
              <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">EMP {match.drawProb}%</span>
            </div>
            <div
              className="bg-[#334155] flex items-center justify-center transition-all duration-500 hover:opacity-90"
              style={{ width: `${match.awayProb}%` }}
            >
              <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">{match.awayTeam.shortName} {match.awayProb}%</span>
            </div>
          </div>
        </div>
        )}

        {/* Odds Row */}
        {hasOdds && (
        <div className="flex gap-2 sm:gap-3 mb-4">
          <div className="flex-1 bg-[#F8F9FA] rounded-xl p-2 sm:p-3 text-center border border-[#E2E8F0]">
            <p className="text-[10px] sm:text-xs text-[#64748B] font-medium">{match.homeTeam.shortName}</p>
            <p className="text-base sm:text-lg font-extrabold text-[#0F172A]">{match.homeOdd.toFixed(2)}</p>
          </div>
          <div className="flex-1 bg-[#F8F9FA] rounded-xl p-2 sm:p-3 text-center border border-[#E2E8F0]">
            <p className="text-[10px] sm:text-xs text-[#64748B] font-medium">Empate</p>
            <p className="text-base sm:text-lg font-extrabold text-[#0F172A]">{match.drawOdd.toFixed(2)}</p>
          </div>
          <div className="flex-1 bg-[#F8F9FA] rounded-xl p-2 sm:p-3 text-center border border-[#E2E8F0]">
            <p className="text-[10px] sm:text-xs text-[#64748B] font-medium">{match.awayTeam.shortName}</p>
            <p className="text-base sm:text-lg font-extrabold text-[#0F172A]">{match.awayOdd.toFixed(2)}</p>
          </div>
        </div>
        )}

        {/* Value Bet Card */}
        {match.valueBet && (
          <div className="bg-[#FEF3C7] border-2 border-[#D97706] rounded-xl p-4 sm:p-5 mb-4 relative overflow-hidden">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#B45309] text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Altíssima Confiança</span>
                  <span className="text-xs font-bold text-[#B45309]">APOSTA DE VALOR DETECTADA</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#78350F]">
                  {match.valueBet} <span className="bg-white/80 px-2 py-0.5 rounded border border-[#F59E0B] text-sm sm:text-base">@ {match.valueBetOdd?.toFixed(2)}</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#92400E]">
                  Casa recomendada: <strong className="underline">{match.valueBetHouse}</strong> — {match.valueBetAdvantage}
                </p>
              </div>
              <button className="bg-[#B45309] hover:bg-[#92400E] text-white font-bold text-xs sm:text-sm px-4 sm:px-6 py-3 rounded-xl transition shadow-md whitespace-nowrap flex items-center gap-2">
                Ir para o Mercado
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Profit Calculator */}
        {match.valueBet && match.valueBetOdd && (
          <ProfitCalculator odd={match.valueBetOdd} label={match.valueBet} />
        )}

        {/* Surebet Calculator */}
        {hasOdds && (
          <SurebetCalculator
            odds={match.oddsComparison}
            homeShort={match.homeTeam.shortName}
            awayShort={match.awayTeam.shortName}
          />
        )}

        {/* Odds Comparison Table */}
        {hasOdds && (
          <OddsComparison
            odds={match.oddsComparison}
            homeShort={match.homeTeam.shortName}
            awayShort={match.awayTeam.shortName}
          />
        )}
      </div>
    </div>
  );
}
