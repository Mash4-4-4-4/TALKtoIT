import mongoose from "mongoose";
import { randomUUID } from "crypto";

const RepoChatMessageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => randomUUID(),
    },
    role: {
      type: String,
      required: true, // "user" | "assistant"
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // gives each message a real createdAt, unlike the User chat schema
);

const RepoSchema = new mongoose.Schema(
  {
    repoName: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    zipFile: {
      type: String,
      required: true,
    },
    extractedPath: {
      type: String,
      required: true,
    },
    // "processing" while extraction/indexing runs in the background,
    // "ready" once it can be queried, "failed" if something went wrong.
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    // where the repo came from — used to show the right icon/label in the UI
    source: {
      type: String,
      enum: ["zip", "github"],
      default: "zip",
    },
    sourceUrl: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    filesProcessed: {
      type: Number,
      default: 0,
    },
    chunksCreated: {
      type: Number,
      default: 0,
    },
    messages: [RepoChatMessageSchema],
  },
  {
    timestamps: true,
    collection: "repositories",
  }
);

const RepoModel = mongoose.model("Repo", RepoSchema);

export default RepoModel;