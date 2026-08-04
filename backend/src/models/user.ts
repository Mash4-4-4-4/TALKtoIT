import mongoose, { Schema, Document } from 'mongoose';
import { randomUUID } from 'crypto';

// Sub-schema for individual chat messages
const ChatsSchema = new Schema(
  {
    id: {
      type: String,
      default: () => randomUUID(),
    },
    role: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

export interface IChat {
  id?: string;
  role: string;
  content: string;
}

export interface IUser extends Document {
  googleId?: string;
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  chats: IChat[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false },
  name: { type: String, required: true },
  avatar: { type: String },
  chats: [ChatsSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', userSchema);