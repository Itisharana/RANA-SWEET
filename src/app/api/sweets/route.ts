import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Sweet } from '@/lib/models/Sweet';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const sweets = await Sweet.find({ isAvailable: true }).sort({ createdAt: -1 });
    return NextResponse.json(sweets);
  } catch (error) {
    console.error('Get sweets error:', error);
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

    const { name, category, price, quantity, description, image } = await request.json();

    if (!name || !category || price === undefined || !image) {
      return NextResponse.json(
        { error: 'Name, category, price, and image are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const sweet = await Sweet.create({
      name,
      category,
      price,
      quantity: quantity || 0,
      description,
      image,
      isAvailable: true,
    });

    return NextResponse.json(sweet, { status: 201 });
  } catch (error) {
    console.error('Create sweet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
