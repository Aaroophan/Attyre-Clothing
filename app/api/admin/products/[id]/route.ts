import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/session';
import { deactivateProduct, findAnyProductBySlug, findProductById, objectIdToString, reactivateProduct, updateProduct } from '@/lib/db';
import { validateProductPayload } from '@/lib/admin-product-validation';

export const dynamic = 'force-dynamic';

interface AdminProductRouteContext {
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

export async function PUT(request: Request, { params }: AdminProductRouteContext) {
  const authError = await requireAdminResponse();

  if (authError) {
    return authError;
  }

  const { id } = await params;

  try {
    const product = await findProductById(id);

    if (!product) {
      return NextResponse.json({ ok: false, message: 'Product was not found.' }, { status: 404 });
    }

    const payload = await request.json();
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
    console.error('Admin product update failed:', error);
    return NextResponse.json({ ok: false, message: 'Product could not be updated right now.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: AdminProductRouteContext) {
  const authError = await requireAdminResponse();

  if (authError) {
    return authError;
  }

  const { id } = await params;

  try {
    const payload = await request.json();
    const action = typeof payload.action === 'string' ? payload.action : 'deactivate';
    const success = action === 'reactivate' ? await reactivateProduct(id) : await deactivateProduct(id);

    if (!success) {
      return NextResponse.json({ ok: false, message: 'Product status could not be changed.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin product status update failed:', error);
    return NextResponse.json({ ok: false, message: 'Product status could not be changed right now.' }, { status: 500 });
  }
}
