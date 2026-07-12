import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/session';
import { createCategory, findCategoryBySlug, objectIdToString } from '@/lib/db';
import { validateCategoryPayload } from '@/lib/admin-category-validation';

export const dynamic = 'force-dynamic';

async function requireAdminResponse() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ ok: false, message: 'Login is required.' }, { status: 401 });
  }

  if (!isAdminUser(user)) {
    return NextResponse.json({ ok: false, message: 'Admin access is required.' }, { status: 403 });
  }

  return null;
}

export async function POST(request: Request) {
  const authError = await requireAdminResponse();

  if (authError) {
    return authError;
  }

  try {
    const payload = await request.json();
    const validation = validateCategoryPayload(payload);

    if (!validation.input) {
      return NextResponse.json(
        { ok: false, message: 'Please fix the highlighted category fields.', fieldErrors: validation.fieldErrors },
        { status: 400 },
      );
    }

    const existingCategory = await findCategoryBySlug(validation.input.slug);

    if (existingCategory) {
      return NextResponse.json(
        {
          ok: false,
          message: 'A category already exists with this slug.',
          fieldErrors: { slug: 'This slug is already used by another category.' },
        },
        { status: 409 },
      );
    }

    const category = await createCategory(validation.input);

    return NextResponse.json({ ok: true, categoryId: objectIdToString(category._id), slug: category.slug }, { status: 201 });
  } catch (error) {
    console.error('Admin category creation failed:', error);
    return NextResponse.json({ ok: false, message: 'Category could not be created right now.' }, { status: 500 });
  }
}
