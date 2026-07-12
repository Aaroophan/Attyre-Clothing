import { NextResponse } from 'next/server';
import { createProduct, findAnyProductBySlug, objectIdToString } from '@/lib/db';
import { validateProductPayload, type ProductPayload } from '@/lib/admin-product-validation';
import { readJsonRequest, requestBodyErrorResponse, requireAdminApi, safeLogError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  try {
    const payload = await readJsonRequest<ProductPayload>(request);
    const validation = await validateProductPayload(payload);

    if (!validation.input) {
      return NextResponse.json(
        { ok: false, message: 'Please fix the highlighted product fields.', fieldErrors: validation.fieldErrors },
        { status: 400 },
      );
    }

    const existingProduct = await findAnyProductBySlug(validation.input.slug);

    if (existingProduct) {
      return NextResponse.json(
        {
          ok: false,
          message: 'A product already exists with this slug.',
          fieldErrors: { slug: 'This slug is already used by another product.' },
        },
        { status: 409 },
      );
    }

    const product = await createProduct(validation.input);

    return NextResponse.json({ ok: true, productId: objectIdToString(product._id), slug: product.slug }, { status: 201 });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    safeLogError('Admin product creation failed:', error);
    return NextResponse.json({ ok: false, message: 'Product could not be created right now.' }, { status: 500 });
  }
}
