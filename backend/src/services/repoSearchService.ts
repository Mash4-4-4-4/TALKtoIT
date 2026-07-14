import mongoose from "mongoose";
import RepoChunk from "../models/RepoChunkModel";
import { generateEmbedding } from "./embeddingService";

export const searchRepoChunks = async (
  repoId: string,
  question: string
) => {
  const queryEmbedding = await generateEmbedding(question);
  const results = await RepoChunk.aggregate([
    {
      $vectorSearch: {
        filter: {
          repoId: new mongoose.Types.ObjectId(repoId),
        },
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: 10,
      },
    },
    {
      $project: {
        chunk: 1,
        filePath: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);
  return results;
};

export const getRepoContext = async (
  repoId: string,
  question: string
) => {
  const results = await searchRepoChunks(repoId, question);
  return results
    .map((doc) => `--- File: ${doc.filePath} ---\n${doc.chunk}`)
    .join("\n\n");
};
