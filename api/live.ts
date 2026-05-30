import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getLiveMatches } from './_lib/service.js';

// Short-polling endpoint for live scores/minute/odds. The frontend hits this
// every ~30s for games in progress. Kept lightweight (live fixtures only).
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const result = await getLiveMatches();
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    res.status(200).json(result);
  } catch {
    res.status(200).json({
      data: [],
      source: 'fallback',
      updatedAt: new Date().toISOString(),
      notice: 'Erro interno ao carregar jogos ao vivo.',
    });
  }
}
