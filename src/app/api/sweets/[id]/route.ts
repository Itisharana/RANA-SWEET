import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Sweet } from '@/lib/models/Sweet';
import { getTokenFromRequest, isAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return NextResponse.json(
        { error: 'Sweet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sweet);
  } catch (error) {
    console.error('Get sweet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const updates = await request.json();

    await connectToDatabase();

    const sweet = await Sweet.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!sweet) {
      return NextResponse.json(
        { error: 'Sweet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sweet);
  } catch (error) {
    console.error('Update sweet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await connectToDatabase();

    const sweet = await Sweet.findByIdAndDelete(id);

    if (!sweet) {
      return NextResponse.json(
        { error: 'Sweet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    console.error('Delete sweet error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
