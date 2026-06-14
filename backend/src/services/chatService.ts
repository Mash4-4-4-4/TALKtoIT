import { getContext } from "./searchService";
import { configureopenAI } from "../config/openai-config";
import { Content } from "openai/resources/skills/content.js";

export const askPdf=async(
    pdfId:string,
    question :string,
)=>
{
  const context=await getContext(
    pdfId,
    question);
  console.log(context)
  const client=configureopenAI();
  const response=await client.chat.completions.create(
    {
        model:"llama-3.3-70b-versatile",
        messages:[
            {
                role:"system",
                content: `
                    You are a PDF assistant.

                    Answer only from the provided context.

                    If the answer is not present in the context,
                    say "I could not find that information in the PDF."

                    Context:
                    ${context}
                            `
            },
            {
                role:"user",
                content:question
            }
        ]
    }   
  )
  console.log(
  response.choices[0].message.content
);
 return response.choices[0].message.content;
}


