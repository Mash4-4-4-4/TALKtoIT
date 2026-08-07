import { OpenAI } from "openai";
export function configureopenAI()
{
    const config=new  OpenAI ({
        apiKey:process.env.GROQ_API, 
        baseURL:"https://api.groq.com/openai/v1",   
    })
    return config;
}