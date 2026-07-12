import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/db/users';
import { verifyPassword } from '@/lib/auth/password';
import { normalizeLoginInput, validateLoginInput } from '@/lib/auth/validation';
import { assertSessionSecretConfigured, setAuthSession } from '@/lib/auth/session';
import { isConfigurationError, readJsonRequest, requestBodyErrorResponse, safeLogError } from '@/lib/api';
import type { AuthResponse } from '@/types/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    assertSessionSecretConfigured();

    const payload = await readJsonRequest(request);
    const input = normalizeLoginInput(payload);
    const fieldErrors = validateLoginInput(input);

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json<AuthResponse>({
        ok: false,
        message: 'Please fix the login form errors.',
        fieldErrors,
      }, { status: 400 });
    }

    const user = await findUserByEmail(input.email);
    const isValidPassword = user ? await verifyPassword(input.password, user.passwordHash) : false;

    if (!user || !isValidPassword) {
      return NextResponse.json<AuthResponse>({
        ok: false,
        message: 'Invalid email or password.',
        fieldErrors: { email: 'Check your email and password.' },
      }, { status: 401 });
    }

    const publicUser = await setAuthSession(user);

    return NextResponse.json<AuthResponse>({
      ok: true,
      user: publicUser,
      message: 'Logged in successfully.',
    });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    safeLogError('Customer login failed:', error);

    return NextResponse.json<AuthResponse>({
      ok: false,
      message: isConfigurationError(error)
        ? 'Authentication is not configured correctly. Please contact the store administrator.'
        : 'Login failed right now. Please try again.',
    }, { status: 500 });
  }
}
