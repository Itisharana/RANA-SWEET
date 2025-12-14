import mongoose, { Schema, Document } from 'mongoose';

export interface ISweet extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: 'Sweet' | 'Snack' | 'Namkeen' | 'Dessert';
  price: number;
  quantity: number;
  description?: string;
  image: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SweetSchema = new Schema<ISweet>(
  {
    name: { type: String, required: true, unique: true },
    category: { 
      type: String, 
      enum: ['Sweet', 'Snack', 'Namkeen', 'Dessert'], 
      required: true 
    },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    description: { type: String },
    image: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Sweet = mongoose.models.Sweet || mongoose.model<ISweet>('Sweet', SweetSchema);
