/**
 * Serializes AeroDataBox calls to respect RapidAPI BASIC plan (1 req/s).
 * Also retries once on 429 and caches identical GET responses briefly.
 */

const DEFAULT_MIN_INTERVAL_MS = 1500;
const RETRY_AFTER_429_MS = 2500;
const CACHE_TTL_MS = 2 * 60_000;

let lastRequestFinishedAt = 0;
let chain: Promise<unknown> = Promise.resolve();

const responseCache = new Map<
  string,
  { expiresAt: number; body: string; status: number; ok: boolean }
>();

function minIntervalMs() {
  const parsed = Number(process.env.AERODATABOX_MIN_INTERVAL_MS);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MIN_INTERVAL_MS;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function schedule<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(async () => {
    const elapsed = Date.now() - lastRequestFinishedAt;
    const gap = minIntervalMs() - elapsed;
    if (gap > 0) await wait(gap);
    return task();
  });

  chain = run.then(
    () => undefined,
    () => undefined,
  );

  return run.finally(() => {
    lastRequestFinishedAt = Date.now();
  });
}

async function fetchWithOptionalRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  let res = await fetch(url, init);

  if (res.status === 429) {
    await wait(RETRY_AFTER_429_MS);
    lastRequestFinishedAt = Date.now();
    await wait(minIntervalMs());
    res = await fetch(url, init);
  }

  return res;
}

export async function aerodataboxFetch(
  url: string,
  init: RequestInit,
  options?: { cacheKey?: string },
): Promise<Response> {
  const cacheKey = options?.cacheKey;

  if (cacheKey) {
    const hit = responseCache.get(cacheKey);
    if (hit && hit.expiresAt > Date.now()) {
      return new Response(hit.body, {
        status: hit.status,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return schedule(async () => {
    const res = await fetchWithOptionalRetry(url, init);
    const body = await res.text();

    if (cacheKey && res.ok) {
      responseCache.set(cacheKey, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        body,
        status: res.status,
        ok: res.ok,
      });
    }

    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: { "Content-Type": "application/json" },
    });
  });
}

export function isAeroDataBoxRateLimitError(message: string) {
  return message.includes("(429)") || message.toLowerCase().includes("rate limit");
}
