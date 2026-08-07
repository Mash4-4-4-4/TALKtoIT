import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

export const extractZip = (zipFilePath: string, destPath: string) => {
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(destPath, true);
};

/**
 * Parses a GitHub repo URL (with or without .git, with or without a branch
 * path) into { owner, repo }. Returns null if it doesn't look like a valid
 * GitHub repo URL.
 */
export const parseGithubUrl = (
  url: string
): { owner: string; repo: string } | null => {
  try {
    const cleaned = url.trim().replace(/\/+$/, "");
    const match = cleaned.match(
      /github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/i
    );
    if (!match) return null;
    const [, owner, repo] = match;
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
};

/**
 * Downloads a public GitHub repository as a zip archive (via GitHub's
 * codeload service) and saves it to destZipPath. Tries the "main" branch
 * first, then falls back to "master" since older repos still use it.
 */
export const downloadGithubRepoZip = async (
  githubUrl: string,
  destZipPath: string
): Promise<{ owner: string; repo: string; branch: string }> => {
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) {
    throw new Error(
      "That doesn't look like a valid GitHub repository URL. Expected something like https://github.com/owner/repo"
    );
  }
  const { owner, repo } = parsed;

  const branchesToTry = ["main", "master"];
  let lastError: Error | null = null;

  for (const branch of branchesToTry) {
    const zipUrl = `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${branch}`;
    try {
      const response = await fetch(zipUrl);
      if (!response.ok) {
        lastError = new Error(
          `GitHub returned ${response.status} for branch "${branch}"`
        );
        continue;
      }
      const arrayBuffer = await response.arrayBuffer();
      fs.writeFileSync(destZipPath, Buffer.from(arrayBuffer));
      return { owner, repo, branch };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw new Error(
    `Could not download "${owner}/${repo}" from GitHub. Please make sure the repository exists, is public, and the link is correct. (${lastError?.message ?? "unknown error"})`
  );
};

export const getFilesRecursively = (
  dir: string,
  baseDir: string = dir
): { absolutePath: string; relativePath: string }[] => {
  let results: { absolutePath: string; relativePath: string }[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const absolutePath = path.join(dir, file);
    const relativePath = path.relative(baseDir, absolutePath).replace(/\\/g, "/");
    const stat = fs.statSync(absolutePath);

    if (stat && stat.isDirectory()) {
      const excludedDirs = [
        "node_modules",
        ".git",
        "dist",
        "build",
        "out",
        ".next",
        ".vscode",
        "venv",
        ".idea",
      ];
      if (!excludedDirs.includes(file)) {
        results = results.concat(getFilesRecursively(absolutePath, baseDir));
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      const excludedExts = [
        ".zip",
        ".tar",
        ".gz",
        ".rar",
        ".7z",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".ico",
        ".svg",
        ".pdf",
        ".mp3",
        ".mp4",
        ".wav",
        ".avi",
        ".mov",
        ".woff",
        ".woff2",
        ".ttf",
        ".eot",
        ".exe",
        ".dll",
        ".so",
        ".dylib",
        ".class",
        ".jar",
        ".war",
        ".db",
        ".sqlite",
        ".lock",
        "package-lock.json",
        "yarn.lock",
        "pnpm-lock.yaml",
      ];
      if (!excludedExts.includes(ext)) {
        results.push({ absolutePath, relativePath });
      }
    }
  }
  return results;
};

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
}

const EXCLUDED_DIRS = ["node_modules", ".git", "dist", "build", "out", ".next", ".vscode", "venv", ".idea"];

export const buildFileTree = (dir: string, baseDir: string = dir): FileTreeNode[] => {
  const list = fs.readdirSync(dir).sort((a, b) => a.localeCompare(b));
  const folders: FileTreeNode[] = [];
  const files: FileTreeNode[] = [];

  for (const entry of list) {
    const absolutePath = path.join(dir, entry);
    const relativePath = path.relative(baseDir, absolutePath).replace(/\\/g, "/");
    const stat = fs.statSync(absolutePath);

    if (stat.isDirectory()) {
      if (EXCLUDED_DIRS.includes(entry)) continue;
      folders.push({
        name: entry,
        path: relativePath,
        type: "folder",
        children: buildFileTree(absolutePath, baseDir),
      });
    } else {
      files.push({ name: entry, path: relativePath, type: "file" });
    }
  }
  return [...folders, ...files]; // folders first, alphabetical within group
};
