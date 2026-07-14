console.log("EMBEDDING SERVICE LOADED");
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API!,
});

const EMBEDDING_DIMENSIONS = 768; // matches Atlas vector_index numDimensions

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const generateEmbedding = async (
  text: string,
  retries = 5
): Promise<number[]> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: text,
        config: {
          outputDimensionality: EMBEDDING_DIMENSIONS,
        },
      });

      if (!result.embeddings || result.embeddings.length === 0) {
        throw new Error("No embedding returned");
      }

      const values = result.embeddings[0].values;
      if (!values) {
        throw new Error("Embedding values missing");
      }

      return values;
    } catch (err: any) {
      const status = err?.status ?? err?.error?.code;
      const isRateLimit = status === 429;
      if (!isRateLimit || attempt === retries) throw err;

      let delayMs = 2 ** attempt * 1000;
      const retryInfo = err?.error?.details?.find((d: any) =>
        d["@type"]?.includes("RetryInfo")
      );
      if (retryInfo?.retryDelay) {
        const secs = parseFloat(retryInfo.retryDelay.replace("s", ""));
        if (!isNaN(secs)) delayMs = secs * 1000 + 500;
      }

      console.warn(`Rate-limited, retrying in ${delayMs}ms`);
      await sleep(delayMs);
    }
  }
  throw new Error("generateEmbedding: exhausted retries");
};