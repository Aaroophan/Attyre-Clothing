import { NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/session';
import { adjustProductStock, objectIdToString, updateProductStock } from '@/lib/db';
import { normalizeStockValue } from '@/lib/inventory';

export const dynamic = 'force-dynamic';

interface AdminInventoryRouteContext {
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

export async function PATCH(request: Request, { params }: AdminInventoryRouteContext) {
  const authError = await requireAdminResponse();

  if (authError) {
    return authError;
  }

  const { id } = await params;

  try {
    const payload = await request.json();
    const action = typeof payload.action === 'string' ? payload.action : 'set';
    const rawValue = action === 'adjust' ? payload.adjustment : payload.stock;
    const value = normalizeStockValue(rawValue);

    if (value === null) {
      return NextResponse.json(
        { ok: false, message: action === 'adjust' ? 'Stock adjustment must be a whole number of 0 or more.' : 'Stock must be a whole number of 0 or more.' },
        { status: 400 },
      );
    }

    const product = action === 'adjust'
      ? await adjustProductStock(id, value)
      : await updateProductStock(id, value);

    if (!product) {
      return NextResponse.json(
        { ok: false, message: 'Inventory could not be updated. Check the product and stock value.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      productId: objectIdToString(product._id),
      stock: product.stock,
      message: `${product.name} stock updated to ${product.stock} unit${product.stock === 1 ? '' : 's'}.`,
    });
  } catch (error) {
    console.error('Admin inventory update failed:', error);
    return NextResponse.json({ ok: false, message: 'Inventory could not be updated right now.' }, { status: 500 });
  }
}
