import type { Filter, UpdateFilter } from 'mongodb';
import type { CategoryDocument, CreateCategoryInput, ProductDocument } from '@/types/database';
import { COLLECTIONS, getCollection } from './collections';
import { tryObjectId } from './object-id';

async function categoriesCollection() {
  return getCollection<CategoryDocument>(COLLECTIONS.categories);
}

export interface CategoryUsageSummary {
  categoryId: string;
  productCount: number;
}

export async function listCategories(options: { activeOnly?: boolean } = {}): Promise<CategoryDocument[]> {
  const collection = await categoriesCollection();
  const filter: Filter<CategoryDocument> = options.activeOnly ? { active: true } : {};

  return collection.find(filter).sort({ name: 1 }).toArray();
}

export async function findCategoryById(id: string): Promise<CategoryDocument | null> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return null;
  }

  const collection = await categoriesCollection();
  return collection.findOne({ _id: objectId });
}

export async function findCategoryBySlug(slug: string): Promise<CategoryDocument | null> {
  const collection = await categoriesCollection();
  return collection.findOne({ slug });
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryDocument> {
  const collection = await categoriesCollection();
  const now = new Date();
  const document: Omit<CategoryDocument, '_id'> = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(document as CategoryDocument);
  return { ...document, _id: result.insertedId } as CategoryDocument;
}

export async function updateCategory(id: string, input: Partial<CreateCategoryInput>): Promise<CategoryDocument | null> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return null;
  }

  const collection = await categoriesCollection();
  const update: UpdateFilter<CategoryDocument> = {
    $set: {
      ...input,
      updatedAt: new Date(),
    },
  };

  const result = await collection.findOneAndUpdate({ _id: objectId }, update, { returnDocument: 'after' });

  if (result) {
    const products = await getCollection<ProductDocument>(COLLECTIONS.products);
    await products.updateMany(
      { categoryId: objectId },
      {
        $set: {
          categoryName: result.name,
          categorySlug: result.slug,
          updatedAt: new Date(),
        },
      },
    );
  }

  return result;
}

export async function deactivateCategory(id: string): Promise<boolean> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return false;
  }

  const collection = await categoriesCollection();
  const result = await collection.updateOne(
    { _id: objectId },
    { $set: { active: false, updatedAt: new Date() } },
  );

  return result.matchedCount === 1;
}

export async function reactivateCategory(id: string): Promise<boolean> {
  const objectId = tryObjectId(id);

  if (!objectId) {
    return false;
  }

  const collection = await categoriesCollection();
  const result = await collection.updateOne(
    { _id: objectId },
    { $set: { active: true, updatedAt: new Date() } },
  );

  return result.matchedCount === 1;
}

export async function isCategoryUsed(categoryId: string): Promise<boolean> {
  const objectId = tryObjectId(categoryId);

  if (!objectId) {
    return false;
  }

  const products = await getCollection<ProductDocument>(COLLECTIONS.products);
  const count = await products.countDocuments({ categoryId: objectId }, { limit: 1 });

  return count > 0;
}

export async function countProductsByCategory(categoryId: string): Promise<number> {
  const objectId = tryObjectId(categoryId);

  if (!objectId) {
    return 0;
  }

  const products = await getCollection<ProductDocument>(COLLECTIONS.products);
  return products.countDocuments({ categoryId: objectId });
}

export async function getCategoryUsageMap(): Promise<Map<string, number>> {
  const products = await getCollection<ProductDocument>(COLLECTIONS.products);
  const usage = await products
    .aggregate<CategoryUsageSummary>([
      {
        $group: {
          _id: '$categoryId',
          productCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: { $toString: '$_id' },
          productCount: 1,
        },
      },
    ])
    .toArray();

  return new Map(usage.map((item) => [item.categoryId, item.productCount]));
}
