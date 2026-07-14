import { Request, Response } from "express";
import fs from "fs";
import {buildFileTree} from "../services/repoPipelineService";
import mongoose from "mongoose";
import path from "path";
import RepoModel from "../models/RepoMode";
import RepoChunk from "../models/RepoChunkModel";
import { extractZip, getFilesRecursively } from "../services/repoPipelineService";
import { chunkText } from "../services/chunkService";
import { generateEmbedding } from "../services/embeddingService";
import { askRepo } from "../services/repoChatService";

export const uploadRepo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No repository zip file uploaded" });
    }

    const userId = res.locals.jwtData.id;
    const filename = req.file.filename;
    // Create the DB record first to get a unique ID
    const repoName = req.file.originalname.replace(".zip", "");
    const repoId= new mongoose.Types.ObjectId(); // Generate a new ObjectId for the repo
    const destDir = path.join(".", "files", "repos", repoId.toString());
    const repo = await RepoModel.create({
      _id: repoId,
      repoName,
      uploadedBy: userId,
      zipFile: filename,
      extractedPath: destDir, // will update below
    });

    // Ensure destination directory exists
    fs.mkdirSync(destDir, { recursive: true });

    // Extract zip
    console.log("EXTRACTING ZIP...");
    extractZip(req.file.path, destDir);

    // Update the extractedPath in the database
    repo.extractedPath = destDir;
    await repo.save();

    console.log("PROCESSING REPOSITORY FILES...");
    const files = getFilesRecursively(destDir);

    let processedFilesCount = 0;
    let chunksCount = 0;

    for (const file of files) {
      try {
        const stat = fs.statSync(file.absolutePath);
        if (stat.size > 500000) {
          console.log(`Skipping file ${file.relativePath} because it is too large`);
          continue;
        }

        const content = fs.readFileSync(file.absolutePath, "utf-8");
        if (content.includes("\0")) {
          console.log(`Skipping binary file ${file.relativePath}`);
          continue;
        }

        const chunks = await chunkText(content);
        if (chunks.length === 0) continue;

        processedFilesCount++;

        // Process in small batches of 5 to run concurrently and speed it up
        const BATCH_SIZE = 2;
        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
          const batch = chunks.slice(i, i + BATCH_SIZE);
          await Promise.all(
            batch.map(async (chunkText) => {
              const embedding = await generateEmbedding(chunkText);
              await RepoChunk.create({
                repoId: repo._id,
                filePath: file.relativePath,
                chunk: chunkText,
                embedding,
              });
              chunksCount++;
            })
          );
          await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms between batches to avoid overwhelming the system
        }
      } catch (err) {
        console.error(`Error processing file ${file.relativePath}:`, err);
      }
    }

    // Clean up the uploaded zip file to save space
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      console.warn("Could not delete uploaded zip file:", e);
    }

    return res.status(200).json({
      message: "Repository processed successfully",
      repoId: repo._id,
      repoName: repo.repoName,
      filesProcessed: processedFilesCount,
      chunksCreated: chunksCount,
    });
  } catch (error) {
    console.error("Upload/Processing failed:", error);
    return res.status(500).json({ message: "Repository upload/indexing failed" });
  }
};

export const getRepos = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.jwtData.id;
    const repos = await RepoModel.find({ uploadedBy: userId });
    return res.status(200).json({ repos });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return res.status(500).json({ message: "Error fetching repositories" });
  }
};

export const askRepoQuestion = async (req: Request, res: Response) => {
  try {
    const { repoId, question } = req.body;
    if (!repoId || !question) {
      return res.status(400).json({ message: "repoId and question are required" });
    }

    // Verify user owns this repo
    const userId = res.locals.jwtData.id;
    const repo = await RepoModel.findOne({ _id: repoId, uploadedBy: userId });
    if (!repo) {
      return res.status(404).json({ message: "Repository not found or unauthorized" });
    }

   console.log(`Querying Repo ${repo.repoName}: "${question}"`);

const result = await askRepo(repoId, question);

// Save user message
repo.messages.push({
  role: "user",
  content: question,
});

// Save assistant message
repo.messages.push({
  role: "assistant",
  content: result.answer ?? "",
});

// Persist to MongoDB
await repo.save();

return res.status(200).json(result);
  } catch (error) {
    console.error("Error asking repo question:", error);
    return res.status(500).json({ message: "Error answering repository question" });
  }
};
export const getRepoChatHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.jwtData.id;

    const repo = await RepoModel.findOne({ _id: id, uploadedBy: userId });
    if (!repo) {
      return res.status(404).json({ message: "Repository not found or unauthorized" });
    }

    return res.status(200).json({ messages: repo.messages });
  } catch (error) {
    console.error("Error fetching repo chat history:", error);
    return res.status(500).json({ message: "Error fetching repo chat history" });
  }
};

// ── NEW: optional — clear just the chat history, keep the repo indexed ───────
export const deleteRepoChatHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.jwtData.id;

    const repo = await RepoModel.findOneAndUpdate(
      { _id: id, uploadedBy: userId },
      { $set: { messages: [] } },
      { new: true }
    );
    if (!repo) {
      return res.status(404).json({ message: "Repository not found or unauthorized" });
    }

    return res.status(200).json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Error clearing repo chat history:", error);
    return res.status(500).json({ message: "Error clearing repo chat history" });
  }
};
export const deleteRepo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.jwtData.id;

    // Verify ownership
    const repo = await RepoModel.findOne({ _id: id, uploadedBy: userId });
    if (!repo) {
      return res.status(404).json({ message: "Repository not found or unauthorized" });
    }

    // Delete chunks
    await RepoChunk.deleteMany({ repoId: id });

    // Clean up extracted files
    if (repo.extractedPath && fs.existsSync(repo.extractedPath)) {
      try {
        fs.rmSync(repo.extractedPath, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to delete directory ${repo.extractedPath}:`, err);
      }
    }

    // Delete model
    await RepoModel.findByIdAndDelete(id);

    return res.status(200).json({ message: "Repository deleted successfully" });
  } catch (error) {
    console.error("Error deleting repository:", error);
    return res.status(500).json({ message: "Error deleting repository" });
  }
};


export const getRepoTree = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = res.locals.jwtData.id;

    const repo = await RepoModel.findOne({ _id: id, uploadedBy: userId });
    if (!repo) {
      return res.status(404).json({ message: "Repository not found or unauthorized" });
    }

    const tree = buildFileTree(repo.extractedPath);
    return res.status(200).json({ tree });
  } catch (error) {
    console.error("Error building repo file tree:", error);
    return res.status(500).json({ message: "Error building repo file tree" });
  }
};

export const getRepoFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { path: relativePath } = req.query;
    const userId = res.locals.jwtData.id;

    if (!relativePath || typeof relativePath !== "string") {
      return res.status(400).json({ message: "File path is required" });
    }

    const repo = await RepoModel.findOne({ _id: id, uploadedBy: userId });
    if (!repo) {
      return res.status(404).json({ message: "Repository not found or unauthorized" });
    }

    const baseDir = path.resolve(repo.extractedPath);
    const targetPath = path.resolve(baseDir, relativePath);

    // block path traversal outside the repo's extracted directory
    if (targetPath !== baseDir && !targetPath.startsWith(baseDir + path.sep)) {
      return res.status(400).json({ message: "Invalid file path" });
    }
    if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
      return res.status(404).json({ message: "File not found" });
    }

    const stat = fs.statSync(targetPath);
    if (stat.size > 1_000_000) {
      return res.status(413).json({ message: "File too large to preview" });
    }

    const content = fs.readFileSync(targetPath, "utf-8");
    if (content.includes("\0")) {
      return res.status(415).json({ message: "Cannot preview binary file" });
    }

    return res.status(200).json({ path: relativePath, content });
  } catch (error) {
    console.error("Error reading repo file:", error);
    return res.status(500).json({ message: "Error reading repo file" });
  }
};