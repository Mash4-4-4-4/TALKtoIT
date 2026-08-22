import { Request, Response } from "express";
import fs from "fs";
import {buildFileTree} from "../services/repoPipelineService";
import mongoose from "mongoose";
import path from "path";
import RepoModel from "../models/RepoMode";
import RepoChunk from "../models/RepoChunkModel";
import { extractZip, getFilesRecursively, downloadGithubRepoZip, parseGithubUrl } from "../services/repoPipelineService";
import { chunkText } from "../services/chunkService";
import { generateEmbeddings } from "../services/embeddingService";
import { askRepo } from "../services/repoChatService";

/**
 * Shared indexing pipeline used by both the zip-upload flow and the
 * GitHub-URL flow. Runs AFTER the HTTP response has already been sent, so
 * the client gets an instant reply and the repo list can show a
 * "processing" badge until this finishes and flips the status to "ready".
 */
const indexRepository = async (repoId: mongoose.Types.ObjectId, destDir: string) => {
  const repo = await RepoModel.findById(repoId);
  if (!repo) return;

  try {
    console.log(`PROCESSING REPOSITORY FILES for ${repo.repoName}...`);
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

        // Embed this file's chunks via generateEmbeddings, which batches
        // many chunks into a single Gemini request and paces every
        // outbound call through a shared rate limiter (see
        // embeddingService.ts / utils/rateLimiter.ts). This is what
        // actually avoids the 429 storm the old per-chunk Promise.all
        // loop caused: instead of one request per chunk, a file with 100
        // chunks now costs ~3-4 requests, and those requests are
        // globally throttled even when multiple files/repos are
        // indexing at once.
        const embeddings = await generateEmbeddings(chunks);

        const docs = chunks.map((chunkStr, idx) => ({
          repoId: repo._id,
          filePath: file.relativePath,
          chunk: chunkStr,
          embedding: embeddings[idx],
        }));
        await RepoChunk.insertMany(docs);
        chunksCount += docs.length;
      } catch (err) {
        console.error(`Error processing file ${file.relativePath}:`, err);
        // A quota error means every remaining embed call will fail too —
        // swallowing it here and moving to the next file used to end
        // with the repo silently marked "ready" with 0 chunks, which is
        // worse than failing loudly. Stop the whole run and let the
        // outer catch mark the repo "failed" with the real reason.
        if (err instanceof Error && err.message.toLowerCase().includes("quota")) {
          throw err;
        }
      }
    }

    repo.status = "ready";
    repo.filesProcessed = processedFilesCount;
    repo.chunksCreated = chunksCount;
    await repo.save();
    console.log(`Repository ${repo.repoName} is ready (${processedFilesCount} files, ${chunksCount} chunks).`);
  } catch (error) {
    console.error(`Indexing failed for repo ${repoId}:`, error);
    repo.status = "failed";
    repo.errorMessage =
      error instanceof Error ? error.message : "Repository indexing failed";
    await repo.save();
  }
};

export const uploadRepo = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("REPO UPLOAD CONTROLLER HIT");
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "No repository file uploaded",
      });
    }

    console.log("ZIP PATH:", req.file.path);

    // rest of your existing code here

  } catch (error) {
    console.log("REPO UPLOAD FULL ERROR:");
    console.error(error);

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Repository upload failed",
    });
  }
};

export const uploadRepoFromUrl = async (req: Request, res: Response) => {
  try {
    const { githubUrl } = req.body;
    if (!githubUrl || typeof githubUrl !== "string") {
      return res.status(400).json({ message: "A GitHub repository URL is required" });
    }

    const parsed = parseGithubUrl(githubUrl);
    if (!parsed) {
      return res.status(400).json({
        message:
          "That doesn't look like a valid GitHub repository URL. Expected something like https://github.com/owner/repo",
      });
    }

    const userId = res.locals.jwtData.id;
    const repoName = parsed.repo;
    const repoId = new mongoose.Types.ObjectId();
    const destDir = path.join(".", "files", "repos", repoId.toString());
    const tempZipPath = path.join(".", "files", `${Date.now()}-${repoName}.zip`);

    const repo = await RepoModel.create({
      _id: repoId,
      repoName,
      uploadedBy: userId,
      zipFile: `${repoName}.zip`,
      extractedPath: destDir,
      status: "processing",
      source: "github",
      sourceUrl: githubUrl.trim(),
    });

    // Respond immediately so the UI can show the repo as "processing" and
    // keep polling — no page refresh needed.
    res.status(202).json({
      message: "Fetching the repository from GitHub. Indexing has started in the background.",
      repoId: repo._id,
      repoName: repo.repoName,
      status: repo.status,
    });

    try {
      console.log(`DOWNLOADING GITHUB REPO ${githubUrl}...`);
      const { branch } = await downloadGithubRepoZip(githubUrl, tempZipPath);

      fs.mkdirSync(destDir, { recursive: true });
      console.log("EXTRACTING ZIP...");
      extractZip(tempZipPath, destDir);

      // GitHub zips extract into a single "<repo>-<branch>" folder — flatten it
      // so the file tree/chunk paths look the same as a normal zip upload.
      const entries = fs.readdirSync(destDir);
      if (entries.length === 1) {
        const nestedDir = path.join(destDir, entries[0]);
        if (fs.statSync(nestedDir).isDirectory()) {
          for (const entry of fs.readdirSync(nestedDir)) {
            fs.renameSync(path.join(nestedDir, entry), path.join(destDir, entry));
          }
          fs.rmSync(nestedDir, { recursive: true, force: true });
        }
      }

      try {
        fs.unlinkSync(tempZipPath);
      } catch (e) {
        console.warn("Could not delete downloaded GitHub zip file:", e);
      }

      await indexRepository(repoId, destDir);
    } catch (err) {
      console.error(`GitHub import failed for ${githubUrl}:`, err);
      repo.status = "failed";
      repo.errorMessage =
        err instanceof Error ? err.message : "Failed to import repository from GitHub";
      await repo.save();
    }
  } catch (error) {
    console.error("GitHub upload failed:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Repository import from GitHub failed" });
    }
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

    if (repo.status === "processing") {
      return res.status(409).json({
        message: `${repo.repoName} is still being indexed. Hang tight — this usually takes a minute or two for larger repos.`,
      });
    }
    if (repo.status === "failed") {
      return res.status(409).json({
        message: `${repo.repoName} failed to index${repo.errorMessage ? `: ${repo.errorMessage}` : ""}. Try deleting it and uploading again.`,
      });
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
    // Surface known, user-actionable errors (like the Gemini daily quota
    // message thrown from embeddingService) instead of a generic 500, so
    // the UI can actually tell the user what happened and what to do.
    const message =
      error instanceof Error && error.message.includes("quota")
        ? error.message
        : "Error answering repository question";
    return res.status(error instanceof Error && message === error.message ? 429 : 500).json({ message });
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