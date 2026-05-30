// Vercel Postgres data layer. Everything here is defensive: if POSTGRES_URL is
// not configured (e.g. before the database is created in the Vercel dashboard),
// every function becomes a no-op and the API falls back to live/mock data.
import { sql } from '@vercel/postgres';
import type { Match } from './types';

export function hasDatabase(): boolean {
  return !!process.env.POSTGRES_URL || !!process.env.POSTGRES_URL_NON_POOLING;
}

let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (!hasDatabase() || schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS matches (
      id            BIGINT PRIMARY KEY,
      payload       JSONB NOT NULL,
      status        TEXT NOT NULL,
      league        TEXT,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS matches_status_idx ON matches (status);`;
  schemaReady = true;
}

// Upsert the current set of matches. Used by the cron refresh job.
export async function saveMatches(matches: Match[]): Promise<void> {
  if (!hasDatabase() || matches.length === 0) return;
  await ensureSchema();
  for (const m of matches) {
    await sql`
      INSERT INTO matches (id, payload, status, league, updated_at)
      VALUES (${m.id}, ${JSON.stringify(m)}::jsonb, ${m.status}, ${m.league}, now())
      ON CONFLICT (id) DO UPDATE
        SET payload = EXCLUDED.payload,
            status = EXCLUDED.status,
            league = EXCLUDED.league,
            updated_at = now();
    `;
  }
}

// Read active (non-finished) matches ordered by status so live games come first.
export async function getActiveMatches(): Promise<Match[]> {
  if (!hasDatabase()) return [];
  await ensureSchema();
  const { rows } = await sql<{ payload: Match }>`
    SELECT payload FROM matches
    WHERE status <> 'finished'
    ORDER BY
      CASE status WHEN 'live' THEN 0 WHEN 'today' THEN 1 ELSE 2 END,
      updated_at DESC
    LIMIT 50;
  `;
  return rows.map((r) => r.payload);
}

// Expiration/cleanup: mark finished games and delete very old rows so the table
// (and the main screen) never congest.
export async function expireFinishedMatches(): Promise<number> {
  if (!hasDatabase()) return 0;
  await ensureSchema();
  // Remove finished games older than 24h from the active pool entirely.
  const { rowCount } = await sql`
    DELETE FROM matches
    WHERE status = 'finished' AND updated_at < now() - INTERVAL '24 hours';
  `;
  return rowCount ?? 0;
}

// Timestamp of the most recently refreshed match (used to decide staleness).
export async function lastUpdatedAt(): Promise<Date | null> {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const { rows } = await sql<{ max: string | null }>`SELECT MAX(updated_at) AS max FROM matches;`;
  const max = rows[0]?.max;
  return max ? new Date(max) : null;
}
