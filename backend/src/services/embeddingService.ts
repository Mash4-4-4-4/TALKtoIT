console.log("EMBEDDING SERVICE LOADED");
import { GoogleGenAI} from "@google/genai";


console.log(
  "GEMINI_API:",
  process.env.GEMINI_API
);
const ai=new GoogleGenAI(
    {
        apiKey: process.env.GEMINI_API!,
    }
);

export const generateEmbedding = async (
  text: string
): Promise<number[]> => {

  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  if (!result.embeddings || result.embeddings.length === 0) {
    throw new Error("No embedding returned");
  }

  const values = result.embeddings[0].values;

  if (!values) {
    throw new Error("Embedding values missing");
  }

  return values;
};