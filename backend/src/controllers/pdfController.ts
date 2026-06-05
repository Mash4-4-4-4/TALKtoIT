import {
  savePdf,
  getAllPdfs,
  extractPdfText,
} from "../services/PdfService";
import { Request, Response } from "express";
export const uploadPdf =
async (req: Request, res: Response) => {

  try {

    if (!req.file) {
      return res
      .status(400)
      .json({
        message:
        "No file uploaded",
      });
    }

    const filename =
      req.file.filename;

    await savePdf(filename);

    return res.json({
      message:
      "File uploaded successfully",
      filename,
    });

  } catch (error) {

    console.log(error);

    return res
    .status(500)
    .json({
      message:
      "Upload failed",
    });
  }
};

export const getPdfs =
async (req: Request, res: Response) => {

  try {

    const pdfs =
      await getAllPdfs();

    return res.send({
      pdfs,
    });

  } catch (error) {

    console.log(error);

    return res
    .status(500)
    .json({
      message:
      "Error fetching PDFs",
    });
  }
};

export const getPdfText =
async (req: Request, res: Response) => {

  try {

    if (!req.file) {
      return res
      .status(400)
      .send(
       "No file uploaded"
      );
    }

    const text =
      await extractPdfText(
        req.file.path
      );

    return res.send(text);

  } catch (error) {

    console.log(error);

    return res
    .status(500)
    .send(
      "Error extracting text"
    );
  }
};
