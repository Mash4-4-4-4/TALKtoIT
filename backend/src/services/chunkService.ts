import { RecursiveCharacterTextSplitter }
from "@langchain/textsplitters";
export const chunkText= async (
    text:string,
)=>
{
     const splitter=new RecursiveCharacterTextSplitter
     ({chunkSize:300,chunkOverlap:50});
     const chunks=await splitter.splitText(text);
     return chunks;
}
