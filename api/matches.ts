import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMatches } from './_lib/service';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const result = await getMatches();
    // Cache at the edge for 60s, allow serving stale while revalidating.
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
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
