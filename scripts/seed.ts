import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import type { BulkWriteResult, Db, Document, ObjectId } from 'mongodb';
import { seedCategories, seedProducts } from '../data/seed';
import type { CategoryDocument, ProductDocument, UserDocument } from '../types/database';

const SEED_SOURCE = 'attyre-issue-04-demo-catalog';

function loadEnvFile(fileName: string): void {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadEnvironment(): void {
  loadEnvFile('.env');
  loadEnvFile('.env.local');
}

function requiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;

  if (!value) {
    throw new Error(`${name} is required before running the seed script.`);
  }

  return value;
}

function logResult(label: string, result: BulkWriteResult): void {
  console.log(`${label}: matched=${result.matchedCount}, modified=${result.modifiedCount}, upserted=${result.upsertedCount}`);
}

async function createIndexes(db: Db, collections: Record<string, string>): Promise<void> {
  await Promise.all([
    db.collection(collections.categories).createIndex({ slug: 1 }, { unique: true }),
    db.collection(collections.products).createIndex({ slug: 1 }, { unique: true }),
    db.collection(collections.products).createIndex({ categorySlug: 1 }),
    db.collection(collections.products).createIndex({ active: 1, featured: 1 }),
    db.collection(collections.users).createIndex({ email: 1 }, { unique: true }),
    db.collection(collections.orders).createIndex({ orderNumber: 1 }, { unique: true }),
    db.collection(collections.orders).createIndex({ customerId: 1, createdAt: -1 }),
  ]);
}

async function seedCategoryDocuments(db: Db, collections: Record<string, string>): Promise<Map<string, CategoryDocument>> {
  const categoriesCollection = db.collection<CategoryDocument & Document>(collections.categories);
  const now = new Date();

  const result = await categoriesCollection.bulkWrite(
    seedCategories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: {
          $set: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            active: category.active,
            seeded: true,
            seedSource: SEED_SOURCE,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        upsert: true,
      },
    })),
  );

  logResult('Categories', result);

  const categories = await categoriesCollection
    .find({ slug: { $in: seedCategories.map((category) => category.slug) } })
    .toArray();

  return new Map(categories.map((category) => [category.slug, category as CategoryDocument]));
}

async function seedProductDocuments(
  db: Db,
  collections: Record<string, string>,
  categoryBySlug: Map<string, CategoryDocument>,
): Promise<void> {
  const productsCollection = db.collection<ProductDocument & Document>(collections.products);
  const now = new Date();

  const productOperations = seedProducts.map((product) => {
    const category = categoryBySlug.get(product.categorySlug);

    if (!category) {
      throw new Error(`Missing category for product ${product.name}: ${product.categorySlug}`);
    }

    return {
      updateOne: {
        filter: { slug: product.slug },
        update: {
          $set: {
            name: product.name,
            slug: product.slug,
            description: product.description,
            categoryId: category._id,
            categorySlug: category.slug,
            categoryName: category.name,
            price: product.price,
            salePrice: product.salePrice,
            images: product.images,
            sizes: product.sizes,
            colors: product.colors,
            stock: product.stock,
            featured: product.featured,
            active: product.active,
            sku: product.sku,
            seeded: true,
            seedSource: SEED_SOURCE,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        upsert: true,
      },
    };
  });

  const result = await productsCollection.bulkWrite(productOperations);
  logResult('Products', result);
}

async function seedAdminUser(db: Db, collections: Record<string, string>): Promise<void> {
  const usersCollection = db.collection<UserDocument & Document>(collections.users);
  const now = new Date();
  const email = requiredEnv('ADMIN_EMAIL', 'admin@attyre.com').toLowerCase().trim();
  const password = requiredEnv('ADMIN_PASSWORD', 'SecurePassword123!');
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await usersCollection.updateOne(
    { email },
    {
      $set: {
        name: 'Attyre Admin',
        email,
        passwordHash,
        role: 'admin',
        seeded: true,
        seedSource: SEED_SOURCE,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  console.log(`Admin user: matched=${result.matchedCount}, modified=${result.modifiedCount}, upserted=${result.upsertedCount}`);
}

async function printSummary(db: Db, collections: Record<string, string>): Promise<void> {
  const [categoryCount, productCount, adminCount] = await Promise.all([
    db.collection(collections.categories).countDocuments({ seeded: true, seedSource: SEED_SOURCE }),
    db.collection(collections.products).countDocuments({ seeded: true, seedSource: SEED_SOURCE }),
    db.collection(collections.users).countDocuments({ role: 'admin' }),
  ]);

  console.log('Seed summary');
  console.log(`- Categories seeded: ${categoryCount}`);
  console.log(`- Products seeded: ${productCount}`);
  console.log(`- Admin users available: ${adminCount}`);
}

async function main(): Promise<void> {
  loadEnvironment();

  const { getMongoClient, closeMongoClient } = await import('../lib/mongodb');
  const { COLLECTIONS, DB_NAME } = await import('../lib/db/collections');

  requiredEnv('MONGODB_URI');

  const client = await getMongoClient();
  const db = client.db(DB_NAME);

  try {
    await db.command({ ping: 1 });
    console.log(`Connected to MongoDB database: ${DB_NAME}`);

    await createIndexes(db, COLLECTIONS);
    const categoryBySlug = await seedCategoryDocuments(db, COLLECTIONS);
    await seedProductDocuments(db, COLLECTIONS, categoryBySlug as Map<string, CategoryDocument & { _id: ObjectId }>);
    await seedAdminUser(db, COLLECTIONS);
    await printSummary(db, COLLECTIONS);
    console.log('Attyre seed completed successfully.');
  } finally {
    await closeMongoClient();
  }
}

main().catch((error) => {
  console.error('Attyre seed failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
