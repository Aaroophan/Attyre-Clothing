import { NextResponse } from 'next/server';
import { deactivateProduct, findAnyProductBySlug, findProductById, objectIdToString, reactivateProduct, updateProduct } from '@/lib/db';
import { validateProductPayload, type ProductPayload } from '@/lib/admin-product-validation';
import { isObjectIdString } from '@/lib/db/object-id';
import { readJsonRequest, requestBodyErrorResponse, requireAdminApi, safeLogError } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface AdminProductRouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: AdminProductRouteContext) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await params;

  if (!isObjectIdString(id)) {
    return NextResponse.json({ ok: false, message: 'Invalid product ID.' }, { status: 400 });
  }

  try {
    const product = await findProductById(id);

    if (!product) {
      return NextResponse.json({ ok: false, message: 'Product was not found.' }, { status: 404 });
    }

    const payload = await readJsonRequest<ProductPayload>(request);
    const validation = await validateProductPayload(payload);

    if (!validation.input) {
      return NextResponse.json(
        { ok: false, message: 'Please fix the highlighted product fields.', fieldErrors: validation.fieldErrors },
        { status: 400 },
      );
    }

    const existingProduct = await findAnyProductBySlug(validation.input.slug);

    if (existingProduct && objectIdToString(existingProduct._id) !== id) {
      return NextResponse.json(
        {
          ok: false,
          message: 'A product already exists with this slug.',
          fieldErrors: { slug: 'This slug is already used by another product.' },
        },
        { status: 409 },
      );
    }

    const updatedProduct = await updateProduct(id, validation.input);

    if (!updatedProduct) {
      return NextResponse.json({ ok: false, message: 'Product could not be updated.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, productId: objectIdToString(updatedProduct._id), slug: updatedProduct.slug });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    safeLogError('Admin product update failed:', error);
    return NextResponse.json({ ok: false, message: 'Product could not be updated right now.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: AdminProductRouteContext) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await params;

  if (!isObjectIdString(id)) {
    return NextResponse.json({ ok: false, message: 'Invalid product ID.' }, { status: 400 });
  }

  try {
    const payload = await readJsonRequest<{ action?: unknown }>(request);
    const action = typeof payload.action === 'string' ? payload.action : 'deactivate';

    if (action !== 'deactivate' && action !== 'reactivate') {
      return NextResponse.json({ ok: false, message: 'Invalid product status action.' }, { status: 400 });
    }

    const success = action === 'reactivate' ? await reactivateProduct(id) : await deactivateProduct(id);

    if (!success) {
      return NextResponse.json({ ok: false, message: 'Product status could not be changed.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    safeLogError('Admin product status update failed:', error);
    return NextResponse.json({ ok: false, message: 'Product status could not be changed right now.' }, { status: 500 });
  }
}
