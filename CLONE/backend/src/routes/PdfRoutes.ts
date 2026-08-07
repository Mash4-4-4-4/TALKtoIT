import { Router } from "express";

import upload
from "../middleware/uploadMiddleware";
import {
  uploadPdf,
  getPdfs,
  getPdfText,
  deletePdf
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
pdfRouter.delete("/:id",deletePdf);
export default pdfRouter;