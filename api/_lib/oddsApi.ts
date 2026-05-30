// The Odds API client (https://the-odds-api.com/).
// Free plan: 500 requests/month. Each call returns odds for many events, so we
// fetch once per refresh cycle and match events to fixtures by team name.
import { fetchJson } from './http.js';
import type { BettingHouseOdd } from './types.js';

const BASE = 'https://api.the-odds-api.com/v4';

// Soccer competitions on The Odds API that map to our leagues.
const SPORT_KEYS = [
  'soccer_uefa_champs_league',
  'soccer_epl',
  'soccer_brazil_campeonato',
];

interface OddsOutcome {
  name: string;
  price: number;
}
interface OddsMarket {
  key: string;
  outcomes: OddsOutcome[];
}
interface OddsBookmaker {
  key: string;
  title: string;
  markets: OddsMarket[];
}
interface OddsEvent {
  id: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
}

// Map The Odds API bookmaker titles to emoji logos used in the UI.
const HOUSE_LOGOS: Record<string, string> = {
  Bet365: '🟢',
  Betfair: '🟡',
  Betano: '🟠',
  Stake: '🔵',
  Sportingbet: '⚫',
  Superbet: '🟡',
  Pinnacle: '🔵',
  Unibet: '🟢',
  'William Hill': '🔵',
  Betsson: '🟠',
};

function hasKey(): boolean {
  return !!process.env.ODDS_API_KEY;
}

function logoFor(title: string): string {
  return HOUSE_LOGOS[title] ?? '🔸';
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

// Decimal-odds → implied probability, then normalize the three outcomes so they
// sum to 100% (removes the bookmaker margin / "overround").
export function impliedProbabilities(homeOdd: number, drawOdd: number, awayOdd: number) {
  const inv = (o: number) => (o > 0 ? 1 / o : 0);
  const hi = inv(homeOdd);
  const di = inv(drawOdd);
  const ai = inv(awayOdd);
  const total = hi + di + ai;
  if (total <= 0) return { homeProb: 0, drawProb: 0, awayProb: 0 };
  return {
    homeProb: Math.round((hi / total) * 100),
    drawProb: Math.round((di / total) * 100),
    awayProb: Math.round((ai / total) * 100),
  };
}

export interface MatchOdds {
  homeTeam: string;
  awayTeam: string;
  oddsComparison: BettingHouseOdd[];
}

function mapEvent(ev: OddsEvent): MatchOdds | null {
  const comparison: BettingHouseOdd[] = [];

  for (const bk of ev.bookmakers) {
    const h2h = bk.markets.find((m) => m.key === 'h2h');
    if (!h2h) continue;

    const home = h2h.outcomes.find((o) => normalize(o.name) === normalize(ev.home_team));
    const away = h2h.outcomes.find((o) => normalize(o.name) === normalize(ev.away_team));
    const draw = h2h.outcomes.find((o) => normalize(o.name) === 'draw');

    if (!home || !away) continue;

    comparison.push({
      house: bk.title,
      logo: logoFor(bk.title),
      homeOdd: home.price,
      drawOdd: draw?.price ?? 0,
      awayOdd: away.price,
      isBest: false,
    });
  }

  if (comparison.length === 0) return null;

  // Mark the single best line per market (highest decimal odd = best payout).
  const bestHome = Math.max(...comparison.map((c) => c.homeOdd));
  comparison.forEach((c) => {
    c.isBest = c.homeOdd === bestHome;
  });

  return { homeTeam: ev.home_team, awayTeam: ev.away_team, oddsComparison: comparison };
}

// Fetch h2h odds across all configured soccer competitions. Returns a list of
// per-event odds, or null if no key / all requests fail.
export async function fetchAllOdds(): Promise<MatchOdds[] | null> {
  if (!hasKey()) return null;

  const key = process.env.ODDS_API_KEY as string;
  const all: MatchOdds[] = [];
  let anySuccess = false;

  // Run all competitions in parallel to stay within the serverless time budget.
  const results = await Promise.all(
    SPORT_KEYS.map((sport) => {
      const url = `${BASE}/sports/${sport}/odds/?apiKey=${key}&regions=eu,uk&markets=h2h&oddsFormat=decimal`;
      return fetchJson<OddsEvent[]>(url, { timeoutMs: 5000 });
    }),
  );

  for (const result of results) {
    if (!result.ok || !Array.isArray(result.data)) continue;
    anySuccess = true;
    for (const ev of result.data) {
      const mapped = mapEvent(ev);
      if (mapped) all.push(mapped);
    }
  }

  if (!anySuccess) return null;
  return all;
}

export { hasKey as hasOddsApiKey };
