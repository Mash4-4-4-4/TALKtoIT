import {Router} from "express"
import { allchats, deleteChats } from "../controllers/chatConroller";
import { verifyToken } from "../utils/tokenmanager";
import { chatValidator, validate } from "../utils/validators";
import { generateChatCopmleteion } from "../controllers/chatConroller";
const chatRoutes=Router();
chatRoutes.post("/new",validate(chatValidator),verifyToken,generateChatCopmleteion);
chatRoutes.get("/all-chats",verifyToken,allchats)
chatRoutes.delete("/delete-chats",verifyToken,deleteChats);
export default chatRoutes;
