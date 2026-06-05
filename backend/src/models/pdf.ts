import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    pdf: String,
  },
  {
    timestamps: true,
    collection: "pdfs",
  }
);

const PdfModel = mongoose.model(
  "Pdf",
  pdfSchema
);

export default PdfModel;