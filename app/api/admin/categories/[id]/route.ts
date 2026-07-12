import { NextResponse } from 'next/server';
import {
  deactivateCategory,
  findCategoryById,
  findCategoryBySlug,
  objectIdToString,
  reactivateCategory,
  updateCategory,
} from '@/lib/db';
import { validateCategoryPayload, type CategoryPayload } from '@/lib/admin-category-validation';
import { isObjectIdString } from '@/lib/db/object-id';
import { readJsonRequest, requestBodyErrorResponse, requireAdminApi, safeLogError } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface AdminCategoryRouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: AdminCategoryRouteContext) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await params;

  if (!isObjectIdString(id)) {
    return NextResponse.json({ ok: false, message: 'Invalid category ID.' }, { status: 400 });
  }

  try {
    const category = await findCategoryById(id);

    if (!category) {
      return NextResponse.json({ ok: false, message: 'Category was not found.' }, { status: 404 });
    }

    const payload = await readJsonRequest<CategoryPayload>(request);
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
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    safeLogError('Admin category update failed:', error);
    return NextResponse.json({ ok: false, message: 'Category could not be updated right now.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: AdminCategoryRouteContext) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await params;

  if (!isObjectIdString(id)) {
    return NextResponse.json({ ok: false, message: 'Invalid category ID.' }, { status: 400 });
  }

  try {
    const payload = await readJsonRequest<{ action?: unknown }>(request);
    const action = typeof payload.action === 'string' ? payload.action : 'deactivate';

    if (action !== 'deactivate' && action !== 'reactivate') {
      return NextResponse.json({ ok: false, message: 'Invalid category status action.' }, { status: 400 });
    }

    const success = action === 'reactivate' ? await reactivateCategory(id) : await deactivateCategory(id);

    if (!success) {
      return NextResponse.json({ ok: false, message: 'Category status could not be changed.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    safeLogError('Admin category status update failed:', error);
    return NextResponse.json({ ok: false, message: 'Category status could not be changed right now.' }, { status: 500 });
  }
}
