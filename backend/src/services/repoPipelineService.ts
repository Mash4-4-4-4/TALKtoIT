import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

export const extractZip = (zipFilePath: string, destPath: string) => {
  const zip = new AdmZip(zipFilePath);
  zip.extractAllTo(destPath, true);
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
