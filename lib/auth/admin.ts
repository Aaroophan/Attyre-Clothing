import { redirect } from 'next/navigation';
import type { UserDocument } from '@/types/database';
import { getCurrentUser } from './session';

export function isAdminUser(user: UserDocument | null): user is UserDocument {
  return user?.role === 'admin';
}

export async function getRequiredAdminUser(nextPath = '/admin'): Promise<UserDocument> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (!isAdminUser(user)) {
    redirect('/?admin=denied');
  }

  return user;
}
