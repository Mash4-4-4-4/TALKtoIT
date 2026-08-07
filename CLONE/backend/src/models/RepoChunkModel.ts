import mongoose from "mongoose";

const repoChunkSchema = new mongoose.Schema(
  {
    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repo",
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    chunk: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "repo_chunks",
  }
);

export default mongoose.model("RepoChunk", repoChunkSchema);
