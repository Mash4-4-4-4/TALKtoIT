import { Request,Response,NextFunction } from "express";
import multer from "multer";

export const errorHnadler=async (err: any, req: Request, res: Response, next: NextFunction) => 
{
    if(err instanceof multer.MulterError) {
        if(err.code==="LIMIT_FILE_SIZE") {
            return res.status(400).json({message:"File size is too large"});
        }
    }
    return res.status(500).json({message:"Internal server error"});
}