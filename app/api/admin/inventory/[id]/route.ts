import { NextResponse } from 'next/server';
import { adjustProductStock, objectIdToString, updateProductStock } from '@/lib/db';
import { isObjectIdString } from '@/lib/db/object-id';
import { normalizeStockValue } from '@/lib/inventory';
import { readJsonRequest, requestBodyErrorResponse, requireAdminApi, safeLogError } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface AdminInventoryRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: AdminInventoryRouteContext) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const { id } = await params;

  if (!isObjectIdString(id)) {
    return NextResponse.json({ ok: false, message: 'Invalid product ID.' }, { status: 400 });
  }

  try {
    const payload = await readJsonRequest<{ action?: unknown; adjustment?: unknown; stock?: unknown }>(request);
    const action = typeof payload.action === 'string' ? payload.action : 'set';

    if (action !== 'set' && action !== 'adjust') {
      return NextResponse.json({ ok: false, message: 'Invalid inventory action.' }, { status: 400 });
    }

    const rawValue = action === 'adjust' ? payload.adjustment : payload.stock;
    const value = normalizeStockValue(rawValue);

    if (value === null) {
      return NextResponse.json(
        { ok: false, message: action === 'adjust' ? 'Stock adjustment must be a whole number.' : 'Stock must be a whole number of 0 or more.' },
        { status: 400 },
      );
    }

    if (action === 'set' && value > 100000) {
      return NextResponse.json({ ok: false, message: 'Stock value is too high.' }, { status: 400 });
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
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    safeLogError('Admin inventory update failed:', error);
    return NextResponse.json({ ok: false, message: 'Inventory could not be updated right now.' }, { status: 500 });
  }
}
