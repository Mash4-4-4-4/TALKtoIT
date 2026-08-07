import mongoose from "mongoose";
import fs from "fs";

const pdfParse = require("pdf-parse");

import PdfModel
from "../models/Pdf";

export const savePdf = async (
  filename: string
) => {

  return await PdfModel.create({
    pdf: filename,
  });
};

export const getAllPdfs =
async () => {

  return await PdfModel.find({});
};

export const extractPdfText =
async (path: string) => {

  const dataBuffer =
    fs.readFileSync(path);

  const result =
    await pdfParse(dataBuffer);

  return result.text;
};
