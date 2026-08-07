/**
 * A tiny, dependency-free sliding-window rate limiter.
 *
 * Why this exists: the old indexing pipeline fired several
 * `embedContent` calls concurrently (Promise.all in small batches) with
 * only a fixed 500ms pause between batches. Each call also retried
 * independently on 429s. Under any real repo size that adds up to way
 * more requests/minute than the Gemini free/paid tier allows, so every
 * concurrent request ends up racing the same 429 wall and the retries
 * never catch up.
 *
 * This limiter makes ALL embedding calls (indexing + search, repo + pdf)
 * funnel through one shared queue that never exceeds `maxPerMinute`
 * requests in any rolling 60s window, regardless of how many callers are
 * trying to embed at once. Combined with request-batching in
 * embeddingService.ts, this keeps us comfortably under quota instead of
 * hoping retries win a race.
 */
export class RateLimiter {
  private readonly maxPerWindow: number;
  private readonly windowMs: number;
  private timestamps: number[] = [];
  private queue: Array<() => void> = [];
  private processing = false;

  constructor(maxPerWindow: number, windowMs = 60_000) {
    this.maxPerWindow = maxPerWindow;
    this.windowMs = windowMs;
  }

  /** Resolves once it's safe to make one more request under the limit. */
  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.processing) return;
    this.processing = true;
    this.drain();
  }

  private async drain() {
    while (this.queue.length > 0) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

      if (this.timestamps.length < this.maxPerWindow) {
        this.timestamps.push(now);
        const resolve = this.queue.shift()!;
        resolve();
        // small stagger so we don't release a whole burst on the same tick
        await sleep(50);
      } else {
        const oldest = this.timestamps[0];
        const waitMs = this.windowMs - (now - oldest) + 25;
        await sleep(Math.max(waitMs, 50));
      }
    }
    this.processing = false;
  }
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Shared across the whole process: every embedding call (indexing repos,
// indexing PDFs, and answering search queries) goes through this one
// limiter, so concurrent uploads can't stack requests on top of each other.
// Override via EMBEDDING_MAX_RPM in .env if your Gemini tier allows more
// (or less) than the default. Keep this conservative — free-tier Gemini
// embedding quota is easy to blow through on a whole repo.
const EMBEDDING_MAX_RPM = Number(process.env.EMBEDDING_MAX_RPM) || 12;

export const embeddingRateLimiter = new RateLimiter(EMBEDDING_MAX_RPM, 60_000);
