// API-Football client (https://www.api-football.com/).
// Free plan: 100 requests/day. We keep request counts low by fetching a small
// set of fixtures per call and letting the cron job (not each user) drive
// refreshes.
import { fetchJson } from './http';
import type { Match, Team } from './types';

const BASE = 'https://v3.football.api-sports.io';

// Leagues we care about (API-Football league IDs):
//  2  = UEFA Champions League
//  39 = Premier League
//  71 = Brasileirão Série A
const LEAGUES: Record<number, { name: string; icon: string }> = {
  2: { name: 'Champions League', icon: '🏆' },
  39: { name: 'Premier League', icon: '🏴' },
  71: { name: 'Brasileirao Serie A', icon: '🇧🇷' },
};

interface AFFixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null } };
  league: { id: number; name: string; logo: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

interface AFResponse {
  errors: unknown;
  results: number;
  response: AFFixture[];
}

function hasKey(): boolean {
  return !!process.env.API_FOOTBALL_KEY;
}

function shortName(name: string): string {
  return name
    .replace(/[^A-Za-z\s]/g, '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function statusFromShort(short: string): Match['status'] {
  // API-Football status codes: NS (not started), 1H/HT/2H/ET/P/LIVE (live),
  // FT/AET/PEN (finished).
  if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(short)) return 'live';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  return 'upcoming';
}

function toTeam(t: { name: string; logo: string }): Team {
  return { name: t.name, shortName: shortName(t.name), logo: t.logo };
}

function mapFixture(f: AFFixture): Match {
  const meta = LEAGUES[f.league.id] ?? { name: f.league.name, icon: '⚽' };
  const date = new Date(f.fixture.date);
  const kickoff = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
  const status = statusFromShort(f.fixture.status.short);

  return {
    id: f.fixture.id,
    league: meta.name,
    leagueIcon: meta.icon,
    homeTeam: toTeam(f.teams.home),
    awayTeam: toTeam(f.teams.away),
    // Probabilities/odds are filled in by the odds layer; sane defaults here.
    homeProb: 0,
    drawProb: 0,
    awayProb: 0,
    homeOdd: 0,
    drawOdd: 0,
    awayOdd: 0,
    valueBet: null,
    valueBetOdd: null,
    valueBetHouse: '',
    valueBetAdvantage: '',
    kickoff,
    status,
    minute: f.fixture.status.elapsed ?? undefined,
    homeScore: f.goals.home ?? undefined,
    awayScore: f.goals.away ?? undefined,
    expectedGoals: 0,
    oddsComparison: [],
  };
}

// Fetch today's fixtures for the configured leagues. One request covers all
// leagues for a given date, keeping us well within the free quota.
export async function fetchTodayFixtures(): Promise<Match[] | null> {
  if (!hasKey()) return null;

  const today = new Date().toISOString().slice(0, 10);
  const ids = Object.keys(LEAGUES).join('-');
  const url = `${BASE}/fixtures?date=${today}&timezone=America/Sao_Paulo&league=${ids}`;

  const result = await fetchJson<AFResponse>(url, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY as string },
    timeoutMs: 5000,
  });

  if (!result.ok) return null;
  if (!result.data || !Array.isArray(result.data.response)) return null;

  return result.data.response.map(mapFixture);
}

// Fetch only currently-live fixtures (cheap, used for the live polling path).
export async function fetchLiveFixtures(): Promise<Match[] | null> {
  if (!hasKey()) return null;

  const ids = Object.keys(LEAGUES).join('-');
  const url = `${BASE}/fixtures?live=all&league=${ids}`;

  const result = await fetchJson<AFResponse>(url, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY as string },
    timeoutMs: 5000,
  });

  if (!result.ok || !result.data || !Array.isArray(result.data.response)) return null;
  return result.data.response.map(mapFixture);
}

export { hasKey as hasApiFootballKey };
