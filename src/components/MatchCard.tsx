import { TrendingUp, ExternalLink, Target } from 'lucide-react';
import type { Match } from '../types';
import OddsComparison from './OddsComparison';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const maxProb = Math.max(match.homeProb, match.drawProb, match.awayProb);

  return (
    <div className="bg-grafite-800 rounded-2xl border border-grafite-600 overflow-hidden hover:border-grafite-500 transition-all duration-300 group">
      {/* League Header */}
      <div className="px-4 py-2.5 bg-grafite-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{match.leagueIcon}</span>
          <span className="text-xs font-medium text-gray-400">{match.league}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.status === 'live' && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-red-400">AO VIVO · {match.minute}&apos;</span>
            </div>
          )}
          {match.status === 'upcoming' && (
            <span className="text-xs text-gray-500">Hoje · {match.kickoff}</span>
          )}
          {match.status === 'today' && (
            <span className="text-xs text-electric-blue">{match.kickoff}</span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{match.homeTeam.logo}</span>
            <div>
              <p className="font-bold text-white text-sm">{match.homeTeam.name}</p>
              {match.status === 'live' && (
                <p className="text-2xl font-bold text-white">{match.homeScore}</p>
              )}
            </div>
          </div>
          <div className="px-4">
            <span className="text-gray-600 font-bold text-lg">VS</span>
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end text-right">
            <div>
              <p className="font-bold text-white text-sm">{match.awayTeam.name}</p>
              {match.status === 'live' && (
                <p className="text-2xl font-bold text-white">{match.awayScore}</p>
              )}
            </div>
            <span className="text-3xl">{match.awayTeam.logo}</span>
          </div>
        </div>

        {/* AI Probability Bar */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Target className="w-3 h-3 text-electric-blue" />
            <span className="text-[10px] text-electric-blue font-semibold uppercase tracking-wider">
              Veredito da IA
            </span>
          </div>
          <div className="flex h-8 rounded-lg overflow-hidden border border-grafite-500">
            <div
              className={`flex items-center justify-center transition-all duration-500 ${match.homeProb === maxProb ? 'bg-neon-green/30 text-neon-green' : 'bg-grafite-700 text-gray-400'}`}
              style={{ width: `${match.homeProb}%` }}
            >
              <span className="text-xs font-bold">{match.homeTeam.shortName} {match.homeProb}%</span>
            </div>
            <div
              className={`flex items-center justify-center border-x border-grafite-500 transition-all duration-500 ${match.drawProb === maxProb ? 'bg-electric-blue/30 text-electric-blue' : 'bg-grafite-700 text-gray-400'}`}
              style={{ width: `${match.drawProb}%` }}
            >
              <span className="text-[10px] font-bold">E {match.drawProb}%</span>
            </div>
            <div
              className={`flex items-center justify-center transition-all duration-500 ${match.awayProb === maxProb ? 'bg-neon-green/30 text-neon-green' : 'bg-grafite-700 text-gray-400'}`}
              style={{ width: `${match.awayProb}%` }}
            >
              <span className="text-xs font-bold">{match.awayTeam.shortName} {match.awayProb}%</span>
            </div>
          </div>
        </div>

        {/* Odds Row */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 bg-grafite-700 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">{match.homeTeam.shortName}</p>
            <p className="text-sm font-bold text-white">{match.homeOdd.toFixed(2)}</p>
          </div>
          <div className="flex-1 bg-grafite-700 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">Empate</p>
            <p className="text-sm font-bold text-white">{match.drawOdd.toFixed(2)}</p>
          </div>
          <div className="flex-1 bg-grafite-700 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">{match.awayTeam.shortName}</p>
            <p className="text-sm font-bold text-white">{match.awayOdd.toFixed(2)}</p>
          </div>
        </div>

        {/* Expected Goals */}
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-grafite-700/50 rounded-lg">
          <TrendingUp className="w-3.5 h-3.5 text-electric-blue" />
          <span className="text-[11px] text-gray-400">
            Gols Esperados (xG): <span className="text-white font-bold">{match.expectedGoals.toFixed(1)}</span>
          </span>
        </div>

        {/* Value Bet Button */}
        {match.valueBet && (
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/40 flex items-center justify-center gap-2 group-hover:from-gold/30 group-hover:to-gold/20 transition-all">
            <div className="flex items-center gap-1.5">
              <span className="text-gold text-sm">🏆</span>
              <span className="text-xs font-bold text-gold">APOSTA DE VALOR</span>
            </div>
            <span className="text-[11px] text-gray-300 mx-1">·</span>
            <span className="text-xs text-gray-300">
              {match.valueBet} @ <span className="text-white font-bold">{match.valueBetOdd?.toFixed(2)}</span>
            </span>
            <ExternalLink className="w-3 h-3 text-gold ml-1" />
          </button>
        )}
        {match.valueBet && (
          <p className="text-center text-[10px] text-gray-500 mt-1.5">
            👉 {match.valueBetHouse} — {match.valueBetAdvantage}
          </p>
        )}

        {/* Odds Comparison Table - Casas do Brasil */}
        <OddsComparison
          odds={match.oddsComparison}
          homeShort={match.homeTeam.shortName}
          awayShort={match.awayTeam.shortName}
        />
      </div>
    </div>
  );
}
