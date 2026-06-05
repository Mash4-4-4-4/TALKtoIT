import { RecursiveCharacterTextSplitter }
from "@langchain/textsplitters";
export const chunkText= async (
    text:string,
)=>
{
     const splitter=new RecursiveCharacterTextSplitter
     ({chunkSize:30,chunkOverlap:5});
     const chunks=await splitter.splitText(text);
     return chunks;
}
