// Statistical "form" engine. Fetches each team's recent finished games from
// API-Football and turns them into a weighted form score, then combines two
// teams' form (plus market odds when available) into a natural-language
// prediction with a confidence level.
import { fetchJson } from './http.js';
import type { Match, Prediction, TeamForm } from './types.js';

const BASE = 'https://v3.football.api-sports.io';
const KEY_HEADER = 'x-apisports-key';

interface AFStatusFixture {
  fixture: { date: string; status: { short: string } };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: { home: number | null; away: number | null };
}

interface AFFixturesResponse {
  response: AFStatusFixture[];
}

function hasKey(): boolean {
  return !!process.env.API_FOOTBALL_KEY;
}

const FINISHED = new Set(['FT', 'AET', 'PEN']);

interface GameResult {
  result: 'W' | 'D' | 'L';
  gf: number;
  ga: number;
  date: string;
}

// Reduce a list of a team's finished fixtures into per-game W/D/L + goals,
// ordered oldest → newest.
function toGameResults(teamId: number, fixtures: AFStatusFixture[]): GameResult[] {
  const games: GameResult[] = [];
  for (const f of fixtures) {
    if (!FINISHED.has(f.fixture.status.short)) continue;
    const isHome = f.teams.home.id === teamId;
    const gf = (isHome ? f.goals.home : f.goals.away) ?? 0;
    const ga = (isHome ? f.goals.away : f.goals.home) ?? 0;
    const result: GameResult['result'] = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
    games.push({ result, gf, ga, date: f.fixture.date });
  }
  // API returns most-recent first; we want oldest → newest for weighting.
  return games.sort((a, b) => a.date.localeCompare(b.date));
}

// Weighted form score in [0,100]. Recent games weigh more: the i-th game from
// the end gets a linearly higher weight, so the last 5 dominate the result.
function computeForm(games: GameResult[]): TeamForm {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let weightedPoints = 0;
  let weightSum = 0;

  const n = games.length;
  games.forEach((g, idx) => {
    if (g.result === 'W') wins += 1;
    else if (g.result === 'D') draws += 1;
    else losses += 1;
    goalsFor += g.gf;
    goalsAgainst += g.ga;

    // Newest games (higher idx) get a larger weight.
    const weight = 1 + idx; // 1,2,3,... oldest→newest
    const pts = g.result === 'W' ? 3 : g.result === 'D' ? 1 : 0;
    weightedPoints += weight * pts;
    weightSum += weight * 3;
  });

  const formScore = weightSum > 0 ? Math.round((weightedPoints / weightSum) * 100) : 0;
  // Compact sequence of the last 5, most recent last, in PT (V/E/D).
  const map: Record<GameResult['result'], string> = { W: 'V', D: 'E', L: 'D' };
  const sequence = games
    .slice(Math.max(0, n - 5))
    .map((g) => map[g.result])
    .join(' ');

  return { played: n, wins, draws, losses, goalsFor, goalsAgainst, formScore, sequence };
}

// Seasons to try, newest first. The API-Football free plan blocks the live
// current season and the `last` parameter, but allows full-season fixtures for
// 2022–2024 — so we derive recent form from the newest season the plan permits.
const SEASONS = [2024, 2023];

// Fetch and summarize a single team's most recent finished games. Uses the
// season endpoint (free-plan compatible) and keeps the last `take` results.
// One API request per season tried (stops at the first that returns games).
export async function fetchTeamForm(teamId: number, take = 10): Promise<TeamForm | null> {
  if (!hasKey()) return null;
  for (const season of SEASONS) {
    const url = `${BASE}/fixtures?team=${teamId}&season=${season}`;
    const result = await fetchJson<AFFixturesResponse>(url, {
      headers: { [KEY_HEADER]: process.env.API_FOOTBALL_KEY as string },
      timeoutMs: 6000,
    });
    if (!result.ok || !result.data || !Array.isArray(result.data.response)) continue;
    const games = toGameResults(teamId, result.data.response);
    if (games.length === 0) continue;
    // toGameResults sorts oldest→newest; keep the most recent `take`.
    const form = computeForm(games.slice(Math.max(0, games.length - take)));
    form.season = season;
    return form;
  }
  return null;
}

const CONFIDENCE_THRESHOLD = 70;

function bestOddFor(match: Match, pick: Prediction['pick']): { house: string; odd: number } {
  const key = pick === 'home' ? 'homeOdd' : pick === 'away' ? 'awayOdd' : 'drawOdd';
  let house = '';
  let odd = 0;
  for (const c of match.oddsComparison) {
    if (c[key] > odd) {
      odd = c[key];
      house = c.house;
    }
  }
  return { house, odd };
}

function pct(n: number, d: number): number {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

// Build a prediction from form (+ market odds when present). Confidence blends
// the statistical edge with the market's implied probability; a suggestion is
// only returned when confidence clears the threshold.
export function buildPrediction(
  match: Match,
  homeForm: TeamForm | null,
  awayForm: TeamForm | null,
): Prediction | null {
  if (!homeForm || !awayForm) return null;
  if (homeForm.played < 3 || awayForm.played < 3) return null;

  // Statistical lean: home advantage + form gap. Map to a 0–100 "home strength".
  const HOME_ADVANTAGE = 6;
  const diff = homeForm.formScore - awayForm.formScore + HOME_ADVANTAGE;
  // Squash the diff (range roughly -100..100) into a 0–100 probability-ish lean.
  // Slope 0.9 lets a clear form favorite (gap ~25+) reach the 70% threshold.
  const statHome = Math.max(5, Math.min(95, 50 + diff * 0.9));

  // Market lean from odds (implied probabilities), when we have them.
  let marketHome: number | null = null;
  let marketAway: number | null = null;
  if (match.homeProb > 0 || match.awayProb > 0) {
    marketHome = match.homeProb;
    marketAway = match.awayProb;
  }

  // Blend statistical and market signals (favor market when available).
  const homeStrength = marketHome !== null ? Math.round(statHome * 0.4 + marketHome * 0.6) : Math.round(statHome);
  const awayStrength =
    marketAway !== null
      ? Math.round((100 - statHome) * 0.4 + marketAway * 0.6)
      : Math.round(100 - statHome);

  const pick: Prediction['pick'] = homeStrength >= awayStrength ? 'home' : 'away';
  const confidence = Math.max(homeStrength, awayStrength);
  if (confidence < CONFIDENCE_THRESHOLD) return null;

  const team = pick === 'home' ? match.homeTeam : match.awayTeam;
  const form = pick === 'home' ? homeForm : awayForm;
  const oppForm = pick === 'home' ? awayForm : homeForm;
  const oppTeam = pick === 'home' ? match.awayTeam : match.homeTeam;
  const { house, odd } = bestOddFor(match, pick);

  const approval = pct(form.wins * 3 + form.draws, form.played * 3);
  const seqPart = form.sequence ? `vem de ${form.sequence} nos últimos ${form.played} jogos` : `tem ${form.wins}V ${form.draws}E ${form.losses}D`;
  const oddPart = odd > 0 && house ? ` Melhor odd: ${odd.toFixed(2)} na ${house}.` : ' (odds ainda não disponíveis no mercado).';

  const reasoning =
    `${team.name} ${seqPart} (${form.wins}V ${form.draws}E ${form.losses}D, ${approval}% de aproveitamento, ` +
    `saldo de gols ${form.goalsFor - form.goalsAgainst >= 0 ? '+' : ''}${form.goalsFor - form.goalsAgainst}). ` +
    `${oppTeam.name} tem ${oppForm.formScore}% de forma (${oppForm.wins}V ${oppForm.draws}E ${oppForm.losses}D). ` +
    `Confiança estatística de ${confidence}% na vitória do ${team.name}.${oddPart}`;

  return {
    pick,
    label: `Vitória do ${team.name}`,
    confidence,
    house,
    odd,
    reasoning,
  };
}

export { hasKey as hasStatsKey };
