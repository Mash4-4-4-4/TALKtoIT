import mongoose from "mongoose";
import chunk from "../models/ChunksModel";
import {generateEmbedding} from "./embeddingService";
export const searchChunks=async(
pdfId:string,
    question:string,
)=>
{
   const queryEmbedding=await generateEmbedding(question);
   const results=await chunk.aggregate([
    {
        $vectorSearch:
        {
            filter:{
                pdfId:new mongoose.Types.ObjectId(pdfId)
            },
            index:"vector_index",
            path:"embedding",
            queryVector:queryEmbedding,
            numCandidates:100,
            limit:10
        },
    },{
     $project: {
                chunk: 1,
                score: { $meta: "vectorSearchScore" },
            },
        },
   ])
 return results;
}

export const getContext=async(
    pdfId:string,
    question:string,
  
)=>
{
    const result=await searchChunks(
        pdfId,
        question);
      return result.map(doc=>doc.chunk).
      join("\n\n");    
}
