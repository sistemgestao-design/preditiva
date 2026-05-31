import { useEffect, useRef, useState } from 'react';
import type { Match } from '../types';
import { fetchMatches, fetchLiveMatches, type DataSource } from '../services/api';

const LIVE_POLL_MS = 30_000; // short polling for live games
const FULL_REFRESH_MS = 60_000; // automatic full refresh every 60s

interface DashboardData {
  matches: Match[];
  source: DataSource;
  updatedAt: string;
  notice?: string;
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
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

interface InternalState {
  matches: Match[];
  source: DataSource;
  updatedAt: string;
  notice?: string;
  loading: boolean;
  refreshing: boolean;
}

export function useDashboardData(): DashboardData {
  const [state, setState] = useState<InternalState>({
    matches: [],
    source: 'fallback',
    updatedAt: new Date().toISOString(),
    loading: true,
    refreshing: false,
  });
  const matchesRef = useRef<Match[]>([]);
  const loadFullRef = useRef<() => Promise<void>>(async () => {});

  // Initial load + periodic full refresh (every 60s) + manual refresh.
  useEffect(() => {
    let cancelled = false;

    const loadFull = async () => {
      setState((prev) => ({ ...prev, refreshing: true }));
      const res = await fetchMatches();
      if (cancelled) return;
      matchesRef.current = res.data;
      setState({
        matches: res.data,
        source: res.source,
        updatedAt: res.updatedAt,
        notice: res.notice,
        loading: false,
        refreshing: false,
      });
    };

    loadFullRef.current = loadFull;
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

  return {
    ...state,
    refresh: () => {
      void loadFullRef.current();
    },
  };
}
