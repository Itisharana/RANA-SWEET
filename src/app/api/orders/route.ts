import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { Sweet } from '@/lib/models/Sweet';
import { getTokenFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getTokenFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let orders;
    if (isAdmin(user)) {
      orders = await Order.find()
        .populate('userId', 'name email phone address')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      orders = await Order.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getTokenFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { items, paymentMethod, deliveryAddress } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !deliveryAddress) {
      return NextResponse.json(
        { error: 'Payment method and delivery address are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const sweet = await Sweet.findById(item.sweetId);
      if (!sweet) {
        return NextResponse.json(
          { error: `Sweet not found: ${item.sweetId}` },
          { status: 404 }
        );
      }

      if (sweet.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${sweet.name}` },
          { status: 400 }
        );
      }

      sweet.quantity -= item.quantity;
      await sweet.save();

      orderItems.push({
        sweetId: sweet._id,
        name: sweet.name,
        price: sweet.price,
        quantity: item.quantity,
      });

      totalAmount += sweet.price * item.quantity;
    }

    const order = await Order.create({
      userId: user.userId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      status: 'confirmed',
      paymentStatus: 'completed',
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}