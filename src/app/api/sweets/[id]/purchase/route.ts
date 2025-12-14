import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Sweet } from '@/lib/models/Sweet';
import { getTokenFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getTokenFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { quantity = 1 } = await request.json();

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return NextResponse.json(
        { error: 'Sweet not found' },
        { status: 404 }
      );
    }

    if (sweet.quantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    sweet.quantity -= quantity;
    await sweet.save();

    return NextResponse.json({
      message: 'Purchase successful',
      sweet,
      purchasedQuantity: quantity,
      totalCost: sweet.price * quantity,
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
