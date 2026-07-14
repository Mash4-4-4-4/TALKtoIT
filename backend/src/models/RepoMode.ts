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
    messages: [RepoChatMessageSchema],
  },
  {
    timestamps: true,
    collection: "repositories",
  }
);

const RepoModel = mongoose.model("Repo", RepoSchema);

export default RepoModel;