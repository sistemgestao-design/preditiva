import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMatches } from './_lib/service.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const force = req.query?.refresh === '1' || req.query?.force === '1';
    const result = await getMatches(force);
    if (force) {
      // A forced refresh must not be served from the edge cache.
      res.setHeader('Cache-Control', 'no-store');
    } else {
      // Cache at the edge for 60s, allow serving stale while revalidating.
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    }
    res.status(200).json(result);
  } catch {
    // Never 500 to the UI — return fallback shape so the screen stays alive.
    res.status(200).json({
      data: [],
      source: 'fallback',
      updatedAt: new Date().toISOString(),
      notice: 'Erro interno ao carregar jogos.',
    });
  }
}
