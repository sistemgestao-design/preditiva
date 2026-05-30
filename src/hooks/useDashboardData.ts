import { useEffect, useRef, useState } from 'react';
import type { Match } from '../types';
import { fetchMatches, fetchLiveMatches, type DataSource } from '../services/api';

const LIVE_POLL_MS = 30_000; // short polling for live games
const FULL_REFRESH_MS = 5 * 60_000; // periodic full refresh

interface DashboardData {
  matches: Match[];
  source: DataSource;
  updatedAt: string;
  notice?: string;
  loading: boolean;
}

// Merge live updates (score/minute/odds/status) into the current match list by id.
function mergeLive(current: Match[], live: Match[]): Match[] {
  if (live.length === 0) return current;
  const byId = new Map(live.map((m) => [m.id, m]));
  return current.map((m) => {
    const update = byId.get(m.id);
    return update ? { ...m, ...update } : m;
  });
}

export function useDashboardData(): DashboardData {
  const [state, setState] = useState<DashboardData>({
    matches: [],
    source: 'fallback',
    updatedAt: new Date().toISOString(),
    loading: true,
  });
  const matchesRef = useRef<Match[]>([]);

  // Initial load + periodic full refresh.
  useEffect(() => {
    let cancelled = false;

    const loadFull = async () => {
      const res = await fetchMatches();
      if (cancelled) return;
      matchesRef.current = res.data;
      setState({
        matches: res.data,
        source: res.source,
        updatedAt: res.updatedAt,
        notice: res.notice,
        loading: false,
      });
    };

    loadFull();
    const fullTimer = setInterval(loadFull, FULL_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(fullTimer);
    };
  }, []);

  // Short polling for live games — only runs while at least one game is live.
  useEffect(() => {
    const hasLive = state.matches.some((m) => m.status === 'live');
    if (!hasLive) return;

    let cancelled = false;
    const poll = async () => {
      const live = await fetchLiveMatches();
      if (cancelled || live.length === 0) return;
      const merged = mergeLive(matchesRef.current, live);
      matchesRef.current = merged;
      setState((prev) => ({ ...prev, matches: merged, updatedAt: new Date().toISOString() }));
    };

    const timer = setInterval(poll, LIVE_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [state.matches]);

  return state;
}
