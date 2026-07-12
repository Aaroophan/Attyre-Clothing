import type { Collection, Document } from 'mongodb';
import { getMongoClient } from '@/lib/mongodb';

export const DB_NAME = process.env.MONGODB_DB || 'attyre';

export const COLLECTIONS = {
  users: 'users',
  categories: 'categories',
  products: 'products',
  orders: 'orders',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}

export async function getCollection<TSchema extends Document>(name: CollectionName): Promise<Collection<TSchema>> {
  const db = await getDatabase();
  return db.collection<TSchema>(name);
}
