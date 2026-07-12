import type { Filter, UpdateFilter } from 'mongodb';
import type { CreateOrderInput, OrderDocument, OrderStatus } from '@/types/database';
import { COLLECTIONS, getCollection } from './collections';
import { tryObjectId } from './object-id';

export interface OrderListOptions {
  status?: OrderStatus;
  customerId?: string;
  search?: string;
  limit?: number;
}

async function ordersCollection() {
  return getCollection<OrderDocument>(COLLECTIONS.orders);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildOrderSearchFilter(search: string): Filter<OrderDocument> | null {
  const trimmed = search.trim();

  if (!trimmed) {
    return null;
  }

  const expression = new RegExp(escapeRegExp(trimmed), 'i');

  return {
    $or: [
      { orderNumber: expression },
      { 'customerInfo.name': expression },
      { 'customerInfo.email': expression },
      { 'customerInfo.phone': expression },
      { 'customerInfo.city': expression },
      { 'customerInfo.district': expression },
    ],
  } as Filter<OrderDocument>;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderDocument> {
  const collection = await ordersCollection();
  const now = new Date();
  const document: Omit<OrderDocument, '_id'> = {
    ...input,
    statusHistory: [
      {
        status: input.orderStatus,
        changedAt: now,
        note: 'Order created by customer checkout.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(document as OrderDocument);
  return { ...document, _id: result.insertedId } as OrderDocument;
}

export async function listOrders(options: OrderListOptions = {}): Promise<OrderDocument[]> {
  const collection = await ordersCollection();
  const filter: Filter<OrderDocument> = {};

  if (options.status) {
    filter.orderStatus = options.status;
  }

  if (options.customerId) {
    const customerObjectId = tryObjectId(options.customerId);

    if (!customerObjectId) {
      return [];
    }

    filter.customerId = customerObjectId;
  }

  const searchFilter = options.search ? buildOrderSearchFilter(options.search) : null;

  if (searchFilter) {
    Object.assign(filter, searchFilter);
  }

  const cursor = collection.find(filter).sort({ createdAt: -1 });

  if (options.limit) {
    cursor.limit(options.limit);
  }

  return cursor.toArray();
}

export async function findOrderById(id: string): Promise<OrderDocument | null> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return null;
  }

  const collection = await ordersCollection();
  return collection.findOne({ _id: objectId });
}

export async function findOrderByNumber(orderNumber: string): Promise<OrderDocument | null> {
  const collection = await ordersCollection();
  return collection.findOne({ orderNumber });
}

export async function listCustomerOrders(customerId: string): Promise<OrderDocument[]> {
  return listOrders({ customerId });
}

export async function updateOrderStatus(
  id: string,
  orderStatus: OrderStatus,
  changedBy?: string,
  note?: string,
): Promise<OrderDocument | null> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return null;
  }

  const changedByObjectId = tryObjectId(changedBy);
  const collection = await ordersCollection();
  const now = new Date();
  const update: UpdateFilter<OrderDocument> = {
    $set: {
      orderStatus,
      updatedAt: now,
    },
    $push: {
      statusHistory: {
        status: orderStatus,
        changedAt: now,
        ...(changedByObjectId ? { changedBy: changedByObjectId } : {}),
        ...(note ? { note } : {}),
      },
    },
  };

  const result = await collection.findOneAndUpdate({ _id: objectId }, update, { returnDocument: 'after' });
  return result;
}

export async function countOrders(status?: OrderStatus): Promise<number> {
  const collection = await ordersCollection();
  return collection.countDocuments(status ? { orderStatus: status } : {});
}

export async function calculateSalesTotal(): Promise<number> {
  const collection = await ordersCollection();
  const result = await collection
    .aggregate<{ totalSales: number }>([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$total' } } },
    ])
    .toArray();

  return result[0]?.totalSales || 0;
}
