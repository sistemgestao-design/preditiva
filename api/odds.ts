import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMatches } from './_lib/service.js';

// Returns the odds comparison for a single match (?id=<matchId>), or the full
// list of matches' odds when no id is given. Reuses the cached match data so it
// doesn't burn extra upstream requests.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    const result = await getMatches();

    if (id) {
      const match = result.data.find((m) => String(m.id) === String(id));
      if (!match) {
        res.status(404).json({ error: 'match_not_found' });
        return;
      }
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      res.status(200).json({
        data: {
          matchId: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          oddsComparison: match.oddsComparison,
        },
        source: result.source,
        updatedAt: result.updatedAt,
      });
      return;
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({
      data: result.data.map((m) => ({
        matchId: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        oddsComparison: m.oddsComparison,
      })),
      source: result.source,
      updatedAt: result.updatedAt,
    });
  } catch {
    res.status(200).json({ data: [], source: 'fallback', updatedAt: new Date().toISOString() });
  }
}
