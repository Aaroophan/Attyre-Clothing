import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import type { UserDocument } from '@/types/database';
import type { AuthSessionPayload, PublicUser } from '@/types/auth';
import { findUserById } from '@/lib/db/users';
import { objectIdToString } from '@/lib/db/object-id';

export const AUTH_COOKIE_NAME = 'attyre_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret === 'your-secret-key-here') {
    throw new Error('SESSION_SECRET must be configured before using authentication.');
  }

  return secret;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getSessionSecret()).update(encodedPayload).digest('base64url');
}

function verifySignature(encodedPayload: string, signature: string): boolean {
  const expectedSignature = signPayload(encodedPayload);
  const expected = Buffer.from(expectedSignature, 'base64url');
  const actual = Buffer.from(signature, 'base64url');

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: objectIdToString(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
}

function createSessionPayload(user: UserDocument): AuthSessionPayload {
  const now = Math.floor(Date.now() / 1000);

  return {
    ...toPublicUser(user),
    issuedAt: now,
    expiresAt: now + SESSION_MAX_AGE_SECONDS,
  };
}

function createSessionToken(payload: AuthSessionPayload): string {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): AuthSessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature || !verifySignature(encodedPayload, signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AuthSessionPayload>;
    const now = Math.floor(Date.now() / 1000);

    if (
      typeof payload.id !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.email !== 'string' ||
      (payload.role !== 'customer' && payload.role !== 'admin') ||
      typeof payload.expiresAt !== 'number' ||
      payload.expiresAt <= now
    ) {
      return null;
    }

    return payload as AuthSessionPayload;
  } catch {
    return null;
  }
}

export async function setAuthSession(user: UserDocument): Promise<PublicUser> {
  const cookieStore = await cookies();
  const payload = createSessionPayload(user);
  const token = createSessionToken(payload);

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return toPublicUser(user);
}

export async function clearAuthSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function getSessionPayload(): Promise<AuthSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return verifySessionToken(token);
}

export async function getCurrentUser(): Promise<UserDocument | null> {
  const payload = await getSessionPayload();

  if (!payload) {
    return null;
  }

  return findUserById(payload.id);
}
