import mongoose from "mongoose";
import{randomUUID} from 'crypto'
import chatRoutes from "../routes/chatsRouter";
const ChatsSchema=new mongoose.Schema(
    {
        id:{
            type:String,
            default:randomUUID(),
        },
        role:
        {
            type:String,
            required:true,
        },
        content:
        {
            type:String,
            required:true,
        },

    }
)
const UserSchema=new mongoose.Schema(
    {
        name:
        {
            type:String,
            required:true,
        },
        email:
        {
            type:String,
            required:true,
            unique:true,
        },
        password:
        {
            type:String,
            required:true,
        },
        chats:[ChatsSchema],
    }
)

export default mongoose.model("User",UserSchema);