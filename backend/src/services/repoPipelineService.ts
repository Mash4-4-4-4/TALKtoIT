import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

export const extractZip = (zipFilePath: string, destPath: string) => {
  const zip = new AdmZip(zipFilePath);

  // Guard against zip-slip (malicious paths like ../../etc/passwd)
  const entries = zip.getEntries();
  const destResolved = path.resolve(destPath);
  for (const entry of entries) {
    const entryPath = path.resolve(destPath, entry.entryName);
    if (!entryPath.startsWith(destResolved + path.sep) && entryPath !== destResolved) {
      throw new Error(`Unsafe zip entry path detected: ${entry.entryName}`);
    }
  }

  zip.extractAllTo(destPath, true);
};

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

interface GithubRepoInfo {
  owner: string;
  repo: string;
  defaultBranch: string;
  private: boolean;
}

/**
 * Resolves a repo via the GitHub REST API. This is case-INSENSITIVE
 * (unlike codeload.github.com), so it also fixes case-mismatch 404s,
 * and it tells us the true default branch instead of guessing.
 */
const resolveGithubRepo = async (
  owner: string,
  repo: string
): Promise<GithubRepoInfo> => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "TalkToIt-App",
        Accept: "application/vnd.github+json",
        // Optional but recommended: raises rate limit from 60/hr to 5000/hr
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Timed out while contacting GitHub. Please try again.");
    }
    throw new Error(
      `Network error while contacting GitHub: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404) {
    throw new Error(
      `Repository "${owner}/${repo}" was not found. Check that the URL is correct and the repo is public.`
    );
  }

  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    if (rateLimitRemaining === "0") {
      throw new Error(
        "GitHub API rate limit exceeded. Please try again in a few minutes, or set GITHUB_TOKEN in the backend env to raise the limit."
      );
    }
    throw new Error(
      `Access to "${owner}/${repo}" was denied. It may be private.`
    );
  }

  if (!response.ok) {
    throw new Error(`GitHub API returned unexpected status ${response.status}`);
  }

  const data = (await response.json()) as {
    owner: { login: string };
    name: string;
    default_branch: string;
    private: boolean;
  };

  return {
    owner: data.owner.login, // canonical casing
    repo: data.name, // canonical casing
    defaultBranch: data.default_branch,
    private: data.private,
  };
};

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

  // Step 1: resolve canonical owner/repo/branch via the API (case-insensitive)
  const info = await resolveGithubRepo(parsed.owner, parsed.repo);

  if (info.private) {
    throw new Error(
      `"${info.owner}/${info.repo}" is a private repository. Only public repos can be imported right now.`
    );
  }

  // Step 2: download using the *canonical* casing + *real* default branch
  const zipUrl = `https://codeload.github.com/${info.owner}/${info.repo}/zip/refs/heads/${info.defaultBranch}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let response: Response;
  try {
    response = await fetch(zipUrl, { signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Timed out while downloading the repository zip from GitHub.");
    }
    throw new Error(
      `Network error while downloading repo zip: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(
      `Could not download "${info.owner}/${info.repo}" (branch "${info.defaultBranch}") from GitHub. GitHub returned ${response.status}.`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Sanity check: a real zip starts with "PK" (0x50 0x4B). If GitHub ever
  // returns an HTML error page with a 200 status, this catches it instead
  // of letting AdmZip throw a cryptic error later.
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new Error(
      "GitHub did not return a valid zip archive. The repository may be empty or unavailable."
    );
  }

  fs.writeFileSync(destZipPath, buffer);

  return { owner: info.owner, repo: info.repo, branch: info.defaultBranch };
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
        "node_modules", ".git", "dist", "build", "out",
        ".next", ".vscode", "venv", ".idea",
      ];
      if (!excludedDirs.includes(file)) {
        results = results.concat(getFilesRecursively(absolutePath, baseDir));
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      const excludedExts = [
        ".zip", ".tar", ".gz", ".rar", ".7z", ".png", ".jpg", ".jpeg",
        ".gif", ".ico", ".svg", ".pdf", ".mp3", ".mp4", ".wav", ".avi",
        ".mov", ".woff", ".woff2", ".ttf", ".eot", ".exe", ".dll", ".so",
        ".dylib", ".class", ".jar", ".war", ".db", ".sqlite", ".lock",
        "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
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
  return [...folders, ...files];
};