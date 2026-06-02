// football-data.org (free tier) provides CURRENT-season results for the major
// covered competitions (Brasileirão, Premier League, La Liga, Serie A,
// Bundesliga, Ligue 1, etc.). We use it to compute up-to-date recent form,
// falling back to API-Football's most-recent-allowed season elsewhere.
//
// Team names differ from API-Football ("São Paulo FC" vs "Sao Paulo"), so we
// match by significant-token overlap with a small alias map for tricky cases.
import { fetchJson } from './http.js';
import { computeForm, type GameResult } from './stats.js';
import { getKv, setKv } from './db.js';
import type { TeamForm } from './types.js';

const BASE = 'https://api.football-data.org/v4';
const AUTH_HEADER = 'X-Auth-Token';
const INDEX_KEY = 'fd_form_index';

// Free-tier competitions worth querying for recent form (kept under the
// 10 req/min limit; the built index is cached for hours so this rarely runs).
const COMPETITIONS = ['BSA', 'PL', 'PD', 'SA', 'BL1', 'FL1', 'DED', 'PPL', 'CL'];

export function hasFootballDataKey(): boolean {
  return !!process.env.FOOTBALL_DATA_KEY;
}

interface FDMatch {
  utcDate: string;
  status: string;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: { fullTime: { home: number | null; away: number | null } };
}

// A precomputed form entry plus the tokens used to match a team by name.
interface FormEntry {
  name: string;
  tokens: string[];
  form: TeamForm;
}

// Tokens that carry no identifying value across providers.
const STOPWORDS = new Set([
  'fc', 'sc', 'se', 'cr', 'ca', 'ac', 'cf', 'afc', 'ec', 'rc', 'cd', 'ud', 'club',
  'clube', 'de', 'do', 'da', 'dos', 'das', 'the', 'futebol', 'football', 'calcio',
  'paulista', 'fbpa', 'fbc', 'as', 'ssc', 'us', 'rb',
]);

// Synonyms so cross-provider abbreviations line up (e.g. Atlético-MG ↔ Mineiro).
const ALIAS: Record<string, string> = {
  mg: 'mineiro',
  pr: 'paranaense',
  rj: 'rio',
};

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tokenize(name: string): string[] {
  const raw = stripAccents(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((t) => ALIAS[t] ?? t)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
  return Array.from(new Set(raw));
}

function buildEntries(matches: FDMatch[]): FormEntry[] {
  // Accumulate per-team (by fd id) results + the display name.
  const byTeam = new Map<number, { name: string; games: GameResult[] }>();
  const add = (id: number, name: string, gf: number, ga: number, date: string) => {
    const result: GameResult['result'] = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
    const cur = byTeam.get(id) ?? { name, games: [] };
    cur.games.push({ result, gf, ga, date });
    byTeam.set(id, cur);
  };

  for (const m of matches) {
    if (m.status !== 'FINISHED') continue;
    const h = m.score.fullTime.home;
    const a = m.score.fullTime.away;
    if (h === null || a === null) continue;
    add(m.homeTeam.id, m.homeTeam.name, h, a, m.utcDate);
    add(m.awayTeam.id, m.awayTeam.name, a, h, m.utcDate);
  }

  const entries: FormEntry[] = [];
  for (const { name, games } of byTeam.values()) {
    if (games.length === 0) continue;
    games.sort((x, y) => x.date.localeCompare(y.date));
    const recent = games.slice(Math.max(0, games.length - 10));
    const form = computeForm(recent);
    form.season = new Date(recent[recent.length - 1].date).getUTCFullYear();
    entries.push({ name, tokens: tokenize(name), form });
  }
  return entries;
}

async function fetchCompetition(code: string): Promise<FDMatch[]> {
  const url = `${BASE}/competitions/${code}/matches?status=FINISHED`;
  const res = await fetchJson<{ matches?: FDMatch[] }>(url, {
    headers: { [AUTH_HEADER]: process.env.FOOTBALL_DATA_KEY as string },
    timeoutMs: 7000,
  });
  if (!res.ok || !res.data || !Array.isArray(res.data.matches)) return [];
  return res.data.matches;
}

// Build (or load from cache) the global form index across covered competitions.
// Cached in the DB for 6h so we don't approach the 10 req/min limit.
async function getIndex(): Promise<FormEntry[]> {
  if (!hasFootballDataKey()) return [];
  const cached = await getKv<FormEntry[]>(INDEX_KEY, 6);
  if (cached && cached.length > 0) return cached;

  const all: FDMatch[] = [];
  // Fetch in small sequential chunks to stay well under the rate limit.
  const CHUNK = 3;
  for (let i = 0; i < COMPETITIONS.length; i += CHUNK) {
    const batch = COMPETITIONS.slice(i, i + CHUNK);
    const results = await Promise.all(batch.map((c) => fetchCompetition(c)));
    results.forEach((r) => all.push(...r));
  }

  const entries = buildEntries(all);
  if (entries.length > 0) await setKv(INDEX_KEY, entries);
  return entries;
}

// Decide whether two token sets refer to the same club. A single shared generic
// token (e.g. "atletico", "real") is NOT enough — that would wrongly map
// "Atlético Nacional" (Colombia) to "Atlético de Madrid". We accept only when
// either ≥2 tokens match, or one set's significant tokens are a subset of the
// other's (e.g. "CA Mineiro" ⊆ "Atletico-MG"). Returns the shared count, or 0.
function matchScore(a: string[], b: string[]): number {
  const setB = new Set(b);
  let shared = 0;
  let strong = false;
  for (const t of a) {
    if (setB.has(t)) {
      shared += 1;
      if (t.length >= 4) strong = true;
    }
  }
  if (!strong || shared === 0) return 0;
  const setA = new Set(a);
  const aSubsetB = a.every((t) => setB.has(t));
  const bSubsetA = b.every((t) => setA.has(t));
  if (shared >= 2 || aSubsetB || bSubsetA) return shared;
  return 0;
}

// Build a name→form lookup. Returns a function so callers can resolve many
// teams against a single (cached) index build.
export async function buildFormLookup(): Promise<(name: string) => TeamForm | null> {
  const index = await getIndex();
  if (index.length === 0) return () => null;
  return (name: string) => {
    const tokens = tokenize(name);
    let best: FormEntry | null = null;
    let bestScore = 0;
    for (const e of index) {
      const s = matchScore(tokens, e.tokens);
      if (s > bestScore) {
        bestScore = s;
        best = e;
      }
    }
    return best ? best.form : null;
  };
}
