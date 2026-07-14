import { Router } from "express";
import multer from "multer";
import upload from "../middleware/uploadMiddleware";
import { verifyToken } from "../utils/tokenmanager";
import {
  uploadRepo,
  getRepos,
  askRepoQuestion,
  deleteRepo,
  getRepoChatHistory,
  deleteRepoChatHistory,
} from "../controllers/repoController";
import { getRepoTree, getRepoFile } from "../controllers/repoController";
const repoRouter = Router();

repoRouter.post("/upload", verifyToken, upload.single("file"), uploadRepo);
repoRouter.get("/all", verifyToken, getRepos);
repoRouter.post("/chat", verifyToken, askRepoQuestion);
repoRouter.get("/:id/history", verifyToken, getRepoChatHistory);
repoRouter.delete("/:id/history", verifyToken, deleteRepoChatHistory);
repoRouter.delete("/:id", verifyToken, deleteRepo);
repoRouter.get("/:id/tree", verifyToken, getRepoTree);
repoRouter.get("/:id/file", verifyToken, getRepoFile);
export default repoRouter;