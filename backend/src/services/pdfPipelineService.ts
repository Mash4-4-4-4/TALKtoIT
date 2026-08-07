import {extractPdfText} from "../services/PdfService";
import {chunkText} from "../services/chunkService";
import {generateEmbeddings} from "../services/embeddingService";
import Chunk from "../models/ChunksModel";

export const processPdf=async(
    pdfId:string,
    pdfPath:string
)=>
{
  const text=await extractPdfText(pdfPath);
  console.log("PDF TEXT EXTRACTED");
  console.log(text);
  const chunks=await chunkText(text);
  console.log("TEXT CHUNKED");
  console.log(chunks);
  if (chunks.length === 0) return;

  // Batched + rate-limited, same as repo indexing — see embeddingService.ts
  const embeddings = await generateEmbeddings(chunks);
  const docs = chunks.map((chunk, idx) => ({
    pdfId,
    chunk,
    embedding: embeddings[idx],
  }));
  await Chunk.insertMany(docs);
}