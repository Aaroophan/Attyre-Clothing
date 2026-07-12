import { ObjectId, type ClientSession } from 'mongodb';
import { DELIVERY_FEE } from '@/lib/constants';
import { getMongoClient } from '@/lib/mongodb';
import { COLLECTIONS, DB_NAME } from '@/lib/db/collections';
import { tryObjectId } from '@/lib/db/object-id';
import type { CheckoutCustomerInput, CheckoutItemInput, CheckoutOrderRequest } from '@/types/checkout';
import type { OrderDocument, OrderItemDocument, ProductDocument } from '@/types/database';

export class CheckoutValidationError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 400, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'CheckoutValidationError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ValidatedCheckoutItem extends CheckoutItemInput {
  productObjectId: ObjectId;
}

interface PreparedCheckoutOrder {
  order: Omit<OrderDocument, '_id'>;
  stockUpdates: { productId: ObjectId; quantity: number }[];
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeCustomerInfo(input: unknown): CheckoutCustomerInput {
  const value = input && typeof input === 'object' ? input as Partial<CheckoutCustomerInput> : {};

  return {
    name: cleanText(value.name),
    email: cleanText(value.email).toLowerCase(),
    phone: cleanText(value.phone),
    address: cleanText(value.address),
    city: cleanText(value.city),
    district: cleanText(value.district),
    note: cleanText(value.note) || undefined,
  };
}

function validateCustomerInfo(customerInfo: CheckoutCustomerInput): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!customerInfo.name) {
    fieldErrors.name = 'Name is required.';
  }

  if (!customerInfo.email) {
    fieldErrors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
    fieldErrors.email = 'Enter a valid email address.';
  }

  if (!customerInfo.phone) {
    fieldErrors.phone = 'Phone number is required.';
  } else if (!/^[+\d][\d\s()-]{6,20}$/.test(customerInfo.phone)) {
    fieldErrors.phone = 'Enter a valid phone number.';
  }

  if (!customerInfo.address) {
    fieldErrors.address = 'Delivery address is required.';
  }

  if (!customerInfo.city) {
    fieldErrors.city = 'City is required.';
  }

  if (!customerInfo.district) {
    fieldErrors.district = 'District is required.';
  }

  return fieldErrors;
}

function normalizeItems(input: unknown): ValidatedCheckoutItem[] {
  if (!Array.isArray(input)) {
    throw new CheckoutValidationError('Cart items are required.', 400, { items: 'Cart items are required.' });
  }

  const items = input.map((item) => {
    const value = item && typeof item === 'object' ? item as Partial<CheckoutItemInput> : {};
    const productObjectId = tryObjectId(cleanText(value.productId));
    const quantity = Number(value.quantity);

    if (!productObjectId) {
      throw new CheckoutValidationError('One or more cart items are invalid.', 400, { items: 'One or more products have an invalid ID.' });
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new CheckoutValidationError('One or more cart quantities are invalid.', 400, { items: 'Cart item quantities must be at least 1.' });
    }

    return {
      productId: productObjectId.toHexString(),
      productObjectId,
      size: cleanText(value.size) || undefined,
      color: cleanText(value.color) || undefined,
      quantity: Math.trunc(quantity),
    };
  });

  if (items.length === 0) {
    throw new CheckoutValidationError('Your cart is empty.', 400, { items: 'Add at least one product before checkout.' });
  }

  return items;
}

function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `ATT-${datePart}-${randomPart}`;
}

async function getUniqueOrderNumber(
  ordersCollection: { findOne: (filter: { orderNumber: string }, options?: { session?: ClientSession }) => Promise<OrderDocument | null> },
  session: ClientSession,
): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const orderNumber = generateOrderNumber();
    const existingOrder = await ordersCollection.findOne({ orderNumber }, { session });

    if (!existingOrder) {
      return orderNumber;
    }
  }

  throw new CheckoutValidationError('Could not generate a unique order number. Please try again.', 500);
}

function prepareOrderFromProducts(
  customerInfo: CheckoutCustomerInput,
  cartItems: ValidatedCheckoutItem[],
  products: ProductDocument[],
  orderNumber: string,
): PreparedCheckoutOrder {
  const productMap = new Map(products.map((product) => [product._id.toHexString(), product]));
  const stockTotals = new Map<string, number>();
  const orderItems: OrderItemDocument[] = [];

  for (const item of cartItems) {
    const product = productMap.get(item.productId);

    if (!product || !product.active) {
      throw new CheckoutValidationError('A product in your cart is no longer available.', 409, { items: 'Please remove unavailable products and try again.' });
    }

    if (item.size && product.sizes.length > 0 && !product.sizes.includes(item.size)) {
      throw new CheckoutValidationError(`${product.name} is not available in size ${item.size}.`, 409, { items: 'Please review product size selections.' });
    }

    if (item.color && product.colors.length > 0 && !product.colors.includes(item.color)) {
      throw new CheckoutValidationError(`${product.name} is not available in ${item.color}.`, 409, { items: 'Please review product color selections.' });
    }

    stockTotals.set(item.productId, (stockTotals.get(item.productId) ?? 0) + item.quantity);

    const price = product.salePrice ?? product.price;
    const lineTotal = price * item.quantity;

    orderItems.push({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      size: item.size,
      color: item.color,
      price,
      quantity: item.quantity,
      lineTotal,
    });
  }

  const stockUpdates = Array.from(stockTotals.entries()).map(([productId, quantity]) => {
    const product = productMap.get(productId);

    if (!product) {
      throw new CheckoutValidationError('A product in your cart is no longer available.', 409, { items: 'Please refresh your cart and try again.' });
    }

    if (quantity > product.stock) {
      throw new CheckoutValidationError(
        `${product.name} has only ${product.stock} unit${product.stock === 1 ? '' : 's'} available.`,
        409,
        { items: 'Please reduce quantities for low-stock products.' },
      );
    }

    return { productId: product._id, quantity };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const now = new Date();

  return {
    order: {
      orderNumber,
      customerInfo,
      items: orderItems,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total: subtotal + DELIVERY_FEE,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    },
    stockUpdates,
  };
}

export async function placeCheckoutOrder(payload: CheckoutOrderRequest, customerId?: string): Promise<OrderDocument> {
  const customerInfo = normalizeCustomerInfo(payload.customerInfo);
  const fieldErrors = validateCustomerInfo(customerInfo);

  if (Object.keys(fieldErrors).length > 0) {
    throw new CheckoutValidationError('Please complete the required delivery details.', 400, fieldErrors);
  }

  const cartItems = normalizeItems(payload.items);
  const customerObjectId = customerId ? tryObjectId(customerId) : null;
  const client = await getMongoClient();
  const session = client.startSession();

  try {
    let createdOrder: OrderDocument | null = null;

    await session.withTransaction(async () => {
      const db = client.db(DB_NAME);
      const productsCollection = db.collection<ProductDocument>(COLLECTIONS.products);
      const ordersCollection = db.collection<OrderDocument>(COLLECTIONS.orders);
      const productObjectIds = Array.from(new Set(cartItems.map((item) => item.productObjectId.toHexString())))
        .map((id) => new ObjectId(id));
      const products = await productsCollection
        .find({ _id: { $in: productObjectIds }, active: true }, { session })
        .toArray();
      const orderNumber = await getUniqueOrderNumber(ordersCollection, session);
      const prepared = prepareOrderFromProducts(customerInfo, cartItems, products, orderNumber);

      if (customerObjectId) {
        prepared.order.customerId = customerObjectId;
      }

      const now = new Date();

      for (const update of prepared.stockUpdates) {
        const result = await productsCollection.updateOne(
          { _id: update.productId, active: true, stock: { $gte: update.quantity } },
          { $inc: { stock: -update.quantity }, $set: { updatedAt: now } },
          { session },
        );

        if (result.modifiedCount !== 1) {
          throw new CheckoutValidationError('Stock changed while placing the order. Please review your cart and try again.', 409, {
            items: 'One or more products no longer have enough stock.',
          });
        }
      }

      const insertResult = await ordersCollection.insertOne(prepared.order as OrderDocument, { session });
      createdOrder = { ...prepared.order, _id: insertResult.insertedId } as OrderDocument;
    });

    if (!createdOrder) {
      throw new CheckoutValidationError('Order could not be created. Please try again.', 500);
    }

    return createdOrder;
  } finally {
    await session.endSession();
  }
}
