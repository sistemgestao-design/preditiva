// Orchestration layer used by the serverless endpoints. Encapsulates the
// "live → cache → fallback" strategy so every endpoint behaves consistently
// and the UI never receives empty/broken data.
import type { ApiResponse, Match, TeamForm } from './types.js';
import { fetchTodayFixtures, fetchLiveFixtures } from './apiFootball.js';
import { fetchAllOdds } from './oddsApi.js';
import { enrichMatches } from './merge.js';
import { fetchTeamForm, buildPrediction } from './stats.js';
import { buildFormLookup, hasFootballDataKey } from './footballData.js';
import { fallbackMatches } from './fallback.js';
import {
  hasDatabase,
  getActiveMatches,
  saveMatches,
  lastUpdatedAt,
  expireFinishedMatches,
  expireStaleMatches,
  getCachedForms,
  saveTeamForm,
} from './db.js';

// Cap on how many NEW team-history requests we make per refresh. Each team costs
// one API-Football request; with a 12h form cache this protects the 100/day free
// quota even across multiple forced refreshes.
const MAX_NEW_FORM_FETCHES = 20;

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

  const enriched = enrichMatches(fixtures, odds ?? []);
  return enrichWithAnalysis(enriched);
}

// Attach statistical form + AI suggestion to each match. Form is read from the
// DB cache first (12h fresh); only teams missing from the cache trigger an
// API-Football history request, bounded by MAX_NEW_FORM_FETCHES to protect the
// daily quota. Best-effort: any failure just leaves a match without analysis.
export async function enrichWithAnalysis(matches: Match[]): Promise<Match[]> {
  // Unique teams (id + name); the name is needed to match against football-data.
  const teams = new Map<number, string>();
  for (const m of matches) {
    if (m.homeTeam.id) teams.set(m.homeTeam.id, m.homeTeam.name);
    if (m.awayTeam.id) teams.set(m.awayTeam.id, m.awayTeam.name);
  }
  const ids = Array.from(teams.keys());
  if (ids.length === 0) return matches;

  const forms = new Map<number, TeamForm>();
  try {
    const cached = await getCachedForms(ids);
    cached.forEach((v, k) => forms.set(k, v));
  } catch {
    /* ignore cache read failure */
  }

  // Prefer CURRENT-season form from football-data (covered leagues). It replaces
  // any older cached form (e.g. the API-Football season fallback). The index is
  // built once and cached for hours, so this costs ~0 requests most of the time.
  if (hasFootballDataKey()) {
    try {
      const lookup = await buildFormLookup();
      for (const [id, name] of teams) {
        const fd = lookup(name);
        const cur = forms.get(id);
        if (fd && (!cur || (cur.season ?? 0) < (fd.season ?? 0))) {
          forms.set(id, fd);
          saveTeamForm(id, fd).catch(() => {});
        }
      }
    } catch {
      /* ignore football-data failure; fall back below */
    }
  }

  const missing = ids.filter((id) => !forms.has(id)).slice(0, MAX_NEW_FORM_FETCHES);
  // Fetch missing forms with a small concurrency limit to respect the 30s budget.
  const CONCURRENCY = 8;
  for (let i = 0; i < missing.length; i += CONCURRENCY) {
    const batch = missing.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (id) => {
        const form = await fetchTeamForm(id);
        return { id, form };
      }),
    );
    for (const { id, form } of results) {
      if (form) {
        forms.set(id, form);
        saveTeamForm(id, form).catch(() => {});
      }
    }
  }

  return matches.map((m) => {
    const homeForm = m.homeTeam.id ? forms.get(m.homeTeam.id) ?? null : null;
    const awayForm = m.awayTeam.id ? forms.get(m.awayTeam.id) ?? null : null;
    const prediction = buildPrediction(m, homeForm, awayForm);
    return { ...m, analysis: { homeForm, awayForm, prediction } };
  });
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
