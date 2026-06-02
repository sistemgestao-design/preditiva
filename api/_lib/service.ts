// Orchestration layer used by the serverless endpoints. Encapsulates the
// "live → cache → fallback" strategy so every endpoint behaves consistently
// and the UI never receives empty/broken data.
import type { ApiResponse, Match } from './types.js';
import { fetchTodayFixtures, fetchLiveFixtures } from './apiFootball.js';
import { fetchAllOdds } from './oddsApi.js';
import { enrichMatches } from './merge.js';
import { fallbackMatches } from './fallback.js';
import {
  hasDatabase,
  getActiveMatches,
  saveMatches,
  lastUpdatedAt,
  expireFinishedMatches,
  expireStaleMatches,
} from './db.js';

// When a forced refresh arrives within this window of the last write we serve
// the cache instead of hitting the upstream APIs again — protects the free odds
// quota from rapid repeated "Analisar Jogos de Hoje" clicks.
const FORCE_THROTTLE_MS = 90 * 1000; // 90 seconds

// Build a fresh match list straight from the upstream APIs (fixtures + odds).
// Returns null if fixtures could not be fetched (no key or upstream failure).
export async function buildLiveMatches(): Promise<Match[] | null> {
  // Fixtures and odds are independent — fetch concurrently to stay within the
  // serverless execution-time budget.
  const [fixtures, odds] = await Promise.all([fetchTodayFixtures(), fetchAllOdds()]);
  if (!fixtures || fixtures.length === 0) return null;

  return enrichMatches(fixtures, odds ?? []);
}

// Main read path for the dashboard.
//
// Quota-aware strategy: the normal (automatic) read path NEVER calls the upstream
// odds API — it serves the snapshot persisted by the daily cron and the live
// poll, so leaving the dashboard open with 60s auto-refresh costs zero odds
// quota. The upstream APIs are only hit on a cold start (empty DB) or when the
// user explicitly forces a refresh ("Analisar Jogos de Hoje"), which is throttled.
export async function getMatches(force = false): Promise<ApiResponse<Match[]>> {
  const now = new Date().toISOString();

  // Load whatever the DB currently holds.
  let cached: Match[] = [];
  let updated: Date | null = null;
  if (hasDatabase()) {
    try {
      updated = await lastUpdatedAt();
      cached = await getActiveMatches();
    } catch {
      // DB hiccup — fall through to live/fallback.
    }
  }

  const recentlyRefreshed = !!updated && Date.now() - updated.getTime() < FORCE_THROTTLE_MS;

  // Serve cache for normal reads, and for forced reads that arrive too soon
  // after the last refresh (throttle). Only rebuild when forced (and allowed)
  // or on a cold start with no cached data.
  if (cached.length > 0 && (!force || recentlyRefreshed)) {
    return { data: cached, source: 'cache', updatedAt: (updated ?? new Date()).toISOString() };
  }

  // Rebuild a fresh snapshot from upstream (fixtures + odds) and persist it.
  try {
    const live = await buildLiveMatches();
    if (live && live.length > 0) {
      if (hasDatabase()) {
        try {
          await saveMatches(live);
        } catch {
          /* persistence is best-effort */
        }
      }
      return { data: live, source: 'live', updatedAt: now };
    }
  } catch {
    // ignore and fall back
  }

  // Upstream failed — serve whatever cache we have, else mock fallback.
  if (cached.length > 0) {
    return { data: cached, source: 'cache', updatedAt: (updated ?? new Date()).toISOString() };
  }

  return {
    data: fallbackMatches,
    source: 'fallback',
    updatedAt: now,
    notice: 'Dados de demonstracao — configure as chaves de API para dados reais.',
  };
}

// Live-only path used by short polling. Cheaper than a full refresh: it only
// fetches volatile fields (score/minute/status) from API-Football and reuses the
// odds/probabilities already computed in the last full refresh. It deliberately
// does NOT call The Odds API — doing that every 30s would exhaust the monthly
// quota and would also overwrite good odds with zeros for unmatched events.
export async function getLiveMatches(): Promise<ApiResponse<Match[]>> {
  const now = new Date().toISOString();
  try {
    const live = await fetchLiveFixtures();
    if (live && live.length > 0) {
      // Preserve odds/probabilities/value-bet from the cached snapshot.
      let cachedById = new Map<number, Match>();
      if (hasDatabase()) {
        try {
          const cached = await getActiveMatches();
          cachedById = new Map(cached.map((m) => [m.id, m]));
        } catch {
          /* ignore — fall back to bare live fixtures */
        }
      }
      const merged = live.map((lm) => {
        const prev = cachedById.get(lm.id);
        if (!prev) return lm;
        return {
          ...prev,
          status: lm.status,
          minute: lm.minute,
          homeScore: lm.homeScore,
          awayScore: lm.awayScore,
        };
      });
      if (hasDatabase()) {
        try {
          await saveMatches(merged);
        } catch {
          /* best-effort */
        }
      }
      return { data: merged, source: 'live', updatedAt: now };
    }
  } catch {
    /* ignore */
  }

  // No live games (or no key): return any live games from cache, else empty.
  if (hasDatabase()) {
    try {
      const cached = (await getActiveMatches()).filter((m) => m.status === 'live');
      return { data: cached, source: 'cache', updatedAt: now };
    } catch {
      /* ignore */
    }
  }

  const liveFallback = fallbackMatches.filter((m) => m.status === 'live');
  return {
    data: liveFallback,
    source: 'fallback',
    updatedAt: now,
  };
}

// Full refresh used by the cron job: rebuild from upstream, persist, clean up.
export async function refreshAll(): Promise<{
  refreshed: number;
  expired: number;
  source: string;
}> {
  const live = await buildLiveMatches();
  let refreshed = 0;
  if (live && live.length > 0 && hasDatabase()) {
    await saveMatches(live);
    refreshed = live.length;
  }
  let expired = 0;
  if (hasDatabase()) {
    expired = await expireFinishedMatches();
    // Drop leftover games from previous days so the dashboard only shows the
    // current snapshot (only when we actually got a fresh live set, to avoid
    // wiping the cache during an upstream outage).
    if (refreshed > 0) {
      expired += await expireStaleMatches();
    }
  }
  return { refreshed, expired, source: live ? 'live' : 'none' };
}
