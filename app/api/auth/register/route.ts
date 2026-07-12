import { NextResponse } from 'next/server';
import { createCustomer, findUserByEmail } from '@/lib/db/users';
import { hashPassword } from '@/lib/auth/password';
import { normalizeRegisterInput, validateRegisterInput } from '@/lib/auth/validation';
import { setAuthSession } from '@/lib/auth/session';
import type { AuthResponse } from '@/types/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = normalizeRegisterInput(payload);
    const fieldErrors = validateRegisterInput(input);

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json<AuthResponse>({
        ok: false,
        message: 'Please fix the registration form errors.',
        fieldErrors,
      }, { status: 400 });
    }

    const existingUser = await findUserByEmail(input.email);

    if (existingUser) {
      return NextResponse.json<AuthResponse>({
        ok: false,
        message: 'An account already exists with this email address.',
        fieldErrors: { email: 'This email is already registered.' },
      }, { status: 409 });
    }

    const passwordHash = await hashPassword(input.password);
    const user = await createCustomer({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
    });
    const publicUser = await setAuthSession(user);

    return NextResponse.json<AuthResponse>({
      ok: true,
      user: publicUser,
      message: 'Account created successfully.',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json<AuthResponse>({
        ok: false,
        message: 'Invalid registration request. Please try again.',
      }, { status: 400 });
    }

    console.error('Customer registration failed:', error);

    return NextResponse.json<AuthResponse>({
      ok: false,
      message: 'Registration failed right now. Please try again.',
    }, { status: 500 });
  }
}
