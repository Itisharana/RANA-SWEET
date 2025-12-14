import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'user' | 'admin';
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
