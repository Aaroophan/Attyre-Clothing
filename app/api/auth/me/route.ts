import { NextResponse } from 'next/server';
import { getCurrentUser, toPublicUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({
      ok: true,
      user: null,
    });
  }

  return NextResponse.json({
    ok: true,
    user: toPublicUser(user),
  });
}
