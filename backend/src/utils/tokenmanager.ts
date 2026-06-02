import jwt, { JwtPayload } from "jsonwebtoken";
import { COOKIE_NAME } from "../utils/constants";
import { Request, Response, NextFunction } from "express";

export const createToken = (
  id: string,
  email: string,
expiresIn: jwt.SignOptions["expiresIn"]
) => {
  const payload = { id, email };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: expiresIn,
  });

  return token;
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies[COOKIE_NAME];
  if(!token||token.trim()==="")
  {
    return res.status(401).json({message:"Token Missing",success:false});
  }

  if (!token) {
    return res.status(401).json({
      message: "Token Missing",
      success: false,
    });
  }

  return new Promise<void>((resolve, reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET!,
      async (
        err: jwt.VerifyErrors | null,
        success: string | JwtPayload | undefined
      ) => {
        if (err) {
          reject(err);

          return res.status(401).json({
            message: "Token Expired",
            success: false,
          });
        } else {
          console.log("token is valid");

          resolve();

          res.locals.jwtData = success;

          return next();
        }
      }
    );
  });
};