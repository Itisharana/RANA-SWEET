import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Sweet } from '@/lib/models/Sweet';
import { User } from '@/lib/models/User';
import { indianSweets } from '@/lib/seed-data';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await connectToDatabase();

    await Sweet.deleteMany({});
    await Sweet.insertMany(indianSweets);

    const adminExists = await User.findOne({ email: 'admin@ranasweets.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@ranasweets.com',
        password: hashedPassword,
        role: 'admin',
      });
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      sweetsCount: indianSweets.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}