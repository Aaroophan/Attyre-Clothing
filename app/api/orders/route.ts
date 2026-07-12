import { NextResponse } from 'next/server';
import { placeCheckoutOrder, CheckoutValidationError } from '@/lib/checkout';
import type { CheckoutOrderRequest, CheckoutOrderResponse } from '@/types/checkout';
import { objectIdToString } from '@/lib/db/object-id';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const payload = await request.json() as CheckoutOrderRequest;
    const order = await placeCheckoutOrder(payload);

    return NextResponse.json<CheckoutOrderResponse>({
      ok: true,
      orderNumber: order.orderNumber,
      orderId: objectIdToString(order._id),
      total: order.total,
      message: 'Order placed successfully.',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json<CheckoutOrderResponse>({
        ok: false,
        message: 'Invalid checkout request. Please try again.',
      }, { status: 400 });
    }

    if (error instanceof CheckoutValidationError) {
      return NextResponse.json<CheckoutOrderResponse>({
        ok: false,
        message: error.message,
        fieldErrors: error.fieldErrors,
      }, { status: error.status });
    }

    console.error('Checkout order creation failed:', error);

    return NextResponse.json<CheckoutOrderResponse>({
      ok: false,
      message: 'Order could not be placed right now. Please try again.',
    }, { status: 500 });
  }
}
