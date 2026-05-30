// Small fetch wrapper that enforces a timeout via AbortController so a slow
// upstream API never causes the serverless function to hit Vercel's execution
// timeout. Returns null on any failure (timeout, network, non-2xx) so callers
// can fall back gracefully.

export interface FetchJsonOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<{ ok: true; data: T } | { ok: false; error: string; status?: number }> {
  const { headers = {}, timeoutMs = 7000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { headers, signal: controller.signal });

    if (res.status === 429) {
      return { ok: false, error: 'rate_limit', status: 429 };
    }
    if (!res.ok) {
      return { ok: false, error: `http_${res.status}`, status: res.status };
    }

    const json = (await res.json()) as T;
    return { ok: true, data: json };
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return { ok: false, error: isAbort ? 'timeout' : 'network_error' };
  } finally {
    clearTimeout(timer);
  }
}
