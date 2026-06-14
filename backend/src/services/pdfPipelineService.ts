import {extractPdfText} from "../services/PdfService";
import {chunkText} from "../services/chunkService";
import {generateEmbedding} from "../services/embeddingService";
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
    for(const chunk of chunks)
    {
        const embedding=await generateEmbedding(chunk);
    await Chunk.create({
        pdfId,
        chunk,
        embedding,
    })
}

}