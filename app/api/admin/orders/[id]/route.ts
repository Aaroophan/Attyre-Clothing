import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { findOrderById, objectIdToString, updateOrderStatus } from '@/lib/db';
import { isObjectIdString } from '@/lib/db/object-id';
import { isOrderStatus, orderStatusLabel } from '@/lib/order-status';
import { readJsonRequest, requestBodyErrorResponse, requireAdminApi, safeLogError } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface AdminOrderRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: AdminOrderRouteContext) {
  const { user, response } = await requireAdminApi();

  if (response || !user) {
    return response;
  }

  const { id } = await params;

  if (!isObjectIdString(id)) {
    return NextResponse.json({ ok: false, message: 'Invalid order ID.' }, { status: 400 });
  }

  try {
    const existingOrder = await findOrderById(id);

    if (!existingOrder) {
      return NextResponse.json({ ok: false, message: 'Order was not found.' }, { status: 404 });
    }

    const payload = await readJsonRequest<{ orderStatus?: unknown; note?: unknown }>(request);

    if (!isOrderStatus(payload.orderStatus)) {
      return NextResponse.json({ ok: false, message: 'Select a valid order status.' }, { status: 400 });
    }

    const note = typeof payload.note === 'string' ? payload.note.trim().slice(0, 220) : '';
    const updatedOrder = await updateOrderStatus(
      id,
      payload.orderStatus,
      objectIdToString(user._id),
      note || `Status changed to ${orderStatusLabel(payload.orderStatus)} by admin.`,
    );

    if (!updatedOrder) {
      return NextResponse.json({ ok: false, message: 'Order status could not be updated.' }, { status: 404 });
    }

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath('/account/orders');

    return NextResponse.json({
      ok: true,
      orderId: objectIdToString(updatedOrder._id),
      orderNumber: updatedOrder.orderNumber,
      orderStatus: updatedOrder.orderStatus,
      message: `Order marked as ${orderStatusLabel(updatedOrder.orderStatus)}.`,
    });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    safeLogError('Admin order status update failed:', error);
    return NextResponse.json({ ok: false, message: 'Order status could not be updated right now.' }, { status: 500 });
  }
}
