export interface CheckoutCustomerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  note?: string;
}

export interface CheckoutItemInput {
  productId: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface CheckoutOrderRequest {
  customerInfo: CheckoutCustomerInput;
  items: CheckoutItemInput[];
}

export interface CheckoutOrderSuccessResponse {
  ok: true;
  orderNumber: string;
  orderId: string;
  total: number;
  message: string;
}

export interface CheckoutOrderErrorResponse {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof CheckoutCustomerInput | 'items', string>>;
}

export type CheckoutOrderResponse = CheckoutOrderSuccessResponse | CheckoutOrderErrorResponse;
