import mongoose from "mongoose"
import cookieParser from "cookie-parser";
import { COOKIE_NAME } from "../utils/constants";
import user from "../models/user"
import {hash, compare} from "bcryptjs";
import { Request,Response,NextFunction } from "express";
import { createToken } from "../utils/tokenmanager";
//apis

export const GetAllUsers= async (req:Request,res:Response,next:NextFunction)=>
{
   try {
     const allusers= await user.find();
     return res.status(200).json({message:"okhay",allusers});
   } catch (error) {
    console.log(error)
    return res.status(200).json({message:"error"})
   }
}

export const UserSignUp= async (req:Request,res:Response,next:NextFunction)=>
{
   try {//user signup
    const {name,email,password}=req.body;
    const existingUser=await user.findOne({email});
    if(existingUser)return res.status(401).send("email already exists")
    const hashedpass=await hash(password,10)
     const User= new user({name,email,password:hashedpass});
     await User.save();
//crate and storing token afetr user is saved
       res.clearCookie(COOKIE_NAME,
    {
      domain:"localhost",
      httpOnly:true,
      signed:true,
      path:"/",
    });


   const token=createToken(User._id.toString(),email,"7d");

   //sending the token in the form of cookie
   const expires=new Date();
   expires.setDate(expires.getDate()+7) //this will set the expiry time for the cookie to 7 days
   res.cookie("token",
    token,
    {path:"/",
      domain:"localhost",
      expires,
      httpOnly:true,
      signed:true,
    });


     return res.status(200).json({message:"okhay",name:User.name,email:User.email})
   } catch (error) {
    console.log(error)
    return res.status(500).json({message:"error"})
   }
}

export const UserLogin= async (req:Request,res:Response,next:NextFunction)=>
{
   try {//user login
    const {email,password}=req.body;
    const existingUser=await user.findOne({email})
    if(!existingUser)
    {
      return res.status(401).send("user not registered");
    }
   const isPasswordCorrect=await compare(password,existingUser!.password);
   if(!isPasswordCorrect){
     return res.status(401).send("incorrect password")
   }
  res.clearCookie(COOKIE_NAME,
    {
      domain:"localhost",
      httpOnly:true,
      signed:true,
      path:"/",
    });


   const token=createToken(existingUser!._id.toString(),email,"7d");

   //sending the token in the form of cookie
   const expires=new Date();
   expires.setDate(expires.getDate()+7) //this will set the expiry time for the cookie to 7 days
   res.cookie("token",
    token,
    {path:"/",
      domain:"localhost", 
      expires,
      httpOnly:true,
      signed:true,
    });

   return res.status(200).json({message:"Succesfuly login",token})
   } catch (error) {
    console.log(error)
    return res.status(500).json({message:"error"})
   }
}

export const VerifyUser= async (req:Request,res:Response,next:NextFunction)=>
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
   return res.status(200).json({message:"Succesfuly login",email:existingUser.email,name:existingUser.name})
   } catch (error) {
    console.log(error)
    return res.status(500).json({message:"error"})
   }
}

export const UserLogout= async (req:Request,res:Response,next:NextFunction)=>
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

     res.clearCookie(COOKIE_NAME,
    {
      domain:"localhost",
      httpOnly:true,
      signed:true,
      path:"/",
    });

   return res.status(200).json({message:"Succesfuly logged out"})
   } catch (error) {
    console.log(error)
    return res.status(500).json({message:"error"})
   }
}