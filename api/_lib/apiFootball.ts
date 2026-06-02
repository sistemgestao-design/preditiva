// API-Football client (https://www.api-football.com/).
// Free plan: 100 requests/day. We keep request counts low by fetching a small
// set of fixtures per call and letting the cron job (not each user) drive
// refreshes.
import { fetchJson } from './http.js';
import type { Match, Team } from './types.js';

const BASE = 'https://v3.football.api-sports.io';

// Friendly names/icons for the leagues we recognize. Unknown leagues still
// render with their real API name (see mapFixture), so this map is only for
// nicer labels — it does NOT restrict which games appear.
const LEAGUES: Record<number, { name: string; icon: string }> = {
  // International
  1: { name: 'Copa do Mundo', icon: '🌍' },
  4: { name: 'Eurocopa', icon: '🇪🇺' },
  9: { name: 'Copa America', icon: '🌎' },
  10: { name: 'Amistosos', icon: '🤝' },
  15: { name: 'Mundial de Clubes', icon: '🏆' },
  // European clubs
  2: { name: 'Champions League', icon: '🏆' },
  3: { name: 'Europa League', icon: '🏆' },
  848: { name: 'Conference League', icon: '🏆' },
  39: { name: 'Premier League', icon: '🏴' },
  140: { name: 'La Liga', icon: '🇪🇸' },
  135: { name: 'Serie A (ITA)', icon: '🇮🇹' },
  78: { name: 'Bundesliga', icon: '🇩🇪' },
  61: { name: 'Ligue 1', icon: '🇫🇷' },
  94: { name: 'Primeira Liga', icon: '🇵🇹' },
  88: { name: 'Eredivisie', icon: '🇳🇱' },
  203: { name: 'Super Lig', icon: '🇹🇷' },
  // South America
  13: { name: 'Libertadores', icon: '🌎' },
  11: { name: 'Sul-Americana', icon: '🌎' },
  71: { name: 'Brasileirao Serie A', icon: '🇧🇷' },
  72: { name: 'Brasileirao Serie B', icon: '🇧🇷' },
  73: { name: 'Copa do Brasil', icon: '🇧🇷' },
  612: { name: 'Copa do Nordeste', icon: '🇧🇷' },
  128: { name: 'Liga Argentina', icon: '🇦🇷' },
  130: { name: 'Copa Argentina', icon: '🇦🇷' },
  239: { name: 'Primera A (COL)', icon: '🇨🇴' },
  // North America
  253: { name: 'MLS', icon: '🇺🇸' },
  262: { name: 'Liga MX', icon: '🇲🇽' },
};

// Preferred display order: when many games are available we show the most
// recognizable competitions first. Leagues not listed here still appear, just
// after the prioritized ones.
const PRIORITY: number[] = [
  1, 4, 9, 15, 2, 3, 848, 13, 11, 39, 140, 135, 78, 61, 71, 72, 73, 612, 94, 88,
  203, 128, 130, 239, 253, 262, 10,
];

// Max fixtures to surface in one payload (keeps the UI focused and the odds
// matching cheap).
const MAX_FIXTURES = 16;

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

const KEY_HEADER = 'x-apisports-key';

// Choose which fixtures to surface. We prefer recognized/priority leagues, but
// if none of them are playing (e.g. European off-season days) we fall back to
// whatever real games the day has — so the dashboard always shows live data
// instead of a stale cache / "API indisponivel" notice.
function selectFixtures(fixtures: AFFixture[]): AFFixture[] {
  const rank = (id: number) => {
    const i = PRIORITY.indexOf(id);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const known = fixtures.filter((f) => f.league.id in LEAGUES);
  const pool = known.length > 0 ? known : fixtures;
  return [...pool]
    .sort((a, b) => {
      const r = rank(a.league.id) - rank(b.league.id);
      if (r !== 0) return r;
      // Stable-ish secondary sort: by kickoff time.
      return a.fixture.date.localeCompare(b.fixture.date);
    })
    .slice(0, MAX_FIXTURES);
}

// The free plan only serves a rolling date window. When a date is out of range
// the API replies with e.g. "...try from 2026-05-29 to 2026-05-31." — we parse
// the first allowed date so the app can still show real upcoming fixtures.
function parseAllowedDate(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') return null;
  const text = Object.values(errors as Record<string, string>).join(' ');
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
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

function toTeam(t: { id: number; name: string; logo: string }): Team {
  // Serve the crest through our own /api/crest proxy so it loads on networks
  // that block the api-sports CDN directly (hotlink/referrer protection).
  const logo = t.id ? `/api/crest?team=${t.id}` : t.logo;
  return { id: t.id, name: t.name, shortName: shortName(t.name), logo };
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

async function fetchFixturesByDate(date: string): Promise<AFResponse | null> {
  // Note: API-Football rejects multiple league IDs in one `league` param, so we
  // fetch the whole date and filter to our leagues in code (still 1 request).
  const url = `${BASE}/fixtures?date=${date}&timezone=America/Sao_Paulo`;
  const result = await fetchJson<AFResponse>(url, {
    headers: { [KEY_HEADER]: process.env.API_FOOTBALL_KEY as string },
    timeoutMs: 5000,
  });
  return result.ok && result.data ? result.data : null;
}

// Fetch fixtures for today; if the free plan blocks today's date, retry once
// with the first date it does allow.
export async function fetchTodayFixtures(): Promise<Match[] | null> {
  if (!hasKey()) return null;

  const today = new Date().toISOString().slice(0, 10);
  let data = await fetchFixturesByDate(today);
  if (!data) return null;

  if (data.results === 0) {
    const allowed = parseAllowedDate(data.errors);
    if (allowed && allowed !== today) {
      data = await fetchFixturesByDate(allowed);
      if (!data) return null;
    }
  }

  if (!Array.isArray(data.response)) return null;
  return selectFixtures(data.response).map(mapFixture);
}

// Fetch currently-live fixtures (cheap, used for the live polling path).
// `live=all` returns every live game globally; we filter to our leagues.
export async function fetchLiveFixtures(): Promise<Match[] | null> {
  if (!hasKey()) return null;

  const url = `${BASE}/fixtures?live=all`;
  const result = await fetchJson<AFResponse>(url, {
    headers: { [KEY_HEADER]: process.env.API_FOOTBALL_KEY as string },
    timeoutMs: 5000,
  });

  if (!result.ok || !result.data || !Array.isArray(result.data.response)) return null;
  return selectFixtures(result.data.response).map(mapFixture);
}

export { hasKey as hasApiFootballKey };
