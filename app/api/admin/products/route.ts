import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/session';
import { createProduct, findAnyProductBySlug, objectIdToString } from '@/lib/db';
import { validateProductPayload } from '@/lib/admin-product-validation';

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
    console.error('Admin product creation failed:', error);
    return NextResponse.json({ ok: false, message: 'Product could not be created right now.' }, { status: 500 });
  }
}
