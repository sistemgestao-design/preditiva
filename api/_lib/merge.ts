// Combines fixtures (API-Football) with odds (The Odds API) into the enriched
// Match shape the UI expects: best market odds, AI-style probabilities derived
// from the market, and a detected "value bet" when a house's odd is clearly
// above the market average.
import type { Match } from './types.js';
import { impliedProbabilities, type MatchOdds } from './oddsApi.js';

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function findOdds(match: Match, odds: MatchOdds[]): MatchOdds | undefined {
  return odds.find(
    (o) =>
      normalize(o.homeTeam) === normalize(match.homeTeam.name) &&
      normalize(o.awayTeam) === normalize(match.awayTeam.name),
  );
}

export function enrichMatch(match: Match, odds: MatchOdds[]): Match {
  const matchOdds = findOdds(match, odds);
  if (!matchOdds || matchOdds.oddsComparison.length === 0) {
    return match;
  }

  const comparison = matchOdds.oddsComparison;
  const bestHome = Math.max(...comparison.map((c) => c.homeOdd));
  const bestDraw = Math.max(...comparison.map((c) => c.drawOdd));
  const bestAway = Math.max(...comparison.map((c) => c.awayOdd));

  const probs = impliedProbabilities(bestHome, bestDraw, bestAway);

  // Value bet: a house whose home odd is meaningfully above the market average.
  const avgHome = average(comparison.map((c) => c.homeOdd));
  const topHouse = comparison.find((c) => c.homeOdd === bestHome);
  let valueBet: string | null = null;
  let valueBetOdd: number | null = null;
  let valueBetHouse = '';
  let valueBetAdvantage = '';

  if (topHouse && bestHome - avgHome >= 0.1) {
    valueBet = `${match.homeTeam.name} (Vitoria)`;
    valueBetOdd = bestHome;
    valueBetHouse = topHouse.house;
    valueBetAdvantage = `R$ ${(bestHome - avgHome).toFixed(2)} acima da media do mercado`;
  }

  return {
    ...match,
    homeOdd: bestHome,
    drawOdd: bestDraw,
    awayOdd: bestAway,
    homeProb: probs.homeProb,
    drawProb: probs.drawProb,
    awayProb: probs.awayProb,
    valueBet,
    valueBetOdd,
    valueBetHouse,
    valueBetAdvantage,
    // Rough xG proxy from attacking probability; refined later if stats added.
    expectedGoals: Number((((probs.homeProb + probs.awayProb) / 100) * 3).toFixed(1)),
    oddsComparison: comparison,
  };
}

export function enrichMatches(matches: Match[], odds: MatchOdds[]): Match[] {
  return matches.map((m) => enrichMatch(m, odds));
}
