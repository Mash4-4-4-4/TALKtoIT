console.log("EMBEDDING SERVICE LOADED");
import { GoogleGenAI } from "@google/genai";
import { embeddingRateLimiter } from "../utils/rateLimiter";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API!,
});

const EMBEDDING_DIMENSIONS = 768; // matches Atlas vector_index numDimensions
const EMBEDDING_MODEL = "gemini-embedding-001";

// Gemini's embedContent endpoint accepts multiple texts in one request
// (contents: string[]). Batching chunks into one call instead of one
// call per chunk is what actually fixes the rate-limit problem: a repo
// with 1,000 chunks used to mean 1,000 requests, now it means ~32.
// Keep this comfortably under Google's per-request batch cap.
const EMBED_BATCH_SIZE = Number(process.env.EMBEDDING_BATCH_SIZE) || 32;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * @google/genai's ApiError does NOT expose the response body as a
 * structured `err.error` object — it bakes the whole JSON payload into
 * `err.message` as a string (e.g. `ApiError: {"error":{"code":429,...}}`).
 * Reading `err?.error?.details` therefore silently returns undefined for
 * every real error, including daily-quota exhaustion, and every 429 fell
 * through to a full 8-attempt exponential backoff (up to ~2 minutes)
 * instead of failing immediately on an error retrying can never fix.
 * This pulls the JSON blob out of `.message` (falling back to a
 * structured `.error` property if some other error shape ever provides
 * one) so the checks below actually see the real payload.
 */
const getErrorPayload = (err: any): any => {
  if (err?.error && typeof err.error === "object") return err.error;
  const raw = typeof err?.message === "string" ? err.message : "";
  const jsonStart = raw.indexOf("{");
  if (jsonStart === -1) return null;
  try {
    const parsed = JSON.parse(raw.slice(jsonStart));
    return parsed?.error ?? parsed;
  } catch {
    return null;
  }
};

const isQuotaPerDay = (err: any): boolean => {
  const details = getErrorPayload(err)?.details ?? [];
  const violations = details.flatMap((d: any) => d?.violations ?? []);
  return violations.some((v: any) =>
    String(v?.quotaId ?? v?.quotaMetric ?? "").toLowerCase().includes("perday")
  );
};

const getRetryDelayMs = (err: any, attempt: number): number => {
  const details = getErrorPayload(err)?.details ?? [];
  const retryInfo = details.find((d: any) => d["@type"]?.includes("RetryInfo"));
  if (retryInfo?.retryDelay) {
    const secs = parseFloat(String(retryInfo.retryDelay).replace("s", ""));
    if (!isNaN(secs)) return secs * 1000 + 500;
  }
  // Exponential backoff with jitter as a fallback, capped so a bad
  // request doesn't stall the whole indexing job for minutes.
  const base = Math.min(2 ** attempt * 1000, 30_000);
  const jitter = Math.random() * 500;
  return base + jitter;
};

/**
 * Embeds a batch of texts in a single Gemini API request. Internally
 * chunks the input into groups of EMBED_BATCH_SIZE and paces every
 * outbound request through the shared rate limiter, so concurrent
 * callers (multiple files/repos indexing at once, or search running
 * alongside indexing) never collectively exceed the configured RPM.
 */
export const generateEmbeddings = async (
  texts: string[],
  retries = 8
): Promise<number[][]> => {
  if (texts.length === 0) return [];

  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
    const embeddings = await embedBatchWithRetry(batch, retries);
    results.push(...embeddings);
  }
  return results;
};

/** Convenience wrapper for the (common) single-text case. */
export const generateEmbedding = async (
  text: string,
  retries = 8
): Promise<number[]> => {
  const [embedding] = await embedBatchWithRetry([text], retries);
  return embedding;
};

const embedBatchWithRetry = async (
  batch: string[],
  retries: number
): Promise<number[][]> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    await embeddingRateLimiter.acquire();
    try {
      const result = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: batch,
        config: {
          outputDimensionality: EMBEDDING_DIMENSIONS,
        },
      });

      if (!result.embeddings || result.embeddings.length === 0) {
        throw new Error("No embedding returned");
      }

      const values = result.embeddings.map((e) => e.values);
      if (values.some((v) => !v)) {
        throw new Error("Embedding values missing");
      }

      return values as number[][];
    } catch (err: any) {
      const status = err?.status ?? err?.error?.code;
      const isRateLimit = status === 429;

      if (!isRateLimit) throw err;

      if (isQuotaPerDay(err)) {
        // Retrying won't help a daily quota exhaustion — fail fast with
        // a message the UI/controller can surface, instead of burning
        // through all retries on a request that can never succeed today.
        throw new Error(
          "Gemini embedding daily quota exhausted. Try again after the quota resets, or upgrade your API tier."
        );
      }

      if (attempt === retries) throw err;

      const delayMs = getRetryDelayMs(err, attempt);
      console.warn(
        `Rate-limited embedding a batch of ${batch.length} (attempt ${attempt + 1}/${retries + 1}), retrying in ${Math.round(delayMs)}ms`
      );
      await sleep(delayMs);
    }
  }
  throw new Error("generateEmbeddings: exhausted retries");
};
