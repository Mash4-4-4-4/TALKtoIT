import { verifyToken } from "../utils/tokenmanager";
import { UserLogout, VerifyUser } from "../controllers/userController";
import {Router} from "express"  //routes for user level features
import { GetAllUsers, UserSignUp,UserLogin } from "../controllers/userController";
import {validate ,signupValidator,loginValidator }from "../utils/validators.js"
const userRoutes=Router();

userRoutes.get("/",GetAllUsers) //to handle users we have got the controllers getAllUser is in userController
userRoutes.post("/signup",validate(signupValidator),UserSignUp);
userRoutes.post("/login",validate(loginValidator),UserLogin);
userRoutes.get("/logout",verifyToken,UserLogout);
userRoutes.get("/auth-status",verifyToken,VerifyUser) //this is to check if the user is logged in or not by checking the token in the cookies and verifying it;
export default userRoutes;