import { NextResponse } from 'next/server';
import { createCategory, findCategoryBySlug, objectIdToString } from '@/lib/db';
import { validateCategoryPayload, type CategoryPayload } from '@/lib/admin-category-validation';
import { readJsonRequest, requestBodyErrorResponse, requireAdminApi, safeLogError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  try {
    const payload = await readJsonRequest<CategoryPayload>(request);
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
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    safeLogError('Admin category creation failed:', error);
    return NextResponse.json({ ok: false, message: 'Category could not be created right now.' }, { status: 500 });
  }
}
