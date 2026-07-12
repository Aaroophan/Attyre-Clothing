import type { Filter, Sort, UpdateFilter } from 'mongodb';
import type { CreateProductInput, ProductDocument } from '@/types/database';
import { COLLECTIONS, getCollection } from './collections';
import { tryObjectId } from './object-id';

export interface ProductListOptions {
  activeOnly?: boolean;
  includeInactive?: boolean;
  categorySlug?: string;
  featuredOnly?: boolean;
  search?: string;
  limit?: number;
  sort?: Sort;
}

async function productsCollection() {
  return getCollection<ProductDocument>(COLLECTIONS.products);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildProductFilter(options: ProductListOptions = {}): Filter<ProductDocument> {
  const filter: Filter<ProductDocument> = {};

  if (options.activeOnly ?? !options.includeInactive) {
    filter.active = true;
  }

  if (options.categorySlug) {
    filter.categorySlug = options.categorySlug;
  }

  if (options.featuredOnly) {
    filter.featured = true;
  }

  if (options.search) {
    const search = escapeRegExp(options.search);

    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  return filter;
}

export async function listProducts(options: ProductListOptions = {}): Promise<ProductDocument[]> {
  const collection = await productsCollection();
  const filter = buildProductFilter(options);
  const sort = options.sort || { createdAt: -1 };
  const cursor = collection.find(filter).sort(sort);

  if (options.limit) {
    cursor.limit(options.limit);
  }

  return cursor.toArray();
}

export async function findProductBySlug(slug: string): Promise<ProductDocument | null> {
  const collection = await productsCollection();
  return collection.findOne({ slug, active: true });
}

export async function findAnyProductBySlug(slug: string): Promise<ProductDocument | null> {
  const collection = await productsCollection();
  return collection.findOne({ slug });
}

export async function findProductById(id: string): Promise<ProductDocument | null> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return null;
  }

  const collection = await productsCollection();
  return collection.findOne({ _id: objectId });
}

export async function createProduct(input: CreateProductInput): Promise<ProductDocument> {
  const collection = await productsCollection();
  const now = new Date();
  const document: Omit<ProductDocument, '_id'> = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(document as ProductDocument);
  return { ...document, _id: result.insertedId } as ProductDocument;
}

export async function updateProduct(id: string, input: Partial<CreateProductInput>): Promise<ProductDocument | null> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return null;
  }

  const collection = await productsCollection();
  const update: UpdateFilter<ProductDocument> = {
    $set: {
      ...input,
      updatedAt: new Date(),
    },
  };

  const result = await collection.findOneAndUpdate({ _id: objectId }, update, { returnDocument: 'after' });
  return result;
}

export async function deactivateProduct(id: string): Promise<boolean> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return false;
  }

  const collection = await productsCollection();
  const result = await collection.updateOne(
    { _id: objectId },
    { $set: { active: false, updatedAt: new Date() } },
  );

  return result.modifiedCount === 1;
}

export async function reactivateProduct(id: string): Promise<boolean> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return false;
  }

  const collection = await productsCollection();
  const result = await collection.updateOne(
    { _id: objectId },
    { $set: { active: true, updatedAt: new Date() } },
  );

  return result.modifiedCount === 1;
}

export async function countActiveProducts(): Promise<number> {
  const collection = await productsCollection();
  return collection.countDocuments({ active: true });
}

export async function listLowStockProducts(threshold = 5): Promise<ProductDocument[]> {
  const collection = await productsCollection();

  return collection
    .find({ active: true, stock: { $lte: threshold } })
    .sort({ stock: 1, name: 1 })
    .toArray();
}
