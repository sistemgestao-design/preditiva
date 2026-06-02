import type { VercelRequest, VercelResponse } from '@vercel/node';

// Crest image proxy. The api-sports.io CDN blocks direct hotlinking on some
// mobile networks, which made team logos vanish for users. Serving the image
// from our own domain sidesteps that: the browser requests /api/crest?team=ID
// and we stream the upstream PNG back with long-lived cache headers.
//
// Only the api-sports media host is allowed, so this can't be used as an open
// proxy for arbitrary URLs.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const team = Array.isArray(req.query.team) ? req.query.team[0] : req.query.team;
  const league = Array.isArray(req.query.league) ? req.query.league[0] : req.query.league;

  let upstream: string | null = null;
  if (team && /^\d+$/.test(team)) {
    upstream = `https://media.api-sports.io/football/teams/${team}.png`;
  } else if (league && /^\d+$/.test(league)) {
    upstream = `https://media.api-sports.io/football/leagues/${league}.png`;
  }

  if (!upstream) {
    res.status(400).json({ error: 'missing or invalid team/league id' });
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const upstreamRes = await fetch(upstream, {
      signal: controller.signal,
      headers: { Accept: 'image/png,image/*,*/*' },
    });
    clearTimeout(timer);

    if (!upstreamRes.ok || !upstreamRes.body) {
      res.status(502).json({ error: 'upstream image unavailable' });
      return;
    }

    const arrayBuffer = await upstreamRes.arrayBuffer();
    const contentType = upstreamRes.headers.get('content-type') ?? 'image/png';
    res.setHeader('Content-Type', contentType);
    // Cache hard at the edge and in the browser — crests basically never change.
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, immutable');
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch {
    res.status(502).json({ error: 'failed to fetch crest' });
  }
}
