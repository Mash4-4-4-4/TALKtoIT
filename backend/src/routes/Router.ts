import {Router} from "express";
import userRoutes from "./userRouter";
import chatRoutes from "./chatsRouter";
import pdfRoutes from "./PdfRoutes";
const appRouter=Router();

appRouter.use("/user",userRoutes); //if we get this url domain/api/v1/user the request will be transferred to this userroutes 
appRouter.use("/chat",chatRoutes);
appRouter.use("/pdf", pdfRoutes);
export default appRouter;