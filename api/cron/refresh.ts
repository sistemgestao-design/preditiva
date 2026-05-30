import type { VercelRequest, VercelResponse } from '@vercel/node';
import { refreshAll } from '../_lib/service.js';

// Cron job (configured in vercel.json) that periodically fetches the day's
// fixtures + odds, upserts them into Postgres, and expires finished games.
// Protected by CRON_SECRET when set — Vercel Cron sends it as a Bearer token.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${secret}`) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
  }

  try {
    const result = await refreshAll();
    res.status(200).json({ ok: true, ...result, ranAt: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error';
    res.status(200).json({ ok: false, error: message, ranAt: new Date().toISOString() });
  }
}
