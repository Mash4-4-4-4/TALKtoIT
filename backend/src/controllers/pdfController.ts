import {
  savePdf,
  getAllPdfs,
  extractPdfText,
} from "../services/PdfService";
import { askPdf } from "../services/chatService";
import { processPdf } from "../services/pdfPipelineService";
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
const filename = req.file.filename;

const pdf = await savePdf(filename);
console.log("PROCESSING PDF...");
await processPdf(
  pdf._id.toString(),
  req.file.path
);

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

export const askPdfQuestion=async(
  req:Request,res:Response
)=>
{
  try {
     const {pdfId,question}=req.body;
     if(!pdfId || !question)
      {
 return res.status(400).json({message:"pdfid and questions are required"});
  }
  console.log("PDF ID RECEIVED:", pdfId);
console.log("QUESTION RECEIVED:", question);
  const answer=await askPdf(
            pdfId,
            question
        )
        return res.status(200).json({
    answer
});
 } catch(error)
{
    console.log("FULL ERROR:");
    console.error(error);

    if(error instanceof Error)
    {
        console.log("MESSAGE:", error.message);
        console.log("STACK:", error.stack);
    }

    return res.status(500).json({
        message:"Error answering PDF question"
    });
}
}
