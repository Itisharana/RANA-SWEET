import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Sweet } from '@/lib/models/Sweet';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    await connectToDatabase();

    const query: Record<string, unknown> = { isAvailable: true };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        (query.price as Record<string, number>).$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (query.price as Record<string, number>).$lte = parseFloat(maxPrice);
      }
    }

    const sweets = await Sweet.find(query).sort({ createdAt: -1 });
    return NextResponse.json(sweets);
  } catch (error) {
    console.error('Search sweets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
