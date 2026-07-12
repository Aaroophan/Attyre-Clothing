import { NextResponse } from 'next/server';
import { placeCheckoutOrder, CheckoutValidationError } from '@/lib/checkout';
import type { CheckoutOrderRequest, CheckoutOrderResponse } from '@/types/checkout';
import { objectIdToString } from '@/lib/db/object-id';
import { getCurrentUser } from '@/lib/auth/session';
import { readJsonRequest, requestBodyErrorResponse, safeLogError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const payload = await readJsonRequest<CheckoutOrderRequest>(request);
    const currentUser = await getCurrentUser();
    const order = await placeCheckoutOrder(payload, currentUser ? objectIdToString(currentUser._id) : undefined);

    return NextResponse.json<CheckoutOrderResponse>({
      ok: true,
      orderNumber: order.orderNumber,
      orderId: objectIdToString(order._id),
      total: order.total,
      message: 'Order placed successfully.',
    }, { status: 201 });
  } catch (error) {
    const bodyError = requestBodyErrorResponse(error);

    if (bodyError) {
      return bodyError;
    }

    if (error instanceof CheckoutValidationError) {
      return NextResponse.json<CheckoutOrderResponse>({
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      }, { status: error.status });
    }

    safeLogError('Checkout order creation failed:', error);

    return NextResponse.json<CheckoutOrderResponse>({
      ok: false,
      message: 'Order could not be placed right now. Please try again.',
    }, { status: 500 });
  }
}
