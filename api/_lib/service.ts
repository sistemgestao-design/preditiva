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

const STALE_MS = 15 * 60 * 1000; // 15 minutes

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
export async function getMatches(): Promise<ApiResponse<Match[]>> {
  const now = new Date().toISOString();

  // 1) Serve from DB if it has reasonably fresh data.
  if (hasDatabase()) {
    try {
      const updated = await lastUpdatedAt();
      const fresh = updated && Date.now() - updated.getTime() < STALE_MS;
      const cached = await getActiveMatches();
      if (fresh && cached.length > 0) {
        return { data: cached, source: 'cache', updatedAt: updated!.toISOString() };
      }
    } catch {
      // DB hiccup — fall through to live/fallback.
    }
  }

  // 2) Try live upstream APIs, persist to DB if available.
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

  // 3) Last-resort: stale cache, then mock fallback.
  if (hasDatabase()) {
    try {
      const cached = await getActiveMatches();
      if (cached.length > 0) {
        return {
          data: cached,
          source: 'cache',
          updatedAt: now,
          notice: 'Exibindo ultimo dado salvo (API indisponivel no momento).',
        };
      }
    } catch {
      /* ignore */
    }
  }

  return {
    data: fallbackMatches,
    source: 'fallback',
    updatedAt: now,
    notice: 'Dados de demonstracao — configure as chaves de API para dados reais.',
  };
}

// Live-only path used by short polling. Cheaper than a full refresh.
export async function getLiveMatches(): Promise<ApiResponse<Match[]>> {
  const now = new Date().toISOString();
  try {
    const [live, odds] = await Promise.all([fetchLiveFixtures(), fetchAllOdds()]);
    if (live && live.length > 0) {
      const enriched = enrichMatches(live, odds ?? []);
      if (hasDatabase()) {
        try {
          await saveMatches(enriched);
        } catch {
          /* best-effort */
        }
      }
      return { data: enriched, source: 'live', updatedAt: now };
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
