import { Router } from "express";

import upload
from "../middleware/uploadMiddleware";
import {
  uploadPdf,
  getPdfs,
  getPdfText,
} from "../controllers/pdfController";
import { askPdfQuestion } from "../controllers/pdfController";
const pdfRouter = Router();

pdfRouter.post(
  "/upload",
  upload.single("file"),
  uploadPdf
);

pdfRouter.post(
  "/text",
  upload.single("file"),
  getPdfText
);

pdfRouter.get(
  "/all",
  getPdfs
);

pdfRouter.post("/chat",
  askPdfQuestion
)

export default pdfRouter;