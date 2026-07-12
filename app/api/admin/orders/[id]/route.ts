import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminUser } from '@/lib/auth/admin';
import { getCurrentUser } from '@/lib/auth/session';
import { findOrderById, objectIdToString, updateOrderStatus } from '@/lib/db';
import { isOrderStatus, orderStatusLabel } from '@/lib/order-status';

export const dynamic = 'force-dynamic';

interface AdminOrderRouteContext {
  params: Promise<{ id: string }>;
}

async function requireAdminResponse() {
  const user = await getCurrentUser();

  if (!user) {
    return { user: null, response: NextResponse.json({ ok: false, message: 'Login is required.' }, { status: 401 }) };
  }

  if (!isAdminUser(user)) {
    return { user: null, response: NextResponse.json({ ok: false, message: 'Admin access is required.' }, { status: 403 }) };
  }

  return { user, response: null };
}

export async function PATCH(request: Request, { params }: AdminOrderRouteContext) {
  const { user, response } = await requireAdminResponse();

  if (response || !user) {
    return response;
  }

  const { id } = await params;

  try {
    const existingOrder = await findOrderById(id);

    if (!existingOrder) {
      return NextResponse.json({ ok: false, message: 'Order was not found.' }, { status: 404 });
    }

    const payload = await request.json() as { orderStatus?: unknown; note?: unknown };

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
    if (error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, message: 'Invalid order status request.' }, { status: 400 });
    }

    console.error('Admin order status update failed:', error);
    return NextResponse.json({ ok: false, message: 'Order status could not be updated right now.' }, { status: 500 });
  }
}
