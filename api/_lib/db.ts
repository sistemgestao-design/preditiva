// Postgres data layer (Supabase-compatible via postgres.js).
//
// Everything here is defensive: if no connection string is configured, every
// function becomes a no-op and the API falls back to live/mock data. We use
// postgres.js (not @vercel/postgres) because the Supabase connection string is
// a standard Postgres endpoint — the @vercel/postgres Neon driver talks to a
// Neon proxy over fetch and fails against Supabase ("fetch failed").
import postgres from 'postgres';
import type { Match, TeamForm } from './types.js';

// Prefer the pooled connection (transaction pooler, port 6543) which is the
// right choice for short-lived serverless invocations; fall back to the direct
// connection if that's all that's available.
const CONNECTION_STRING =
  process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || '';

export function hasDatabase(): boolean {
  return !!CONNECTION_STRING;
}

// Lazily create a single client per warm function instance. `prepare: false` is
// required for the Supabase transaction pooler (pgbouncer) which doesn't support
// prepared statements.
let client: ReturnType<typeof postgres> | null = null;

function db(): ReturnType<typeof postgres> {
  if (!client) {
    client = postgres(CONNECTION_STRING, {
      prepare: false,
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return client;
}

let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (!hasDatabase() || schemaReady) return;
  const sql = db();
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
  await sql`
    CREATE TABLE IF NOT EXISTS team_form (
      team_id     BIGINT PRIMARY KEY,
      data        JSONB NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  schemaReady = true;
}

// Read cached team-form rows that are still fresh (within maxAgeHours). Used to
// avoid re-spending the API-Football daily quota on history we already have.
export async function getCachedForms(
  ids: number[],
  maxAgeHours = 12,
): Promise<Map<number, TeamForm>> {
  const map = new Map<number, TeamForm>();
  if (!hasDatabase() || ids.length === 0) return map;
  await ensureSchema();
  const sql = db();
  const rows = await sql<{ team_id: number; data: TeamForm | string }[]>`
    SELECT team_id, data FROM team_form
    WHERE team_id IN ${sql(ids)}
      AND updated_at > now() - make_interval(hours => ${maxAgeHours});
  `;
  for (const r of rows) {
    const d = typeof r.data === 'string' ? (JSON.parse(r.data) as TeamForm) : r.data;
    map.set(Number(r.team_id), d);
  }
  return map;
}

// Persist a team's computed form (upsert, refreshing updated_at).
export async function saveTeamForm(teamId: number, form: TeamForm): Promise<void> {
  if (!hasDatabase()) return;
  await ensureSchema();
  const sql = db();
  await sql`
    INSERT INTO team_form (team_id, data, updated_at)
    VALUES (${teamId}, ${JSON.stringify(form)}::jsonb, now())
    ON CONFLICT (team_id) DO UPDATE
      SET data = EXCLUDED.data, updated_at = now();
  `;
}

// Upsert the current set of matches. Used by the cron refresh job.
export async function saveMatches(matches: Match[]): Promise<void> {
  if (!hasDatabase() || matches.length === 0) return;
  await ensureSchema();
  const sql = db();
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
  const sql = db();
  const rows = await sql<{ payload: Match | string }[]>`
    SELECT payload FROM matches
    WHERE status <> 'finished'
    ORDER BY
      CASE status WHEN 'live' THEN 0 WHEN 'today' THEN 1 ELSE 2 END,
      updated_at DESC
    LIMIT 50;
  `;
  // Some rows may have been persisted double-encoded (a JSON string inside the
  // jsonb column). Normalize so the API always returns Match objects.
  return rows
    .map((r) => {
      const p = r.payload;
      if (typeof p === 'string') {
        try {
          return JSON.parse(p) as Match;
        } catch {
          return null;
        }
      }
      return p;
    })
    .filter((m): m is Match => m !== null);
}

// Expiration/cleanup: delete finished games older than 24h so the table (and the
// main screen) never congest.
export async function expireFinishedMatches(): Promise<number> {
  if (!hasDatabase()) return 0;
  await ensureSchema();
  const sql = db();
  const result = await sql`
    DELETE FROM matches
    WHERE status = 'finished' AND updated_at < now() - INTERVAL '24 hours';
  `;
  return result.count ?? 0;
}

// Remove stale games that were not part of a recent refresh. A fresh refresh
// bumps updated_at to now() for every current fixture, so any non-finished row
// that hasn't been touched in `maxAgeHours` is a leftover from a previous day
// (e.g. an "upcoming" game whose date has passed) and should be dropped — this
// keeps the dashboard showing only the current snapshot instead of mixing in
// outdated fixtures.
export async function expireStaleMatches(maxAgeHours = 6): Promise<number> {
  if (!hasDatabase()) return 0;
  await ensureSchema();
  const sql = db();
  const result = await sql`
    DELETE FROM matches
    WHERE status <> 'finished'
      AND updated_at < now() - make_interval(hours => ${maxAgeHours});
  `;
  return result.count ?? 0;
}

// Timestamp of the most recently refreshed match (used to decide staleness).
export async function lastUpdatedAt(): Promise<Date | null> {
  if (!hasDatabase()) return null;
  await ensureSchema();
  const sql = db();
  const rows = await sql<{ max: string | null }[]>`SELECT MAX(updated_at) AS max FROM matches;`;
  const max = rows[0]?.max;
  return max ? new Date(max) : null;
}
