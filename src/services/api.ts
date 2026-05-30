// Frontend data client. Talks to the serverless API with a hard timeout and
// always degrades gracefully to bundled mock data so the UI never breaks or
// shows frozen/zeroed values when the backend or upstream APIs are unavailable.
import type { Match } from '../types';
import { matches as mockMatches } from '../data/mockData';

export type DataSource = 'live' | 'cache' | 'fallback';

export interface ApiResponse<T> {
  data: T;
  source: DataSource;
  updatedAt: string;
  notice?: string;
}

async function getJson<T>(url: string, timeoutMs = 8000): Promise<ApiResponse<T> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isValidMatch(m: unknown): m is Match {
  return (
    !!m &&
    typeof m === 'object' &&
    'id' in m &&
    'homeTeam' in m &&
    'awayTeam' in m &&
    Array.isArray((m as Match).oddsComparison)
  );
}

// Sanitize the API payload: drop malformed entries so a partially-broken
// response can't crash the render. Empty result → use mock fallback.
function sanitize(data: unknown): Match[] | null {
  if (!Array.isArray(data)) return null;
  const valid = data.filter(isValidMatch);
  return valid.length > 0 ? valid : null;
}

export async function fetchMatches(): Promise<ApiResponse<Match[]>> {
  const result = await getJson<Match[]>('/api/matches');
  const clean = result ? sanitize(result.data) : null;
  if (result && clean) {
    return { ...result, data: clean };
  }
  return {
    data: mockMatches,
    source: 'fallback',
    updatedAt: new Date().toISOString(),
    notice: 'Sem conexao com o back-end — exibindo dados de demonstracao.',
  };
}

export async function fetchLiveMatches(): Promise<Match[]> {
  const result = await getJson<Match[]>('/api/live', 6000);
  const clean = result ? sanitize(result.data) : null;
  return clean ?? [];
}
