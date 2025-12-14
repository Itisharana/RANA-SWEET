import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Sweet } from '@/lib/models/Sweet';
import { getTokenFromRequest, isAdmin } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getTokenFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
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

    sweet.quantity += quantity;
    await sweet.save();

    return NextResponse.json({
      message: 'Restock successful',
      sweet,
      addedQuantity: quantity,
    });
  } catch (error) {
    console.error('Restock error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
