import {body, ValidationChain, validationResult} from "express-validator"
import { Request,Response,NextFunction } from "express";
//this validates the inputs from users
//validationchain[] is an array that we get from signup validator functions used for name enmail , password etc,...
export const validate=(validations:ValidationChain[])=>
{
    return async(req:Request,res:Response,next:NextFunction)=>
    {
      for(let validation of validations)
      {
        const result =await validation.run(req);
        if(!result.isEmpty())
        {
            break;
        }
      }
      const errors=validationResult(req);
      if(errors.isEmpty())
      {
        return next();
      }
      return res.status(422).json({errors:errors.array()})

    }
};

export const loginValidator=[
    body("email").trim().isEmail().withMessage("email is required"),
    body("password").trim().isLength({min:6}).withMessage("password length should be more than 6 "),
];

export const signupValidator=[body("name").notEmpty().withMessage("name is required"),
...loginValidator,    
];
export const chatValidator=[body("message").notEmpty().withMessage("message is required"),
];