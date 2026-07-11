import { NextResponse } from 'next/server';
import { DB_NAME, getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });

    return NextResponse.json({
      ok: true,
      database: DB_NAME,
      message: 'MongoDB connection successful.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: DB_NAME,
        message: error instanceof Error ? error.message : 'MongoDB connection failed.',
      },
      { status: 500 },
    );
  }
}
