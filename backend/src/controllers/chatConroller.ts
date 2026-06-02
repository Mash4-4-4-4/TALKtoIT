import { Request, Response, NextFunction } from "express";
import { configureopenAI } from "../config/openai-config";
import user from "../models/user";
import OpenAI from "openai";

export const generateChatCopmleteion = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const { message } = req.body;

    try {

        const User = await user.findById(res.locals.jwtData.id);

        if (!User) {
            return res.status(404).json({
                message: "user not found"
            });
        }

        // convert chats into AI format
const chats: OpenAI.Chat.ChatCompletionMessageParam[] =
    User.chats.map(({ role, content }) => ({
        role: role as "user" | "assistant",
        content,
    }));

        // add latest message
        chats.push({
            role: "user",
            content: message
        });

        // save user message
        User.chats.push({
            role: "user",
            content: message
        });

        // AI client
        const config = configureopenAI();

        // AI response
        const chatResponse =
            await config.chat.completions.create({
model:"llama-3.3-70b-versatile",
                messages: chats,
            });

        // save assistant reply
        User.chats.push({
            role: "assistant",
            content:
                chatResponse.choices[0].message.content || ""
        });

        // save to DB
        await User.save();

        // send response
        return res.status(200).json({
            chats: User.chats
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

export const allchats= async (req:Request,res:Response,next:NextFunction)=>
{
   try {
    const existingUser=await user.findOne({email:res.locals.jwtData.email})
    if(!existingUser)
    {
      return res.status(401).send("user not registered or token is invalid");
    }

    console.log(existingUser._id.toString(),res.locals.jwtData.id)
    if(existingUser._id.toString()!==res.locals.jwtData.id)
    {
      return res.status(401).send("token is invalid");
    }
   return res.status(200).json({message:"Succesfuly login",chats:existingUser.chats})
   } catch (error) {
    console.log(error)
    return res.status(500).json({message:"error"})
   }
}

export const deleteChats= async (req:Request,res:Response,next:NextFunction)=>
{
   try {
    const existingUser=await user.findOne({email:res.locals.jwtData.email})
    if(!existingUser)
    {
      return res.status(401).send("user not registered or token is invalid");
    }

    console.log(existingUser._id.toString(),res.locals.jwtData.id)
    if(existingUser._id.toString()!==res.locals.jwtData.id)
    {
      return res.status(401).send("token is invalid");
    }
    //@ts-ignore
    existingUser.chats=[];
    await existingUser.save();

   return res.status(200).json({message:"Succesfuly login"})
   } catch (error) {
    console.log(error)
    return res.status(500).json({message:"error"})
   }
}