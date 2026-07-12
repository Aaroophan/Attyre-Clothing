import { NextResponse } from 'next/server';
import { clearAuthSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  await clearAuthSession();

  return NextResponse.json({
    ok: true,
    message: 'Logged out successfully.',
  });
}
