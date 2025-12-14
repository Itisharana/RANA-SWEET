import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  sweetId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash';
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  sweetId: { type: Schema.Types.ObjectId, ref: 'Sweet', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Credit Card', 'Debit Card', 'Cash'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    deliveryAddress: { type: String, required: true },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
