import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/session';
import {
  deactivateCategory,
  findCategoryById,
  findCategoryBySlug,
  objectIdToString,
  reactivateCategory,
  updateCategory,
} from '@/lib/db';
import { validateCategoryPayload } from '@/lib/admin-category-validation';

export const dynamic = 'force-dynamic';

interface AdminCategoryRouteContext {
  params: Promise<{ id: string }>;
}

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

export async function PUT(request: Request, { params }: AdminCategoryRouteContext) {
  const authError = await requireAdminResponse();

  if (authError) {
    return authError;
  }

  const { id } = await params;

  try {
    const category = await findCategoryById(id);

    if (!category) {
      return NextResponse.json({ ok: false, message: 'Category was not found.' }, { status: 404 });
    }

    const payload = await request.json();
    const validation = validateCategoryPayload(payload);

    if (!validation.input) {
      return NextResponse.json(
        { ok: false, message: 'Please fix the highlighted category fields.', fieldErrors: validation.fieldErrors },
        { status: 400 },
      );
    }

    const existingCategory = await findCategoryBySlug(validation.input.slug);

    if (existingCategory && objectIdToString(existingCategory._id) !== id) {
      return NextResponse.json(
        {
          ok: false,
          message: 'A category already exists with this slug.',
          fieldErrors: { slug: 'This slug is already used by another category.' },
        },
        { status: 409 },
      );
    }

    const updatedCategory = await updateCategory(id, validation.input);

    if (!updatedCategory) {
      return NextResponse.json({ ok: false, message: 'Category could not be updated.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, categoryId: objectIdToString(updatedCategory._id), slug: updatedCategory.slug });
  } catch (error) {
    console.error('Admin category update failed:', error);
    return NextResponse.json({ ok: false, message: 'Category could not be updated right now.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: AdminCategoryRouteContext) {
  const authError = await requireAdminResponse();

  if (authError) {
    return authError;
  }

  const { id } = await params;

  try {
    const payload = await request.json();
    const action = typeof payload.action === 'string' ? payload.action : 'deactivate';
    const success = action === 'reactivate' ? await reactivateCategory(id) : await deactivateCategory(id);

    if (!success) {
      return NextResponse.json({ ok: false, message: 'Category status could not be changed.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin category status update failed:', error);
    return NextResponse.json({ ok: false, message: 'Category status could not be changed right now.' }, { status: 500 });
  }
}
